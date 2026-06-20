/**
 * 후보지 A~E 시연용 데이터
 *
 * 사용자가 작성한 후보지 A~E 데이터를 백엔드 Express 서버에서 바로 사용할 수 있도록
 * CommonJS module.exports 형식으로 정리한 파일입니다.
 *
 * 원래 AI 지표명:
 * - fireDamageScore: 산불피해도
 * - landslideRiskScore: 산사태위험도
 * - soilRunoffRiskScore: 토사유출위험도
 * - exposureScore: 생활권노출도
 *
 * 백엔드 기존 scoring.js 호환 alias:
 * - fireDamage = fireDamageScore
 * - disasterVuln = landslideRiskScore
 * - restorationDifficulty = soilRunoffRiskScore
 * - residentialExposure = exposureScore
 */

const demoCandidatesAE = [
  {
    id: 1,
    name: "후보지 A",
    region: "경북 의성군",
    location: { lat: 36.35, lng: 128.68 },
    latitude: 36.35,
    longitude: 128.68,

    fireDamageScore: 90,
    landslideRiskScore: 80,
    soilRunoffRiskScore: 75,
    exposureScore: 95,

    // 기존 백엔드 scoring.js 호환 alias
    fireDamage: 90,
    disasterVuln: 80,
    restorationDifficulty: 75,
    residentialExposure: 95,

    priorityScore: 86.75,
    gradeLabel: "즉시 복원 필요",

    slope: 31,
    rainfallRisk: "높음",
    landslideRisk: "높음",

    distanceToHouse: 180,
    distanceToRoad: 90,
    distanceToRiver: 220,

    jurisdiction: "의성군청 산림녹지과",
    agency: "의성군청 산림녹지과",

    riskTags: ["민가 인접", "급경사지", "토사유출 위험"],
    mainRisks: ["민가 인접", "급경사지", "토사유출 위험"],
    summary:
      "산불 피해도와 생활권 노출도가 모두 높고, 민가와 도로에 가까워 장마철 2차 피해 가능성이 큰 고위험 후보지이다.",
  },
  {
    id: 2,
    name: "후보지 B",
    region: "경북 의성군",
    location: { lat: 36.39, lng: 128.72 },
    latitude: 36.39,
    longitude: 128.72,

    fireDamageScore: 82,
    landslideRiskScore: 70,
    soilRunoffRiskScore: 68,
    exposureScore: 75,

    fireDamage: 82,
    disasterVuln: 70,
    restorationDifficulty: 68,
    residentialExposure: 75,

    priorityScore: 74.35,
    gradeLabel: "우선 복원 권장",

    slope: 24,
    rainfallRisk: "중간",
    landslideRisk: "중간",

    distanceToHouse: 520,
    distanceToRoad: 210,
    distanceToRiver: 350,

    jurisdiction: "의성군청 산림녹지과",
    agency: "의성군청 산림녹지과",

    riskTags: ["도로 인접", "중간 수준 산사태 위험"],
    mainRisks: ["도로 인접", "중간 수준 산사태 위험"],
    summary:
      "산불 피해도와 재해위험이 중간 이상이며 도로와 가까워 우선 복원 검토가 필요한 후보지이다.",
  },
  {
    id: 3,
    name: "후보지 C",
    region: "경북 의성군",
    location: { lat: 36.31, lng: 128.64 },
    latitude: 36.31,
    longitude: 128.64,

    fireDamageScore: 88,
    landslideRiskScore: 90,
    soilRunoffRiskScore: 87,
    exposureScore: 82,

    fireDamage: 88,
    disasterVuln: 90,
    restorationDifficulty: 87,
    residentialExposure: 82,

    priorityScore: 86.1,
    gradeLabel: "즉시 복원 필요",

    slope: 36,
    rainfallRisk: "높음",
    landslideRisk: "매우 높음",

    distanceToHouse: 310,
    distanceToRoad: 150,
    distanceToRiver: 180,

    jurisdiction: "의성군청 재난안전과",
    agency: "의성군청 재난안전과",

    riskTags: ["산사태 위험", "하천 인접", "급경사지"],
    mainRisks: ["산사태 위험", "하천 인접", "급경사지"],
    summary:
      "산사태 위험도와 토사유출 위험도가 매우 높고 하천과 가까워 집중호우 시 2차 피해 가능성이 큰 후보지이다.",
  },
  {
    id: 4,
    name: "후보지 D",
    region: "경북 의성군",
    location: { lat: 36.44, lng: 128.75 },
    latitude: 36.44,
    longitude: 128.75,

    fireDamageScore: 60,
    landslideRiskScore: 48,
    soilRunoffRiskScore: 45,
    exposureScore: 40,

    fireDamage: 60,
    disasterVuln: 48,
    restorationDifficulty: 45,
    residentialExposure: 40,

    priorityScore: 47.6,
    gradeLabel: "지속 관찰 대상",

    slope: 15,
    rainfallRisk: "낮음",
    landslideRisk: "낮음",

    distanceToHouse: 980,
    distanceToRoad: 600,
    distanceToRiver: 720,

    jurisdiction: "의성군청 산림녹지과",
    agency: "의성군청 산림녹지과",

    riskTags: ["생활권 거리 멂", "일반 모니터링"],
    mainRisks: ["생활권 거리 멂", "일반 모니터링"],
    summary:
      "생활권과 거리가 있고 재해위험이 낮아 즉시 복원보다는 지속 관찰과 자연회복 가능성 검토가 적절한 후보지이다.",
  },
  {
    id: 5,
    name: "후보지 E",
    region: "경북 의성군",
    location: { lat: 36.28, lng: 128.7 },
    latitude: 36.28,
    longitude: 128.7,

    fireDamageScore: 75,
    landslideRiskScore: 65,
    soilRunoffRiskScore: 70,
    exposureScore: 88,

    fireDamage: 75,
    disasterVuln: 65,
    restorationDifficulty: 70,
    residentialExposure: 88,

    priorityScore: 76.55,
    gradeLabel: "우선 복원 권장",

    slope: 22,
    rainfallRisk: "중간",
    landslideRisk: "중간",

    distanceToHouse: 260,
    distanceToRoad: 340,
    distanceToRiver: 410,

    jurisdiction: "의성군청 산림녹지과",
    agency: "의성군청 산림녹지과",

    riskTags: ["민가 인접", "생활권 노출도 높음"],
    mainRisks: ["민가 인접", "생활권 노출도 높음"],
    summary:
      "산불 피해도는 최상위는 아니지만 민가와 가까워 생활권 노출도 측면에서 우선 복원 검토가 필요한 후보지이다.",
  },
];

module.exports = demoCandidatesAE;
