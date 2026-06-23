import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  MapPin,
  ChevronRight,
  Layers,
  BarChart2,
  BookOpen,
  TreePine,
  AlertTriangle,
} from "lucide-react";
import {
  fetchAnalyzeResult,
  getCandidateExplanationFromAnalyzeResult,
  getGradeColor,
  latLngToMapPosition,
  getScoreColor,
  type AnalyzeResult,
  type Candidate,
} from "../../lib/candidates";

const gradeConfig = [
  { grade: "1등급", color: "#C62828", bg: "#FFEBEE", label: "즉시 복원 필요" },
  { grade: "2등급", color: "#E65100", bg: "#FFF3E0", label: "우선 복원 권장" },
  { grade: "3등급", color: "#F9A825", bg: "#FFFDE7", label: "복원 검토 대상" },
  { grade: "4등급", color: "#558B2F", bg: "#F1F8E9", label: "지속 관찰 대상" },
  { grade: "5등급", color: "#2E7D32", bg: "#E8F5E9", label: "자연 회복 가능" },
];

type MapMarker = Candidate & {
  rank: number;
  color: string;
  x: number;
  y: number;
};

function RiskBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-xs font-semibold tabular-nums" style={{ color }}>
          {value}점
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function GyeongsangbukMap({
  markers,
  topCandidateId,
  selectedId,
  onSelect,
}: {
  markers: MapMarker[];
  topCandidateId: number;
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  return (
    <div className="relative w-full h-full" style={{ minHeight: 520 }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 620" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="terrainGrad" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#d4e8c2" />
            <stop offset="40%" stopColor="#c8e0b0" />
            <stop offset="80%" stopColor="#b8d498" />
            <stop offset="100%" stopColor="#a8c886" />
          </radialGradient>
        </defs>

        <path
          d="M 160 60 L 220 45 L 300 50 L 380 40 L 460 55 L 540 50 L 610 70 L 650 110 L 670 160 L 660 220 L 680 280 L 660 340 L 640 390 L 600 430 L 560 470 L 510 490 L 460 510 L 400 520 L 340 510 L 290 490 L 240 460 L 200 420 L 170 380 L 140 330 L 120 270 L 110 210 L 120 150 Z"
          fill="url(#terrainGrad)"
          stroke="#9ebe78"
          strokeWidth="2"
        />

        <line x1="160" y1="60" x2="400" y2="300" stroke="#9ebe78" strokeWidth="0.5" opacity="0.4" />
        <line x1="220" y1="45" x2="500" y2="400" stroke="#9ebe78" strokeWidth="0.5" opacity="0.4" />
        <line x1="300" y1="50" x2="320" y2="480" stroke="#9ebe78" strokeWidth="0.5" opacity="0.4" />
        <line x1="460" y1="55" x2="280" y2="460" stroke="#9ebe78" strokeWidth="0.5" opacity="0.4" />
        <line x1="110" y1="210" x2="660" y2="280" stroke="#9ebe78" strokeWidth="0.5" opacity="0.4" />
        <line x1="120" y1="150" x2="680" y2="200" stroke="#9ebe78" strokeWidth="0.5" opacity="0.4" />

        <ellipse cx="350" cy="200" rx="180" ry="130" fill="none" stroke="#88b860" strokeWidth="1" opacity="0.3" />
        <ellipse cx="350" cy="200" rx="120" ry="85" fill="none" stroke="#78a850" strokeWidth="1" opacity="0.3" />
        <ellipse cx="350" cy="200" rx="65" ry="45" fill="#78a850" opacity="0.1" />
      </svg>

      {[
        { name: "울진군", x: "72%", y: "24%" },
        { name: "영덕군", x: "72%", y: "38%" },
        { name: "안동시", x: "45%", y: "34%" },
        { name: "청송군", x: "58%", y: "45%" },
        { name: "의성군", x: "43%", y: "50%" },
        { name: "문경시", x: "25%", y: "40%" },
        { name: "상주시", x: "28%", y: "56%" },
        { name: "구미시", x: "38%", y: "68%" },
        { name: "경주시", x: "66%", y: "68%" },
        { name: "포항시", x: "74%", y: "58%" },
      ].map(({ name, x, y }) => (
        <span
          key={name}
          className="absolute text-[10px] text-gray-500 pointer-events-none select-none font-medium"
          style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
        >
          {name}
        </span>
      ))}

      {markers.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
          style={{ left: `${c.x}%`, top: `${c.y}%`, zIndex: selectedId === c.id ? 20 : 10 }}
          title={`#${c.rank} ${c.region} ${c.name}`}
        >
          <div className="relative flex flex-col items-center">
            {c.id === topCandidateId && (
              <span
                className="absolute rounded-full animate-ping"
                style={{
                  width: 36,
                  height: 36,
                  top: -4,
                  left: "50%",
                  transform: "translateX(-50%)",
                  backgroundColor: c.color,
                  opacity: 0.25,
                }}
              />
            )}

            <div
              className="flex items-center justify-center rounded-full border-2 border-white shadow-lg transition-transform duration-150 group-hover:scale-110"
              style={{
                width: selectedId === c.id ? 40 : 32,
                height: selectedId === c.id ? 40 : 32,
                backgroundColor: c.color,
              }}
            >
              <span className="text-white font-bold" style={{ fontSize: selectedId === c.id ? 13 : 11 }}>
                #{c.rank}
              </span>
            </div>

            <div
              className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white text-[10px] rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ zIndex: 30 }}
            >
              #{c.rank} {c.name} · {c.grade}
            </div>
          </div>
        </button>
      ))}

      <div className="absolute top-4 right-4 w-8 h-8 opacity-50">
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
          <circle cx="16" cy="16" r="14" stroke="#4a7c5f" strokeWidth="1" />
          <path d="M16 4 L18 14 L16 12 L14 14 Z" fill="#4a7c5f" />
          <path d="M16 28 L18 18 L16 20 L14 18 Z" fill="#9ebe78" />
          <text x="15.5" y="10" fontSize="5" fill="#4a7c5f" fontWeight="bold">
            N
          </text>
        </svg>
      </div>

      <div className="absolute bottom-4 right-4 bg-white/80 rounded px-2 py-1 text-[9px] text-gray-600 border border-gray-200 flex items-center gap-1">
        <div className="w-8 h-0.5 bg-gray-600" />
        <span>50km</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const [sortedCandidates, setSortedCandidates] = useState<Candidate[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResult | null>(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);
        setApiError(null);

        const data = await fetchAnalyzeResult();
        const candidates = data.topCandidates;

        setAnalysisResult(data);
        setSortedCandidates(candidates);
        setSelectedMarkerId(candidates[0]?.id ?? null);
      } catch (error) {
        console.error(error);
        setApiError("백엔드 분석 결과를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F6F4] flex items-center justify-center">
        <div className="bg-white rounded-lg border border-[#DDE3DC] shadow-sm px-8 py-6 text-center">
          <p className="text-sm font-semibold text-[#2F5D50] mb-2">AI 분석 결과 불러오는 중</p>
          <p className="text-xs text-gray-500">백엔드 API에서 복원 우선순위 데이터를 가져오고 있습니다.</p>
        </div>
      </div>
    );
  }

  if (apiError || sortedCandidates.length === 0) {
    return (
      <div className="min-h-screen bg-[#F4F6F4] flex items-center justify-center">
        <div className="bg-white rounded-lg border border-red-200 shadow-sm px-8 py-6 text-center">
          <p className="text-sm font-semibold text-red-700 mb-2">대시보드 데이터 로딩 실패</p>
          <p className="text-xs text-gray-500">{apiError ?? "표시할 후보지 데이터가 없습니다."}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#2F5D50] text-white text-xs font-semibold rounded"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const topCandidate = sortedCandidates[0];
  const topFive = sortedCandidates.slice(0, 5);

  const mapMarkers: MapMarker[] = topFive.map((c, index) => {
    const position = latLngToMapPosition(c);

    return {
      ...c,
      rank: c.rank ?? index + 1,
      color: getGradeColor(c.grade),
      x: Math.min(88, Math.max(12, position.x)),
      y: Math.min(88, Math.max(12, position.y)),
    };
  });

  const selectedCandidate =
    topFive.find((candidate) => candidate.id === selectedMarkerId) ?? topCandidate;

  const selectedRank =
    selectedCandidate.rank ??
    (topFive.findIndex((candidate) => candidate.id === selectedCandidate.id) + 1);

  const selectedGradeColor = getGradeColor(selectedCandidate.grade);

  const selectedMarker = mapMarkers.find((marker) => marker.id === selectedCandidate.id);

  const selectedRationale = analysisResult
    ? getCandidateExplanationFromAnalyzeResult(analysisResult, selectedCandidate)
    : "";

  const selectedRisksLabel =
    selectedCandidate.mainRisks.length > 0
      ? selectedCandidate.mainRisks.slice(0, 3).join(", ")
      : "위험요인";

  const selectedAiInsight =
    selectedRationale || selectedCandidate.summary
      ? `${selectedRisksLabel}을 중심으로 ${selectedCandidate.gradeLabel || selectedCandidate.grade} 수준의 복원 우선순위가 산정되었습니다.`
      : "백엔드 AI 분석 근거를 불러오지 못해 후보지 요약을 표시합니다.";

  const riskMetrics = [
    {
      label: "산불 피해도",
      value: selectedCandidate.fireDamageScore,
      color: getScoreColor(selectedCandidate.fireDamageScore),
    },
    {
      label: "산사태 위험도",
      value: selectedCandidate.landslideRiskScore,
      color: getScoreColor(selectedCandidate.landslideRiskScore),
    },
    {
      label: "토사유출 위험도",
      value: selectedCandidate.soilRunoffRiskScore,
      color: getScoreColor(selectedCandidate.soilRunoffRiskScore),
    },
    {
      label: "생활권 노출도",
      value: selectedCandidate.exposureScore,
      color: getScoreColor(selectedCandidate.exposureScore),
    },
  ];

  const gradeCounts = sortedCandidates.reduce(
    (acc, c) => {
      acc[c.grade] = (acc[c.grade] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="min-h-screen bg-[#F4F6F4] flex flex-col">
      <nav className="bg-white border-b border-[#DDE3DC] sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 bg-[#2F5D50] rounded flex items-center justify-center">
              <TreePine className="w-4 h-4 text-white" />
            </div>
            <span className="text-[15px] font-semibold text-[#1C3A30] tracking-tight">산림 복원 AI</span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {[
              { label: "대시보드", path: "/dashboard", icon: <BarChart2 className="w-3.5 h-3.5" />, active: true },
              { label: "TOP 후보지", path: "/top-candidates", icon: <Layers className="w-3.5 h-3.5" />, active: false },
              { label: "분석 방법", path: "/methodology", icon: <BookOpen className="w-3.5 h-3.5" />, active: false },
            ].map(({ label, path, icon, active }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-[13px] font-medium transition-all ${
                  active
                    ? "bg-[#2F5D50]/10 text-[#2F5D50]"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">2025.06.19 기준</span>
          </div>
        </div>
      </nav>

      <div className="bg-[#1C3A30] border-b border-[#0f2218]">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-7">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <p className="text-[11px] font-semibold text-[#6fbf9e] uppercase tracking-widest mb-1.5">
                AI 분석 완료 · {topCandidate.region}
              </p>
              <h1 className="text-2xl md:text-[28px] font-bold text-white leading-snug mb-2">
                경상북도 산림 복원 우선순위 분석 결과
              </h1>
              <p className="text-[13px] text-white/65 max-w-xl leading-relaxed">
                백엔드 AI 분석 API를 통해 산불 피해 후보지의 복원 우선순위를 산정한 결과입니다.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white/10 rounded-lg px-4 py-2.5 border border-white/15 text-center">
                <p className="text-[10px] text-white/50 mb-0.5">분석 후보지</p>
                <p className="text-xl font-bold text-white">{sortedCandidates.length}개</p>
              </div>
              <div className="bg-[#C62828]/30 rounded-lg px-4 py-2.5 border border-[#C62828]/40 text-center">
                <p className="text-[10px] text-red-200/70 mb-0.5">1등급</p>
                <p className="text-xl font-bold text-red-200">{gradeCounts["1등급"] ?? 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-screen-2xl mx-auto w-full px-6 lg:px-10 py-6">
        <div className="grid grid-cols-12 gap-5 h-full">
          <aside className="col-span-12 lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg border border-[#DDE3DC] shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[#DDE3DC] bg-[#F8FAF8] flex items-center gap-2">
                <div className="w-1 h-3.5 bg-[#2F5D50] rounded-full" />
                <h2 className="text-[13px] font-semibold text-gray-800">분석 조건</h2>
              </div>
              <div className="px-4 py-3 grid grid-cols-3 divide-x divide-[#DDE3DC]">
                {[
                  { label: "지역", value: topCandidate.region },
                  { label: "연도", value: "2025년" },
                  { label: "위험요인", value: "전체" },
                ].map(({ label, value }) => (
                  <div key={label} className="px-3 first:pl-0 last:pr-0 text-center">
                    <p className="text-[10px] text-gray-400 mb-1">{label}</p>
                    <p className="text-[12px] font-semibold text-gray-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#DDE3DC] shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[#DDE3DC] bg-[#F8FAF8] flex items-center gap-2">
                <div className="w-1 h-3.5 bg-[#2F5D50] rounded-full" />
                <h2 className="text-[13px] font-semibold text-gray-800">AI 분석 근거</h2>
              </div>
              <div className="px-4 py-3 space-y-2">
                {(analysisResult?.analysisLogs ?? []).slice(0, 2).map((log) => (
                  <div key={`${log.step}-${log.name}`} className="text-[11px] leading-relaxed text-gray-600">
                    <span className="font-semibold text-[#2F5D50]">{log.name}</span>
                    <span className="text-gray-400"> · </span>
                    {log.message}
                  </div>
                ))}
                {(!analysisResult?.analysisLogs || analysisResult.analysisLogs.length === 0) && (
                  <p className="text-[11px] leading-relaxed text-gray-600">
                    산불 피해도, 재해 위험도, 생활권 노출도를 함께 반영해 복원 우선순위를 산정했습니다.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#DDE3DC] shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[#DDE3DC] bg-[#F8FAF8] flex items-center gap-2">
                <div className="w-1 h-3.5 bg-[#2F5D50] rounded-full" />
                <h2 className="text-[13px] font-semibold text-gray-800">AI 분석 결과 요약</h2>
              </div>
              <div className="px-4 py-3 space-y-2.5">
                <div className="flex items-center justify-between py-1">
                  <span className="text-[12px] text-gray-500">분석 후보지 총계</span>
                  <span className="text-[15px] font-bold text-gray-900 tabular-nums">
                    {sortedCandidates.length}개
                  </span>
                </div>
                <div className="h-px bg-[#F0F2F0]" />
                {["1등급", "2등급", "3등급", "4등급", "5등급"].map((grade) => {
                  const color = getGradeColor(grade);
                  const count = gradeCounts[grade] ?? 0;
                  if (count === 0) return null;

                  return (
                    <div key={grade} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: color }} />
                        <span className="text-[12px] text-gray-600">{grade}</span>
                      </div>
                      <span className="text-[14px] font-bold tabular-nums" style={{ color }}>
                        {count}개
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#DDE3DC] shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[#DDE3DC] bg-[#F8FAF8] flex items-center gap-2">
                <div className="w-1 h-3.5 bg-[#2F5D50] rounded-full" />
                <h2 className="text-[13px] font-semibold text-gray-800">등급 범례</h2>
              </div>
              <div className="px-4 py-3 space-y-2">
                {gradeConfig.map(({ grade, color, bg, label }) => (
                  <div key={grade} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center"
                        style={{ backgroundColor: bg, border: `1.5px solid ${color}` }}
                      >
                        <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: color }} />
                      </div>
                      <span className="text-[12px] font-semibold text-gray-800">{grade}</span>
                    </div>
                    <span className="text-[11px] text-gray-500">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <main className="col-span-12 lg:col-span-7">
            <div className="bg-white rounded-lg border border-[#DDE3DC] shadow-sm overflow-hidden" style={{ minHeight: 640 }}>
              <div className="px-4 py-3 border-b border-[#DDE3DC] bg-[#F8FAF8] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#2F5D50]" />
                  <h2 className="text-[13px] font-semibold text-gray-800">경상북도 복원 후보지 분포</h2>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                  <span>마커 클릭 시 상세 정보 확인</span>
                </div>
              </div>

              <div className="relative" style={{ height: 600, minHeight: 520 }}>
                <GyeongsangbukMap
                  markers={mapMarkers}
                  topCandidateId={topCandidate.id}
                  selectedId={selectedMarkerId}
                  onSelect={setSelectedMarkerId}
                />

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur-sm text-white text-[11px] rounded-lg px-4 py-2 border border-white/10 shadow-xl pointer-events-none whitespace-nowrap">
                  #{selectedMarker?.rank ?? selectedRank} 후보지 선택됨 — 우측 패널에 선택 후보지 정보가 표시됩니다
                </div>
              </div>
            </div>
          </main>

          <aside className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-lg border-2 border-[#2F5D50] shadow-md overflow-hidden sticky top-20">
              <div className="bg-[#2F5D50] px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center"
                      style={{ backgroundColor: selectedGradeColor }}
                    >
                      <span className="text-[10px] font-bold text-white">#{selectedRank}</span>
                    </div>
                    <h2 className="text-[14px] font-bold text-white">{selectedCandidate.name}</h2>
                  </div>
                  <span
                    className="text-[10px] text-white px-2 py-0.5 rounded-full font-semibold"
                    style={{ backgroundColor: selectedGradeColor }}
                  >
                    {selectedCandidate.grade}
                  </span>
                </div>
                <p className="text-[11px] text-white/70 mt-1.5">{selectedCandidate.region}</p>
              </div>

              <div className="px-4 py-4 space-y-4">
                <div className="bg-[#F4F9F7] rounded-lg p-3 border border-[#DDE3DC] flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-500 mb-0.5">AI 종합 점수</p>
                    <p className="text-2xl font-bold text-[#2F5D50] tabular-nums">
                      {selectedCandidate.priorityScore}
                      <span className="text-sm font-medium text-gray-400 ml-0.5">점</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 mb-0.5">복원 필요성</p>
                    <span className="text-[12px] font-bold" style={{ color: selectedGradeColor }}>
                      {selectedCandidate.gradeLabel}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { label: "지역", value: selectedCandidate.region },
                    { label: "복원 우선순위", value: selectedCandidate.grade, highlight: true },
                    {
                      label: "경사도",
                      value: selectedCandidate.slope ? `${selectedCandidate.slope}°` : "정보 없음",
                    },
                    { label: "관할 기관", value: selectedCandidate.agency },
                  ].map(({ label, value, highlight }) => (
                    <div key={label} className="flex items-center justify-between py-1 border-b border-[#F0F2F0] last:border-0">
                      <span className="text-[11px] text-gray-500">{label}</span>
                      <span
                        className="text-[12px] font-semibold text-right"
                        style={{ color: highlight ? selectedGradeColor : "#1C2A24" }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-gray-700 mb-2.5">위험 지표</p>
                  <div className="space-y-2.5">
                    {riskMetrics.map(({ label, value, color }) => (
                      <RiskBar key={label} label={label} value={value} color={color} />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-gray-700 mb-2">주요 위험요인</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCandidate.mainRisks.length > 0 ? (
                      selectedCandidate.mainRisks.map((risk) => (
                        <span
                          key={risk}
                          className="text-[10px] font-semibold px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-100"
                        >
                          {risk}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-gray-400">등록된 위험요인이 없습니다.</span>
                    )}
                  </div>
                </div>

                <div className="bg-[#FFFBF0] border border-amber-200 rounded-lg p-3">
                  <p className="text-[10px] font-semibold text-amber-700 mb-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    AI 종합 의견
                  </p>
                  <p className="text-[11px] text-amber-900 leading-relaxed">
                    {selectedAiInsight}
                  </p>
                </div>

                <button
                  onClick={() => navigate(`/candidate/${selectedCandidate.id}`)}
                  className="w-full flex items-center justify-center gap-2 bg-[#2F5D50] hover:bg-[#254a3f] active:bg-[#1c3a30] text-white text-[13px] font-semibold py-3 rounded-lg transition-colors duration-150 shadow-sm"
                >
                  상세 분석 보기
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
