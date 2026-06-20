/**
 * Gemini API 호출 유틸
 *
 * - 외부 SDK 없이 Node.js의 fetch를 사용합니다. Node 18 이상 권장.
 * - GEMINI_API_KEY가 없거나 호출 실패 시 fallback을 반환할 수 있게 설계했습니다.
 * - .env 파일은 simpleEnv.js에서 가볍게 읽습니다.
 */

const { loadEnv } = require("./simpleEnv");
loadEnv();

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
}

async function generateWithGemini(prompt, options = {}) {
  const {
    systemInstruction = "너는 공공정책, 산림복원, 재난안전 분야의 의사결정 지원 문서를 작성하는 AI다. 모든 답변은 한국어로 작성한다.",
    model = DEFAULT_MODEL,
    temperature = 0.4,
    maxOutputTokens = 1200,
    fallback = "",
  } = options;

  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return {
      ok: false,
      source: "fallback",
      reason: "GEMINI_API_KEY가 설정되지 않아 fallback을 반환했습니다.",
      text: fallback,
    };
  }

  if (typeof fetch !== "function") {
    return {
      ok: false,
      source: "fallback",
      reason: "현재 Node.js 환경에서 fetch를 사용할 수 없습니다. Node 18 이상을 사용하거나 fallback을 사용하세요.",
      text: fallback,
    };
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature,
          maxOutputTokens,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        source: "fallback",
        reason: data?.error?.message || `Gemini API 오류: ${response.status}`,
        text: fallback,
      };
    }

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim() || "";

    if (!text) {
      return {
        ok: false,
        source: "fallback",
        reason: "Gemini 응답이 비어 있어 fallback을 반환했습니다.",
        text: fallback,
      };
    }

    return {
      ok: true,
      source: "gemini",
      model,
      text,
    };
  } catch (error) {
    return {
      ok: false,
      source: "fallback",
      reason: error.message,
      text: fallback,
    };
  }
}

module.exports = { generateWithGemini, getGeminiApiKey };
