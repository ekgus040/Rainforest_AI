import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Map,
  BarChart3,
  TrendingUp,
  FileText,
  MapPin,
  Calendar,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Database,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  fetchAnalyzeResult,
  getCandidateExplanationFromAnalyzeResult,
  getGradeColor,
  getScoreColor,
  latLngToMapPosition,
  type AnalyzeResult,
  type Candidate,
} from "../../lib/candidates";

type RegionalMarker = Candidate & {
  rank: number;
  color: string;
  x: number;
  y: number;
};

function RiskBar({ label, value }: { label: string; value: number }) {
  const color = getScoreColor(value);

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

function RegionalMap({
  markers,
  selectedId,
  onSelect,
}: {
  markers: RegionalMarker[];
  selectedId: number | null;
  onSelect: (candidate: RegionalMarker) => void;
}) {
  return (
    <Card className="border-[#E5E7EB] shadow-md overflow-hidden">
      <CardContent className="p-0">
        <div className="px-5 py-4 border-b border-[#E5E7EB] bg-[#F8FAF8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#2F5D50]" />
            <h3 className="text-sm font-bold text-gray-900">경상북도 후보지 분포</h3>
          </div>
          <p className="text-[11px] text-gray-500">마커 클릭 시 우측 정보 변경</p>
        </div>

        <div className="relative h-[560px] bg-gradient-to-br from-green-50 to-green-100 overflow-hidden">
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 800 560"
            preserveAspectRatio="xMidYMid slice"
          >
            <path
              d="M 150 55 L 220 45 L 310 55 L 390 40 L 470 60 L 560 55 L 635 90 L 675 150 L 665 220 L 690 285 L 660 360 L 615 420 L 550 470 L 470 500 L 390 515 L 315 500 L 250 470 L 190 420 L 145 350 L 120 270 L 115 185 L 130 115 Z"
              fill="#CFE5B8"
              stroke="#9EBE78"
              strokeWidth="2"
            />

            <ellipse
              cx="395"
              cy="260"
              rx="210"
              ry="155"
              fill="none"
              stroke="#8FAF6A"
              strokeWidth="1"
              opacity="0.35"
            />
            <ellipse
              cx="395"
              cy="260"
              rx="145"
              ry="100"
              fill="none"
              stroke="#7EA45A"
              strokeWidth="1"
              opacity="0.35"
            />
            <path
              d="M 500 120 Q 470 210 500 290 Q 520 360 485 455"
              fill="none"
              stroke="#7DB3D8"
              strokeWidth="3"
              opacity="0.5"
            />
          </svg>

          {[
            { name: "안동시", x: "45%", y: "33%" },
            { name: "의성군", x: "45%", y: "50%" },
            { name: "청송군", x: "58%", y: "45%" },
            { name: "상주시", x: "30%", y: "58%" },
            { name: "구미시", x: "39%", y: "70%" },
            { name: "포항시", x: "73%", y: "58%" },
            { name: "경주시", x: "67%", y: "72%" },
            { name: "울진군", x: "72%", y: "25%" },
          ].map((region) => (
            <span
              key={region.name}
              className="absolute text-[10px] text-gray-500 font-medium select-none pointer-events-none"
              style={{
                left: region.x,
                top: region.y,
                transform: "translate(-50%, -50%)",
              }}
            >
              {region.name}
            </span>
          ))}

          {markers.map((candidate) => (
            <button
              key={candidate.id}
              onClick={() => onSelect(candidate)}
              className="absolute -translate-x-1/2 -translate-y-1/2 group"
              style={{
                left: `${candidate.x}%`,
                top: `${candidate.y}%`,
                zIndex: selectedId === candidate.id ? 20 : 10,
              }}
              title={`${candidate.rank}위 ${candidate.region} ${candidate.name}`}
            >
              <div
                className="rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold transition-transform group-hover:scale-110"
                style={{
                  width: selectedId === candidate.id ? 42 : 34,
                  height: selectedId === candidate.id ? 42 : 34,
                  backgroundColor: candidate.color,
                }}
              >
                #{candidate.rank}
              </div>

              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white text-[10px] rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {candidate.grade} · {candidate.name}
              </div>
            </button>
          ))}

          <div className="absolute bottom-4 right-4 bg-white/95 rounded-lg shadow-md p-3 border border-[#E5E7EB]">
            <p className="text-xs font-semibold text-gray-700 mb-2">등급 범례</p>
            <div className="space-y-1">
              {["1등급", "2등급", "3등급", "4등급", "5등급"].map((grade) => {
                const hasGrade = markers.some((candidate) => candidate.grade === grade);
                if (!hasGrade) return null;

                const color = getGradeColor(grade);

                return (
                  <div key={grade} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xs text-gray-600">{grade}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CandidatePanel({
  candidate,
  onDetail,
}: {
  candidate: RegionalMarker;
  onDetail: () => void;
}) {
  const gradeColor = getGradeColor(candidate.grade);
  const risksLabel =
    candidate.mainRisks.length > 0
      ? candidate.mainRisks.slice(0, 3).join(", ")
      : "주요 위험요인";
  const actionLabel = candidate.gradeAction || candidate.gradeLabel || candidate.grade;
  const aiPanelInsight =
    candidate.candidateExplanation || candidate.summary
      ? `${risksLabel}을 고려하면 ${actionLabel} 판단이 우선되며, 현장 확인과 복원 검토를 이어갈 필요가 있습니다.`
      : "선택 후보지에 대한 AI 요약 정보가 없습니다.";

  return (
    <Card className="border-[#2F5D50] shadow-md sticky top-20">
      <CardContent className="p-0">
        <div className="bg-[#2F5D50] px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-white/70 mb-1">
                분석 순위 #{candidate.rank}
              </p>
              <h3 className="text-base font-bold text-white">{candidate.name}</h3>
              <p className="text-[12px] text-white/70 mt-1">{candidate.region}</p>
            </div>

            <span
              className="text-xs text-white font-bold px-2.5 py-1 rounded"
              style={{ backgroundColor: gradeColor }}
            >
              {candidate.grade}
            </span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-[#F4F9F7] rounded-lg border border-[#DDE3DC] p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-gray-500 mb-1">AI 종합 점수</p>
              <p className="text-3xl font-bold text-[#2F5D50]">
                {candidate.priorityScore}
                <span className="text-sm text-gray-400 ml-1">점</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-gray-500 mb-1">복원 필요성</p>
              <p className="text-sm font-bold" style={{ color: gradeColor }}>
                {candidate.gradeLabel}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { label: "관할 기관", value: candidate.agency },
              { label: "경사도", value: `${candidate.slope}°` },
              { label: "민가 거리", value: `${candidate.distanceToHouse}m` },
              { label: "하천 거리", value: `${candidate.distanceToRiver}m` },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between border-b border-gray-100 pb-2"
              >
                <span className="text-xs text-gray-500">{item.label}</span>
                <span className="text-xs font-semibold text-gray-800 text-right">
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs font-bold text-gray-700 mb-2">위험 지표</p>
            <div className="space-y-2.5">
              <RiskBar label="산불 피해도" value={candidate.fireDamageScore} />
              <RiskBar label="산사태 위험도" value={candidate.landslideRiskScore} />
              <RiskBar label="토사유출 위험도" value={candidate.soilRunoffRiskScore} />
              <RiskBar label="생활권 노출도" value={candidate.exposureScore} />
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-700 mb-2">주요 위험 요인</p>
            <div className="flex flex-wrap gap-1.5">
              {candidate.mainRisks.map((risk) => (
                <span
                  key={risk}
                  className="text-xs px-2 py-1 bg-red-50 text-red-700 border border-red-100 rounded-full"
                >
                  {risk}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[#FFFBF0] border border-amber-200 rounded-lg p-3">
            <p className="text-[11px] font-semibold text-amber-700 mb-1.5 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              AI 요약
            </p>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              {aiPanelInsight}
            </p>
          </div>

          <Button
            onClick={onDetail}
            className="w-full bg-[#2F5D50] hover:bg-[#254a3f] text-white"
          >
            상세 분석 보기
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RegionalDashboardPage() {
  const navigate = useNavigate();

  const [analysisResult, setAnalysisResult] = useState<AnalyzeResult | null>(null);
  const [markers, setMarkers] = useState<RegionalMarker[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<RegionalMarker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRegionalData() {
      try {
        setIsLoading(true);
        setApiError(null);

        const data = await fetchAnalyzeResult();

        const regionalMarkers: RegionalMarker[] = data.allCandidates.map((candidate, index) => {
          const position = latLngToMapPosition(candidate);

          return {
            ...candidate,
            candidateExplanation: getCandidateExplanationFromAnalyzeResult(data, candidate),
            rank: candidate.rank ?? index + 1,
            color: getGradeColor(candidate.grade),
            x: Math.min(88, Math.max(12, position.x)),
            y: Math.min(88, Math.max(12, position.y)),
          };
        });

        setAnalysisResult(data);
        setMarkers(regionalMarkers);
        setSelectedCandidate(regionalMarkers[0] ?? null);
      } catch (error) {
        console.error(error);
        setApiError("지역 대시보드 데이터를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    loadRegionalData();
  }, []);

  const navItems = [
    { icon: <BarChart3 className="h-5 w-5" />, label: "대시보드", path: "/dashboard" },
    { icon: <TrendingUp className="h-5 w-5" />, label: "TOP 후보지", path: "/top-candidates" },
    { icon: <FileText className="h-5 w-5" />, label: "분석 방법", path: "/methodology" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] flex items-center justify-center">
        <Card className="border-[#E5E7EB] shadow-md bg-white">
          <CardContent className="px-8 py-6 text-center">
            <p className="text-sm font-semibold text-[#2F5D50] mb-2">
              지역 대시보드 불러오는 중
            </p>
            <p className="text-xs text-gray-500">
              백엔드 API에서 경상북도 후보지 분석 결과를 가져오고 있습니다.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (apiError || !analysisResult || markers.length === 0 || !selectedCandidate) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] flex items-center justify-center">
        <Card className="border-red-200 shadow-md bg-white">
          <CardContent className="px-8 py-6 text-center">
            <p className="text-sm font-semibold text-red-700 mb-2">
              지역 대시보드 데이터 로딩 실패
            </p>
            <p className="text-xs text-gray-500">
              {apiError ?? "표시할 후보지 데이터가 없습니다."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-[#2F5D50] text-white text-xs font-semibold rounded"
            >
              다시 시도
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const summary = analysisResult.summary;

  const gradeCounts = markers.reduce(
    (acc, candidate) => {
      acc[candidate.grade] = (acc[candidate.grade] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const statistics = [
    {
      label: "총 후보지",
      value: `${summary.totalCandidates}개`,
      icon: <MapPin className="h-5 w-5" />,
      color: "#2F5D50",
    },
    {
      label: "1등급 후보지",
      value: `${summary.grade1Count}개`,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: "#D32F2F",
    },
    {
      label: "최고 AI 점수",
      value: `${summary.topScore}점`,
      icon: <TrendingUp className="h-5 w-5" />,
      color: "#2F5D50",
    },
    {
      label: "평균 AI 점수",
      value: `${summary.averageScore}점`,
      icon: <Database className="h-5 w-5" />,
      color: "#2F5D50",
    },
    {
      label: "최근 업데이트",
      value: "2026.06",
      icon: <Calendar className="h-5 w-5" />,
      color: "#2F5D50",
    },
  ];

  const topRisks = Array.from(
    new Set(markers.flatMap((candidate) => candidate.mainRisks)),
  ).slice(0, 5);

  const topCandidate = markers.find(
    (candidate) => candidate.name === summary.topCandidateName,
  ) ?? markers[0];
  const summaryInsight = topCandidate
    ? `${summary.topRiskRegion}에서 ${summary.topCandidateName}이 최상위 후보지로 산정되었고, ${topCandidate.mainRisks.slice(0, 3).join(", ") || "주요 위험요인"} 관리가 핵심입니다.`
    : "백엔드 분석 요약을 기준으로 지역별 후보지 우선순위를 정리했습니다.";

  return (
    <div className="min-h-screen bg-[#F8FAF8]">
      <nav className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-[#2F5D50] rounded-md flex items-center justify-center">
                <Map className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-[#2F5D50]">
                산림 복원 AI
              </span>
            </button>

            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center space-x-2 transition-colors ${
                    item.path === "/dashboard"
                      ? "text-[#2F5D50] font-medium"
                      : "text-gray-700 hover:text-[#2F5D50]"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <div className="bg-gradient-to-r from-[#2F5D50] to-[#1a3a2f] text-white border-b border-[#2F5D50]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-3 text-white/90 hover:text-white hover:bg-white/10 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            전국 대시보드로 돌아가기
          </Button>

          <h1 className="text-2xl md:text-3xl font-bold">
            경상북도 산림 복원 우선순위 분석 결과
          </h1>
          <p className="text-white/90 mt-1 text-sm">
            {summary.topRiskRegion} · 백엔드 AI 분석 API 기준
          </p>
        </div>
      </div>

      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {statistics.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center space-x-3 p-3 bg-[#F8FAF8] rounded-lg"
              >
                <div className="p-2 rounded" style={{ backgroundColor: `${stat.color}15` }}>
                  <div style={{ color: stat.color }}>{stat.icon}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">{stat.label}</div>
                  <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-3">
            <Card className="border-[#2F5D50] shadow-md">
              <CardContent className="p-6">
                <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  분석 요약
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">분석 지역</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {summary.topRiskRegion}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-600 mb-1">분석 후보지</div>
                    <div className="text-sm font-semibold text-gray-900">
                      총 {summary.totalCandidates}개 후보지
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-600 mb-1">최상위 후보지</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {summary.topCandidateName}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-600 mb-2">등급별 분포</div>
                    <div className="space-y-2">
                      {["1등급", "2등급", "3등급", "4등급", "5등급"].map((grade) => {
                        const count = gradeCounts[grade] ?? 0;
                        if (count === 0) return null;

                        return (
                          <div key={grade} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-3 h-3 rounded"
                                style={{ backgroundColor: getGradeColor(grade) }}
                              />
                              <span className="text-xs text-gray-700">{grade}</span>
                            </div>
                            <span className="text-xs font-semibold text-gray-900">
                              {count}개
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-600 mb-2">주요 위험 요인</div>
                    <div className="flex flex-wrap gap-1.5">
                      {topRisks.map((risk) => (
                        <span
                          key={risk}
                          className="text-xs px-2 py-1 bg-[#2F5D50]/10 text-[#2F5D50] rounded"
                        >
                          {risk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">AI 지역 판단</div>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      {summaryInsight}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-12 lg:col-span-6">
            <RegionalMap
              markers={markers}
              selectedId={selectedCandidate.id}
              onSelect={setSelectedCandidate}
            />
          </div>

          <div className="col-span-12 lg:col-span-3">
            <CandidatePanel
              candidate={selectedCandidate}
              onDetail={() => navigate(`/candidate/${selectedCandidate.id}`)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
