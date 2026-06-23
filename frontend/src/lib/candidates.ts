/**
 * MVP demo data helpers for the forest restoration AI dashboard.
 *
 * Data source: src/data/candidates.json (mock/demo only).
 * In production, replace with API or public-data analysis results.
 */
import candidatesData from "../data/candidates.json";

export interface Candidate {
  id: number;
  name: string;
  region: string;
  description: string;
  latitude: number;
  longitude: number;
  fireDamageScore: number;
  landslideRiskScore: number;
  soilRunoffRiskScore: number;
  exposureScore: number;
  priorityScore: number;
  grade: string;
  gradeLabel: string;
  slope: number;
  rainfallRisk: string;
  landslideRisk: string;
  distanceToHouse: number;
  distanceToRoad: number;
  distanceToRiver: number;
  agency: string;
  mainRisks: string[];
  summary: string;
  candidateExplanation?: string;
  rank?: number;
  gradeAction?: string;
}

const candidates = candidatesData as Candidate[];

export function getAllCandidates(): Candidate[] {
  return [...candidates];
}

export function getSortedCandidates(): Candidate[] {
  return [...candidates].sort((a, b) => b.priorityScore - a.priorityScore);
}

export function getTopCandidate(): Candidate | undefined {
  return getSortedCandidates()[0];
}

export function getCandidateById(id: string | number | undefined): Candidate | undefined {
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  if (numId == null || Number.isNaN(numId)) return undefined;
  return candidates.find((c) => c.id === numId);
}

export function getGradeColor(grade: string): string {
  switch (grade) {
    case "1등급":
      return "#C62828";
    case "2등급":
      return "#E65100";
    case "3등급":
      return "#F9A825";
    case "4등급":
      return "#558B2F";
    case "5등급":
      return "#2E7D32";
    default:
      return "#9E9E9E";
  }
}

export function generateReportTitle(candidate: Candidate): string {
  return `2025년 ${candidate.region} ${candidate.name} 산불 피해지역 복원 우선순위 분석 보고서`;
}

export function generateAttachmentFileName(candidate: Candidate): string {
  const regionSlug = candidate.region.replace(/\s+/g, "_");
  const nameSlug = candidate.name.replace(/\s+/g, "");
  return `AI_복원우선순위_분석보고서_${regionSlug}_${nameSlug}.pdf`;
}

export function generateEmailSubject(candidate: Candidate): string {
  return `[협조요청] ${candidate.region} ${candidate.name} 산불 피해지역 복원 우선순위 분석 결과 공유`;
}

