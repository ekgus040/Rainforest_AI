# API 스펙

## GET /api/candidates
전체 후보지 데이터(score/grade 포함) 반환. `?mode=demo`로 demoCandidatesAE 사용 가능.

## GET /api/candidates/:id
후보지 단건 상세 반환. 없는 id면 404. `?mode=demo`도 동일하게 동작.

## GET /api/analyze
전체 후보지에 priorityScore·grade 부여 후 점수 내림차순 정렬, TOP5 + summary 반환.

응답 예시:
```json
{
  "summary": {
    "totalCandidates": 20,
    "grade1Count": 0,
    "averageScore": 54.5,
    "topCandidateName": "강릉 옥계면 산불피해지",
    "topRiskRegion": "강원 강릉시",
    "topScore": 81.15
  },
  "topCandidates": [ { "id": 4, "name": "강릉 옥계면 산불피해지", "priorityScore": 81.15, "grade": "2등급", "...": "..." } ]
}
```

## POST /api/report
후보지 id 기반 정책 보고서 텍스트 생성(Gemini API, 실패 시 fallback 텍스트).

## POST /api/email-draft
후보지 id 기반 관할기관 이메일 초안 생성(Gemini API, 실패 시 fallback 텍스트).

## GET /api/ai-config
가중치/등급기준/위험태그 규칙 조회.

## POST /api/agent-explanation
AI Agent 분석 과정 설명문 생성.

## GET /api/demo-candidates
후보지 A~E 시연 데이터 조회.

---

## 후보지 표준 필드 (ai/aiSupport.js의 normalizeCandidate가 최종 보장)

모든 `/api/candidates*`, `/api/analyze`, `/api/demo-candidates` 응답은 아래 필드명으로 통일된다.
레거시 별칭(`fireDamage`, `disasterVuln`, `residentialExposure`, `restorationDifficulty`,
`riskTags`, `jurisdiction`, `score`)은 더 이상 응답에 포함되지 않는다.

| 필드 | 타입 | 설명 |
|---|---|---|
| id | number | 후보지 고유 ID |
| name | string | 후보지명 |
| region | string | 행정구역 |
| agency | string | 관할기관 |
| location | {lat, lng} | 좌표 |
| fireDamageScore | number(0~100) | 산불피해도 |
| landslideRiskScore | number(0~100) | 산사태위험도 |
| exposureScore | number(0~100) | 생활권노출도 |
| soilRunoffRiskScore | number(0~100) | 토사유출위험도 |
| mainRisks | string[] | 위험요인 태그 |
| priorityScore | number(0~100) | 최종 복원 우선순위 점수 |
| grade / gradeLabel / gradeAction | string | 등급 및 설명 |
| sourceFire | {date, location, areaHa} \| null | mockCandidates 한정, 실제 매칭된 산불 사례 출처 |

## 점수 계산 공식 (ai/aiSupport.js calculatePriorityScore)

```
priorityScore = 0.25*fireDamageScore + 0.20*landslideRiskScore + 0.20*soilRunoffRiskScore + 0.35*exposureScore
```

등급(GRADE_RULES, 단일 기준): 85↑ "1등급" / 70↑ "2등급" / 55↑ "3등급" / 40↑ "4등급" / 그 외 "5등급"

> 과거 `lib/scoring.js`는 80/65/50/35 기준의 별도 등급 체계를 갖고 있어 위 기준과 충돌했다.
> 중복 코드라 삭제했고, 점수·등급 계산은 `ai/aiSupport.js` 한 곳에서만 한다.

## 실데이터 연동 — landslideRiskScore (산사태위험지도)

`lib/landslideRiskClient.js`에서 행정안전부 생활안전지도 WMS(`safemap.go.kr/openapi2/IF_0046_WMS`)를
좌표 기반으로 호출해 산사태위험등급(1~5)을 받아와 `landslideRiskScore`(0~100)로 환산한다.

- `.env`의 `SAFEMAP_API_KEY`가 있으면: 실데이터로 `landslideRiskScore` 덮어씀
- 키가 없거나 호출 실패 시: `mockCandidates.js`에 박혀있는 기존 값 그대로 사용 (자동 fallback)

**주의**: safemap OpenAPI는 인증키 없이는 요청이 500으로 막혀서, 정확한 layer명과 응답 XML
구조를 이 시점에는 확인하지 못했다. `SAFEMAP_API_KEY` 발급 후 `landslideRiskClient.js`의
`LAYER_NAME`과 `parseRiskGrade()` 파싱 로직을 실제 응답에 맞게 검증/수정해야 한다.

## 폴더 구조

```
backend/
  lib/      백엔드 본인 작업 (landslideRiskClient.js)
  ai/       AI/LLM 담당 작업 (aiRoutes.js, aiSupport.js, geminiClient.js, simpleEnv.js)
  data/     mockCandidates.js(백엔드), demoCandidatesAE.js(AI팀 시연용), 실데이터 CSV
  server.js 위 둘을 합쳐서 Express 라우트로 노출
```

`GEMINI_API_KEY`가 `.env`에 없으면 `generateFallbackPolicyReport`/`generateFallbackEmailDraft`로 자동 fallback.
