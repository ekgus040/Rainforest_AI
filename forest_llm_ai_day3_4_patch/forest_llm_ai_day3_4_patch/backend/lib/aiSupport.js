/**
 * AI 담당 레이어
 *
 * 이 파일은 U-Net 직접 학습/위성영상 자동분석이 아니라,
 * 백엔드 점수 계산 결과를 생성형 AI가 해석할 수 있게 만드는 레이어입니다.
 *
 * 포함 기능:
 * - AI Agent 6단계 구조
 * - 분석 로그 생성
 * - 점수 산정 근거 문장 생성
 * - 위험 요인 태그 기준
 * - 정책 보고서 프롬프트 생성
 * - 이메일 초안 프롬프트 생성
 * - Gemini 실패 시 fallback 보고서/이메일 생성
 */

const PRIORITY_WEIGHTS = {
  fireDamageScore: 0.25,
  landslideRiskScore: 0.20,
  soilRunoffRiskScore: 0.20,
  exposureScore: 0.35,
};

const GRADE_RULES = [
  { min: 85, grade: "1등급", label: "즉시 복원 필요", action: "장마 전 현장 점검 및 우선 복원 조치 필요" },
  { min: 70, grade: "2등급", label: "우선 복원 권장", action: "단기 복원 계획에 포함 검토" },
  { min: 55, grade: "3등급", label: "복원 검토 대상", action: "추가 데이터 확인 후 복원 여부 판단" },
  { min: 40, grade: "4등급", label: "지속 관찰 대상", action: "정기 모니터링 중심 관리" },
  { min: 0, grade: "5등급", label: "자연 회복 가능 또는 일반 모니터링", action: "즉시 개입 우선순위 낮음" },
];

const AI_AGENT_STEPS = [
  {
    id: 1,
    name: "산불 이벤트 인식 Agent",
    role: "산불 발생 위치와 분석 범위를 설정합니다.",
    log: "산불 발생 지역과 분석 대상 후보지를 확인했습니다.",
  },
  {
    id: 2,
    name: "산림/비산림 분류 Agent",
    role: "기존 토지피복 AI 결과 또는 산림 마스크를 활용해 실제 복원 대상 산림지역을 분리합니다.",
    log: "Trees/Forest 클래스를 산림지역으로 정의하고 비산림지역을 분석 대상에서 제외했습니다.",
  },
  {
    id: 3,
    name: "산불 피해도 분석 Agent",
    role: "산불 전후 식생지수 변화량을 바탕으로 산불 피해 강도를 해석합니다.",
    log: "산불피해도 점수를 확인하고 식생 손실이 큰 후보지를 탐지했습니다.",
  },
  {
    id: 4,
    name: "생활권 2차 피해 위험 분석 Agent",
    role: "산사태, 토사유출, 민가·도로·하천 인접성을 종합해 2차 피해 가능성을 분석합니다.",
    log: "산사태 위험도, 토사유출 위험도, 생활권 노출도를 종합 분석했습니다.",
  },
  {
    id: 5,
    name: "복원 우선순위 산정 Agent",
    role: "가중치 기반 점수식을 적용해 후보지별 최종 점수와 등급을 계산합니다.",
    log: "복원 우선순위 점수와 등급을 산정하고 TOP 후보지를 정렬했습니다.",
  },
  {
    id: 6,
    name: "정책 실행 지원 Agent",
    role: "분석 결과를 정책 보고서와 관할 기관 이메일 초안으로 변환합니다.",
    log: "정책 담당자가 검토할 수 있는 보고서와 이메일 초안 생성 준비를 완료했습니다.",
  },
];

