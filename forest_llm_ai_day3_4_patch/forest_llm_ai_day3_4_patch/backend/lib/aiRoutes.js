/**
 * Express 라우터 생성 함수
 *
 * 기존 server.js에 직접 붙일 수도 있고,
 * 아래처럼 분리해서 사용할 수도 있습니다.
 *
 * const { createAiRoutes } = require("./lib/aiRoutes");
 * app.use("/api", createAiRoutes({ getCandidates }));
 */

const {
  AI_AGENT_STEPS,
  RISK_TAG_RULES,
  PRIORITY_WEIGHTS,
  GRADE_RULES,
  normalizeCandidate,
  rankCandidates,
  getDashboardSummary,
  buildAnalysisLogs,
  buildAgentExplanation,
  buildScoreRationale,
  buildPolicyReportPrompt,
  buildEmailDraftPrompt,
  generateFallbackPolicyReport,
  generateFallbackEmailDraft,
  INDICATOR_DEFINITIONS,
  FINAL_RISK_TAG_RULES,
  DASHBOARD_POLICY_SENTENCES,
  extractRiskTags,
  selectCoreRisks,
  getCandidateExplanation,
  buildDashboardPolicyInsight,
  buildCandidateDashboardDescriptions,
} = require("./aiSupport");
const { generateWithGemini } = require("./geminiClient");

function createAiRoutes({ express, getCandidates, findCandidateById }) {
  const router = express.Router();

  router.get("/ai-config", (req, res) => {
    res.json({
      agentSteps: AI_AGENT_STEPS,
      priorityWeights: PRIORITY_WEIGHTS,
      gradeRules: GRADE_RULES,
      riskTagRules: RISK_TAG_RULES,
      finalRiskTagRules: FINAL_RISK_TAG_RULES,
      indicatorDefinitions: INDICATOR_DEFINITIONS,
      dashboardPolicySentences: DASHBOARD_POLICY_SENTENCES,
      formula:
        "복원 우선순위 점수 = 0.25×산불피해도 + 0.20×산사태위험도 + 0.20×토사유출위험도 + 0.35×생활권노출도",
    });
  });

  router.get("/analyze", async (req, res) => {
    const candidates = await getCandidates(req);
    const ranked = rankCandidates(candidates);
    const topCandidates = ranked.slice(0, 5);

    res.json({
      summary: getDashboardSummary(ranked),
      topCandidates,
      allCandidates: ranked,
      analysisLogs: buildAnalysisLogs(ranked),
      agentExplanation: buildAgentExplanation(ranked),
      dashboardPolicyInsight: buildDashboardPolicyInsight(ranked),
      candidateDescriptions: buildCandidateDashboardDescriptions(ranked),
      indicatorDefinitions: INDICATOR_DEFINITIONS,
      scoreRationales: ranked.map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        rationale: buildScoreRationale(candidate),
        coreRisks: selectCoreRisks(candidate),
        autoRiskTags: extractRiskTags(candidate),
        explanation: getCandidateExplanation(candidate),
      })),
    });
  });



  router.get("/candidate-descriptions", async (req, res) => {
    const candidates = await getCandidates(req);
    const ranked = rankCandidates(candidates);
    res.json({
      dashboardPolicyInsight: buildDashboardPolicyInsight(ranked),
      candidateDescriptions: buildCandidateDashboardDescriptions(ranked),
      indicatorDefinitions: INDICATOR_DEFINITIONS,
      riskTagRules: FINAL_RISK_TAG_RULES,
    });
  });

  router.post("/report", async (req, res) => {
    const { id, useGemini = true } = req.body || {};
    const candidate = await findCandidateById(Number(id), req);

    if (!candidate) {
      return res.status(404).json({ error: "candidate not found" });
    }

    const normalized = normalizeCandidate(candidate);
    const fallback = generateFallbackPolicyReport(normalized);
    const prompt = buildPolicyReportPrompt(normalized);

    const result = useGemini
      ? await generateWithGemini(prompt, {
          fallback,
          temperature: 0.35,
          maxOutputTokens: 1200,
        })
      : { ok: false, source: "fallback", reason: "useGemini=false", text: fallback };

    res.json({
      candidateId: normalized.id,
      candidateName: normalized.name,
      source: result.source,
      model: result.model || null,
      reason: result.reason || null,
      prompt,
      report: result.text,
    });
  });

  router.post("/email-draft", async (req, res) => {
    const { id, reportSummary = "", useGemini = true } = req.body || {};
    const candidate = await findCandidateById(Number(id), req);

    if (!candidate) {
      return res.status(404).json({ error: "candidate not found" });
    }

    const normalized = normalizeCandidate(candidate);
    const fallbackEmail = generateFallbackEmailDraft(normalized, reportSummary);
    const prompt = buildEmailDraftPrompt(normalized, reportSummary);

    const result = useGemini
      ? await generateWithGemini(prompt, {
          fallback: `제목: ${fallbackEmail.subject}\n본문:\n${fallbackEmail.body}`,
          temperature: 0.4,
          maxOutputTokens: 1000,
        })
      : {
          ok: false,
          source: "fallback",
          reason: "useGemini=false",
          text: `제목: ${fallbackEmail.subject}\n본문:\n${fallbackEmail.body}`,
        };

    res.json({
      candidateId: normalized.id,
      candidateName: normalized.name,
      to: normalized.agency,
      source: result.source,
      model: result.model || null,
      reason: result.reason || null,
      prompt,
      rawDraft: result.text,
      fallbackParsed: fallbackEmail,
    });
  });

  router.post("/agent-explanation", async (req, res) => {
    const candidates = await getCandidates(req);
    const ranked = rankCandidates(candidates);
    const fallback = buildAgentExplanation(ranked);
    const prompt = `너는 산림복원 AI Agent의 분석 과정을 설명하는 발표용 문장을 작성하는 AI다.\n\n아래 분석 로그와 TOP 후보지 정보를 바탕으로 500자 이내의 발표용 설명을 작성하라.\n\n[분석 로그]\n${JSON.stringify(buildAnalysisLogs(ranked), null, 2)}\n\n[TOP 후보지]\n${JSON.stringify(ranked.slice(0, 5), null, 2)}`;

    const result = await generateWithGemini(prompt, {
      fallback,
      temperature: 0.35,
      maxOutputTokens: 900,
    });

    res.json({
      source: result.source,
      model: result.model || null,
      reason: result.reason || null,
      explanation: result.text,
      logs: buildAnalysisLogs(ranked),
    });
  });

  return router;
}

module.exports = { createAiRoutes };
