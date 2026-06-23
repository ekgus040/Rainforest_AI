import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft, TreePine, BarChart2, Layers, BookOpen,
  RefreshCw, Copy, CheckCircle2, Send, Mail, Paperclip,
  Users, X, AlertTriangle, ChevronRight, ClipboardCheck,
  FileText,
} from "lucide-react";
import {
  fetchApiCandidateById,
  generateEmailBody,
  generateEmailSubject,
  generateAttachmentFileName,
  generateEmailDraftFromApi,
  getGradeColor,
  getSortedRank,
  type Candidate,
} from "../../lib/candidates";
import CandidateNotFound from "../components/CandidateNotFound";

const progressStages = [
  { label: "분석 완료", done: true },
  { label: "보고서 생성 완료", done: true },
  { label: "이메일 초안 작성 완료", done: true, current: true },
  { label: "담당자 검토", done: false },
];

const FALLBACK_CC_AGENCIES = "경상북도 산림·재난 담당 부서";

type ReviewStatus = "검토 전" | "검토 완료";
type SendStatus = "발송 대기" | "발송 요청 완료";

type EmailDraftApiResult = {
  subject?: string;
  body?: string;
  emailBody?: string;
  content?: string;
  draft?: string;
  rawDraft?: string;
  cc?: string;
  ccAgencies?: string;
  fallbackParsed?: {
    subject?: string;
    body?: string;
    to?: string;
    cc?: string;
  };
  email?: {
    subject?: string;
    body?: string;
    cc?: string;
  };
  result?: {
    subject?: string;
    body?: string;
    emailBody?: string;
    content?: string;
    cc?: string;
  };
};

function parseRawDraftSubject(rawDraft?: string): string | undefined {
  if (!rawDraft) return undefined;

  const match = rawDraft.match(/제목:\s*(.+)/);
  return match?.[1]?.trim() || undefined;
}

function parseRawDraftBody(rawDraft?: string): string | undefined {
  if (!rawDraft) return undefined;

  const match = rawDraft.match(/본문:\s*([\s\S]*)/);
  return match?.[1]?.trim() || undefined;
}

function readReportSummaryFromSession(candidate: Candidate): string {
  const fallback = candidate.summary;

  try {
    const raw = sessionStorage.getItem(`policy-report-${candidate.id}`);
    if (!raw) return fallback;

    const stored = JSON.parse(raw);

    return (
      stored.reportSummary ??
      stored.summary ??
      stored.report?.summary ??
      stored.result?.summary ??
      stored.content ??
      stored.reportContent ??
      fallback
    );
  } catch (error) {
    console.error("저장된 보고서 요약을 읽지 못했습니다:", error);
    return fallback;
  }
}

function getDraftSubject(draft: EmailDraftApiResult, candidate: Candidate): string {
  return (
    draft.subject ??
    draft.fallbackParsed?.subject ??
    parseRawDraftSubject(draft.rawDraft) ??
    draft.email?.subject ??
    draft.result?.subject ??
    generateEmailSubject(candidate)
  );
}

function getDraftBody(draft: EmailDraftApiResult, candidate: Candidate): string {
  return (
    draft.body ??
    draft.fallbackParsed?.body ??
    parseRawDraftBody(draft.rawDraft) ??
    draft.emailBody ??
    draft.content ??
    draft.draft ??
    draft.email?.body ??
    draft.result?.body ??
    draft.result?.emailBody ??
    draft.result?.content ??
    generateEmailBody(candidate)
  );
}

function getDraftCc(draft: EmailDraftApiResult): string {
  return (
    draft.cc ??
    draft.ccAgencies ??
    draft.fallbackParsed?.cc ??
    draft.email?.cc ??
    draft.result?.cc ??
    FALLBACK_CC_AGENCIES
  );
}

async function createEmailDraft(candidate: Candidate): Promise<EmailDraftApiResult> {
  const reportSummary = readReportSummaryFromSession(candidate);
  return generateEmailDraftFromApi(candidate.id, reportSummary);
}