const RISK_TAG_RULES = [
  { tag: "피해도 높음", condition: "산불피해도 85점 이상", field: "fireDamageScore" },
  { tag: "산사태 위험", condition: "산사태위험도 75점 이상 또는 landslideRisk가 높음/매우 높음", field: "landslideRiskScore" },
  { tag: "토사유출 위험", condition: "토사유출위험도 70점 이상", field: "soilRunoffRiskScore" },
  { tag: "생활권 노출도 높음", condition: "생활권노출도 80점 이상", field: "exposureScore" },
  { tag: "민가 인접", condition: "민가와의 거리 300m 이하", field: "distanceToHouse" },
  { tag: "도로 인접", condition: "도로와의 거리 300m 이하", field: "distanceToRoad" },
  { tag: "하천 인접", condition: "하천과의 거리 300m 이하", field: "distanceToRiver" },
  { tag: "급경사지", condition: "경사도 30도 이상", field: "slope" },
];

function round2(value) {
  return Math.round(Number(value) * 100) / 100;
}

function getNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeCandidate(candidate) {
  const fireDamageScore = getNumber(candidate.fireDamageScore ?? candidate.fireDamage);
  const landslideRiskScore = getNumber(candidate.landslideRiskScore ?? candidate.disasterVuln);
  const soilRunoffRiskScore = getNumber(candidate.soilRunoffRiskScore ?? candidate.restorationDifficulty);
  const exposureScore = getNumber(candidate.exposureScore ?? candidate.residentialExposure);

  const priorityScore = calculatePriorityScore({
    fireDamageScore,
    landslideRiskScore,
    soilRunoffRiskScore,
    exposureScore,
  });
  const gradeInfo = getGradeInfo(priorityScore);

  return {
    ...candidate,
    fireDamageScore,
    landslideRiskScore,
    soilRunoffRiskScore,
    exposureScore,

    // 기존 백엔드 scoring.js와의 호환 필드
    fireDamage: fireDamageScore,
    disasterVuln: landslideRiskScore,
    restorationDifficulty: soilRunoffRiskScore,
    residentialExposure: exposureScore,

    priorityScore,
    score: priorityScore,
    grade: gradeInfo.grade,
    gradeLabel: gradeInfo.label,
    gradeAction: gradeInfo.action,
    riskTags: candidate.riskTags || candidate.mainRisks || [],
    mainRisks: candidate.mainRisks || candidate.riskTags || [],
    agency: candidate.agency || candidate.jurisdiction || "관할 지자체",
    jurisdiction: candidate.jurisdiction || candidate.agency || "관할 지자체",
  };
}

function calculatePriorityScore(candidate) {
  const score =
    getNumber(candidate.fireDamageScore) * PRIORITY_WEIGHTS.fireDamageScore +
    getNumber(candidate.landslideRiskScore) * PRIORITY_WEIGHTS.landslideRiskScore +
    getNumber(candidate.soilRunoffRiskScore) * PRIORITY_WEIGHTS.soilRunoffRiskScore +
    getNumber(candidate.exposureScore) * PRIORITY_WEIGHTS.exposureScore;
  return round2(score);
}

function getGradeInfo(score) {
  return GRADE_RULES.find((rule) => score >= rule.min) || GRADE_RULES[GRADE_RULES.length - 1];
}

function rankCandidates(candidates) {
  return candidates
    .map(normalizeCandidate)
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .map((candidate, index) => ({ ...candidate, rank: index + 1 }));
}

function getDashboardSummary(rankedCandidates) {
  const total = rankedCandidates.length;
  const averageScore = total
    ? round2(rankedCandidates.reduce((sum, c) => sum + c.priorityScore, 0) / total)
    : 0;
  const grade1Count = rankedCandidates.filter((c) => c.grade === "1등급").length;
  const top = rankedCandidates[0] || null;

  return {
    totalCandidates: total,
    grade1Count,
    averageScore,
    topCandidateName: top?.name || null,
    topRiskRegion: top?.region || null,
    topScore: top?.priorityScore || null,
  };
}

