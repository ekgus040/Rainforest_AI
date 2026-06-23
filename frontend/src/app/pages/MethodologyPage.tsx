import { useNavigate } from "react-router";
import { Map, BarChart3, TrendingUp, FileText, ArrowDown, Database, Satellite, Cloud, Mountain, Users, MapPin as MapPinIcon, Flame, TreeDeciduous, Home, CheckCircle2, Zap, Sparkles, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function MethodologyPage() {
  const navigate = useNavigate();

  const navItems = [
    { icon: <BarChart3 className="h-5 w-5" />, label: "대시보드", path: "/dashboard" },
    { icon: <TrendingUp className="h-5 w-5" />, label: "TOP 후보지", path: "/top-candidates" },
    { icon: <FileText className="h-5 w-5" />, label: "분석 방법", path: "/methodology" },
  ];

  const inputDataCards = [
    {
      title: "산불 피해 데이터",
      icon: <Flame className="h-8 w-8" />,
      items: ["산불 발생 위치", "피해 면적", "발생 시기"],
    },
    {
      title: "위성영상 데이터",
      icon: <Satellite className="h-8 w-8" />,
      items: ["산불 전 영상", "산불 후 영상", "Sentinel-2"],
    },
    {
      title: "지형 데이터",
      icon: <Mountain className="h-8 w-8" />,
      items: ["DEM", "경사도", "고도"],
    },
    {
      title: "강수량 데이터",
      icon: <Cloud className="h-8 w-8" />,
      items: ["누적 강수량", "집중호우 빈도"],
    },
    {
      title: "토양 및 임상도",
      icon: <TreeDeciduous className="h-8 w-8" />,
      items: ["토양 안정성", "산림 특성"],
    },
    {
      title: "민가 및 도로 데이터",
      icon: <Home className="h-8 w-8" />,
      items: ["생활권 위치", "도로망 정보"],
    },
  ];

  const keyContributions = [
    {
      title: "민가 피해 가능성 중심 복원 우선순위 산정",
      icon: <Home className="h-8 w-8" />,
    },
    {
      title: "산불 이후 2차 재해 위험 통합 분석",
      icon: <Mountain className="h-8 w-8" />,
    },
    {
      title: "위성영상과 공공데이터 기반 객관적 의사결정 지원",
      icon: <Satellite className="h-8 w-8" />,
    },
    {
      title: "설명 가능한 AI 기반 복원 우선순위 추천",
      icon: <Sparkles className="h-8 w-8" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF8]">
      {/* Navigation */}
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
              <span className="text-lg font-semibold text-[#2F5D50]">산림 복원 AI</span>
            </button>
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center space-x-2 transition-colors ${
                    item.path === "/methodology"
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

      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#2F5D50] to-[#1a3a2f] text-white border-b border-[#2F5D50]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">AI 분석 방법</h1>
          <p className="text-white/90 text-base leading-relaxed max-w-3xl">
            산불 이후 훼손된 산림의 복원 우선순위를 산정하기 위한<br />
            AI 및 공간데이터 기반 분석 프로세스를 소개합니다.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section - Process Flow Diagram */}
        <Card className="border-[#2F5D50] shadow-lg bg-white mb-8">
          <CardHeader className="bg-gradient-to-r from-[#2F5D50]/10 to-transparent border-b border-[#E5E7EB]">
            <CardTitle className="text-lg">분석 프로세스 흐름도</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-4">
              {/* Input Data */}
              <div className="w-full max-w-md">
                <div className="bg-[#2F5D50] text-white rounded-lg p-4 text-center">
                  <Database className="h-6 w-6 mx-auto mb-2" />
                  <p className="font-semibold">Input Data</p>
                  <p className="text-sm text-white/80">6종 공간 데이터</p>
                </div>
              </div>

              <ChevronDown className="h-6 w-6 text-gray-400" />

              {/* Step 1 */}
              <div className="w-full max-w-md">
                <div className="bg-[#D32F2F] text-white rounded-lg p-4 text-center">
                  <p className="font-semibold">Step 1</p>
                  <p className="text-sm">산불 피해 및 식생 훼손 분석</p>
                </div>
              </div>

              <ChevronDown className="h-6 w-6 text-gray-400" />

              {/* Step 2 */}
              <div className="w-full max-w-md">
                <div className="bg-[#F57C00] text-white rounded-lg p-4 text-center">
                  <p className="font-semibold">Step 2</p>
                  <p className="text-sm">2차 재해 취약성 분석</p>
                </div>
              </div>

              <ChevronDown className="h-6 w-6 text-gray-400" />

              {/* Step 3 */}
              <div className="w-full max-w-md">
                <div className="bg-[#FBC02D] text-white rounded-lg p-4 text-center">
                  <p className="font-semibold">Step 3</p>
                  <p className="text-sm">민가 및 도로 노출도 분석</p>
                </div>
              </div>

              <ChevronDown className="h-6 w-6 text-gray-400" />

              {/* Step 4 */}
              <div className="w-full max-w-md">
                <div className="bg-[#2F5D50] text-white rounded-lg p-4 text-center">
                  <Sparkles className="h-6 w-6 mx-auto mb-2" />
                  <p className="font-semibold">Step 4</p>
                  <p className="text-sm">AI 기반 복원 우선순위 산정</p>
                </div>
              </div>

              <ChevronDown className="h-6 w-6 text-gray-400" />

              {/* Output */}
              <div className="w-full max-w-md">
                <div className="bg-gradient-to-r from-[#2F5D50] to-[#1a3a2f] text-white rounded-lg p-6 text-center">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-3" />
                  <p className="font-bold text-lg mb-2">Output</p>
                  <div className="space-y-1 text-sm">
                    <p>• 복원 우선순위 지도</p>
                    <p>• TOP10 후보지</p>
                    <p>• 후보지별 위험 원인 설명</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 1: Input Data */}
        <Card className="border-[#E5E7EB] shadow-lg bg-white mb-8">
          <CardHeader className="bg-gradient-to-r from-[#2F5D50]/10 to-transparent border-b border-[#E5E7EB]">
            <CardTitle className="text-lg">입력 데이터</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inputDataCards.map((card, index) => (
                <Card key={index} className="border-[#2F5D50] bg-gradient-to-br from-white to-[#2F5D50]/5">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-[#2F5D50]/10 rounded-lg text-[#2F5D50]">
                        {card.icon}
                      </div>
                      <h3 className="font-bold text-gray-900">{card.title}</h3>
                    </div>
                    <ul className="space-y-2">
                      {card.items.map((item, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700">
                          <span className="text-[#2F5D50] mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Step 1 */}
        <Card className="border-[#D32F2F] shadow-lg bg-white mb-8">
          <CardHeader className="bg-gradient-to-r from-[#D32F2F]/10 to-transparent border-b border-[#E5E7EB]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#D32F2F] text-white flex items-center justify-center font-bold">
                1
              </div>
              <CardTitle className="text-lg">산불 피해 및 식생 훼손 분석</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-base text-gray-700 mb-6 leading-relaxed">
              산불 전·후 위성영상을 비교하여 식생 훼손 정도를 분석합니다.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Before/After Visual */}
              <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-8 text-center">
                <Satellite className="h-12 w-12 text-green-700 mx-auto mb-3" />
                <p className="font-semibold text-gray-900 mb-1">산불 발생 전</p>
                <p className="text-sm text-gray-600">정상 식생 영역</p>
              </div>
              <div className="bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg p-8 text-center">
                <Flame className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="font-semibold text-white mb-1">산불 발생 후</p>
                <p className="text-sm text-gray-300">식생 훼손 영역</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">분석 지표</h4>
                <ul className="space-y-2">
                  {["NDVI", "NBR", "dNBR"].map((indicator) => (
                    <li key={indicator} className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-[#D32F2F]"></div>
                      <span className="text-sm text-gray-700">{indicator}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">출력 결과</h4>
                <ul className="space-y-2">
                  {["산불 피해 영역", "식생 훼손도", "산불 피해 강도 지도"].map((output) => (
                    <li key={output} className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#D32F2F]" />
                      <span className="text-sm text-gray-700">{output}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Step 2 */}
        <Card className="border-[#F57C00] shadow-lg bg-white mb-8">
          <CardHeader className="bg-gradient-to-r from-[#F57C00]/10 to-transparent border-b border-[#E5E7EB]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#F57C00] text-white flex items-center justify-center font-bold">
                2
              </div>
              <CardTitle className="text-lg">2차 재해 취약성 분석</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-base text-gray-700 mb-6 leading-relaxed">
              산불 이후 발생할 수 있는 산사태 및 토사유출 위험을 분석합니다.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">입력 요소</h4>
                <ul className="space-y-2">
                  {["경사도", "고도", "토양 안정성", "강수량", "식생 훼손도"].map((factor) => (
                    <li key={factor} className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-[#F57C00]"></div>
                      <span className="text-sm text-gray-700">{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">출력 결과</h4>
                <ul className="space-y-2">
                  {["산사태 위험도", "토사유출 위험도", "재해 취약도 점수"].map((output) => (
                    <li key={output} className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#F57C00]" />
                      <span className="text-sm text-gray-700">{output}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Step 3 */}
        <Card className="border-[#FBC02D] shadow-lg bg-white mb-8">
          <CardHeader className="bg-gradient-to-r from-[#FBC02D]/10 to-transparent border-b border-[#E5E7EB]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#FBC02D] text-white flex items-center justify-center font-bold">
                3
              </div>
              <CardTitle className="text-lg">민가 및 도로 노출도 분석</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-base text-gray-700 mb-6 leading-relaxed">
              산불 피해지역이 실제 생활권에 얼마나 영향을 줄 수 있는지 평가합니다.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">분석 요소</h4>
                <ul className="space-y-2">
                  {["민가와의 거리", "도로와의 거리", "경사 방향", "하류 위치"].map((factor) => (
                    <li key={factor} className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-[#FBC02D]"></div>
                      <span className="text-sm text-gray-700">{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">출력 결과</h4>
                <ul className="space-y-2">
                  {["인명 피해 가능성", "재산 피해 가능성", "생활권 노출도 점수"].map((output) => (
                    <li key={output} className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#FBC02D]" />
                      <span className="text-sm text-gray-700">{output}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Step 4 - AI Scoring */}
        <Card className="border-[#2F5D50] shadow-lg bg-gradient-to-br from-white to-[#2F5D50]/5 mb-8">
          <CardHeader className="bg-gradient-to-r from-[#2F5D50]/10 to-transparent border-b border-[#E5E7EB]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#2F5D50] text-white flex items-center justify-center font-bold">
                4
              </div>
              <CardTitle className="text-lg">AI 기반 복원 우선순위 산정</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4 mb-6">
              <div className="w-full max-w-lg">
                <div className="bg-white border-2 border-[#2F5D50] rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 text-center">Input Features</h4>
                  <div className="space-y-2">
                    {["산불 피해도", "재해 취약도", "민가·도로 노출도", "자연 회복 가능성"].map((feature) => (
                      <div key={feature} className="flex items-center space-x-2 p-2 bg-[#2F5D50]/5 rounded">
                        <Zap className="w-4 h-4 text-[#2F5D50]" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <ChevronDown className="h-6 w-6 text-[#2F5D50]" />

              <div className="w-full max-w-lg">
                <div className="bg-[#2F5D50] text-white rounded-lg p-6 text-center">
                  <Sparkles className="h-12 w-12 mx-auto mb-3" />
                  <p className="font-bold text-lg">AI 분석 엔진</p>
                  <p className="text-sm text-white/80">머신러닝 기반 통합 분석</p>
                </div>
              </div>

              <ChevronDown className="h-6 w-6 text-[#2F5D50]" />

              <div className="w-full max-w-lg">
                <div className="bg-gradient-to-r from-[#D32F2F] to-[#2F5D50] text-white rounded-lg p-6 text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3" />
                  <p className="font-bold text-lg">복원 우선순위 점수 산출</p>
                  <p className="text-sm text-white/90">1~5등급 분류</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-[#E5E7EB]">
              <p className="text-base text-gray-700 leading-relaxed text-center">
                AI는 <strong className="text-[#2F5D50]">산불 피해도</strong>,
                <strong className="text-[#2F5D50]"> 2차 재해 취약성</strong>,
                <strong className="text-[#2F5D50]"> 민가 및 도로 노출도</strong>,
                <strong className="text-[#2F5D50]"> 자연 회복 가능성</strong>을 종합적으로 분석하여 복원 우선순위를 산정합니다.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 6: Final Results */}
        <Card className="border-[#E5E7EB] shadow-lg bg-white mb-8">
          <CardHeader className="bg-gradient-to-r from-[#2F5D50]/10 to-transparent border-b border-[#E5E7EB]">
            <CardTitle className="text-lg">최종 결과</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "복원 우선순위 지도", icon: <Map className="h-8 w-8" /> },
                { title: "전국 TOP10 후보지", icon: <TrendingUp className="h-8 w-8" /> },
                { title: "후보지별 위험 원인 설명", icon: <FileText className="h-8 w-8" /> },
                { title: "정책 의사결정 지원 정보", icon: <BarChart3 className="h-8 w-8" /> },
              ].map((result, index) => (
                <Card key={index} className="border-[#2F5D50] bg-gradient-to-br from-white to-[#2F5D50]/5">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex p-3 bg-[#2F5D50]/10 rounded-lg text-[#2F5D50] mb-3">
                      {result.icon}
                    </div>
                    <p className="font-semibold text-gray-900">{result.title}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section 7: Comparison Table */}
        <Card className="border-[#E5E7EB] shadow-lg bg-white mb-8">
          <CardHeader className="bg-gradient-to-r from-[#2F5D50]/10 to-transparent border-b border-[#E5E7EB]">
            <CardTitle className="text-lg">제안 방법론의 차별성</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8FAF8]">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900 border-b-2 border-[#E5E7EB]">
                      기존 방법
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-[#2F5D50] border-b-2 border-[#2F5D50]">
                      제안 방법
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#E5E7EB]">
                    <td className="px-6 py-4 text-gray-700">
                      <div className="flex items-start space-x-2">
                        <span className="text-gray-400">•</span>
                        <span>산불 피해 면적 중심</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900 bg-[#2F5D50]/5" rowSpan={3}>
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <CheckCircle2 className="w-5 h-5 text-[#2F5D50] flex-shrink-0 mt-0.5" />
                          <span className="font-medium">산불 피해도</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <CheckCircle2 className="w-5 h-5 text-[#2F5D50] flex-shrink-0 mt-0.5" />
                          <span className="font-medium">재해 취약성</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <CheckCircle2 className="w-5 h-5 text-[#2F5D50] flex-shrink-0 mt-0.5" />
                          <span className="font-medium">민가·도로 노출도</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <CheckCircle2 className="w-5 h-5 text-[#2F5D50] flex-shrink-0 mt-0.5" />
                          <span className="font-medium">자연 회복 가능성</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-[#2F5D50]/30">
                          <p className="text-[#2F5D50] font-bold">통합 분석</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-[#E5E7EB]">
                    <td className="px-6 py-4 text-gray-700">
                      <div className="flex items-start space-x-2">
                        <span className="text-gray-400">•</span>
                        <span>행정구역 중심</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700">
                      <div className="flex items-start space-x-2">
                        <span className="text-gray-400">•</span>
                        <span>현장 조사 중심</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Section 8: Key Contributions */}
        <Card className="border-[#2F5D50] shadow-lg bg-gradient-to-br from-white to-[#2F5D50]/5 mb-8">
          <CardHeader className="border-b border-[#E5E7EB]">
            <CardTitle className="text-lg text-center">핵심 기여점</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {keyContributions.map((contribution, index) => (
                <Card key={index} className="border-[#2F5D50] bg-white shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="p-4 bg-[#2F5D50]/10 rounded-full text-[#2F5D50] mb-4">
                        {contribution.icon}
                      </div>
                      <p className="font-semibold text-gray-900 leading-relaxed">
                        {contribution.title}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bottom Message */}
        <Card className="border-[#2F5D50] shadow-lg bg-gradient-to-r from-[#2F5D50] to-[#1a3a2f] text-white">
          <CardContent className="p-8 text-center">
            <p className="text-lg leading-relaxed max-w-4xl mx-auto">
              본 시스템은 <strong>위성영상</strong>, <strong>공간정보</strong>, <strong>환경데이터</strong>를 통합 분석하여
              산불 이후 복원이 시급한 지역을 객관적으로 식별하고,
              <strong> 산림 복원 정책 의사결정을 지원</strong>합니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