export default function EmailDraftPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [emailBody, setEmailBody] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailCc, setEmailCc] = useState(FALLBACK_CC_AGENCIES);
  const [attachmentName, setAttachmentName] = useState("");
  const [copied, setCopied] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>("검토 전");
  const [sendStatus, setSendStatus] = useState<SendStatus>("발송 대기");
  const [showModal, setShowModal] = useState(false);
  const [sendDone, setSendDone] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState(false);
  const [sendFeedback, setSendFeedback] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEmailDraft() {
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
        setAttachmentName(generateAttachmentFileName(candidateData));

        const storedDraftRaw = sessionStorage.getItem(`email-draft-${candidateData.id}`);

        if (storedDraftRaw) {
          const storedDraft = JSON.parse(storedDraftRaw) as EmailDraftApiResult;
          setEmailSubject(getDraftSubject(storedDraft, candidateData));
          setEmailBody(getDraftBody(storedDraft, candidateData));
          setEmailCc(getDraftCc(storedDraft));
          return;
        }

        const draft = await createEmailDraft(candidateData);

        sessionStorage.setItem(
          `email-draft-${candidateData.id}`,
          JSON.stringify(draft),
        );

        setEmailSubject(getDraftSubject(draft, candidateData));
        setEmailBody(getDraftBody(draft, candidateData));
        setEmailCc(getDraftCc(draft));
      } catch (error) {
        console.error("이메일 초안 생성 실패:", error);
        setApiError("이메일 초안 생성 API 호출에 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    loadEmailDraft();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F6F4] flex items-center justify-center">
        <div className="bg-white rounded-lg border border-[#DDE3DC] shadow-sm px-8 py-6 text-center">
          <div className="w-12 h-12 rounded-full bg-[#E8F5F0] flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-[#2F5D50]" />
          </div>
          <p className="text-sm font-semibold text-[#2F5D50] mb-2">
            관할 기관 이메일 초안 생성 중
          </p>
          <p className="text-xs text-gray-500">
            백엔드 API에서 보고서 요약을 바탕으로 이메일 초안을 생성하고 있습니다.
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
            이메일 초안 생성 실패
          </p>
          <p className="text-xs text-gray-500 mb-4">
            {apiError}
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => navigate(`/candidate/${id}/report`)}
              className="px-4 py-2 border border-[#DDE3DC] text-xs text-gray-600 rounded hover:bg-gray-50"
            >
              보고서로 돌아가기
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#2F5D50] text-white text-xs font-semibold rounded"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return <CandidateNotFound />;
  }

  const sortedRank = candidate.rank ?? getSortedRank(candidate.id);
  const gradeColor = getGradeColor(candidate.grade);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(emailBody);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("이메일 본문 복사 실패:", error);
      setCopied(false);
    }
  }

  function handleReview() {
    setReviewStatus("검토 완료");
    setReviewFeedback(true);
  }

  async function handleRegenerate() {
    try {
      setRegenerating(true);

      const draft = await createEmailDraft(candidate);

      sessionStorage.setItem(
        `email-draft-${candidate.id}`,
        JSON.stringify(draft),
      );

      setEmailSubject(getDraftSubject(draft, candidate));
      setEmailBody(getDraftBody(draft, candidate));
      setEmailCc(getDraftCc(draft));
    } catch (error) {
      console.error("이메일 초안 재생성 실패:", error);
      setEmailBody(generateEmailBody(candidate));
      setEmailSubject(generateEmailSubject(candidate));
      setEmailCc(FALLBACK_CC_AGENCIES);
    } finally {
      setRegenerating(false);
    }
  }

  function handleSendConfirm() {
    setSendDone(true);
    setSendStatus("발송 요청 완료");
    setSendFeedback(true);
    setTimeout(() => {
      setShowModal(false);
      setSendDone(false);
    }, 1800);
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
          <div className="flex items-center gap-2 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-emerald-600 font-medium hidden sm:inline">이메일 초안 작성 완료</span>
          </div>
        </div>
      </nav>

      <div className="bg-[#1C3A30] border-b border-[#0f2218]">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-7">
          <button
            onClick={() => navigate(`/candidate/${candidate.id}/report`)}
            className="flex items-center gap-1.5 text-[#6fbf9e] hover:text-white text-[11px] mb-4 transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            AI 정책 보고서로 돌아가기
          </button>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold text-[#6fbf9e] uppercase tracking-widest mb-1.5">관할 기관 이메일 초안</p>
              <h1 className="text-2xl md:text-[26px] font-bold text-white leading-snug mb-1.5">관할 기관 이메일 초안</h1>
              <p className="text-[13px] text-white/60">
                AI 정책 보고서를 바탕으로 관할 기관 전달용 협조 요청 이메일 초안을 생성했습니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: candidate.region, style: "bg-[#2F5D50]/60 text-[#A8D5C5] border-[#3D7A68]/50" },
                { label: candidate.name, style: "bg-[#2F5D50]/60 text-[#A8D5C5] border-[#3D7A68]/50" },
                { label: `분석 순위 #${sortedRank}`, style: "bg-[#1a2f28] text-[#7FB5A4] border-[#2F5D50]/60" },
                { label: `복원 우선등급 ${candidate.grade}`, gradeBadge: true },
                { label: `AI 종합 점수 ${candidate.priorityScore}점`, style: "bg-[#1a2f28] text-[#7FB5A4] border-[#2F5D50]/60" },
              ].map(({ label, style, gradeBadge }) => (
                <span
                  key={label}
                  className={`${style ?? ""} text-[11px] px-2.5 py-1 rounded border font-medium`}
                  style={gradeBadge ? { backgroundColor: `${gradeColor}4D`, borderColor: `${gradeColor}66`, color: "#fecaca" } : undefined}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center">
            {progressStages.map(({ label, done, current }, i) => (
              <div key={label} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border transition-colors ${
                      done && !current
                        ? "bg-[#2F5D50] border-[#2F5D50]"
                        : current
                        ? "bg-white border-white"
                        : "bg-transparent border-white/20"
                    }`}
                  >
                    {done && !current && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    {current && <CheckCircle2 className="w-3.5 h-3.5 text-[#1C3A30]" />}
                    {!done && !current && <div className="w-1.5 h-1.5 rounded-full bg-white/20" />}
                  </div>
                  <span className={`text-[11px] font-medium whitespace-nowrap ${current ? "text-white" : done ? "text-[#6fbf9e]" : "text-white/30"}`}>
                    {label}
                  </span>
                </div>
                {i < progressStages.length - 1 && (
                  <div className={`mx-3 h-px w-8 flex-shrink-0 ${done ? "bg-[#2F5D50]" : "bg-white/15"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-screen-2xl mx-auto w-full px-6 lg:px-10 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg border border-[#DDE3DC] shadow-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-[#2F5D50] via-[#4A9B80] to-[#7CB342]" />

              <div className="border-b border-[#DDE3DC]">
                {[
                  { icon: <Users className="w-3.5 h-3.5 text-gray-400" />, label: "수신", value: candidate.agency },
                  { icon: <Users className="w-3.5 h-3.5 text-gray-400" />, label: "참조 기관", value: emailCc },
                  { icon: <Mail className="w-3.5 h-3.5 text-gray-400" />, label: "제목", value: emailSubject, bold: true },
                  { icon: <Paperclip className="w-3.5 h-3.5 text-gray-400" />, label: "첨부", value: attachmentName, file: true },
                ].map(({ icon, label, value, bold, file }) => (
                  <div key={label} className="flex items-start gap-3 px-6 py-3 border-b border-[#F0F2F0] last:border-0">
                    <div className="flex items-center gap-2 w-20 flex-shrink-0 pt-0.5">
                      {icon}
                      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
                    </div>
                    {file ? (
                      <span className="text-[12px] text-[#2F5D50] font-medium bg-[#E8F5F0] border border-[#B8DECE] px-2.5 py-1 rounded flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        {value}
                      </span>
                    ) : (
                      <span className={`text-[13px] leading-snug ${bold ? "font-semibold text-gray-900" : "text-gray-700"}`}>{value}</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="px-6 py-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">본문</span>
                  <span className="text-[10px] text-gray-400">AI 생성 초안 · 수정 가능</span>
                </div>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={14}
                  className={`w-full text-[13px] text-gray-800 leading-relaxed resize-none rounded-lg border border-[#DDE3DC] bg-[#FAFBFA] px-4 py-3.5 focus:outline-none focus:border-[#2F5D50] focus:ring-1 focus:ring-[#2F5D50] transition-colors font-[inherit] ${regenerating ? "opacity-40 pointer-events-none" : ""}`}
                  style={{ fontFamily: "inherit" }}
                />
              </div>

              <div className="px-6 pb-5 flex flex-wrap items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] text-gray-600 hover:text-gray-900 border border-[#DDE3DC] rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? "animate-spin" : ""}`} />
                    초안 다시 생성
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] text-gray-600 hover:text-gray-900 border border-[#DDE3DC] rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "복사 완료" : "본문 복사"}
                  </button>
                  <button
                    onClick={handleReview}
                    disabled={reviewStatus === "검토 완료"}
                    className={`flex items-center gap-1.5 px-3.5 py-2 text-[12px] border rounded-lg transition-colors ${
                      reviewStatus === "검토 완료"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default"
                        : "text-gray-600 hover:text-gray-900 border-[#DDE3DC] hover:bg-gray-50"
                    }`}
                  >
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    {reviewStatus === "검토 완료" ? "검토 완료" : "담당자 검토 완료"}
                  </button>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 bg-[#2F5D50] hover:bg-[#254a3f] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  발송하기
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {(copied || reviewFeedback || sendFeedback) && (
                <div className="px-6 pb-5 -mt-2">
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-800">
                    {copied && "이메일 본문이 클립보드에 복사되었습니다."}
                    {!copied && reviewFeedback && "담당자 검토 완료 상태로 표시했습니다."}
                    {!copied && !reviewFeedback && sendFeedback && "발송 요청이 완료되었습니다. 실제 발송은 담당자 승인 후 진행됩니다."}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-start gap-2 px-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-gray-400 leading-relaxed">
                본 기능은 정책 실행 지원 프로세스를 시연하기 위한 프로토타입입니다.
              </p>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-lg border border-[#DDE3DC] shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#DDE3DC] bg-[#F8FAF8] flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-[#2F5D50]" />
                <span className="text-[13px] font-semibold text-gray-800">처리 상태</span>
              </div>
              <div className="px-5 py-4 space-y-3.5">
                {[
                  { label: "보고서 상태", value: "생성 완료", type: "done" as const },
                  { label: "이메일 초안", value: "작성 완료", type: "done" as const },
                  { label: "검토 상태", value: reviewStatus, type: reviewStatus === "검토 완료" ? ("done" as const) : ("pending" as const) },
                  { label: "발송 상태", value: sendStatus, type: sendStatus === "발송 요청 완료" ? ("done" as const) : ("waiting" as const) },
                ].map(({ label, value, type }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-500">{label}</span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        type === "done"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : type === "pending"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-gray-50 text-gray-500 border border-gray-200"
                      }`}
                    >
                      {value}
                    </span>
                  </div>
                ))}

                <div className="mt-3 pt-3 border-t border-[#DDE3DC]">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      AI가 생성한 이메일 초안은 담당자 검토 후 발송되어야 합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border-2 border-[#2F5D50] shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#DDE3DC] bg-[#2F5D50]/5 flex items-center gap-2">
                <Send className="w-4 h-4 text-[#2F5D50]" />
                <span className="text-[13px] font-semibold text-gray-800">발송 준비</span>
              </div>
              <div className="px-5 py-4 space-y-3">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1">수신 기관</p>
                  <p className="text-[12px] font-semibold text-[#2F5D50]">{candidate.agency}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1">참조 기관</p>
                  <p className="text-[12px] text-gray-700">{emailCc}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1">첨부 문서</p>
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-[#2F5D50] bg-[#E8F5F0] border border-[#B8DECE] px-2 py-1 rounded">
                    <FileText className="w-3 h-3" />
                    {attachmentName}
                  </span>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setShowModal(true)}
                    className="w-full flex items-center justify-center gap-2 bg-[#2F5D50] hover:bg-[#254a3f] text-white text-[13px] font-semibold py-3 rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    발송하기
                  </button>
                  <button
                    onClick={() => navigate(`/candidate/${candidate.id}/report`)}
                    className="w-full flex items-center justify-center gap-1.5 text-gray-500 hover:text-gray-800 text-[12px] py-2.5 rounded-lg border border-[#DDE3DC] hover:bg-gray-50 transition-colors mt-2"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    AI 정책 보고서로 돌아가기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => !sendDone && setShowModal(false)} />
          <div className="relative bg-white rounded-xl border border-[#DDE3DC] shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#2F5D50] via-[#4A9B80] to-[#7CB342]" />
            <div className="px-6 py-5">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#2F5D50]/10 rounded-lg flex items-center justify-center">
                    <Send className="w-5 h-5 text-[#2F5D50]" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-gray-900">이메일 발송 승인</h3>
                    {!sendDone && <p className="text-[11px] text-gray-400 mt-0.5">발송 전 내용을 최종 확인해주세요</p>}
                  </div>
                </div>
                {!sendDone && (
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors mt-0.5">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {sendDone ? (
                <div className="py-6 flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="text-[15px] font-semibold text-gray-900 mb-1.5">발송 시연 완료</p>
                  <p className="text-[12px] text-gray-500 leading-relaxed max-w-xs">
                    발송 요청이 완료되었습니다. 실제 발송은 담당자 승인 후 진행됩니다.
                    프로토타입에서는 실제 이메일을 발송하지 않습니다.
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-[#F8FAF8] border border-[#DDE3DC] rounded-lg px-4 py-3 mb-5">
                    <p className="text-[12px] text-gray-600 leading-relaxed">
                      본 프로토타입에서는 실제 이메일 발송 대신, 담당자 승인 후 관할 기관에 발송되는 구조를 시연합니다.
                    </p>
                  </div>
                  <div className="space-y-3 mb-6">
                    {[
                      { label: "수신 기관", value: candidate.agency },
                      { label: "참조 기관", value: emailCc },
                      { label: "첨부 문서", value: attachmentName, file: true },
                      { label: "발송 상태", value: "승인 대기", status: true },
                    ].map(({ label, value, file, status }) => (
                      <div key={label} className="flex items-start gap-3">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide w-20 flex-shrink-0 mt-1">{label}</span>
                        {file ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-[#2F5D50] bg-[#E8F5F0] border border-[#B8DECE] px-2 py-1 rounded">
                            <FileText className="w-3 h-3" />
                            {value}
                          </span>
                        ) : status ? (
                          <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">{value}</span>
                        ) : (
                          <span className="text-[12px] font-medium text-gray-800">{value}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => setShowModal(false)} className="px-4 py-2.5 text-[12px] font-medium text-gray-600 hover:text-gray-900 border border-[#DDE3DC] rounded-lg hover:bg-gray-50 transition-colors">
                      취소
                    </button>
                    <button onClick={handleSendConfirm} className="flex items-center gap-2 px-5 py-2.5 text-[12px] font-semibold text-white bg-[#2F5D50] hover:bg-[#254a3f] rounded-lg transition-colors">
                      <Send className="w-3.5 h-3.5" />
                      발송 시연 완료
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