function buildScoreRationale(candidateInput) {
  const candidate = normalizeCandidate(candidateInput);
  const mainRisks = (candidate.mainRisks || []).join(", ") || "주요 위험 요인 미상";

  return `${candidate.name}은 산불피해도 ${candidate.fireDamageScore}점, 산사태위험도 ${candidate.landslideRiskScore}점, 토사유출위험도 ${candidate.soilRunoffRiskScore}점, 생활권노출도 ${candidate.exposureScore}점을 기록했다. 특히 ${mainRisks} 요인이 확인되어 최종 복원 우선순위 점수 ${candidate.priorityScore}점, ${candidate.grade}(${candidate.gradeLabel})으로 분류되었다.`;
}

function buildAnalysisLogs(candidates) {
  const ranked = rankCandidates(candidates);
  const summary = getDashboardSummary(ranked);
  const top = ranked[0];

  return AI_AGENT_STEPS.map((step) => {
    let detail = step.log;

    if (step.id === 3 && top) {
      detail = `산불피해도 최고 후보지는 ${top.name}이며, 산불피해도 ${top.fireDamageScore}점으로 확인되었습니다.`;
    }
    if (step.id === 4 && top) {
      detail = `${top.name}의 주요 위험요인은 ${(top.mainRisks || []).join(", ")}입니다.`;
    }
    if (step.id === 5 && top) {
      detail = `총 ${summary.totalCandidates}개 후보지를 분석한 결과, ${top.name}이 ${top.priorityScore}점으로 최상위 우선순위에 선정되었습니다.`;
    }
    if (step.id === 6) {
      detail = "후보지별 정책 보고서와 관할 기관 이메일 초안을 생성할 수 있는 상태입니다.";
    }

    return {
      step: step.id,
      name: step.name,
      role: step.role,
      status: "completed",
      message: detail,
    };
  });
}

function buildAgentExplanation(candidates) {
  const ranked = rankCandidates(candidates);
  const summary = getDashboardSummary(ranked);
  const top = ranked[0];

  if (!top) {
    return "분석 가능한 후보지 데이터가 없습니다.";
  }

  return `AI Agent는 총 ${summary.totalCandidates}개 후보지를 분석했다. 산불피해도, 산사태위험도, 토사유출위험도, 생활권노출도를 가중치 기반으로 종합한 결과 ${top.name}이 ${top.priorityScore}점으로 가장 높은 복원 우선순위를 보였다. ${top.name}은 ${top.grade}(${top.gradeLabel})으로 분류되며, 주요 위험요인은 ${(top.mainRisks || []).join(", ")}이다. 이 결과를 바탕으로 정책 보고서와 관할 기관 이메일 초안을 생성할 수 있다.`;
}

function buildPolicyReportPrompt(candidateInput) {
  const candidate = normalizeCandidate(candidateInput);

  return `너는 산림복원 정책 담당자를 위한 보고서를 작성하는 생성형 AI다.
아래 후보지 분석 데이터를 바탕으로 공공기관 보고서 문체의 정책 보고서를 작성하라.

[후보지 데이터]
- 후보지명: ${candidate.name}
- 지역: ${candidate.region}
- 관할 기관: ${candidate.agency}
- 최종 점수: ${candidate.priorityScore}
- 등급: ${candidate.grade}(${candidate.gradeLabel})
- 산불피해도: ${candidate.fireDamageScore}
- 산사태위험도: ${candidate.landslideRiskScore}
- 토사유출위험도: ${candidate.soilRunoffRiskScore}
- 생활권노출도: ${candidate.exposureScore}
- 경사도: ${candidate.slope ?? "정보 없음"}
- 강우 위험: ${candidate.rainfallRisk ?? "정보 없음"}
- 민가 거리: ${candidate.distanceToHouse ?? "정보 없음"}m
- 도로 거리: ${candidate.distanceToRoad ?? "정보 없음"}m
- 하천 거리: ${candidate.distanceToRiver ?? "정보 없음"}m
- 주요 위험요인: ${(candidate.mainRisks || []).join(", ")}
- 기본 요약: ${candidate.summary || "없음"}

[작성 조건]
1. 제목 없이 본문만 작성한다.
2. 700자 이내로 작성한다.
3. 왜 이 후보지가 해당 등급으로 분류되었는지 데이터 근거를 포함한다.
4. 장마철 2차 피해 가능성을 언급한다.
5. 필요한 조치를 2~3개 제안한다.
6. 최종 판단은 현장 조사와 관계기관 검토가 필요하다는 문장을 포함한다.
7. 과장된 표현이나 단정적인 재난 예측은 피한다.`;
}

