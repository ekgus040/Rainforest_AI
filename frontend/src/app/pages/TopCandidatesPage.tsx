import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Map,
  BarChart3,
  TrendingUp,
  FileText,
  MapPin,
  Database,
  AlertTriangle,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  fetchAnalyzeResult,
  generateAgentExplanationFromApi,
  getCandidateExplanationFromAnalyzeResult,
  getGradeColor,
  latLngToMapPosition,
  type AnalyzeResult,
  type Candidate,
} from "../../lib/candidates";

type TopCandidateView = Candidate & {
  rank: number;
  gradeColor: string;
  score: number;
  locationLabel: string;
  risksLabel: string;
  aiRationale: string;
  x: number;
  y: number;
};

function buildShortRationale(candidate: Candidate, rationale: string): string {
  const risks = candidate.mainRisks.slice(0, 3).join(", ");

  if (risks) {
    return `${risks} 요인이 확인되어 ${candidate.gradeLabel || candidate.grade} 수준의 복원 검토가 필요합니다.`;
  }

  if (rationale) {
    return rationale.split(/[.!?。]\s*/)[0].trim();
  }

  return candidate.summary || "AI 분석 근거를 불러오지 못해 후보지 요약을 표시합니다.";
}

function buildTopCandidateView(
  candidate: Candidate,
  index: number,
  data: AnalyzeResult,
): TopCandidateView {
  const position = latLngToMapPosition(candidate);
  const rationale = getCandidateExplanationFromAnalyzeResult(data, candidate);

  return {
    ...candidate,
    rank: candidate.rank ?? index + 1,
    gradeColor: getGradeColor(candidate.grade),
    score: candidate.priorityScore,
    locationLabel: `${candidate.region} ${candidate.name}`,
    risksLabel:
      candidate.mainRisks.length > 0
        ? candidate.mainRisks.join(", ")
        : "위험요인 정보 없음",
    aiRationale: buildShortRationale(candidate, rationale),
    x: Math.min(88, Math.max(12, position.x)),
    y: Math.min(88, Math.max(12, position.y)),
  };
}

