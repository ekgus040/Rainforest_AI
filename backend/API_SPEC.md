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