function buildEmailDraftPrompt(candidateInput, reportSummary = "") {
  const candidate = normalizeCandidate(candidateInput);

  return `너는 지자체 산림·재난 담당 부서에 보낼 공공기관 협조 요청 이메일을 작성하는 생성형 AI다.
아래 후보지 분석 결과를 바탕으로 이메일 초안을 작성하라.

[후보지 분석 결과]
- 후보지명: ${candidate.name}
- 지역: ${candidate.region}
- 관할 기관: ${candidate.agency}
- 최종 점수: ${candidate.priorityScore}
- 등급: ${candidate.grade}(${candidate.gradeLabel})
- 주요 위험요인: ${(candidate.mainRisks || []).join(", ")}
- 점수 산정 근거: ${buildScoreRationale(candidate)}
- 보고서 요약: ${reportSummary || candidate.summary || "별도 요약 없음"}

[출력 형식]
제목: ...
본문:
...

[작성 조건]
1. 정중한 공공기관 협조 요청 문체로 작성한다.
2. 분석 결과 공유 목적을 밝힌다.
3. 현장 점검 및 복원 우선순위 반영 검토를 요청한다.
4. 실제 발송 전 담당자 검토가 필요하다는 문장을 포함한다.
5. 지나치게 위협적인 표현은 사용하지 않는다.`;
}

function generateFallbackPolicyReport(candidateInput) {
  const candidate = normalizeCandidate(candidateInput);
  const rationale = buildScoreRationale(candidate);

  return `${candidate.name}은 ${candidate.region}에 위치한 산불피해 복원 후보지로, 최종 복원 우선순위 점수 ${candidate.priorityScore}점에 따라 ${candidate.grade}(${candidate.gradeLabel})으로 분류되었다. ${rationale}

해당 후보지는 ${(candidate.mainRisks || []).join(", ") || "복합 위험 요인"}이 확인되어 장마철 집중호우 시 산사태 또는 토사유출 등 2차 피해 가능성을 검토할 필요가 있다. 특히 민가·도로·하천과의 거리, 경사도, 산불피해도 지표를 함께 고려할 때 단순 산불피해 복구가 아니라 생활권 피해 예방 관점의 우선 복원 검토가 필요하다.

권장 조치로는 첫째, 장마 전 현장 점검을 통해 실제 경사 및 토양 유실 가능성을 확인하고, 둘째, 민가·도로·하천 인접 구간에 대한 응급 복구 또는 배수 대책을 검토하며, 셋째, 관계기관과 복원 우선순위 반영 여부를 협의하는 것이 적절하다. 본 분석 결과는 의사결정 지원용 자료이며, 최종 판단은 현장 조사와 관계기관 검토를 통해 결정되어야 한다.`;
}

