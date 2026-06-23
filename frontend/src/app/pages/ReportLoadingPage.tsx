import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft, FileText, CheckCircle2, ChevronRight,
  TreePine, BarChart2, Layers, BookOpen, AlertTriangle,
} from "lucide-react";
import {
  fetchApiCandidateById,
  generatePolicyReportFromApi,
  getGradeColor,
  generateReportTitle,
  getSortedRank,
  type Candidate,
} from "../../lib/candidates";
import CandidateNotFound from "../components/CandidateNotFound";

const checklistSteps = [
  "후보지 분석 데이터 불러오기",
  "핵심 위험 요인 정리",
  "복원 우선순위 판단 근거 생성",
  "권장 복원 조치 항목 구성",
  "정책 보고서 문안 작성",
  "보고서 최종 정리",
];

const loadingRelaySteps = [
  "후보지 분석 결과를 불러오는 중입니다.",
  "복원 우선순위와 위험요인을 정리하는 중입니다.",
  "관할 기관 검토용 정책 보고서를 작성하는 중입니다.",
  "현장 점검 및 복원 조치 권고안을 구성하는 중입니다.",
  "보고서 생성 결과를 저장하는 중입니다.",
];

const progressStages = [
  { label: "분석 완료", done: true },
  { label: "보고서 생성 완료", done: true, current: true },
  { label: "이메일 초안 작성", done: false },
  { label: "담당자 검토", done: false },
];

const navItems = [
  { label: "대시보드", path: "/dashboard", icon: <BarChart2 className="w-3.5 h-3.5" /> },
  { label: "TOP 후보지", path: "/top-candidates", icon: <Layers className="w-3.5 h-3.5" /> },
  { label: "분석 방법", path: "/methodology", icon: <BookOpen className="w-3.5 h-3.5" /> },
];

