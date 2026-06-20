// 후보지 데이터
//
// 필드명은 ai/aiSupport.js의 normalizeCandidate()가 쓰는 표준 명세를 따른다
// (프론트/AI팀과 동일한 이름 사용, 레거시 별칭 없음).
//
// fireDamageScore는 산림청_산불통계데이터_20250911.csv(공공데이터포털, EUC-KR)의 시군구별
// 실제 피해면적(ha)을 다음 로그 정규화로 환산한 값:
//   fireDamageScore = round(100 * ln(1+ha) / ln(1+52707.3))
// 52707.3ha는 데이터셋 내 최대값(2025-03-22 의성 안계 산불, 한국 역대 최대 피해면적)을 기준으로 잡았다.
// sourceFire는 해당 시군구에서 면적이 가장 큰 실제 산불 1건의 출처 정보다.
// landslideRiskScore(산사태위험)는 lib/landslideRiskClient.js가 안전지도 WMS 키가 있을 때
// 실데이터로 덮어쓰고, 키가 없으면 아래 mock 값을 그대로 쓴다.
// exposureScore/soilRunoffRiskScore/mainRisks는 아직 실데이터 미연동(임의값).
//
// 필드 설명
// id                  : 후보지 고유 ID
// name                : 후보지명
// region              : 행정구역(시/군/구)
// agency              : 관할기관
// location            : { lat, lng }
// fireDamageScore     : 산불피해도 (0~100, 실데이터 기반)
// landslideRiskScore  : 산사태위험도 (0~100, mock/WMS)
// exposureScore       : 생활권노출도 (0~100, mock)
// soilRunoffRiskScore : 토사유출위험도 (0~100, mock)
// mainRisks           : 위험요인 태그 목록
// sourceFire          : 실제 매칭된 산불 사례 출처 (date, location, areaHa) | null(매칭 없음)