function generateFallbackEmailDraft(candidateInput, reportSummary = "") {
  const candidate = normalizeCandidate(candidateInput);
  const subject = `[복원 우선 검토 요청] ${candidate.name} 산불피해 후보지 분석 결과 공유`;
  const body = `안녕하세요. ${candidate.agency} 담당자님.

본 메일은 ${candidate.region} 내 산불피해 후보지 분석 결과를 공유드리고, 장마철 2차 피해 예방을 위한 현장 점검 및 복원 우선순위 검토를 요청드리기 위해 작성되었습니다.

분석 결과, ${candidate.name}은 최종 점수 ${candidate.priorityScore}점으로 ${candidate.grade}(${candidate.gradeLabel})에 해당하는 후보지로 분류되었습니다. 주요 위험요인은 ${(candidate.mainRisks || []).join(", ") || "복합 위험 요인"}이며, 산불피해도 ${candidate.fireDamageScore}점, 산사태위험도 ${candidate.landslideRiskScore}점, 토사유출위험도 ${candidate.soilRunoffRiskScore}점, 생활권노출도 ${candidate.exposureScore}점으로 산정되었습니다.

${reportSummary ? `보고서 요약은 다음과 같습니다. ${reportSummary}\n\n` : ""}첨부 또는 공유된 분석 보고서를 검토하신 뒤, 현장 점검 및 복원 우선순위 반영 여부를 검토해주시기 바랍니다. 본 메일은 자동 생성된 초안이므로 실제 발송 전 담당자 검토가 필요합니다.

감사합니다.`;

  return { to: candidate.agency, subject, body };
}


// ------------------------------------------------------------
// Day 4~5 추가 산출물: 후보지 설명문, 지표 정의, 정책 해석, 위험요인 자동 추출
// ------------------------------------------------------------

const INDICATOR_DEFINITIONS = [
  {
    key: "fireDamageScore",
    name: "산불피해도",
    meaning: "산불 전후 식생 손실과 피해 강도를 나타내는 지표입니다. 값이 높을수록 산불로 인한 훼손 정도가 크다고 해석합니다.",
    dashboardText: "산불피해도가 높은 후보지는 식생 회복과 토양 안정화 필요성이 큰 지역으로 우선 검토합니다.",
  },
  {
    key: "landslideRiskScore",
    name: "재해취약도",
    meaning: "산사태 위험도, 경사도, 강우 위험 등 2차 재해 발생 가능성을 종합한 지표입니다. 값이 높을수록 장마철 추가 피해 가능성이 큽니다.",
    dashboardText: "재해취약도가 높은 후보지는 장마 전 현장 점검과 사면 안정성 검토가 필요합니다.",
  },
  {
    key: "exposureScore",
    name: "생활권노출도",
    meaning: "민가, 도로, 하천 등 생활권 인프라와의 인접성을 나타내는 지표입니다. 값이 높을수록 사람과 기반시설에 미칠 영향이 클 수 있습니다.",
    dashboardText: "생활권노출도가 높은 후보지는 단순 복구보다 생활권 2차 피해 예방 관점에서 우선 관리가 필요합니다.",
  },
  {
    key: "soilRunoffRiskScore",
    name: "복원난이도",
    meaning: "본 프로토타입에서는 토사유출 위험도와 지형 조건을 중심으로 복원 개입 필요성을 나타내는 지표로 사용합니다. 값이 높을수록 자연 회복만으로는 관리가 어려울 수 있습니다.",
    dashboardText: "복원난이도가 높은 후보지는 배수, 사면 보호, 응급 복구 등 단계적 복원 계획이 필요합니다.",
  },
];