export default function TopCandidatesPage() {
  const navigate = useNavigate();

  const [analysisResult, setAnalysisResult] = useState<AnalyzeResult | null>(null);
  const [topCandidates, setTopCandidates] = useState<TopCandidateView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [agentExplanation, setAgentExplanation] = useState("");
  const [isAgentExplanationLoading, setIsAgentExplanationLoading] = useState(false);
  const [agentExplanationError, setAgentExplanationError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTopCandidates() {
      try {
        setIsLoading(true);
        setApiError(null);

        const data = await fetchAnalyzeResult();
        const candidates = data.topCandidates.map((candidate, index) =>
          buildTopCandidateView(candidate, index, data),
        );

        setAnalysisResult(data);
        setTopCandidates(candidates);
        setAgentExplanation(data.agentExplanation ?? "");
        setIsAgentExplanationLoading(true);
        setAgentExplanationError(null);
        setIsLoading(false);

        try {
          const explanationResult = await generateAgentExplanationFromApi({
            analysisResult: data,
          });

          if (explanationResult.explanation) {
            setAgentExplanation(explanationResult.explanation);
          }
        } catch (explanationError) {
          console.error(explanationError);
          setAgentExplanationError("AI 설명 API를 불러오지 못해 기존 분석 설명을 표시합니다.");
        } finally {
          setIsAgentExplanationLoading(false);
        }
      } catch (error) {
        console.error(error);
        setApiError("TOP 후보지 데이터를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    loadTopCandidates();
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
              TOP 후보지 불러오는 중
            </p>
            <p className="text-xs text-gray-500">
              백엔드 API에서 복원 우선순위 데이터를 가져오고 있습니다.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (apiError || topCandidates.length === 0 || !analysisResult) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] flex items-center justify-center">
        <Card className="border-red-200 shadow-md bg-white">
          <CardContent className="px-8 py-6 text-center">
            <p className="text-sm font-semibold text-red-700 mb-2">
              TOP 후보지 데이터 로딩 실패
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
  const grade1Ratio =
    summary.totalCandidates > 0
      ? ((summary.grade1Count / summary.totalCandidates) * 100).toFixed(1)
      : "0.0";

  const highestRiskFactor =
    topCandidates[0]?.mainRisks[0] ?? "산불 피해도";

  return (
    <div className="min-h-screen bg-[#F8FAF8]">
      <nav className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
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
                    item.path === "/top-candidates"
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
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            복원 우선순위 TOP {topCandidates.length} 후보지
          </h1>
          <p className="text-white/90 text-base">
            백엔드 AI 분석 API가 산불 피해 후보지의 복원 시급성을 산정한 결과입니다.
          </p>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="border-[#2F5D50] shadow-md bg-gradient-to-br from-white to-[#2F5D50]/5">
            <CardContent className="p-6 text-center">
              <MapPin className="h-8 w-8 text-[#2F5D50] mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">분석 후보지</p>
              <p className="text-3xl font-bold text-gray-900">
                {summary.totalCandidates}개
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#D32F2F] shadow-md bg-gradient-to-br from-white to-[#D32F2F]/5">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-8 w-8 text-[#D32F2F] mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">1등급 후보지</p>
              <p className="text-3xl font-bold text-[#D32F2F]">
                {summary.grade1Count}개
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#E5E7EB] shadow-md bg-white">
            <CardContent className="p-6 text-center">
              <Map className="h-8 w-8 text-[#2F5D50] mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">최고 위험 지역</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.topRiskRegion}
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#E5E7EB] shadow-md bg-white">
            <CardContent className="p-6 text-center">
              <Database className="h-8 w-8 text-[#2F5D50] mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">평균 AI 점수</p>
              <p className="text-3xl font-bold text-gray-900">
                {summary.averageScore}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-[#E5E7EB] shadow-lg bg-white mb-6">
          <CardHeader className="bg-gradient-to-r from-[#2F5D50]/10 to-transparent border-b border-[#E5E7EB]">
            <CardTitle className="text-lg">TOP 5 복원 후보지 분포 지도</CardTitle>
          </CardHeader>

          <CardContent className="p-5">
            <div className="relative h-[400px] bg-gradient-to-br from-green-50 via-[#F8FAF8] to-green-100 rounded-lg overflow-hidden border border-[#DDE3DC]">
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232F5D50' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />

              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 960 400" preserveAspectRatio="none">
                <defs>
                  <pattern id="topMapGridWide" width="36" height="36" patternUnits="userSpaceOnUse">
                    <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#2F5D50" strokeWidth="0.35" opacity="0.16" />
                  </pattern>
                </defs>
                <rect width="960" height="400" fill="url(#topMapGridWide)" />
                <path d="M155 58 C270 22 420 34 548 62 C700 95 810 142 842 213 C875 286 786 348 622 365 C468 381 270 365 169 313 C62 257 48 93 155 58 Z" fill="#DDECCB" stroke="#9BBF7C" strokeWidth="2" opacity="0.9" />
                <path d="M235 104 C350 75 560 86 683 129 C760 156 764 225 704 270 C608 342 363 331 251 277 C168 237 148 128 235 104 Z" fill="none" stroke="#7EA45A" strokeWidth="1" opacity="0.36" />
                <path d="M305 158 C420 128 574 142 650 178 C705 204 692 254 628 282 C536 322 379 306 319 268 C262 232 246 178 305 158 Z" fill="none" stroke="#7EA45A" strokeWidth="1" opacity="0.36" />
                <path d="M625 50 C570 116 588 174 532 236 C486 287 487 331 438 384" fill="none" stroke="#5BA2D0" strokeWidth="4" opacity="0.35" />
                <path d="M145 303 C292 267 482 268 775 221" fill="none" stroke="#A98C5A" strokeWidth="3" opacity="0.26" strokeDasharray="8 8" />
                <path d="M205 88 L760 88 L760 326 L205 326 Z" fill="none" stroke="#2F5D50" strokeWidth="1.5" strokeDasharray="8 7" opacity="0.38" />
              </svg>

              <div className="absolute left-4 top-4 bg-white/95 rounded-lg shadow-sm border border-[#DDE3DC] px-3.5 py-3">
                <p className="text-[11px] font-bold text-[#1C3A30]">경북 의성군 분석 권역</p>
                <p className="text-[10px] text-gray-500 mt-1">TOP 5 복원 후보지 분포</p>
              </div>

              {topCandidates.map((candidate) => (
                <button
                  key={candidate.id}
                  onClick={() => navigate(`/candidate/${candidate.id}`)}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform z-10 group"
                  style={{ left: `${candidate.x}%`, top: `${candidate.y}%` }}
                  title={`${candidate.rank}위 ${candidate.locationLabel}`}
                >
                  <div className="relative flex flex-col items-center">
                    {candidate.rank === 1 && (
                      <span
                        className="absolute -top-1 left-1/2 w-12 h-12 -translate-x-1/2 rounded-full animate-ping"
                        style={{ backgroundColor: candidate.gradeColor, opacity: 0.18 }}
                      />
                    )}
                    <div
                      className="w-9 h-9 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs"
                      style={{ backgroundColor: candidate.gradeColor }}
                    >
                      {candidate.rank}
                    </div>
                    <div className="mt-1 rounded bg-white/95 border border-[#DDE3DC] shadow-sm px-2 py-1 whitespace-nowrap">
                      <p className="text-[10px] font-bold text-gray-800 leading-none">{candidate.name}</p>
                    </div>
                  </div>
                </button>
              ))}

              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-[#E5E7EB]">
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  복원 우선순위
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {["1등급", "2등급", "3등급", "4등급", "5등급"].map((grade) => {
                    const color = getGradeColor(grade);
                    const hasGrade = topCandidates.some(
                      (candidate) => candidate.grade === grade,
                    );

                    if (!hasGrade) return null;

                    return (
                      <div key={grade} className="flex items-center space-x-1.5">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs text-gray-600">{grade}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <Card className="border-[#E5E7EB] shadow-lg bg-white">
            <CardHeader className="bg-gradient-to-r from-[#2F5D50]/10 to-transparent border-b border-[#E5E7EB]">
              <CardTitle className="text-lg">
                TOP 후보지 상세 목록
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1120px] table-fixed">
                  <thead className="bg-[#F8FAF8]">
                    <tr>
                      <th className="w-16 px-4 py-3 text-left text-xs font-medium text-gray-700">
                        순위
                      </th>
                      <th className="w-[22%] px-4 py-3 text-left text-xs font-medium text-gray-700">
                        후보지
                      </th>
                      <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-700">
                        복원 우선등급
                      </th>
                      <th className="w-24 px-4 py-3 text-left text-xs font-medium text-gray-700">
                        AI 점수
                      </th>
                      <th className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-700">
                        주요 위험요인
                      </th>
                      <th className="w-[30%] px-4 py-3 text-left text-xs font-medium text-gray-700">
                        AI 판단 근거
                      </th>
                      <th className="w-28 px-4 py-3 text-center text-xs font-medium text-gray-700">
                        상세보기
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#E5E7EB]">
                    {topCandidates.map((candidate) => (
                      <tr
                        key={candidate.id}
                        className="hover:bg-[#F8FAF8] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div
                            className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm text-white"
                            style={{
                              backgroundColor:
                                candidate.rank <= 3 ? "#2F5D50" : candidate.gradeColor,
                            }}
                          >
                            {candidate.rank}
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="text-sm font-medium text-gray-900">
                            {candidate.locationLabel}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {candidate.agency}
                          </p>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-1 rounded text-xs font-semibold text-white"
                            style={{ backgroundColor: candidate.gradeColor }}
                          >
                            {candidate.grade}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-sm font-bold text-[#2F5D50] whitespace-nowrap">
                          {candidate.score}
                        </td>

                        <td className="px-4 py-3 text-xs text-gray-600">
                          {candidate.risksLabel}
                        </td>

                        <td className="px-4 py-3 text-xs text-gray-600 leading-relaxed">
                          {candidate.aiRationale}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/candidate/${candidate.id}`)}
                            className="border-[#2F5D50] text-[#2F5D50] hover:bg-[#2F5D50]/5"
                          >
                            상세보기
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

        </div>

        <Card className="border-[#2F5D50] shadow-lg bg-gradient-to-br from-white to-[#2F5D50]/5 mb-6">
          <CardHeader className="border-b border-[#E5E7EB]">
            <CardTitle className="text-lg">AI 분석 인사이트</CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="border-[#D32F2F] bg-white shadow-sm">
                <CardContent className="p-4 text-center">
                  <AlertTriangle className="h-6 w-6 text-[#D32F2F] mx-auto mb-2" />
                  <p className="text-xs text-gray-600 mb-1">가장 높은 위험요인</p>
                  <p className="text-base font-bold text-[#D32F2F]">
                    {highestRiskFactor}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-[#2F5D50] bg-white shadow-sm">
                <CardContent className="p-4 text-center">
                  <MapPin className="h-6 w-6 text-[#2F5D50] mx-auto mb-2" />
                  <p className="text-xs text-gray-600 mb-1">최고 위험 지역</p>
                  <p className="text-base font-bold text-[#2F5D50]">
                    {summary.topRiskRegion}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-[#2F5D50] bg-white shadow-sm">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-6 w-6 text-[#2F5D50] mx-auto mb-2" />
                  <p className="text-xs text-gray-600 mb-1">최고 AI 점수</p>
                  <p className="text-base font-bold text-[#2F5D50]">
                    {summary.topScore}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-[#D32F2F] bg-white shadow-sm">
                <CardContent className="p-4 text-center">
                  <TrendingDown className="h-6 w-6 text-[#D32F2F] mx-auto mb-2" />
                  <p className="text-xs text-gray-600 mb-1">1등급 비율</p>
                  <p className="text-base font-bold text-[#D32F2F]">
                    {grade1Ratio}%
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-white rounded-lg p-6 border border-[#E5E7EB] text-center">
              <p className="text-base text-gray-700 leading-relaxed max-w-3xl mx-auto">
                {agentExplanation || analysisResult.agentExplanation}
              </p>
              {isAgentExplanationLoading && (
                <p className="text-xs text-gray-400 mt-3">
                  AI 판단 근거를 불러오는 중입니다.
                </p>
              )}
              {agentExplanationError && (
                <p className="text-xs text-amber-700 mt-3">
                  {agentExplanationError}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