const mockCandidates = [
  { id: 1, name: "울진 북면 산불피해지 A", region: "경북 울진군", agency: "울진군청 산림과", location: { lat: 36.9930, lng: 129.4001 }, fireDamageScore: 89, landslideRiskScore: 78, exposureScore: 85, soilRunoffRiskScore: 60, mainRisks: ["산사태위험", "민가인접", "급경사지"], sourceFire: { date: "2022-03-04", location: "경북 울진 북면 두천", areaHa: 16301.98 } },
  { id: 2, name: "삼척 도계읍 산불피해지", region: "강원 삼척시", agency: "삼척시청 산림과", location: { lat: 37.2046, lng: 129.0860 }, fireDamageScore: 32, landslideRiskScore: 70, exposureScore: 65, soilRunoffRiskScore: 55, mainRisks: ["토사유출위험", "도로인접"], sourceFire: { date: "2025-08-25", location: "강원 삼척 가곡 오목", areaHa: 33 } },
  { id: 3, name: "안동 임하면 산불피해지", region: "경북 안동시", agency: "안동시청 산림과", location: { lat: 36.5765, lng: 128.8569 }, fireDamageScore: 23, landslideRiskScore: 60, exposureScore: 55, soilRunoffRiskScore: 45, mainRisks: ["하천인접"], sourceFire: { date: "2023-03-21", location: "경북 안동 도산 의일", areaHa: 10.84 } },
  { id: 4, name: "강릉 옥계면 산불피해지", region: "강원 강릉시", agency: "강릉시청 산림과", location: { lat: 37.6322, lng: 129.0667 }, fireDamageScore: 77, landslideRiskScore: 82, exposureScore: 90, soilRunoffRiskScore: 70, mainRisks: ["산사태위험", "민가인접", "급경사지", "도로인접"], sourceFire: { date: "2022-03-05", location: "강원 강릉 옥계 남양", areaHa: 4190.38 } },
  { id: 5, name: "고성 토성면 산불피해지", region: "강원 고성군", agency: "고성군청 산림과", location: { lat: 38.3815, lng: 128.4779 }, fireDamageScore: 8, landslideRiskScore: 45, exposureScore: 40, soilRunoffRiskScore: 35, mainRisks: ["경미피해"], sourceFire: { date: "2025-03-29", location: "강원 고성 개천 용안", areaHa: 1.51 } },
  { id: 6, name: "영덕 지품면 산불피해지", region: "경북 영덕군", agency: "영덕군청 산림과", location: { lat: 36.4147, lng: 129.2147 }, fireDamageScore: 55, landslideRiskScore: 65, exposureScore: 58, soilRunoffRiskScore: 50, mainRisks: ["토사유출위험"], sourceFire: { date: "2022-02-15", location: "경북 영덕 지품 삼화", areaHa: 405.69 } },
  { id: 7, name: "밀양 단장면 산불피해지", region: "경남 밀양시", agency: "밀양시청 산림과", location: { lat: 35.4543, lng: 128.8316 }, fireDamageScore: 60, landslideRiskScore: 72, exposureScore: 68, soilRunoffRiskScore: 58, mainRisks: ["산사태위험", "하천인접"], sourceFire: { date: "2022-05-31", location: "경남 밀양 부북 춘화", areaHa: 660.82 } },
  { id: 8, name: "함양 휴천면 산불피해지", region: "경남 함양군", agency: "함양군청 산림과", location: { lat: 35.4736, lng: 127.6722 }, fireDamageScore: 26, landslideRiskScore: 40, exposureScore: 35, soilRunoffRiskScore: 30, mainRisks: ["경미피해"], sourceFire: { date: "2022-03-04", location: "경남 함양 마천 가흥", areaHa: 16.3 } },
  { id: 9, name: "양양 현남면 산불피해지", region: "강원 양양군", agency: "양양군청 산림과", location: { lat: 38.0392, lng: 128.6635 }, fireDamageScore: 39, landslideRiskScore: 75, exposureScore: 80, soilRunoffRiskScore: 62, mainRisks: ["민가인접", "급경사지"], sourceFire: { date: "2022-04-22", location: "강원 양양 현북 원일전", areaHa: 70.44 } },
  { id: 10, name: "동해 망상동 산불피해지", region: "강원 동해시", agency: "동해시청 산림과", location: { lat: 37.5840, lng: 129.1135 }, fireDamageScore: 15, landslideRiskScore: 68, exposureScore: 72, soilRunoffRiskScore: 52, mainRisks: ["도로인접", "토사유출위험"], sourceFire: { date: "2022-02-22", location: "강원 동해 이로", areaHa: 3.95 } },
  { id: 11, name: "청송 진보면 산불피해지", region: "경북 청송군", agency: "청송군청 산림과", location: { lat: 36.4779, lng: 129.0697 }, fireDamageScore: 13, landslideRiskScore: 55, exposureScore: 48, soilRunoffRiskScore: 42, mainRisks: ["하천인접"], sourceFire: { date: "2023-03-06", location: "경북 청송 파천 송강", areaHa: 2.92 } },
  { id: 12, name: "포항 죽장면 산불피해지", region: "경북 포항시", agency: "포항시청 산림과", location: { lat: 36.1864, lng: 129.1932 }, fireDamageScore: 2, landslideRiskScore: 80, exposureScore: 88, soilRunoffRiskScore: 65, mainRisks: ["산사태위험", "민가인접"], sourceFire: { date: "2024-05-28", location: "경북 포항 북구 환호", areaHa: 0.3 } },
  { id: 13, name: "정선 임계면 산불피해지", region: "강원 정선군", agency: "정선군청 산림과", location: { lat: 37.4337, lng: 128.8765 }, fireDamageScore: 30, landslideRiskScore: 42, exposureScore: 38, soilRunoffRiskScore: 33, mainRisks: ["경미피해"], sourceFire: { date: "2025-02-21", location: "강원 정선 여량 유천", areaHa: 23.94 } },
  { id: 14, name: "산청 시천면 산불피해지", region: "경남 산청군", agency: "산청군청 산림과", location: { lat: 35.2316, lng: 127.8525 }, fireDamageScore: 75, landslideRiskScore: 62, exposureScore: 55, soilRunoffRiskScore: 48, mainRisks: ["급경사지"], sourceFire: { date: "2025-03-21", location: "경남 산청 시천 신천", areaHa: 3397.52 } },
  { id: 15, name: "거창 신원면 산불피해지", region: "경남 거창군", agency: "거창군청 산림과", location: { lat: 35.5879, lng: 127.8493 }, fireDamageScore: 22, landslideRiskScore: 58, exposureScore: 50, soilRunoffRiskScore: 44, mainRisks: ["토사유출위험"], sourceFire: { date: "2025-04-01", location: "경남 거창 북상 갈계", areaHa: 9.77 } },
  { id: 16, name: "태백 황지동 산불피해지", region: "강원 태백시", agency: "태백시청 산림과", location: { lat: 37.1641, lng: 128.9856 }, fireDamageScore: 15, landslideRiskScore: 74, exposureScore: 76, soilRunoffRiskScore: 56, mainRisks: ["민가인접", "도로인접"], sourceFire: { date: "2024-06-14", location: "강원 태백 동점", areaHa: 3.85 } },
  { id: 17, name: "봉화 춘양면 산불피해지", region: "경북 봉화군", agency: "봉화군청 산림과", location: { lat: 36.9485, lng: 128.9530 }, fireDamageScore: 45, landslideRiskScore: 50, exposureScore: 44, soilRunoffRiskScore: 38, mainRisks: ["하천인접"], sourceFire: { date: "2022-04-05", location: "경북 봉화 봉화 화천", areaHa: 130 } },
  { id: 18, name: "속초 도문동 산불피해지", region: "강원 속초시", agency: "속초시청 산림과", location: { lat: 38.1850, lng: 128.5722 }, fireDamageScore: 87, landslideRiskScore: 77, exposureScore: 83, soilRunoffRiskScore: 61, mainRisks: ["산사태위험", "민가인접"], sourceFire: null },
  { id: 19, name: "의성 안계면 산불피해지", region: "경북 의성군", agency: "의성군청 산림과", location: { lat: 36.4045, lng: 128.7186 }, fireDamageScore: 100, landslideRiskScore: 38, exposureScore: 32, soilRunoffRiskScore: 28, mainRisks: ["경미피해"], sourceFire: { date: "2025-03-22", location: "경북 의성 안계 용기", areaHa: 52707.3 } },
  { id: 20, name: "하동 화개면 산불피해지", region: "경남 하동군", agency: "하동군청 산림과", location: { lat: 35.2540, lng: 127.6817 }, fireDamageScore: 45, landslideRiskScore: 66, exposureScore: 60, soilRunoffRiskScore: 50, mainRisks: ["하천인접", "도로인접"], sourceFire: { date: "2023-03-11", location: "경남 하동 화개 범왕", areaHa: 128.5 } },
];

module.exports = mockCandidates;
