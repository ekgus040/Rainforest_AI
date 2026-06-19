const express = require("express");
const cors = require("cors");
const mockCandidates = require("./data/mockCandidates");
const { withScoreAndGrade } = require("./lib/scoring");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/candidates", (req, res) => {
  res.json(mockCandidates.map(withScoreAndGrade));
});

app.get("/api/candidates/:id", (req, res) => {
  const candidate = mockCandidates.find((c) => c.id === Number(req.params.id));
  if (!candidate) {
    return res.status(404).json({ error: "candidate not found" });
  }
  res.json(withScoreAndGrade(candidate));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`backend listening on port ${PORT}`);
});
