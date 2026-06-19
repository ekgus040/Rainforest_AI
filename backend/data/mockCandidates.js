// Day1: 후보지 mock 데이터
// score/grade는 Day2 점수계산 로직에서 채워짐 (여기서는 원본 지표만 보관)
//
// 필드 설명
// id                     : 후보지 고유 ID
// name                   : 후보지명
// region                 : 행정구역(시/군/구)
// jurisdiction           : 관할기관
// location               : { lat, lng }
// fireDamage             : 산불피해도 (0~100)
// disasterVuln           : 재해취약도 (0~100)
// residentialExposure    : 생활권노출도 (0~100)
// restorationDifficulty  : 복원난이도 (0~100)
// riskTags               : 위험요인 태그 목록

const mockCandidates = [
  { id: 1, name: "울진 북면 산불피해지 A", region: "경북 울진군", jurisdiction: "울진군청 산림과", location: { lat: 36.9930, lng: 129.4001 }, fireDamage: 92, disasterVuln: 78, residentialExposure: 85, restorationDifficulty: 60, riskTags: ["산사태위험", "민가인접", "급경사지"] },
  { id: 2, name: "삼척 도계읍 산불피해지", region: "강원 삼척시", jurisdiction: "삼척시청 산림과", location: { lat: 37.2046, lng: 129.0860 }, fireDamage: 88, disasterVuln: 70, residentialExposure: 65, restorationDifficulty: 55, riskTags: ["토사유출위험", "도로인접"] },
  { id: 3, name: "안동 임하면 산불피해지", region: "경북 안동시", jurisdiction: "안동시청 산림과", location: { lat: 36.5765, lng: 128.8569 }, fireDamage: 75, disasterVuln: 60, residentialExposure: 55, restorationDifficulty: 45, riskTags: ["하천인접"] },
  { id: 4, name: "강릉 옥계면 산불피해지", region: "강원 강릉시", jurisdiction: "강릉시청 산림과", location: { lat: 37.6322, lng: 129.0667 }, fireDamage: 95, disasterVuln: 82, residentialExposure: 90, restorationDifficulty: 70, riskTags: ["산사태위험", "민가인접", "급경사지", "도로인접"] },
  { id: 5, name: "고성 토성면 산불피해지", region: "강원 고성군", jurisdiction: "고성군청 산림과", location: { lat: 38.3815, lng: 128.4779 }, fireDamage: 60, disasterVuln: 45, residentialExposure: 40, restorationDifficulty: 35, riskTags: ["경미피해"] },
  { id: 6, name: "영덕 지품면 산불피해지", region: "경북 영덕군", jurisdiction: "영덕군청 산림과", location: { lat: 36.4147, lng: 129.2147 }, fireDamage: 70, disasterVuln: 65, residentialExposure: 58, restorationDifficulty: 50, riskTags: ["토사유출위험"] },
  { id: 7, name: "밀양 단장면 산불피해지", region: "경남 밀양시", jurisdiction: "밀양시청 산림과", location: { lat: 35.4543, lng: 128.8316 }, fireDamage: 80, disasterVuln: 72, residentialExposure: 68, restorationDifficulty: 58, riskTags: ["산사태위험", "하천인접"] },
  { id: 8, name: "함양 휴천면 산불피해지", region: "경남 함양군", jurisdiction: "함양군청 산림과", location: { lat: 35.4736, lng: 127.6722 }, fireDamage: 55, disasterVuln: 40, residentialExposure: 35, restorationDifficulty: 30, riskTags: ["경미피해"] },
  { id: 9, name: "양양 현남면 산불피해지", region: "강원 양양군", jurisdiction: "양양군청 산림과", location: { lat: 38.0392, lng: 128.6635 }, fireDamage: 85, disasterVuln: 75, residentialExposure: 80, restorationDifficulty: 62, riskTags: ["민가인접", "급경사지"] },
  { id: 10, name: "동해 망상동 산불피해지", region: "강원 동해시", jurisdiction: "동해시청 산림과", location: { lat: 37.5840, lng: 129.1135 }, fireDamage: 78, disasterVuln: 68, residentialExposure: 72, restorationDifficulty: 52, riskTags: ["도로인접", "토사유출위험"] },
  { id: 11, name: "청송 진보면 산불피해지", region: "경북 청송군", jurisdiction: "청송군청 산림과", location: { lat: 36.4779, lng: 129.0697 }, fireDamage: 65, disasterVuln: 55, residentialExposure: 48, restorationDifficulty: 42, riskTags: ["하천인접"] },
  { id: 12, name: "포항 죽장면 산불피해지", region: "경북 포항시", jurisdiction: "포항시청 산림과", location: { lat: 36.1864, lng: 129.1932 }, fireDamage: 90, disasterVuln: 80, residentialExposure: 88, restorationDifficulty: 65, riskTags: ["산사태위험", "민가인접"] },
  { id: 13, name: "정선 임계면 산불피해지", region: "강원 정선군", jurisdiction: "정선군청 산림과", location: { lat: 37.4337, lng: 128.8765 }, fireDamage: 58, disasterVuln: 42, residentialExposure: 38, restorationDifficulty: 33, riskTags: ["경미피해"] },
  { id: 14, name: "산청 시천면 산불피해지", region: "경남 산청군", jurisdiction: "산청군청 산림과", location: { lat: 35.2316, lng: 127.8525 }, fireDamage: 72, disasterVuln: 62, residentialExposure: 55, restorationDifficulty: 48, riskTags: ["급경사지"] },
  { id: 15, name: "거창 신원면 산불피해지", region: "경남 거창군", jurisdiction: "거창군청 산림과", location: { lat: 35.5879, lng: 127.8493 }, fireDamage: 68, disasterVuln: 58, residentialExposure: 50, restorationDifficulty: 44, riskTags: ["토사유출위험"] },
  { id: 16, name: "태백 황지동 산불피해지", region: "강원 태백시", jurisdiction: "태백시청 산림과", location: { lat: 37.1641, lng: 128.9856 }, fireDamage: 82, disasterVuln: 74, residentialExposure: 76, restorationDifficulty: 56, riskTags: ["민가인접", "도로인접"] },
  { id: 17, name: "봉화 춘양면 산불피해지", region: "경북 봉화군", jurisdiction: "봉화군청 산림과", location: { lat: 36.9485, lng: 128.9530 }, fireDamage: 62, disasterVuln: 50, residentialExposure: 44, restorationDifficulty: 38, riskTags: ["하천인접"] },
  { id: 18, name: "속초 도문동 산불피해지", region: "강원 속초시", jurisdiction: "속초시청 산림과", location: { lat: 38.1850, lng: 128.5722 }, fireDamage: 87, disasterVuln: 77, residentialExposure: 83, restorationDifficulty: 61, riskTags: ["산사태위험", "민가인접"] },
  { id: 19, name: "의성 단촌면 산불피해지", region: "경북 의성군", jurisdiction: "의성군청 산림과", location: { lat: 36.4045, lng: 128.7186 }, fireDamage: 50, disasterVuln: 38, residentialExposure: 32, restorationDifficulty: 28, riskTags: ["경미피해"] },
  { id: 20, name: "하동 화개면 산불피해지", region: "경남 하동군", jurisdiction: "하동군청 산림과", location: { lat: 35.2540, lng: 127.6817 }, fireDamage: 76, disasterVuln: 66, residentialExposure: 60, restorationDifficulty: 50, riskTags: ["하천인접", "도로인접"] },
];

module.exports = mockCandidates;