const FINAL_RISK_TAG_RULES = [
  {
    tag: "민가 인접",
    condition: "민가와의 거리 300m 이하",
    policyMeaning: "주민 생활권과 가까워 산사태·토사유출 발생 시 인명·재산 피해 우려가 있으므로 우선 점검이 필요합니다.",
  },
  {
    tag: "도로 인접",
    condition: "도로와의 거리 300m 이하",
    policyMeaning: "도로 유실 또는 통행 장애 가능성이 있어 재난 대응 동선 확보 관점에서 관리가 필요합니다.",
  },
  {
    tag: "하천 인접",
    condition: "하천과의 거리 300m 이하",
    policyMeaning: "강우 시 토사가 하천으로 유입될 가능성이 있어 수질·하천 범람 위험 검토가 필요합니다.",
  },
  {
    tag: "급경사지",
    condition: "경사도 30도 이상",
    policyMeaning: "경사가 급해 사면 붕괴와 토사 이동 가능성이 높으므로 현장 사면 안정성 확인이 필요합니다.",
  },
  {
    tag: "산사태 위험",
    condition: "산사태위험도 75점 이상 또는 산사태 위험 등급 높음 이상",
    policyMeaning: "집중호우 시 산사태 가능성을 우선적으로 확인해야 하는 지역입니다.",
  },
  {
    tag: "토사유출 위험",
    condition: "토사유출위험도 70점 이상",
    policyMeaning: "식생 손실 이후 강우에 따른 토양 유실 가능성이 있어 배수 및 사방 조치 검토가 필요합니다.",
  },
  {
    tag: "피해도 높음",
    condition: "산불피해도 85점 이상",
    policyMeaning: "산불 피해 강도가 높아 식생 회복과 응급 복원 우선순위가 높습니다.",
  },
  {
    tag: "생활권 노출도 높음",
    condition: "생활권노출도 80점 이상",
    policyMeaning: "주민 생활권과 기반시설에 영향을 줄 가능성이 커 정책적 우선 관리가 필요합니다.",
  },
  {
    tag: "일반 모니터링",
    condition: "주요 위험 지표가 낮거나 생활권과 거리가 먼 경우",
    policyMeaning: "즉시 복원보다는 정기 관찰과 자연회복 가능성 검토가 적절합니다.",
  },
];

const CANDIDATE_EXPLANATIONS = {
  1: "후보지 A는 산불피해도와 생활권노출도가 모두 높은 1등급 후보지입니다. 민가와 도로가 가까워 장마철 토사유출이 생활권으로 이어질 가능성을 우선 검토해야 하며, 장마 전 현장 점검과 응급 복원 검토가 필요합니다.",
  2: "후보지 B는 산불피해도와 재해취약도가 중간 이상이고 도로와 가까운 2등급 후보지입니다. 즉시 복원 대상보다는 우선 검토 대상에 가깝지만, 도로 인접성 때문에 통행 안전과 복구 동선 확보 관점에서 관리가 필요합니다.",
  3: "후보지 C는 산사태위험도와 토사유출위험도가 매우 높은 1등급 후보지입니다. 급경사지와 하천 인접성이 함께 확인되어 집중호우 시 토사 이동과 하천 유입 가능성을 우선 점검해야 합니다.",
  4: "후보지 D는 생활권과 거리가 있고 재해위험 지표가 상대적으로 낮은 4등급 후보지입니다. 즉시 복원보다는 자연회복 가능성을 검토하면서 정기 모니터링 중심으로 관리하는 것이 적절합니다.",
  5: "후보지 E는 산불피해도는 최상위는 아니지만 생활권노출도가 높은 2등급 후보지입니다. 민가와 가까운 특성 때문에 단순 피해 강도보다 생활권 피해 예방 관점에서 우선 복원 검토가 필요합니다.",
};

const DASHBOARD_POLICY_SENTENCES = [
  "복원 우선순위는 산불 피해 규모만이 아니라 생활권 2차 피해 가능성을 함께 고려해 산정했습니다.",
  "1등급 후보지는 장마 전 현장 점검과 우선 복원 조치 검토가 필요한 지역입니다.",
  "생활권과 가까운 후보지는 단순 산림 복구보다 주민 안전과 기반시설 보호 관점에서 우선 관리가 필요합니다.",
  "산사태·토사유출 위험이 높은 후보지는 강우 전 사면 안정성, 배수 상태, 토양 유실 가능성을 확인해야 합니다.",
];

function hasHighTextRisk(value) {
  return ["높음", "매우 높음", "상"].includes(String(value || "").trim());
}

