import { useEffect, useState, type MouseEvent } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  FileText,
  TrendingDown,
  TrendingUp,
  MapPin,
  Clock,
  Leaf,
  Wind,
  TreePine,
  ChevronRight,
  BarChart2,
  Layers,
  BookOpen,
  Building2,
} from "lucide-react";
import {
  fetchApiCandidateById,
  getGradeColor,
  getScoreColor,
  formatDistance,
  getSortedRank,
  type Candidate,
} from "../../lib/candidates";
import CandidateNotFound from "../components/CandidateNotFound";

const restorationPhases = [
  {
    phase: "1단계",
    title: "응급 복원 단계",
    items: [
      "집중호우 이전 토사유출 방지시설 설치",
      "침식 방지 매트 및 보호 구조물 설치",
      "산사태 위험 구간 긴급 안정화",
    ],
    color: "#C62828",
    bg: "#FFEBEE",
  },
  {
    phase: "2단계",
    title: "재해 예방 단계",
    items: [
      "배수로 정비",
      "사면 안정화 공사",
      "산사태 취약구간 집중 관리",
      "재해 위험 모니터링 체계 구축",
    ],
    color: "#E65100",
    bg: "#FFF3E0",
  },
  {
    phase: "3단계",
    title: "생태 복원 단계",
    items: [
      "지역 기후와 토양에 적합한 수종 선정",
      "훼손 식생 복원",
      "복층 식생 조성",
      "생물다양성 회복 유도",
    ],
    color: "#558B2F",
    bg: "#F1F8E9",
  },
  {
    phase: "4단계",
    title: "사후 관리 단계",
    items: [
      "드론 및 위성영상 기반 모니터링",
      "생존율 조사",
      "추가 식재 및 유지관리",
      "복원 성과 장기 평가",
    ],
    color: "#2E7D32",
    bg: "#E8F5E9",
  },
];

function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[12px] text-gray-600">{label}</span>
        <span className="text-[12px] font-bold tabular-nums" style={{ color }}>
          {value}점
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="px-5 py-3.5 border-b border-[#DDE3DC] bg-[#F8FAF8] flex items-center gap-2">
      <div className="w-1 h-4 bg-[#2F5D50] rounded-full flex-shrink-0" />
      <div>
        <h2 className="text-[14px] font-semibold text-gray-800">{title}</h2>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function riskLevelStyle(level: string): { color: string; bg: string } {
  if (level.includes("매우") || level === "높음") {
    return { color: "#C62828", bg: "#FFEBEE" };
  }

  if (level === "중간") {
    return { color: "#F9A825", bg: "#FFFDE7" };
  }

  return { color: "#558B2F", bg: "#F1F8E9" };
}

function buildRiskFactors(candidate: Candidate) {
  const soilRunoffLevel =
    candidate.soilRunoffRiskScore >= 70
      ? "높음"
      : candidate.soilRunoffRiskScore >= 50
        ? "중간"
        : "낮음";

  const exposureLevel =
    candidate.exposureScore >= 80
      ? "높음"
      : candidate.exposureScore >= 50
        ? "중간"
        : "낮음";

  return [
    {
      name: "산사태 위험",
      level: candidate.landslideRisk,
      ...riskLevelStyle(candidate.landslideRisk),
    },
    {
      name: "토사유출 위험",
      level: soilRunoffLevel,
      ...riskLevelStyle(soilRunoffLevel),
    },
    {
      name: "집중호우 위험",
      level: candidate.rainfallRisk,
      ...riskLevelStyle(candidate.rainfallRisk),
    },
    {
      name: "생활권 노출",
      level: exposureLevel,
      ...riskLevelStyle(exposureLevel),
    },
  ];
}

