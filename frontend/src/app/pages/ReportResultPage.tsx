import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft, TreePine, BarChart2, Layers, BookOpen,
  FileText, CheckCircle2, RefreshCw, Copy, Download,
  Mail, ChevronRight, AlertTriangle, Building2, ClipboardList,
} from "lucide-react";
import {
  fetchApiCandidateById,
  generatePolicyReportFromApi,
  getGradeColor,
  getScoreColor,
  generateReportTitle,
  getSortedRank,
  type Candidate,
} from "../../lib/candidates";
import CandidateNotFound from "../components/CandidateNotFound";

const restorationPhases = [
  {
    step: "1단계",
    title: "응급 복원 단계",
    color: "#C62828",
    bg: "#FFEBEE",
    items: [
      "집중호우 이전 토사유출 방지시설 설치",
      "침식 방지 매트 및 보호 구조물 설치",
      "산사태 위험 구간 긴급 안정화",
    ],
  },
  {
    step: "2단계",
    title: "재해 예방 단계",
    color: "#E65100",
    bg: "#FFF3E0",
    items: [
      "배수로 정비",
      "사면 안정화 공사",
      "산사태 취약구간 집중 관리",
      "재해 위험 모니터링 체계 구축",
    ],
  },
  {
    step: "3단계",
    title: "생태 복원 단계",
    color: "#558B2F",
    bg: "#F1F8E9",
    items: [
      "지역 기후와 토양에 적합한 수종 선정",
      "훼손 식생 복원",
      "복층 식생 조성",
      "생물다양성 회복 유도",
    ],
  },
  {
    step: "4단계",
    title: "사후 관리 단계",
    color: "#2E7D32",
    bg: "#E8F5E9",
    items: [
      "복원 효과 장기 모니터링",
      "추가 재해 위험 추적",
      "관리기관 협업 유지",
    ],
  },
];

const progressStages = [
  { label: "분석 완료", done: true },
  { label: "보고서 생성 완료", done: true },
  { label: "이메일 초안 작성", done: false, current: false },
  { label: "담당자 검토", done: false, current: false },
];

type PolicyReportResult = {
  title?: string;
  reportTitle?: string;
  summary?: string;
  reportSummary?: string;
  content?: string;
  report?: string | Record<string, unknown>;
  markdown?: string;
  sections?: {
    title?: string;
    content?: string;
    body?: string;
  }[];
  generatedAt?: string;
  [key: string]: unknown;
};

function extractReportTitle(reportData: PolicyReportResult | null, candidate: Candidate) {
  if (typeof reportData?.title === "string" && reportData.title.trim()) {
    return reportData.title;
  }

  if (typeof reportData?.reportTitle === "string" && reportData.reportTitle.trim()) {
    return reportData.reportTitle;
  }

  return generateReportTitle(candidate);
}

function extractReportText(reportData: PolicyReportResult | null, candidate: Candidate) {
  if (!reportData) {
    return "";
  }

  const candidates = [
    reportData.reportSummary,
    reportData.summary,
    reportData.content,
    reportData.markdown,
  ];

  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  if (typeof reportData.report === "string" && reportData.report.trim()) {
    return reportData.report.trim();
  }

  if (Array.isArray(reportData.sections)) {
    const sectionText = reportData.sections
      .map((section) => {
        const title = section.title?.trim();
        const content = section.content?.trim() || section.body?.trim();

        if (title && content) return `${title}\n${content}`;
        return title || content || "";
      })
      .filter(Boolean)
      .join("\n\n");

    if (sectionText.trim()) {
      return sectionText.trim();
    }
  }

  return `AI 분석 결과, ${candidate.name}(${candidate.region})은 ${candidate.grade}(${candidate.gradeLabel})으로 분류되었습니다. 산불 피해도 ${candidate.fireDamageScore}점, 산사태 위험도 ${candidate.landslideRiskScore}점, 토사유출 위험도 ${candidate.soilRunoffRiskScore}점, 생활권 노출도 ${candidate.exposureScore}점으로 평가되었습니다. ${candidate.agency}와의 협조를 통해 복원 사업 추진 여부를 신속히 검토할 필요가 있습니다.`;
}

