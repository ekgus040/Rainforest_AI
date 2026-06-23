import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "../components/ui/card";
import { Check, ArrowRight, Circle, Loader2, MapPin, Calendar, AlertTriangle, Database, Activity } from "lucide-react";
import { fetchAiConfig, fetchAnalyzeResult } from "../../lib/candidates";

type LoadingStep = {
  id: number;
  label: string;
  duration: number;
};

const fallbackSteps: LoadingStep[] = [
  { id: 1, label: "산불 이벤트 인식 Agent: 산불 발생 지역과 분석 대상 후보지를 확인했습니다.", duration: 700 },
  { id: 2, label: "산림/비산림 분류 Agent: 복원 대상 산림지역을 분리하고 비산림지역을 분석 대상에서 제외했습니다.", duration: 800 },
  { id: 3, label: "산불 피해도 분석 Agent: 산불 피해 강도와 후보지별 피해 점수를 분석했습니다.", duration: 800 },
  { id: 4, label: "생활권 2차 피해 위험 분석 Agent: 산사태, 토사유출, 민가·도로·하천 인접성을 종합 분석했습니다.", duration: 900 },
  { id: 5, label: "복원 우선순위 산정 Agent: 가중치 기반 점수식을 적용해 TOP 5 후보지를 산정했습니다.", duration: 900 },
  { id: 6, label: "정책 실행 지원 Agent: 분석 결과를 정책 보고서와 이메일 초안으로 변환할 준비를 완료했습니다.", duration: 800 },
];

const fallbackDataSources = [
  "Sentinel-2 위성영상",
  "산림청 산불 피해 데이터",
  "DEM 지형 데이터",
  "산사태 위험지도",
  "토지피복도",
  "강수량 데이터",
  "민가 및 도로 위치 데이터",
];

function buildStepLabel(step: any): string {
  const name = typeof step?.name === "string" ? step.name.trim() : "";
  const message = typeof step?.message === "string" ? step.message.trim() : "";
  const role = typeof step?.role === "string" ? step.role.trim() : "";

  if (name && message) return `${name}: ${message}`;
  if (message) return message;
  if (name && role) return `${name}: ${role}`;
  return name || role || "";
}

function buildLoadingStepsFromApi(logs: any[] | undefined, config: any): LoadingStep[] {
  const logSteps = Array.isArray(logs)
    ? logs.map(buildStepLabel).filter(Boolean)
    : [];

  const agentSteps = Array.isArray(config?.agentSteps)
    ? config.agentSteps.map(buildStepLabel).filter(Boolean)
    : [];

  const labels = logSteps.length > 0 ? logSteps : agentSteps;
  if (labels.length === 0) return fallbackSteps;

  return labels.slice(0, fallbackSteps.length).map((label, index) => ({
    id: index + 1,
    label,
    duration: fallbackSteps[index]?.duration ?? 700,
  }));
}

