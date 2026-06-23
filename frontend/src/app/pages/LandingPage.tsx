import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { TrendingUp, MapPin, Calendar, Globe, Map, BarChart3, FileText } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  const navItems = [
    { icon: <BarChart3 className="h-5 w-5" />, label: "대시보드", path: "/dashboard" },
    { icon: <TrendingUp className="h-5 w-5" />, label: "TOP 후보지", path: "/top-candidates" },
    { icon: <FileText className="h-5 w-5" />, label: "분석 방법", path: "/methodology" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF8]">
      {/* Navigation */}
      <nav className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  className="flex items-center space-x-2 text-gray-700 hover:text-[#2F5D50] transition-colors"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#2F5D50]/10 rounded-full">
              <div className="w-2 h-2 bg-[#2F5D50] rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-[#2F5D50]">AI 기반 분석 시스템</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              AI 기반 산림 복원 우선순위 추천 시스템
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
              산불 피해도, 2차 재해 위험도, 민가·도로 노출도를 종합 분석하여 복원 우선순위를 추천합니다.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/filter")}
                className="bg-[#2F5D50] hover:bg-[#2F5D50]/90 text-white px-8 py-6 text-base"
              >
                <Map className="mr-2 h-5 w-5" />
                AI 복원 우선순위 분석 시작
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/methodology")}
                className="border-[#2F5D50] text-[#2F5D50] hover:bg-[#2F5D50]/5 px-8 py-6 text-base"
              >
                <FileText className="mr-2 h-5 w-5" />
                분석 방법 알아보기
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Summary Section */}
      <div className="bg-[#F8FAF8] border-y border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-[#E5E7EB] shadow-md hover:shadow-lg transition-shadow bg-white">
              <CardContent className="p-8 text-center">
                <div className="inline-flex p-4 bg-[#2F5D50]/10 rounded-full mb-4">
                  <MapPin className="h-8 w-8 text-[#2F5D50]" />
                </div>
                <div className="text-sm text-gray-600 mb-2">분석 대상 지역</div>
                <div className="text-4xl font-bold text-gray-900 mb-1">1,842개</div>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#D32F2F] shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-[#D32F2F]/5">
              <CardContent className="p-8 text-center">
                <div className="inline-flex p-4 bg-[#D32F2F]/10 rounded-full mb-4">
                  <TrendingUp className="h-8 w-8 text-[#D32F2F]" />
                </div>
                <div className="text-sm text-gray-600 mb-2">1등급 복원 필요 지역</div>
                <div className="text-4xl font-bold text-[#D32F2F] mb-1">126개</div>
              </CardContent>
            </Card>

            <Card className="border-[#E5E7EB] shadow-md hover:shadow-lg transition-shadow bg-white">
              <CardContent className="p-8 text-center">
                <div className="inline-flex p-4 bg-[#2F5D50]/10 rounded-full mb-4">
                  <Globe className="h-8 w-8 text-[#2F5D50]" />
                </div>
                <div className="text-sm text-gray-600 mb-2">활용 데이터</div>
                <div className="text-4xl font-bold text-gray-900 mb-1">6종</div>
              </CardContent>
            </Card>

            <Card className="border-[#E5E7EB] shadow-md hover:shadow-lg transition-shadow bg-white">
              <CardContent className="p-8 text-center">
                <div className="inline-flex p-4 bg-[#2F5D50]/10 rounded-full mb-4">
                  <BarChart3 className="h-8 w-8 text-[#2F5D50]" />
                </div>
                <div className="text-sm text-gray-600 mb-2">AI 분석 모델</div>
                <div className="text-2xl font-bold text-gray-900 mb-1">GIS + ML</div>
              </CardContent>
            </Card>
          </div>

          {/* Priority Legend Card */}
          <Card className="border-[#2F5D50] shadow-md bg-white">
            <CardContent className="p-6">
              <p className="text-base font-semibold text-gray-900 mb-4 text-center">
                복원 우선순위 등급
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                {[
                  { grade: "1등급", color: "#D32F2F", label: "즉시 복원 필요" },
                  { grade: "2등급", color: "#F57C00", label: "우선 복원 권장" },
                  { grade: "3등급", color: "#FBC02D", label: "복원 검토 대상" },
                  { grade: "4등급", color: "#7CB342", label: "지속 관찰 대상" },
                  { grade: "5등급", color: "#388E3C", label: "자연 회복 가능" },
                ].map((item) => (
                  <div key={item.grade} className="flex items-center space-x-2">
                    <div
                      className="w-5 h-5 rounded"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">
                      {item.grade} <span className="text-gray-500">({item.label})</span>
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>


      {/* Features Section */}
      <div className="bg-white border-t border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              AI 기반 정밀 분석 시스템
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              빅데이터와 머신러닝 기술을 활용하여 과학적이고 객관적인 복원 우선순위를 제공합니다.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "산불 피해도 분석",
                description: "위성 이미지와 드론 데이터를 활용하여 피해 규모와 심각도를 정밀 분석합니다.",
                color: "#D32F2F",
                icon: <BarChart3 className="h-6 w-6" />,
              },
              {
                title: "2차 재해 위험도",
                description: "산사태, 토사 유출 등 2차 재해 발생 가능성을 지형 데이터 기반으로 예측합니다.",
                color: "#F57C00",
                icon: <TrendingUp className="h-6 w-6" />,
              },
              {
                title: "민가·도로 노출도",
                description: "주거지역 및 도로 인접성을 고려하여 사회적 영향도를 평가합니다.",
                color: "#7CB342",
                icon: <MapPin className="h-6 w-6" />,
              },
            ].map((feature, index) => (
              <Card key={index} className="border-[#E5E7EB] shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                <CardContent className="p-6">
                  <div
                    className="inline-flex p-3 rounded-lg mb-4"
                    style={{ backgroundColor: `${feature.color}15` }}
                  >
                    <div style={{ color: feature.color }}>{feature.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#2F5D50] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-white/20 rounded-md flex items-center justify-center">
                  <Map className="h-5 w-5" />
                </div>
                <span className="font-semibold">산림 복원 AI</span>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">
                인공지능 기술로 우리 산림의 미래를 보호합니다.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">서비스</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="hover:text-white transition-colors"
                  >
                    대시보드
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/top-candidates")}
                    className="hover:text-white transition-colors"
                  >
                    TOP 후보지
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/methodology")}
                    className="hover:text-white transition-colors"
                  >
                    분석 방법
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">문의</h4>
              <p className="text-sm text-white/80">
                산림청 산림복원과
                <br />
                Tel: 042-481-XXXX
                <br />
                Email: forest@korea.kr
              </p>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/60">
            <p>© 2026 대한민국 산림청. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