function extractRiskTags(candidateInput) {
  const c = normalizeCandidate(candidateInput);
  const tags = new Set(c.riskTags || c.mainRisks || []);

  if (c.fireDamageScore >= 85) tags.add("피해도 높음");
  if (c.landslideRiskScore >= 75 || hasHighTextRisk(c.landslideRisk)) tags.add("산사태 위험");
  if (c.soilRunoffRiskScore >= 70) tags.add("토사유출 위험");
  if (c.exposureScore >= 80) tags.add("생활권 노출도 높음");
  if (Number(c.distanceToHouse) <= 300) tags.add("민가 인접");
  if (Number(c.distanceToRoad) <= 300) tags.add("도로 인접");
  if (Number(c.distanceToRiver) <= 300) tags.add("하천 인접");
  if (Number(c.slope) >= 30) tags.add("급경사지");

  if (tags.size === 0 || (c.priorityScore < 55 && c.exposureScore < 55)) {
    tags.add("일반 모니터링");
  }

  return Array.from(tags);
}

function selectCoreRisks(candidateInput, limit = 2) {
  const c = normalizeCandidate(candidateInput);
  const tags = extractRiskTags(c);
  const priority = [
    "민가 인접",
    "산사태 위험",
    "토사유출 위험",
    "하천 인접",
    "급경사지",
    "생활권 노출도 높음",
    "도로 인접",
    "피해도 높음",
    "일반 모니터링",
  ];

  return priority.filter((tag) => tags.includes(tag)).slice(0, limit);
}

function getCandidateExplanation(candidateInput) {
  const c = normalizeCandidate(candidateInput);
  return CANDIDATE_EXPLANATIONS[c.id] || `${c.name}은 최종 점수 ${c.priorityScore}점, ${c.grade}(${c.gradeLabel})으로 분류된 후보지입니다. 주요 위험요인은 ${selectCoreRisks(c).join(", ") || "복합 위험 요인"}이며, 현장 조사 결과에 따라 복원 우선순위 반영 여부를 검토해야 합니다.`;
}

function buildDashboardPolicyInsight(candidates) {
  const ranked = rankCandidates(candidates);
  const summary = getDashboardSummary(ranked);
  const top = ranked[0];

  if (!top) {
    return "분석 가능한 후보지 데이터가 없어 정책적 해석을 생성할 수 없습니다.";
  }

  const grade1Text = summary.grade1Count > 0
    ? `1등급 후보지 ${summary.grade1Count}곳은 장마 전 현장 점검과 우선 복원 검토가 필요합니다.`
    : "1등급 후보지는 없지만, 2등급 후보지는 단기 복원 계획에 포함해 검토할 필요가 있습니다.";

  return `총 ${summary.totalCandidates}개 후보지를 분석한 결과, ${top.name}이 ${top.priorityScore}점으로 가장 높은 복원 우선순위를 보였습니다. ${grade1Text} 특히 생활권과 가까운 후보지는 산림 복구뿐 아니라 주민 안전과 기반시설 보호 관점에서 우선 관리해야 합니다.`;
}

function buildCandidateDashboardDescriptions(candidates) {
  return rankCandidates(candidates).map((candidate) => ({
    id: candidate.id,
    name: candidate.name,
    rank: candidate.rank,
    grade: candidate.grade,
    gradeLabel: candidate.gradeLabel,
    priorityScore: candidate.priorityScore,
    coreRisks: selectCoreRisks(candidate),
    explanation: getCandidateExplanation(candidate),
  }));
}

module.exports = {
  PRIORITY_WEIGHTS,
  GRADE_RULES,
  AI_AGENT_STEPS,
  RISK_TAG_RULES,
  normalizeCandidate,
  calculatePriorityScore,
  getGradeInfo,
  rankCandidates,
  getDashboardSummary,
  buildScoreRationale,
  buildAnalysisLogs,
  buildAgentExplanation,
  buildPolicyReportPrompt,
  buildEmailDraftPrompt,
  generateFallbackPolicyReport,
  generateFallbackEmailDraft,
  INDICATOR_DEFINITIONS,
  FINAL_RISK_TAG_RULES,
  CANDIDATE_EXPLANATIONS,
  DASHBOARD_POLICY_SENTENCES,
  extractRiskTags,
  selectCoreRisks,
  getCandidateExplanation,
  buildDashboardPolicyInsight,
  buildCandidateDashboardDescriptions,
};