export default function LoadingPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [analyzedCount, setAnalyzedCount] = useState(0);
  const [steps, setSteps] = useState<LoadingStep[]>(fallbackSteps);
  const [analysisTargetCount, setAnalysisTargetCount] = useState(1842);
  const [dataSources] = useState(fallbackDataSources);

  useEffect(() => {
    let isMounted = true;

    async function loadAnalysisSteps() {
      try {
        const [analysisResult, configResult] = await Promise.allSettled([
          fetchAnalyzeResult(),
          fetchAiConfig(),
        ]);

        if (!isMounted) return;

        const analysis =
          analysisResult.status === "fulfilled" ? analysisResult.value : null;
        const config = configResult.status === "fulfilled" ? configResult.value : null;

        setSteps(buildLoadingStepsFromApi(analysis?.analysisLogs, config));

        if (analysis?.summary?.totalCandidates) {
          setAnalysisTargetCount(analysis.summary.totalCandidates);
        }
      } catch (error) {
        console.error(error);
        setSteps(fallbackSteps);
      }
    }

    loadAnalysisSteps();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    // Progress animation - reaches 78% at step 7
    const targetProgress = Math.min((currentStep / (steps.length - 1)) * 100, 100);
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= targetProgress) {
          clearInterval(progressInterval);
          return targetProgress;
        }
        return prev + 2;
      });
    }, 60);

    // Analyzed count animation
    const countInterval = setInterval(() => {
      setAnalyzedCount((prev) => {
        const target = Math.floor((currentStep / steps.length) * analysisTargetCount);
        if (prev >= target) {
          clearInterval(countInterval);
          return target;
        }
        return prev + 23;
      });
    }, 50);

    // Step progression
    let stepTimeout: NodeJS.Timeout;
    const progressSteps = () => {
      if (currentStep < steps.length - 1) {
        stepTimeout = setTimeout(() => {
          setCurrentStep((prev) => prev + 1);
        }, steps[currentStep].duration);
      }
    };

    progressSteps();

    // Navigate to dashboard after completion
    const completeTimeout = setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 6500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(countInterval);
      clearTimeout(stepTimeout);
      clearTimeout(completeTimeout);
    };
  }, [analysisTargetCount, currentStep, navigate, steps]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Subtle GIS Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F8FAF8] via-[#F8FAF8] to-[#2F5D50]/5"></div>
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232F5D50' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      <div className="relative flex items-center justify-center min-h-screen px-4 py-12">
        <div className="max-w-6xl w-full space-y-8">
          {/* Top Badge */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#2F5D50]/10 rounded-full mb-6 backdrop-blur-sm border border-[#2F5D50]/20">
              <Loader2 className="h-4 w-4 text-[#2F5D50] animate-spin" />
              <span className="text-sm font-medium text-[#2F5D50]">AI 분석 엔진 실행 중</span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              경상북도 산불 피해지역 분석 중
            </h1>

            {/* Subtitle */}
            <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
              선택된 지역의 산불 피해도와 재해 위험도를 종합 분석하여
              <br />
              복원 우선순위를 산정하고 있습니다.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Conditions & Progress */}
            <div className="lg:col-span-2 space-y-6">
              {/* Selected Analysis Conditions */}
              <Card className="border-[#2F5D50]/30 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">선택된 분석 조건</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="h-4 w-4 text-[#2F5D50]" />
                        <p className="text-xs text-gray-500">분석 지역</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">경상북도</p>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="h-4 w-4 text-[#2F5D50]" />
                        <p className="text-xs text-gray-500">분석 연도</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">2025년</p>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-[#2F5D50]" />
                        <p className="text-xs text-gray-500">주요 위험 요인</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">전체</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Large Circular Loading Animation */}
              <div className="flex justify-center">
                <div className="relative w-56 h-56">
                  {/* Background Circle */}
                  <svg className="w-56 h-56 transform -rotate-90">
                    <circle
                      cx="112"
                      cy="112"
                      r="100"
                      stroke="#E5E7EB"
                      strokeWidth="16"
                      fill="none"
                    />
                    {/* Progress Circle */}
                    <circle
                      cx="112"
                      cy="112"
                      r="100"
                      stroke="#2F5D50"
                      strokeWidth="16"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 100}`}
                      strokeDashoffset={`${2 * Math.PI * 100 * (1 - progress / 100)}`}
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                  {/* Progress Percentage */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-[#2F5D50]">{Math.round(progress)}%</div>
                      <div className="text-sm text-gray-500 mt-2">분석 진행 중</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Steps */}
              <Card className="border-[#E5E7EB] shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">분석 단계</h3>
                  <div className="space-y-3">
                    {steps.map((step, index) => (
                      <div
                        key={step.id}
                        className={`flex items-center space-x-3 transition-all duration-300 ${
                          index <= currentStep ? "opacity-100" : "opacity-40"
                        }`}
                      >
                        {index < currentStep ? (
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#2F5D50] flex items-center justify-center">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        ) : index === currentStep ? (
                          <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-[#2F5D50] flex items-center justify-center">
                            <ArrowRight className="h-4 w-4 text-[#2F5D50] animate-pulse" />
                          </div>
                        ) : (
                          <Circle className="flex-shrink-0 h-6 w-6 text-gray-300" />
                        )}
                        <span
                          className={`text-sm ${
                            index < currentStep
                              ? "text-gray-900"
                              : index === currentStep
                              ? "text-gray-900 font-medium"
                              : "text-gray-500"
                          }`}
                        >
                          {index < currentStep ? "✓ " : index === currentStep ? "→ " : "○ "}
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Live Stats & Data */}
            <div className="space-y-6">
              {/* Live Analysis Status */}
              <Card className="border-[#2F5D50] shadow-lg bg-gradient-to-br from-white to-[#2F5D50]/5 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                    <Activity className="h-5 w-5 text-[#2F5D50] mr-2" />
                    실시간 분석 현황
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">분석 대상 후보지</p>
                      <p className="text-2xl font-bold text-gray-900">{analysisTargetCount.toLocaleString()}개</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">현재 분석 완료</p>
                      <p className="text-2xl font-bold text-[#2F5D50]">{analyzedCount.toLocaleString()}개</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">AI 모델 상태</p>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <p className="text-sm font-medium text-gray-900">정상 실행 중</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Sources Card */}
              <Card className="border-[#E5E7EB] shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-900 flex items-center">
                      <Database className="h-5 w-5 text-[#2F5D50] mr-2" />
                      활용 데이터
                    </h3>
                  </div>
                  <div className="space-y-2.5">
                    {dataSources.map((source, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-2 text-sm text-gray-700"
                      >
                        <span className="text-[#2F5D50] text-xs mt-0.5">•</span>
                        <span>{source}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom Message */}
          <div className="text-center space-y-3 mt-8">
            <p className="text-base font-medium text-gray-900">
              AI가 복원 필요성이 높은 지역을 선별하고 있습니다.
            </p>
            <p className="text-sm text-gray-600">
              잠시만 기다려 주세요.
            </p>

            {/* Progress Dots */}
            <div className="flex justify-center space-x-2 pt-2">
              <div className="w-2 h-2 bg-[#2F5D50] rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-[#2F5D50] rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></div>
              <div className="w-2 h-2 bg-[#2F5D50] rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
