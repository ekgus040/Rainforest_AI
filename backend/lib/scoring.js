const WEIGHTS = {
  fireDamage: 0.25,
  disasterVuln: 0.20,
  residentialExposure: 0.35,
  restorationDifficulty: 0.20,
};

function calculateScore(candidate) {
  const score =
    candidate.fireDamage * WEIGHTS.fireDamage +
    candidate.disasterVuln * WEIGHTS.disasterVuln +
    candidate.residentialExposure * WEIGHTS.residentialExposure +
    candidate.restorationDifficulty * WEIGHTS.restorationDifficulty;
  return Math.round(score * 10) / 10;
}

function calculateGrade(score) {
  if (score >= 80) return 1;
  if (score >= 65) return 2;
  if (score >= 50) return 3;
  if (score >= 35) return 4;
  return 5;
}

function withScoreAndGrade(candidate) {
  const score = calculateScore(candidate);
  const grade = calculateGrade(score);
  return { ...candidate, score, grade };
}

module.exports = { calculateScore, calculateGrade, withScoreAndGrade, WEIGHTS };
