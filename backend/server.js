const express = require("express");
const cors = require("cors");
const mockCandidates = require("./data/mockCandidates");
const { withScoreAndGrade } = require("./lib/scoring");
const { fetchLandslideRiskScore } = require("./lib/landslideRiskClient");

const app = express();
app.use(cors());
app.use(express.json());

// SAFEMAP_API_KEY가 설정되어 있으면 행정안전부 산사태위험지도 WMS 실데이터로
// disasterVuln을 덮어쓰고, 키가 없거나 호출이 실패하면 mock 값을 그대로 둔다.
async function withRealDisasterVuln(candidate) {
  const realScore = await fetchLandslideRiskScore(
    candidate.location.lat,
    candidate.location.lng
  );
  if (realScore === null) return candidate;
  return { ...candidate, disasterVuln: realScore };
}

app.get("/api/candidates", async (req, res) => {
  const enriched = await Promise.all(mockCandidates.map(withRealDisasterVuln));
  res.json(enriched.map(withScoreAndGrade));
});

app.get("/api/candidates/:id", async (req, res) => {
  const candidate = mockCandidates.find((c) => c.id === Number(req.params.id));
  if (!candidate) {
    return res.status(404).json({ error: "candidate not found" });
  }
  const enriched = await withRealDisasterVuln(candidate);
  res.json(withScoreAndGrade(enriched));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`backend listening on port ${PORT}`);
});
