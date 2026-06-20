/**
 * 백엔드 친구의 Express 서버에 Gemini/LLM 기반 AI 기능을 붙인 server.js 예시입니다.
 *
 * 사용법:
 * 1) 기존 backend/server.js를 백업합니다.
 * 2) 이 파일 내용을 backend/server.js에 복사합니다.
 * 3) backend/data/demoCandidatesAE.js, backend/lib/aiSupport.js, backend/lib/geminiClient.js,
 *    backend/lib/simpleEnv.js, backend/lib/aiRoutes.js를 추가합니다.
 * 4) .env에 GEMINI_API_KEY를 넣고 npm run dev를 실행합니다.
 */

const express = require("express");
const cors = require("cors");

const mockCandidates = require("./data/mockCandidates");
const demoCandidatesAE = require("./data/demoCandidatesAE");
const { withScoreAndGrade } = require("./lib/scoring");
const { fetchLandslideRiskScore } = require("./lib/landslideRiskClient");
const { normalizeCandidate } = require("./lib/aiSupport");
const { createAiRoutes } = require("./lib/aiRoutes");
const { loadEnv } = require("./lib/simpleEnv");

loadEnv();

const app = express();
app.use(cors());
app.use(express.json());

// SAFEMAP_API_KEY가 설정되어 있으면 행정안전부 산사태위험지도 WMS 실데이터로
// disasterVuln을 덮어쓰고, 키가 없거나 호출이 실패하면 mock 값을 그대로 둔다.
async function withRealDisasterVuln(candidate) {
  if (!candidate?.location?.lat || !candidate?.location?.lng) {
    return candidate;
  }

  const realScore = await fetchLandslideRiskScore(
    candidate.location.lat,
    candidate.location.lng
  );
  if (realScore === null) return candidate;
  return { ...candidate, disasterVuln: realScore, landslideRiskScore: realScore };
}

function shouldUseDemo(req) {
  return req.query.mode === "demo" || req.body?.mode === "demo";
}

async function getCandidates(req) {
  if (shouldUseDemo(req)) {
    return demoCandidatesAE.map(normalizeCandidate);
  }

  const enriched = await Promise.all(mockCandidates.map(withRealDisasterVuln));
  return enriched.map((candidate) => normalizeCandidate(withScoreAndGrade(candidate)));
}

async function findCandidateById(id, req) {
  const candidates = await getCandidates(req);
  return candidates.find((candidate) => Number(candidate.id) === Number(id));
}

// 기존 후보지 API
app.get("/api/candidates", async (req, res) => {
  const candidates = await getCandidates(req);
  res.json(candidates);
});

app.get("/api/candidates/:id", async (req, res) => {
  const candidate = await findCandidateById(Number(req.params.id), req);
  if (!candidate) {
    return res.status(404).json({ error: "candidate not found" });
  }
  res.json(candidate);
});

// A~E 시연용 후보지 확인 API
app.get("/api/demo-candidates", (req, res) => {
  res.json(demoCandidatesAE.map(normalizeCandidate));
});

// AI 담당 API
app.use(
  "/api",
  createAiRoutes({
    express,
    getCandidates,
    findCandidateById,
  })
);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`backend listening on port ${PORT}`);
  console.log("AI endpoints enabled:");
  console.log("- GET  /api/ai-config");
  console.log("- GET  /api/analyze?mode=demo");
  console.log("- POST /api/report");
  console.log("- POST /api/email-draft");
  console.log("- POST /api/agent-explanation");
});