function buildDetailedMetrics(candidate: Candidate) {
  return [
    {
      label: "산불 피해도",
      value: candidate.fireDamageScore,
      color: getScoreColor(candidate.fireDamageScore),
    },
    {
      label: "산사태 위험도",
      value: candidate.landslideRiskScore,
      color: getScoreColor(candidate.landslideRiskScore),
    },
    {
      label: "토사유출 위험도",
      value: candidate.soilRunoffRiskScore,
      color: getScoreColor(candidate.soilRunoffRiskScore),
    },
    {
      label: "생활권 노출도",
      value: candidate.exposureScore,
      color: getScoreColor(candidate.exposureScore),
    },
  ];
}

function buildRestorationEffects(candidate: Candidate) {
  return [
    {
      label: "산사태 위험도",
      before: candidate.landslideRiskScore,
      after: Math.round(candidate.landslideRiskScore * 0.6),
      reduction: 40,
    },
    {
      label: "토사유출 위험도",
      before: candidate.soilRunoffRiskScore,
      after: Math.round(candidate.soilRunoffRiskScore * 0.57),
      reduction: 43,
    },
    {
      label: "생활권 노출도",
      before: candidate.exposureScore,
      after: Math.round(candidate.exposureScore * 0.47),
      reduction: 53,
    },
  ];
}