export default function ReportLoadingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) return;

    const intervalId = window.setInterval(() => {
      setLoadingStepIndex((current) =>
        Math.min(current + 1, loadingRelaySteps.length - 1),
      );
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isLoading]);

  useEffect(() => {
    async function createReport() {
      if (!id) {
        setApiError("후보지 ID가 없습니다.");
        setIsLoading(false);
        return;
      }

      const candidateId = Number(id);

      if (Number.isNaN(candidateId)) {
        setApiError("올바르지 않은 후보지 ID입니다.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setApiError(null);
        setLoadingStepIndex(0);

        const minimumLoadingTime = new Promise((resolve) => {
          window.setTimeout(resolve, 5000);
        });

        const candidateData = await fetchApiCandidateById(id);

        if (!candidateData) {
          setCandidate(null);
          return;
        }

        setCandidate(candidateData);

        const reportResult = await generatePolicyReportFromApi(candidateData.id);

        sessionStorage.setItem(
          `policy-report-${candidateData.id}`,
          JSON.stringify(reportResult),
        );

        await minimumLoadingTime;
      } catch (error) {
        console.error("정책 보고서 생성 실패:", error);
        setApiError("정책 보고서 생성 API 호출에 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    createReport();
  }, [id]);

  if (isLoading) {
    const progress = Math.round(
      ((loadingStepIndex + 1) / loadingRelaySteps.length) * 100,
    );

    return (
      <div className="min-h-screen bg-[#F4F6F4] flex items-center justify-center">
        <div className="bg-white rounded-lg border border-[#DDE3DC] shadow-sm px-8 py-7 text-center w-full max-w-md">
          <div className="w-12 h-12 rounded-full bg-[#E8F5F0] flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-[#2F5D50]" />
          </div>
          <p className="text-sm font-semibold text-[#2F5D50] mb-2">
            AI 정책 보고서 생성 중
          </p>
          <p className="text-xs text-gray-500">
            백엔드 API에서 후보지 분석 결과를 바탕으로 보고서를 생성하고 있습니다.
          </p>

          <div className="mt-6 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-gray-500">
                생성 단계 {loadingStepIndex + 1}/{loadingRelaySteps.length}
              </span>
              <span className="text-[11px] font-bold text-[#2F5D50]">
                {progress}%
              </span>
            </div>
            <div className="h-2 bg-[#E8EEE9] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2F5D50] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-5 space-y-2 text-left">
            {loadingRelaySteps.map((step, index) => (
              <div
                key={step}
                className={`flex items-start gap-2 text-xs transition-colors ${
                  index <= loadingStepIndex ? "text-gray-800" : "text-gray-400"
                }`}
              >
                <CheckCircle2
                  className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                    index < loadingStepIndex
                      ? "text-emerald-500"
                      : index === loadingStepIndex
                      ? "text-[#2F5D50]"
                      : "text-gray-300"
                  }`}
                />
                <span className={index === loadingStepIndex ? "font-semibold" : ""}>
                  {step}
                </span>
              </div>
            ))}
          </div>
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
            보고서 생성 실패
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

  const gradeColor = getGradeColor(candidate.grade);
  const sortedRank = candidate.rank ?? getSortedRank(candidate.id);
  const reportTitle = generateReportTitle(candidate);

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
                  {icon}{label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-emerald-600 font-medium hidden sm:inline">생성 완료</span>
          </div>
        </div>
      </nav>

      <div className="bg-[#1C3A30] border-b border-[#0f2218]">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-7">
          <button
            onClick={() => navigate(`/candidate/${candidate.id}`)}
            className="flex items-center gap-1.5 text-[#6fbf9e] hover:text-white text-[11px] mb-4 transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            후보지 상세분석으로 돌아가기
          </button>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold text-[#6fbf9e] uppercase tracking-widest mb-1.5">AI 정책 보고서</p>
              <h1 className="text-2xl md:text-[26px] font-bold text-white leading-snug mb-1.5">AI 정책 보고서 생성 완료</h1>
              <p className="text-[13px] text-white/60">
                후보지 상세 분석 결과를 바탕으로 정책 담당자용 AI 보고서가 생성되었습니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: candidate.region, style: "bg-[#2F5D50]/60 text-[#A8D5C5] border-[#3D7A68]/50" },
                { label: candidate.name, style: "bg-[#2F5D50]/60 text-[#A8D5C5] border-[#3D7A68]/50" },
                { label: `분석 순위 #${sortedRank}`, style: "bg-[#1a2f28] text-[#7FB5A4] border-[#2F5D50]/60" },
                { label: `복원 우선순위 ${candidate.grade}`, gradeBadge: true },
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
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border transition-colors ${
                    current ? "bg-white border-white" : done ? "bg-[#2F5D50] border-[#2F5D50]" : "bg-transparent border-white/20"
                  }`}>
                    {current
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-[#1C3A30]" />
                      : done
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      : <div className="w-1.5 h-1.5 rounded-full bg-white/20" />}
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

      <div className="flex-1 max-w-screen-2xl mx-auto w-full px-6 lg:px-10 py-7">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg border border-[#DDE3DC] shadow-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-[#2F5D50] via-[#4A9B80] to-[#7CB342]" />

              <div className="p-8">
                <div className="flex flex-col items-center mb-8 text-center">
                  <div className="relative w-20 h-20 mb-5">
                    <div className="w-20 h-20 rounded-2xl bg-[#E8F5F0] flex items-center justify-center">
                      <FileText className="w-10 h-10 text-[#2F5D50]" strokeWidth={1.5} />
                    </div>
                    <div className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full mb-3">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    생성 완료
                  </span>
                  <h2 className="text-[20px] font-semibold text-gray-900 mb-2">
                    AI 정책 보고서 생성이 완료되었습니다.
                  </h2>
                  <p className="text-[13px] text-gray-500 max-w-lg leading-relaxed">
                    산불 피해도, 2차 재해 위험도, 생활권 노출도 분석 결과를 바탕으로
                    정책 검토용 보고서가 생성되었습니다.
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">생성 단계</p>
                  <div className="space-y-1">
                    {checklistSteps.map((label, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <span className="text-[13px] text-gray-700 flex-1">{i + 1}. {label} 완료</span>
                        <span className="text-[11px] text-emerald-600 font-medium flex-shrink-0">완료</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-[#DDE3DC] bg-[#F8FAF8] flex items-center justify-between gap-4 flex-wrap">
                <p className="text-[11px] text-gray-400 flex items-start gap-1.5 max-w-md">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  본 보고서는 AI 분석 결과를 기반으로 자동 생성된 정책 검토 초안이며, 최종 행정 판단 전 담당자의 검토가 필요합니다.
                </p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => navigate(`/candidate/${candidate.id}`)}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-[12px] text-gray-500 hover:text-gray-800 border border-[#DDE3DC] rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    후보지 상세분석으로 돌아가기
                  </button>
                  <button
                    onClick={() => navigate(`/candidate/${candidate.id}/report`)}
                    className="flex items-center gap-2 bg-[#2F5D50] hover:bg-[#254a3f] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm"
                  >
                    <FileText className="w-4 h-4" />
                    생성된 보고서 보기
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border-2 border-[#2F5D50] shadow-sm overflow-hidden sticky top-20">
              <div className="px-5 py-3.5 border-b border-[#DDE3DC] bg-[#2F5D50]/5 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#2F5D50]" />
                <span className="text-[13px] font-semibold text-gray-800">생성된 보고서 정보</span>
              </div>
              <div className="px-5 py-4 space-y-4">
                {[
                  { label: "문서명", value: reportTitle, multiline: true },
                  { label: "대상 지역", value: candidate.region },
                  { label: "후보지", value: candidate.name },
                  { label: "문서 유형", value: "정책 검토 보고서" },
                  { label: "활용 목적", value: "복원 우선순위 검토 및 관할 기관 협조 요청" },
                  { label: "문서 상태", value: "생성 완료", status: true },
                ].map(({ label, value, multiline, status }) => (
                  <div key={label}>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1">{label}</p>
                    {status ? (
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        {value}
                      </span>
                    ) : (
                      <p className={`text-[12px] font-medium text-gray-800 ${multiline ? "leading-snug" : ""}`}>{value}</p>
                    )}
                  </div>
                ))}

                <div className="pt-3 border-t border-[#DDE3DC] space-y-2">
                  <button
                    onClick={() => navigate(`/candidate/${candidate.id}/report`)}
                    className="w-full flex items-center justify-center gap-2 bg-[#2F5D50] hover:bg-[#254a3f] text-white text-[13px] font-semibold py-3 rounded-lg transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    생성된 보고서 보기
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate(`/candidate/${candidate.id}`)}
                    className="w-full flex items-center justify-center gap-1.5 text-gray-500 hover:text-gray-800 text-[12px] py-2.5 rounded-lg border border-[#DDE3DC] hover:bg-gray-50 transition-colors"
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
    </div>
  );
}
