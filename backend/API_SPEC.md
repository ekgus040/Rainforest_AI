# API 스펙 (Day1)

점수 계산/정렬 로직은 Day2~3에서 구현. 여기서는 엔드포인트와 입출력 형태만 확정.

## GET /api/candidates
전체 후보지 원본 데이터(mockCandidates) 반환. 점수/등급 없음.

## GET /api/analyze
전체 후보지에 score(0~100)·grade(1~5) 부여 후 점수 내림차순 정렬, TOP5 + summary 반환.

응답 예시:
```json
{
  "summary": {
    "totalCandidates": 20,
    "grade1Count": 4,
    "topRiskRegion": "강원 강릉시",
    "averageScore": 61.4
  },
  "topCandidates": [
    { "id": 4, "name": "강릉 옥계면 산불피해지", "score": 87.5, "grade": 1, "...": "..." }
  ]
}
```

## GET /api/candidates/:id
후보지 단건 상세 (score/grade 포함) 반환. 없는 id면 404.

## POST /api/report
후보지 id 기반 정책 보고서 텍스트 생성(Gemini API, 실패 시 fallback 텍스트).

## POST /api/email-draft
후보지 id 기반 관할기관 이메일 초안 생성(Gemini API, 실패 시 fallback 텍스트).

---

## 후보지 데이터 필드 (data/mockCandidates.js)

| 필드 | 타입 | 설명 |
|---|---|---|
| id | number | 후보지 고유 ID |
| name | string | 후보지명 |
| region | string | 행정구역 |
| jurisdiction | string | 관할기관 |
| location | {lat, lng} | 좌표 |
| fireDamage | number(0~100) | 산불피해도 |
| disasterVuln | number(0~100) | 재해취약도 |
| residentialExposure | number(0~100) | 생활권노출도 |
| restorationDifficulty | number(0~100) | 복원난이도 |
| riskTags | string[] | 위험요인 태그 |

## 점수 계산 공식 (Day2 예정)

```
score = 0.25*fireDamage + 0.20*disasterVuln + 0.35*residentialExposure + 0.20*restorationDifficulty
```

등급: 80↑ 1등급 / 65↑ 2등급 / 50↑ 3등급 / 35↑ 4등급 / 그 외 5등급

## 실데이터 연동 — disasterVuln (산사태위험지도)

`lib/landslideRiskClient.js`에서 행정안전부 생활안전지도 WMS(`safemap.go.kr/openapi2/IF_0046_WMS`)를
좌표 기반으로 호출해 산사태위험등급(1~5)을 받아와 `disasterVuln`(0~100)으로 환산한다.

- `.env`의 `SAFEMAP_API_KEY`가 있으면: 실데이터로 `disasterVuln` 덮어씀
- 키가 없거나 호출 실패 시: `mockCandidates.js`에 박혀있는 기존 값 그대로 사용 (자동 fallback)

**주의**: safemap OpenAPI는 인증키 없이는 요청이 500으로 막혀서, 정확한 layer명과 응답 XML
구조를 이 시점에는 확인하지 못했다. `SAFEMAP_API_KEY` 발급 후 `landslideRiskClient.js`의
`LAYER_NAME`과 `parseRiskGrade()` 파싱 로직을 실제 응답에 맞게 검증/수정해야 한다.

## 폴더 구조

```
backend/
  lib/      백엔드 본인 작업 (scoring.js, landslideRiskClient.js)
  ai/       AI/LLM 담당 작업 (aiRoutes.js, aiSupport.js, geminiClient.js, simpleEnv.js)
  data/     mockCandidates.js(백엔드), demoCandidatesAE.js(AI팀 시연용), 실데이터 CSV
  server.js 위 둘을 합쳐서 Express 라우트로 노출
```

## AI팀 연동 엔드포인트 (ai/aiRoutes.js)

- `GET /api/ai-config` — 가중치/등급기준/위험태그 규칙 조회
- `GET /api/analyze` — 정렬+TOP5+summary (Day3). `?mode=demo`로 demoCandidatesAE 사용 가능
- `POST /api/report` — 정책 보고서 생성 (Gemini, 실패 시 fallback)
- `POST /api/email-draft` — 관할기관 이메일 초안 생성 (Gemini, 실패 시 fallback)
- `POST /api/agent-explanation` — AI Agent 분석 과정 설명문 생성
- `GET /api/demo-candidates` — 후보지 A~E 시연 데이터 조회

`GEMINI_API_KEY`가 `.env`에 없으면 `generateFallbackPolicyReport`/`generateFallbackEmailDraft`로 자동 fallback.