function buildPolicyInterpretation(candidate: Candidate) {
  if (candidate.mainRisks.length > 0) {
    const risks = candidate.mainRisks.join(", ");
    return `주요 위험요인은 ${risks}이며, 생활권과 기반시설 영향 가능성을 고려할 때 장마철 2차 피해 예방 관점에서 우선 복원 검토가 필요합니다.`;
  }

  if (candidate.gradeLabel) {
    return `해당 후보지는 ${candidate.gradeLabel} 수준으로 분류되어 현장 확인과 관계 기관 협의를 통해 복원 사업 추진 여부를 검토할 필요가 있습니다.`;
  }

  return (
    candidate.candidateExplanation?.replace(
      /.*?(점|등급).*?(분류|기록|확인|평가).*?[.。]/,
      "",
    ).trim() ||
    candidate.summary
  );
}

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const fetchCandidate = async () => {
      try {
        setIsLoading(true);

        const data = await fetchApiCandidateById(id);
        setCandidate(data ?? null);

      } catch (error) {
        console.error("후보지 상세 조회 실패:", error);
        setCandidate(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidate();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F6F4] flex items-center justify-center">
        <p className="text-sm text-gray-500">후보지 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (!candidate) {
    return <CandidateNotFound />;
  }

  const gradeColor = getGradeColor(candidate.grade);
  const sortedRank = candidate.rank ?? getSortedRank(candidate.id);
  const riskFactors = buildRiskFactors(candidate);
  const detailedMetrics = buildDetailedMetrics(candidate);
  const restorationEffects = buildRestorationEffects(candidate);
  const policyInterpretation = buildPolicyInterpretation(candidate);

  function handleSliderMouseDown(e: MouseEvent<HTMLDivElement>) {
    setIsDragging(true);
    e.preventDefault();
  }

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!isDragging) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(Math.max(x, 2), 98));
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  const goToReport = () => navigate(`/candidate/${candidate.id}/report-complete`);

  const navItems = [
    {
      label: "대시보드",
      path: "/dashboard",
      icon: <BarChart2 className="w-3.5 h-3.5" />,
    },
    {
      label: "TOP 후보지",
      path: "/top-candidates",
      icon: <Layers className="w-3.5 h-3.5" />,
    },
    {
      label: "분석 방법",
      path: "/methodology",
      icon: <BookOpen className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F4] flex flex-col">
      <nav className="bg-white border-b border-[#DDE3DC] sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-7 h-7 bg-[#2F5D50] rounded flex items-center justify-center">
                <TreePine className="w-4 h-4 text-white" />
              </div>
              <span className="text-[15px] font-semibold text-[#1C3A30] tracking-tight">
                산림 복원 AI
              </span>
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

          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">
              {candidate.region} · {candidate.name}
            </span>
          </div>
        </div>
      </nav>

      <div className="bg-[#1C3A30] border-b border-[#0f2218]">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 text-[#6fbf9e] hover:text-white text-[11px] mb-4 transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            대시보드로 돌아가기
          </button>

          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-[#6fbf9e] uppercase tracking-widest mb-2">
                후보지 상세 분석
              </p>
              <h1 className="text-2xl md:text-[28px] font-bold text-white leading-snug mb-1.5">
                후보지 상세 분석
              </h1>
              <p className="text-[13px] text-white/60 mb-5">
                AI가 선정한 복원 우선순위 후보지에 대한 상세 분석 결과입니다.
              </p>

              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[14px] font-semibold text-white">
                  {candidate.region}
                </span>
                <span className="text-white/30">·</span>
                <span className="text-[12px] bg-white/10 text-white/80 px-2.5 py-1 rounded border border-white/15">
                  {candidate.name}
                </span>
                <span className="text-[12px] bg-[#2F5D50]/60 text-emerald-200 px-2.5 py-1 rounded border border-emerald-700/40">
                  분석 순위 #{sortedRank}
                </span>
                <span
                  className="text-[12px] px-2.5 py-1 rounded border font-semibold text-red-200"
                  style={{
                    backgroundColor: `${gradeColor}66`,
                    borderColor: `${gradeColor}99`,
                  }}
                >
                  복원 우선순위 {candidate.grade}
                </span>
              </div>
            </div>

            <button
              onClick={goToReport}
              className="flex items-center gap-2.5 bg-[#2F5D50] hover:bg-[#254a3f] active:bg-[#1c3a30] text-white text-[13px] font-semibold px-5 py-3 rounded-lg border border-[#3d7a68] transition-colors duration-150 shadow-lg flex-shrink-0 self-start mt-1"
            >
              <FileText className="w-4 h-4" />
              AI 정책 보고서 생성
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-screen-2xl mx-auto w-full px-6 lg:px-10 py-6 space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "복원 우선등급",
              value: candidate.grade,
              sub: candidate.gradeLabel,
              color: gradeColor,
            },
            {
              label: "AI 종합 점수",
              value: `${candidate.priorityScore}점`,
              sub: "100점 만점 기준",
              color: "#2F5D50",
            },
            {
              label: "경사도",
              value: `${candidate.slope}°`,
              sub: candidate.description,
              color: "#1C2A24",
            },
            {
              label: "관할 기관",
              value: candidate.agency.split(" ")[0],
              sub: candidate.agency,
              color: "#1C2A24",
            },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="bg-white rounded-lg border border-[#DDE3DC] shadow-sm p-5">
              <p className="text-[11px] text-gray-500 mb-2">{label}</p>
              <p className="text-2xl font-bold leading-none mb-1.5 tabular-nums" style={{ color }}>
                {value}
              </p>
              <p className="text-[10px] line-clamp-2" style={{ color, opacity: 0.7 }}>
                {sub}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg border border-[#DDE3DC] shadow-sm overflow-hidden">
          <SectionHeader title="위성영상 비교 분석" sub="산불 전·후 위성영상 비교" />
          <div className="p-5">
            <div
              className="relative h-72 rounded-lg overflow-hidden cursor-ew-resize select-none"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg,#2C2416 0%,#3D2E18 30%,#4A3520 60%,#3A2A15 100%)",
                }}
              >
                <div className="absolute bottom-4 right-5 text-right">
                  <span className="bg-black/60 text-white text-[11px] px-2.5 py-1 rounded font-medium">
                    산불 발생 후
                  </span>
                  <p className="text-white/50 text-[10px] mt-1 mr-1">
                    2025년 Sentinel-2 위성영상
                  </p>
                </div>
              </div>

              <div
                className="absolute inset-0"
                style={{
                  clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
                  background:
                    "linear-gradient(135deg,#2E5A1C 0%,#3B7026 30%,#4A8830 60%,#38682A 100%)",
                }}
              >
                <div className="absolute bottom-4 left-5">
                  <span className="bg-black/40 text-white text-[11px] px-2.5 py-1 rounded font-medium">
                    산불 발생 전
                  </span>
                  <p className="text-white/50 text-[10px] mt-1 ml-1">
                    2024년 Sentinel-2 위성영상
                  </p>
                </div>
              </div>

              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] z-10 pointer-events-none"
                style={{ left: `${sliderPos}%` }}
              >
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center cursor-ew-resize pointer-events-auto"
                  onMouseDown={handleSliderMouseDown}
                >
                  <div className="flex gap-0.5">
                    <div className="w-0.5 h-4 bg-gray-400 rounded" />
                    <div className="w-0.5 h-4 bg-gray-400 rounded" />
                  </div>
                </div>
              </div>

              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] px-2 py-1 rounded pointer-events-none whitespace-nowrap">
                ← 슬라이더를 드래그하여 비교 →
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-lg border border-[#DDE3DC] shadow-sm overflow-hidden">
            <SectionHeader title="주요 위험요인 분석" />
            <div className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {riskFactors.map(({ name, level, color, bg }) => (
                  <div
                    key={name}
                    className="rounded-lg border-2 p-4 text-center"
                    style={{ borderColor: color, backgroundColor: bg }}
                  >
                    <p className="text-[12px] font-medium text-gray-700 mb-2">{name}</p>
                    <span className="text-[15px] font-bold" style={{ color }}>
                      {level}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {candidate.mainRisks.map((risk) => (
                  <span
                    key={risk}
                    className="text-[11px] bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2] px-2.5 py-1 rounded-full font-medium"
                  >
                    {risk}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#DDE3DC] shadow-sm overflow-hidden">
            <SectionHeader title="세부 위험도 평가" />
            <div className="p-5 space-y-3.5">
              {detailedMetrics.map(({ label, value, color }) => (
                <MetricBar key={label} label={label} value={value} color={color} />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#2F5D50] shadow-sm overflow-hidden">
          <SectionHeader title="AI 분석 결과" />
          <div className="p-6">
            <div className="space-y-3.5 text-[13px] text-gray-700 leading-relaxed">
              <p>
                해당 지역(
                <strong className="text-gray-900">
                  {candidate.region} {candidate.name}
                </strong>
                )은 AI 분석 결과,
                <strong className="text-[#C62828]">
                  {" "}
                  산불 피해도 {candidate.fireDamageScore}점
                </strong>
                ,
                <strong className="text-[#C62828]">
                  {" "}
                  산사태 위험도 {candidate.landslideRiskScore}점
                </strong>
                ,
                <strong className="text-[#C62828]">
                  {" "}
                  토사유출 위험도 {candidate.soilRunoffRiskScore}점
                </strong>
                ,
                <strong className="text-[#E65100]">
                  {" "}
                  생활권 노출도 {candidate.exposureScore}점
                </strong>
                으로 분석되었습니다.
              </p>

              <p>{policyInterpretation}</p>

              <div className="pt-3 border-t border-[#DDE3DC] flex items-start gap-2">
                <Building2 className="w-4 h-4 text-[#2F5D50] flex-shrink-0 mt-0.5" />
                <p>
                  관할 기관: <strong className="text-[#2F5D50]">{candidate.agency}</strong>.
                  AI 종합 점수 <strong className="text-[#2F5D50]">{candidate.priorityScore}점</strong> 기준,
                  해당 지역은{" "}
                  <strong className="text-gray-900">
                    {candidate.grade}({candidate.gradeLabel})
                  </strong>
                  으로 분류되었습니다.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-[#DDE3DC] flex items-center justify-between gap-4 flex-wrap">
              <p className="text-[12px] text-gray-500">
                분석 결과를 바탕으로 정책 보고서를 자동 생성할 수 있습니다.
              </p>
              <button
                onClick={goToReport}
                className="flex items-center gap-2 bg-[#2F5D50] hover:bg-[#254a3f] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg transition-colors duration-150"
              >
                <FileText className="w-4 h-4" />
                AI 정책 보고서 생성
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#DDE3DC] shadow-sm overflow-hidden">
          <SectionHeader title="AI 기반 복원 권장 조치" sub="권장 복원 전략" />
          <div className="p-6">
            <div className="relative">
              <div className="absolute left-4 top-6 bottom-6 w-px bg-[#DDE3DC]" />
              <div className="space-y-8">
                {restorationPhases.map(({ phase, title, items, color, bg }, i) => (
                  <div key={phase} className="relative pl-12">
                    <div
                      className="absolute left-0 top-0 w-8 h-8 rounded-full border-2 border-white shadow flex items-center justify-center"
                      style={{ backgroundColor: color }}
                    >
                      <span className="text-white text-[10px] font-bold">{i + 1}</span>
                    </div>

                    <div className="rounded-lg border p-4" style={{ borderColor: color, backgroundColor: bg }}>
                      <div className="flex items-center gap-2 mb-2.5">
                        <span
                          className="text-[11px] font-bold text-white px-2 py-0.5 rounded"
                          style={{ backgroundColor: color }}
                        >
                          {phase}
                        </span>
                        <span className="text-[14px] font-semibold text-gray-800">{title}</span>
                      </div>

                      <ul className="space-y-1.5">
                        {items.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-[12px] text-gray-700">
                            <span
                              className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-lg border border-[#DDE3DC] shadow-sm overflow-hidden">
            <SectionHeader title="복원 효과 시뮬레이션" />
            <div className="p-5 space-y-4">
              {restorationEffects.map(({ label, before, after, reduction }) => (
                <div key={label} className="bg-[#F8FAF8] rounded-lg border border-[#DDE3DC] p-4">
                  <p className="text-[12px] font-medium text-gray-700 mb-3">{label}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <p className="text-[10px] text-gray-400 mb-0.5">복원 전</p>
                        <span className="text-2xl font-bold text-[#C62828] tabular-nums">
                          {before}
                        </span>
                      </div>

                      <TrendingDown className="w-5 h-5 text-[#2F5D50]" />

                      <div className="text-center">
                        <p className="text-[10px] text-gray-400 mb-0.5">복원 후</p>
                        <span className="text-2xl font-bold text-[#2F5D50] tabular-nums">
                          {after}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 mb-0.5">감소율</p>
                      <p className="text-xl font-bold text-[#2F5D50] tabular-nums">
                        {reduction}%
                        <span className="text-[11px] font-normal ml-0.5">↓</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-3 gap-3 pt-1">
                {[
                  { icon: <Clock className="w-5 h-5" />, label: "예상 복원 기간", value: "5~7년" },
                  { icon: <Leaf className="w-5 h-5" />, label: "생태 복원 지수", value: "+35%" },
                  { icon: <Wind className="w-5 h-5" />, label: "탄소흡수량 증가", value: "+18%" },
                ].map(({ icon, label, value }) => (
                  <div
                    key={label}
                    className="bg-[#F0F9F5] rounded-lg border border-[#2F5D50]/20 p-3 text-center"
                  >
                    <div className="text-[#2F5D50] flex justify-center mb-1.5">{icon}</div>
                    <p className="text-[9px] text-gray-500 mb-1 leading-tight">{label}</p>
                    <div className="flex items-center justify-center gap-0.5">
                      <TrendingUp className="w-3 h-3 text-[#2F5D50]" />
                      <p className="text-[13px] font-bold text-[#2F5D50]">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#DDE3DC] shadow-sm overflow-hidden">
            <SectionHeader title="위치 및 주변 환경" sub="위치 기반 위험 평가" />
            <div className="p-5">
              <div
                className="relative h-56 rounded-lg overflow-hidden mb-4"
                style={{
                  background: "linear-gradient(135deg,#d4e8c2 0%,#c0d8a8 50%,#aecb94 100%)",
                }}
              >
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 224" preserveAspectRatio="none">
                  <ellipse cx="200" cy="112" rx="120" ry="75" fill="none" stroke="#9ebe78" strokeWidth="1" opacity="0.5" />
                  <ellipse cx="200" cy="112" rx="80" ry="50" fill="none" stroke="#88b060" strokeWidth="1" opacity="0.5" />
                  <path d="M 240 180 Q 220 160 210 140 Q 200 120 195 100" stroke="#60a0d0" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" />
                  <line x1="50" y1="155" x2="165" y2="130" stroke="#888" strokeWidth="2.5" strokeDasharray="6,3" opacity="0.7" />
                  <rect x="80" y="90" width="72" height="55" fill="#F9A825" opacity="0.15" rx="4" />
                  <rect x="80" y="90" width="72" height="55" fill="none" stroke="#F9A825" strokeWidth="1.5" strokeDasharray="5,3" rx="4" />
                </svg>

                <span
                  className="absolute text-[9px] text-[#1a6a9a] font-medium"
                  style={{ left: "53%", top: "56%" }}
                >
                  하천
                </span>
                <span
                  className="absolute text-[9px] text-gray-600 font-medium"
                  style={{ left: "12%", top: "68%" }}
                >
                  도로
                </span>
                <span
                  className="absolute text-[9px] text-[#E65100] font-semibold leading-tight text-center"
                  style={{ left: "19%", top: "38%" }}
                >
                  산사태
                  <br />
                  위험지역
                </span>

                <div className="absolute" style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}>
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: gradeColor, border: "3px solid white" }}
                  >
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-[10px] font-semibold text-gray-800 px-2 py-0.5 rounded shadow">
                    {candidate.name}
                  </div>
                </div>

                <div className="absolute w-5 h-5 bg-blue-500 rounded border-2 border-white shadow" style={{ left: "72%", top: "24%" }} />
                <span
                  className="absolute text-[9px] text-blue-700 font-medium"
                  style={{ left: "79%", top: "26%" }}
                >
                  민가
                </span>
              </div>

              <div className="space-y-2">
                {[
                  {
                    label: "민가까지 거리",
                    value: formatDistance(candidate.distanceToHouse),
                    highlight: candidate.distanceToHouse < 300,
                  },
                  {
                    label: "주요 도로까지 거리",
                    value: formatDistance(candidate.distanceToRoad),
                    highlight: false,
                  },
                  {
                    label: "하천까지 거리",
                    value: formatDistance(candidate.distanceToRiver),
                    highlight: candidate.distanceToRiver < 250,
                  },
                  {
                    label: "2차 재해 발생 가능성",
                    value: candidate.landslideRisk,
                    highlight: candidate.landslideRisk.includes("높음"),
                  },
                ].map(({ label, value, highlight }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                    style={{
                      backgroundColor: highlight ? "#FFEBEE" : "#F8FAF8",
                      border: highlight ? "1px solid #FFCDD2" : "1px solid #DDE3DC",
                    }}
                  >
                    <span className="text-[12px] text-gray-700 font-medium">{label}</span>
                    <span
                      className="text-[12px] font-bold"
                      style={{ color: highlight ? "#C62828" : "#1C2A24" }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between py-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-800 px-4 py-2.5 rounded-lg border border-[#DDE3DC] hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            대시보드로 돌아가기
          </button>

          <p className="text-[11px] text-gray-400 hidden sm:block">
            보고서 생성은 위 "AI 정책 보고서 생성" 버튼을 이용하세요.
          </p>
        </div>
      </div>
    </div>
  );
}