export function generateEmailBody(candidate: Candidate): string {
  return `안녕하세요.

산림 복원 AI 분석 시스템을 통해 ${candidate.region} 산불 피해지역에 대한 복원 우선순위 분석을 수행한 결과를 공유드립니다.

분석 결과, ${candidate.name}은 산불 피해도 ${candidate.fireDamageScore}점, 산사태 위험도 ${candidate.landslideRiskScore}점, 토사유출 위험도 ${candidate.soilRunoffRiskScore}점, 생활권 노출도 ${candidate.exposureScore}점으로 분석되었습니다. AI 종합 점수는 ${candidate.priorityScore}점이며, 해당 지역은 복원 우선순위 ${candidate.grade}(${candidate.gradeLabel})으로 분류되었습니다.

${candidate.summary}

첨부된 AI 정책 보고서를 검토하신 후, 현장 확인 및 복원 사업 추진 가능 여부를 검토해주시기 바랍니다.

감사합니다.`;
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${meters}m`;
}

/** Map lat/lng to approximate SVG map position (percent) for the demo map UI. */
export function latLngToMapPosition(candidate: Candidate): { x: number; y: number } {
  const minLat = 36.25;
  const maxLat = 36.46;
  const minLng = 128.6;
  const maxLng = 128.78;
  const x = ((candidate.longitude - minLng) / (maxLng - minLng)) * 30 + 40;
  const y = ((maxLat - candidate.latitude) / (maxLat - minLat)) * 30 + 25;
  return { x: Math.round(x), y: Math.round(y) };
}

export function getScoreColor(value: number): string {
  if (value >= 80) return "#C62828";
  if (value >= 60) return "#E65100";
  if (value >= 40) return "#F9A825";
  return "#558B2F";
}

export function getSortedRank(candidateId: number): number {
  const index = getSortedCandidates().findIndex((c) => c.id === candidateId);
  return index >= 0 ? index + 1 : candidateId;
}

// ===============================
// Backend API helpers
// ===============================

const API_BASE_URL = "http://localhost:4000";

export interface AnalyzeResult {
  summary: {
    totalCandidates: number;
    grade1Count: number;
    averageScore: number;
    topCandidateName: string;
    topRiskRegion: string;
    topScore: number;
  };
  topCandidates: Candidate[];
  allCandidates: Candidate[];
  analysisLogs: {
    step: number;
    name: string;
    role: string;
    status: string;
    message: string;
  }[];
  agentExplanation: string;
  candidateDescriptions?: {
    id?: number;
    candidateId?: number;
    name?: string;
    explanation?: string;
    rationale?: string;
    description?: string;
  }[];
  scoreRationales: {
    id: number;
    name: string;
    explanation?: string;
    rationale?: string;
  }[];
}

/**
 * 백엔드 후보지 데이터를 프론트 Candidate 구조에 맞게 보정
 */
export interface AiConfig {
  provider?: string;
  model?: string;
  useGemini?: boolean;
  mode?: string;
  [key: string]: unknown;
}

export interface AgentExplanationRequest {
  id?: number;
  candidateId?: number;
  candidate?: Candidate;
  analysisResult?: AnalyzeResult;
  mode?: string;
  useGemini?: boolean;
}

export interface AgentExplanationResult {
  explanation: string;
  raw: unknown;
}

export function normalizeApiCandidate(candidate: any): Candidate {
  return {
    id: candidate.id,
    name: candidate.name,
    region: candidate.region ?? "",
    description: candidate.description ?? candidate.summary ?? "",
    latitude: candidate.latitude ?? candidate.location?.lat ?? 0,
    longitude: candidate.longitude ?? candidate.location?.lng ?? 0,
    fireDamageScore: candidate.fireDamageScore ?? 0,
    landslideRiskScore: candidate.landslideRiskScore ?? 0,
    soilRunoffRiskScore: candidate.soilRunoffRiskScore ?? 0,
    exposureScore: candidate.exposureScore ?? 0,
    priorityScore: candidate.priorityScore ?? 0,
    grade: candidate.grade ?? "",
    gradeLabel: candidate.gradeLabel ?? "",
    gradeAction: candidate.gradeAction ?? "",
    rank: candidate.rank,
    slope: candidate.slope ?? 0,
    rainfallRisk: candidate.rainfallRisk ?? "정보 없음",
    landslideRisk: candidate.landslideRisk ?? "정보 없음",
    distanceToHouse: candidate.distanceToHouse ?? 0,
    distanceToRoad: candidate.distanceToRoad ?? 0,
    distanceToRiver: candidate.distanceToRiver ?? 0,
    agency: candidate.agency ?? "",
    mainRisks: candidate.mainRisks ?? [],
    summary: candidate.summary ?? "",
    candidateExplanation: candidate.candidateExplanation,
  };
}

function extractCandidateExplanation(entry: any): string {
  const candidates = [
    entry?.explanation,
    entry?.rationale,
    entry?.description,
    entry?.message,
    entry?.content,
  ];

  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

export function getCandidateExplanationFromAnalyzeResult(
  data: AnalyzeResult,
  candidate: Candidate
): string {
  const candidateDescriptions = data.candidateDescriptions ?? [];
  const scoreRationales = data.scoreRationales ?? [];

  const descriptionEntry = candidateDescriptions.find((entry) => {
    const entryId = entry.id ?? entry.candidateId;
    return entryId === candidate.id || entry.name === candidate.name;
  });

  const description = extractCandidateExplanation(descriptionEntry);
  if (description) return description;

  const rationaleEntry = scoreRationales.find((entry) => {
    return entry.id === candidate.id || entry.name === candidate.name;
  });

  return extractCandidateExplanation(rationaleEntry);
}

function extractAgentExplanation(data: any): string {
  const candidates = [
    data?.explanation,
    data?.agentExplanation,
    data?.message,
    data?.rationale,
    data?.result?.explanation,
    data?.result?.agentExplanation,
    data?.result?.message,
    data?.data?.explanation,
    data?.data?.agentExplanation,
  ];

  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

export async function fetchAiConfig(): Promise<AiConfig> {
  const response = await fetch(`${API_BASE_URL}/api/ai-config`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("AI config API request failed");
  }

  return response.json();
}

export async function fetchAnalyzeResult(): Promise<AnalyzeResult> {
  const response = await fetch(`${API_BASE_URL}/api/analyze?mode=demo`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("분석 결과 API 호출 실패");
  }

  const data = await response.json();

  return {
    ...data,
    topCandidates: data.topCandidates.map(normalizeApiCandidate),
    allCandidates: data.allCandidates.map(normalizeApiCandidate),
    candidateDescriptions: data.candidateDescriptions ?? [],
    scoreRationales: data.scoreRationales ?? [],
  };
}

export async function fetchApiCandidates(): Promise<Candidate[]> {
  const data = await fetchAnalyzeResult();
  return data.topCandidates;
}

export async function fetchApiCandidateById(
  id: string | number | undefined
): Promise<Candidate | undefined> {
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  if (numId == null || Number.isNaN(numId)) return undefined;

  const data = await fetchAnalyzeResult();
  const candidate = data.allCandidates.find((candidate) => candidate.id === numId);
  if (!candidate) return undefined;

  return {
    ...candidate,
    candidateExplanation: getCandidateExplanationFromAnalyzeResult(data, candidate),
  };
}

export async function generateAgentExplanationFromApi(
  payload: AgentExplanationRequest = {}
): Promise<AgentExplanationResult> {
  const response = await fetch(`${API_BASE_URL}/api/agent-explanation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mode: "demo",
      ...payload,
    }),
  });

  if (!response.ok) {
    throw new Error("Agent explanation API request failed");
  }

  const data = await response.json();

  return {
    explanation: extractAgentExplanation(data),
    raw: data,
  };
}

export async function generatePolicyReportFromApi(
  id: number,
  useGemini = false
) {
  const response = await fetch(`${API_BASE_URL}/api/report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      useGemini,
      mode: "demo",
    }),
  });

  if (!response.ok) {
    throw new Error("정책 보고서 생성 API 호출 실패");
  }

  return response.json();
}

export async function generateEmailDraftFromApi(
  id: number,
  reportSummary: string,
  useGemini = false
) {
  const response = await fetch(`${API_BASE_URL}/api/email-draft`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      reportSummary,
      useGemini,
      mode: "demo",
    }),
  });

  if (!response.ok) {
    throw new Error("이메일 초안 생성 API 호출 실패");
  }

  return response.json();
}