function buildCopyText(candidate: Candidate, reportTitle: string, reportText: string) {
  return `${reportTitle}

대상 지역: ${candidate.region} ${candidate.name}
복원 우선등급: ${candidate.grade} (${candidate.gradeLabel})
AI 종합 점수: ${candidate.priorityScore}점
관할 기관: ${candidate.agency}

${reportText}`;
}

function SectionTitle({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-6 h-6 rounded bg-[#2F5D50] flex items-center justify-center flex-shrink-0">
        <span className="text-[10px] font-bold text-white">{num}</span>
      </div>
      <h3 className="text-[15px] font-semibold text-gray-900">{title}</h3>
    </div>
  );
}

export default function ReportResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [reportData, setReportData] = useState<PolicyReportResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pdfSaved, setPdfSaved] = useState(false);

  useEffect(() => {
    async function loadReport() {
      if (!id) {
        setApiError("후보지 ID가 없습니다.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setApiError(null);

        const candidateData = await fetchApiCandidateById(id);

        if (!candidateData) {
          setCandidate(null);
          return;
        }

        setCandidate(candidateData);

        const storageKey = `policy-report-${candidateData.id}`;
        const savedReport = sessionStorage.getItem(storageKey);

        if (savedReport) {
          setReportData(JSON.parse(savedReport));
        } else {
          const generatedReport = await generatePolicyReportFromApi(candidateData.id);
          sessionStorage.setItem(storageKey, JSON.stringify(generatedReport));
          setReportData(generatedReport);
        }
      } catch (error) {
        console.error("보고서 조회 실패:", error);
        setApiError("생성된 보고서를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    loadReport();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F6F4] flex items-center justify-center">
        <div className="bg-white rounded-lg border border-[#DDE3DC] shadow-sm px-8 py-6 text-center">
          <FileText className="w-10 h-10 text-[#2F5D50] mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#2F5D50] mb-2">
            생성된 보고서 불러오는 중
          </p>
          <p className="text-xs text-gray-500">
            백엔드 API에서 정책 보고서 결과를 확인하고 있습니다.
          </p>
        </div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="min-h-screen bg-[#F4F6F4] flex items-center justify-center">
        <div className="bg-white rounded-lg border border-red-200 shadow-sm px-8 py-6 text-center">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-sm font-semibold text-red-700 mb-2">
            보고서 조회 실패
          </p>
          <p className="text-xs text-gray-500 mb-4">
            {apiError}
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => navigate(`/candidate/${id}`)}
              className="px-4 py-2 border border-[#DDE3DC] text-xs text-gray-600 rounded hover:bg-gray-50"
            >
              상세페이지로 돌아가기
            </button>
            <button
              onClick={() => navigate(`/candidate/${id}/report-complete`)}
              className="px-4 py-2 bg-[#2F5D50] text-white text-xs font-semibold rounded"
            >
              보고서 다시 생성
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return <CandidateNotFound />;
  }

  const gradeColor = getGradeColor(candidate.grade);
  const sortedRank = candidate.rank ?? getSortedRank(candidate.id);
  const reportTitle = extractReportTitle(reportData, candidate);
  const reportText = extractReportText(reportData, candidate);

  const riskMetrics = [
    { label: "산불 피해도", value: candidate.fireDamageScore, color: getScoreColor(candidate.fireDamageScore) },
    { label: "산사태 위험도", value: candidate.landslideRiskScore, color: getScoreColor(candidate.landslideRiskScore) },
    { label: "토사유출 위험도", value: candidate.soilRunoffRiskScore, color: getScoreColor(candidate.soilRunoffRiskScore) },
    { label: "생활권 노출도", value: candidate.exposureScore, color: getScoreColor(candidate.exposureScore) },
  ];

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildCopyText(candidate, reportTitle, reportText));
    } catch (error) {
      console.error("보고서 복사 실패:", error);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePdfSaveMock() {
    setPdfSaved(true);
    setTimeout(() => setPdfSaved(false), 3000);
  }

  const navItems = [
    { label: "대시보드", path: "/dashboard", icon: <BarChart2 className="w-3.5 h-3.5" /> },
    { label: "TOP 후보지", path: "/top-candidates", icon: <Layers className="w-3.5 h-3.5" /> },
    { label: "분석 방법", path: "/methodology", icon: <BookOpen className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F4] flex flex-col">
      <nav className="bg-white border-b border-[#DDE3DC] sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-7 h-7 bg-[#2F5D50] rounded flex items-center justify-center">
                <TreePine className="w-4 h-4 text-white" />
              </div>
              <span className="text-[15px] font-semibold text-[#1C3A30] tracking-tight">산림 복원 AI</span>
            </button>
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(({ label, path, icon }) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded text-[13px] text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors font-medium"
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline text-emerald-600 font-medium">보고서 생성 완료</span>
          </div>
        </div>
      </nav>

      <div className="bg-[#1C3A30] border-b border-[#0f2218]">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-7">
          <button
            onClick={() => navigate(`/candidate/${candidate.id}/report-complete`)}
            className="flex items-center gap-1.5 text-[#6fbf9e] hover:text-white text-[11px] mb-4 transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            보고서 생성 확인으로 돌아가기
          </button>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold text-[#6fbf9e] uppercase tracking-widest mb-1.5">AI 정책 보고서</p>
              <h1 className="text-2xl md:text-[26px] font-bold text-white leading-snug mb-1.5">AI 정책 보고서</h1>
              <p className="text-[13px] text-white/60">
                {candidate.region} {candidate.name}에 대한 정책 보고서입니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: candidate.region, style: "bg-[#2F5D50]/60 text-[#A8D5C5] border-[#3D7A68]/50" },
                { label: candidate.name, style: "bg-[#2F5D50]/60 text-[#A8D5C5] border-[#3D7A68]/50" },
                { label: `분석 순위 #${sortedRank}`, style: "bg-[#1a2f28] text-[#7FB5A4] border-[#2F5D50]/60" },
                { label: candidate.grade, style: "bg-[#C62828]/30 text-red-200 border-[#C62828]/40" },
                { label: `AI 종합 점수 ${candidate.priorityScore}점`, style: "bg-[#1a2f28] text-[#7FB5A4] border-[#2F5D50]/60" },
                { label: "보고서 상태: 생성 완료", style: "bg-emerald-900/40 text-emerald-300 border-emerald-700/40" },
              ].map(({ label, style }) => (
                <span key={label} className={`${style} text-[11px] px-2.5 py-1 rounded border font-medium`}>{label}</span>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-0">
            {progressStages.map(({ label, done }, i) => (
              <div key={label} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border ${done ? "bg-[#2F5D50] border-[#2F5D50]" : "bg-transparent border-white/20"}`}>
                    {done ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <div className="w-1.5 h-1.5 rounded-full bg-white/20" />}
                  </div>
                  <span className={`text-[11px] font-medium whitespace-nowrap ${done ? "text-[#6fbf9e]" : "text-white/30"}`}>{label}</span>
                </div>
                {i < progressStages.length - 1 && (
                  <div className={`mx-3 h-px w-8 flex-shrink-0 ${done ? "bg-[#2F5D50]" : "bg-white/15"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto w-full px-6 lg:px-10 pt-6 pb-0">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "복원 우선등급", value: candidate.grade, sub: candidate.gradeLabel, color: gradeColor },
            { label: "AI 종합 점수", value: `${candidate.priorityScore}점`, sub: "100점 만점 기준", color: "#2F5D50" },
            { label: "경사도", value: `${candidate.slope}°`, sub: candidate.description, color: "#1C2A24" },
            { label: "관할 기관", value: candidate.agency.split(" ")[0], sub: candidate.agency, color: "#1C2A24" },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="bg-white rounded-lg border border-[#DDE3DC] shadow-sm px-5 py-4">
              <p className="text-[10px] text-gray-400 mb-1.5 uppercase tracking-wide font-medium">{label}</p>
              <p className="text-[22px] font-bold tabular-nums leading-none mb-1" style={{ color }}>{value}</p>
              <p className="text-[10px] text-gray-400 line-clamp-2">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 max-w-screen-2xl mx-auto w-full px-6 lg:px-10 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          <div className="lg:col-span-2 space-y-0">
            <div className="bg-white rounded-lg border border-[#DDE3DC] shadow-sm overflow-hidden">
              <div className="border-b border-[#DDE3DC] bg-[#F8FAF8] px-6 py-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-[#2F5D50]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileText className="w-5 h-5 text-[#2F5D50]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-semibold">생성 완료</span>
                        <span className="text-[10px] text-gray-400">2025.06.19 자동 생성</span>
                      </div>
                      <h2 className="text-[14px] font-semibold text-gray-800 leading-snug">{reportTitle}</h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => navigate(`/candidate/${candidate.id}/report-complete`)}
                      className="flex items-center gap-1.5 px-3 py-2 text-[11px] text-gray-600 hover:text-gray-900 border border-[#DDE3DC] rounded-lg hover:bg-gray-50 transition-colors"
                      title="보고서 다시 생성"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">다시 생성</span>
                    </button>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-2 text-[11px] text-gray-600 hover:text-gray-900 border border-[#DDE3DC] rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{copied ? "복사됨" : "복사하기"}</span>
                    </button>
                    <button
                      onClick={handlePdfSaveMock}
                      className={`flex items-center gap-1.5 px-3 py-2 text-[11px] border rounded-lg transition-colors ${
                        pdfSaved
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "text-gray-600 hover:text-gray-900 border-[#DDE3DC] hover:bg-gray-50"
                      }`}
                    >
                      {pdfSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{pdfSaved ? "PDF 저장 완료" : "PDF"}</span>
                    </button>
                    <button
                      onClick={() => navigate(`/candidate/${candidate.id}/email-draft`)}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-semibold text-white bg-[#2F5D50] hover:bg-[#254a3f] rounded-lg transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      이메일 초안 생성
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-8 py-8 space-y-10 text-[13px] text-gray-700 leading-relaxed">
                <section>
                  <SectionTitle num="1" title="분석 개요" />
                  <div className="bg-[#F8FAF8] rounded-lg border border-[#DDE3DC] overflow-hidden">
                    <table className="w-full text-[13px]">
                      <tbody>
                        {[
                          { label: "분석 대상", value: `${candidate.region} ${candidate.name}` },
                          { label: "후보지 설명", value: candidate.description },
                          { label: "복원 우선등급", value: `${candidate.grade} (${candidate.gradeLabel})`, highlight: true },
                          { label: "AI 종합 점수", value: `${candidate.priorityScore}점 / 100점`, highlight: true },
                          { label: "관할 기관", value: candidate.agency },
                        ].map(({ label, value, highlight }) => (
                          <tr key={label} className="border-b border-[#DDE3DC] last:border-0">
                            <td className="px-4 py-3 w-36 text-[11px] font-semibold text-gray-500 uppercase tracking-wide bg-[#F0F4F0] border-r border-[#DDE3DC]">{label}</td>
                            <td className={`px-4 py-3 font-medium ${highlight ? "text-[#C62828]" : "text-gray-800"}`}>{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section>
                  <SectionTitle num="2" title="핵심 분석 결과" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {riskMetrics.map(({ label, value, color }) => (
                      <div key={label} className="bg-[#F8FAF8] rounded-lg border border-[#DDE3DC] px-4 py-3">
                        <p className="text-[10px] text-gray-500 mb-2 leading-snug">{label}</p>
                        <div className="flex items-end gap-1 mb-2">
                          <span className="text-xl font-bold tabular-nums leading-none" style={{ color }}>{value}</span>
                          <span className="text-[10px] text-gray-400 mb-0.5">점</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <SectionTitle num="3" title="위험 판단 근거" />
                  <div className="bg-[#FFFBF0] border border-amber-200 rounded-lg p-5">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div className="space-y-2">
                        <p className="text-[13px] text-amber-900 leading-relaxed">{candidate.summary}</p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {candidate.mainRisks.map((risk) => (
                            <span key={risk} className="text-[11px] bg-white/60 text-amber-800 border border-amber-300 px-2 py-0.5 rounded font-medium">{risk}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <SectionTitle num="4" title="권장 복원 조치" />
                  <div className="relative">
                    <div className="absolute left-4 top-5 bottom-5 w-px bg-[#DDE3DC]" />
                    <div className="space-y-4">
                      {restorationPhases.map(({ step, title, color, bg, items }, i) => (
                        <div key={i} className="relative pl-11">
                          <div className="absolute left-0 top-0 w-8 h-8 rounded-full border-2 border-white shadow flex items-center justify-center" style={{ backgroundColor: color }}>
                            <span className="text-[10px] font-bold text-white">{i + 1}</span>
                          </div>
                          <div className="rounded-lg border p-4" style={{ borderColor: color, backgroundColor: bg }}>
                            <div className="flex items-center gap-2 mb-2.5">
                              <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded" style={{ backgroundColor: color }}>{step}</span>
                              <span className="text-[13px] font-semibold text-gray-800">{title}</span>
                            </div>
                            <ul className="space-y-1.5">
                              {items.map((item, j) => (
                                <li key={j} className="flex items-start gap-2 text-[12px] text-gray-700">
                                  <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section>
                  <SectionTitle num="5" title="최종 의견" />
                  <div className="bg-[#F0F9F5] border border-[#B8DECE] rounded-lg p-5">
                    <p className="text-[13px] text-[#1C3A30] leading-relaxed whitespace-pre-line">
                      {reportText}
                    </p>
                  </div>
                </section>
              </div>

              <div className="px-6 py-5 border-t border-[#DDE3DC] bg-[#F4F9F7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-gray-500 leading-relaxed max-w-md">
                    {pdfSaved
                      ? "AI 정책 보고서 PDF가 생성된 것으로 처리되었습니다. 실제 PDF 저장 기능은 고도화 단계에서 연동됩니다."
                      : "본 보고서는 AI 분석 결과를 기반으로 자동 생성된 정책 검토 초안이며, 최종 행정 판단 전 담당자의 검토가 필요합니다."}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handlePdfSaveMock}
                    className={`flex items-center gap-2 text-[13px] font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm border ${
                      pdfSaved
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-white text-[#2F5D50] border-[#2F5D50] hover:bg-[#F0F9F5]"
                    }`}
                  >
                    {pdfSaved ? <CheckCircle2 className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                    {pdfSaved ? "PDF 저장 완료" : "PDF 보고서 저장"}
                  </button>
                  <button
                    onClick={() => navigate(`/candidate/${candidate.id}/email-draft`)}
                    className="flex items-center gap-2 bg-[#2F5D50] hover:bg-[#254a3f] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm"
                  >
                    <Mail className="w-4 h-4" />
                    이메일 초안 생성
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-lg border border-[#DDE3DC] shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#DDE3DC] bg-[#F8FAF8] flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#2F5D50]" />
                <span className="text-[13px] font-semibold text-gray-800">보고서 정보</span>
              </div>
              <div className="px-5 py-4 space-y-3.5">
                {[
                  { label: "보고서 상태", value: "생성 완료", chip: true },
                  { label: "생성 대상", value: candidate.name },
                  { label: "문서 유형", value: "정책 검토 보고서" },
                  { label: "활용 대상", value: "산림청 및 지자체 담당자" },
                ].map(({ label, value, chip }) => (
                  <div key={label}>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1">{label}</p>
                    {chip ? (
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        {value}
                      </span>
                    ) : (
                      <p className="text-[12px] font-medium text-gray-800">{value}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#DDE3DC] shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#DDE3DC] bg-[#F8FAF8] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#2F5D50]" />
                <span className="text-[13px] font-semibold text-gray-800">관할 기관</span>
              </div>
              <div className="px-5 py-4 space-y-3.5">
                {[
                  { label: "주관 기관", value: candidate.agency, primary: true },
                  { label: "협조 기관", value: "경상북도청 산림자원과" },
                  { label: "참고 기관", value: "산림청" },
                ].map(({ label, value, primary }) => (
                  <div key={label}>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1">{label}</p>
                    <p className={`text-[12px] font-medium ${primary ? "text-[#2F5D50]" : "text-gray-800"}`}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border-2 border-[#2F5D50] shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#DDE3DC] bg-[#2F5D50]/5 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-[#2F5D50]" />
                <span className="text-[13px] font-semibold text-gray-800">다음 단계</span>
              </div>
              <div className="px-5 py-4 space-y-4">
                <p className="text-[12px] text-gray-600 leading-relaxed">
                  생성된 정책 보고서를 바탕으로 관할 기관에 전달할 이메일 초안을 작성할 수 있습니다.
                </p>
                <button
                  onClick={() => navigate(`/candidate/${candidate.id}/email-draft`)}
                  className="w-full flex items-center justify-center gap-2 bg-[#2F5D50] hover:bg-[#254a3f] text-white text-[13px] font-semibold py-3 rounded-lg transition-colors duration-150"
                >
                  <Mail className="w-4 h-4" />
                  이메일 초안 생성
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate(`/candidate/${candidate.id}`)}
                  className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 text-[12px] font-medium py-2.5 rounded-lg border border-[#DDE3DC] hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  후보지 상세분석으로 돌아가기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
