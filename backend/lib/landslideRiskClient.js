// 행정안전부 생활안전지도 - 산사태위험지도 WMS (safemap.go.kr)
// 엔드포인트: https://www.safemap.go.kr/openapi2/IF_0046_WMS
//
// safemap OpenAPI는 회원가입 후 발급되는 authKey(apikey)가 없으면 요청 자체가 500으로
// 거부되어, 정확한 layer명/응답 스키마를 이 환경에서 확인하지 못했다.
// SAFEMAP_API_KEY를 발급받은 뒤 아래 LAYER_NAME과 파싱 로직을 안전지도 OpenAPI 문서
// (마이페이지 > Open API 신청 내역에서 제공되는 명세)에 맞춰 확인/수정해야 한다.
//
// 키가 없거나 호출이 실패하면 null을 반환 -> 호출부에서 mockCandidates의 기존 값으로 fallback.

const SAFEMAP_WMS_URL = "https://www.safemap.go.kr/openapi2/IF_0046_WMS";
const LAYER_NAME = "A2SM_LNDSLDRISKZON"; // TODO: authKey 발급 후 GetCapabilities로 정확한 레이어명 확인

// 산사태위험등급(1~5, 1이 가장 위험) -> disasterVuln(0~100) 환산
const GRADE_TO_SCORE = { 1: 95, 2: 80, 3: 60, 4: 40, 5: 20 };

async function fetchLandslideRiskScore(lat, lng) {
  const apiKey = process.env.SAFEMAP_API_KEY;
  if (!apiKey) return null;

  const delta = 0.0015;
  const bbox = [lng - delta, lat - delta, lng + delta, lat + delta].join(",");
  const params = new URLSearchParams({
    service: "WMS",
    version: "1.1.1",
    request: "GetFeatureInfo",
    layers: LAYER_NAME,
    query_layers: LAYER_NAME,
    styles: "",
    bbox,
    width: "10",
    height: "10",
    srs: "EPSG:4326",
    x: "5",
    y: "5",
    info_format: "text/xml",
    apikey: apiKey,
  });

  try {
    const res = await fetch(`${SAFEMAP_WMS_URL}?${params.toString()}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;

    const xml = await res.text();
    const grade = parseRiskGrade(xml);
    if (!grade) return null;
    return GRADE_TO_SCORE[grade] ?? null;
  } catch {
    return null;
  }
}

// TODO: 실제 응답 XML 구조를 authKey 발급 후 확인하여 정확한 태그명으로 교체
function parseRiskGrade(xml) {
  const match = xml.match(/<(?:GRADE|RISK_GRADE|DGRD)>\s*(\d+)\s*<\/(?:GRADE|RISK_GRADE|DGRD)>/i);
  return match ? Number(match[1]) : null;
}

module.exports = { fetchLandslideRiskScore };
