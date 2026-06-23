import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Map, ArrowRight, Clock, Database, Sparkles } from "lucide-react";

export default function FilterSetupPage() {
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [allYears, setAllYears] = useState(true);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [allRisks, setAllRisks] = useState(true);
  const [selectedRisks, setSelectedRisks] = useState<string[]>([]);

  const regions = [
    "전체",
    "강원특별자치도",
    "경기도",
    "경상북도",
    "경상남도",
    "충청북도",
    "충청남도",
    "전북특별자치도",
    "전라남도",
    "제주특별자치도",
  ];

  const years = ["2022년", "2023년", "2024년", "2025년"];

  const risks = [
    "산사태 위험",
    "토사유출 위험",
    "민가 인접",
    "도로 인접",
    "급경사",
    "집중호우 위험",
    "자연 회복 어려움",
    "생태 훼손 심각",
    "수질오염 위험",
  ];

  const aiAnalysisItems = [
    "산불 피해도",
    "산사태 발생 가능성",
    "토사유출 위험도",
    "민가 및 도로 노출도",
    "자연 회복 가능성",
    "생태 복원 효과",
    "복원 시급성",
    "2차 재해 위험도",
  ];

  const dataSources = [
    "Sentinel-2 위성영상",
    "DEM",
    "토지피복도",
    "강수량 데이터",
    "산림청 산불 이력 데이터",
    "산사태 위험지도",
  ];

  const handleYearToggle = (year: string) => {
    if (allYears) {
      setAllYears(false);
      setSelectedYears([year]);
    } else {
      if (selectedYears.includes(year)) {
        const newYears = selectedYears.filter((y) => y !== year);
        setSelectedYears(newYears);
        if (newYears.length === 0) {
          setAllYears(true);
        }
      } else {
        setSelectedYears([...selectedYears, year]);
      }
    }
  };

  const handleAllYearsToggle = () => {
    setAllYears(!allYears);
    if (!allYears) {
      setSelectedYears([]);
    }
  };

  const handleRiskToggle = (risk: string) => {
    if (allRisks) {
      setAllRisks(false);
      setSelectedRisks([risk]);
    } else {
      if (selectedRisks.includes(risk)) {
        const newRisks = selectedRisks.filter((r) => r !== risk);
        setSelectedRisks(newRisks);
        if (newRisks.length === 0) {
          setAllRisks(true);
        }
      } else {
        setSelectedRisks([...selectedRisks, risk]);
      }
    }
  };

  const handleAllRisksToggle = () => {
    setAllRisks(!allRisks);
    if (!allRisks) {
      setSelectedRisks([]);
    }
  };

  const handleStartAnalysis = () => {
    navigate("/loading");
  };

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
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#2F5D50]/10 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-[#2F5D50]" />
            <span className="text-sm font-medium text-[#2F5D50]">AI 분석 조건 설정</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            복원 우선순위 분석 조건 설정
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            분석할 지역과 위험 요인을 선택하면 AI가 복원 우선순위를 산정합니다.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Filter Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Region Selection */}
            <Card className="border-[#E5E7EB] shadow-md bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">지역 선택</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="분석할 지역을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Wildfire Year Selection */}
            <Card className="border-[#E5E7EB] shadow-md bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">산불 발생 연도</CardTitle>
                <p className="text-sm text-gray-500 mt-1">복수 선택 가능</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="all-years"
                      checked={allYears}
                      onCheckedChange={handleAllYearsToggle}
                    />
                    <Label htmlFor="all-years" className="cursor-pointer">
                      전체
                    </Label>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    {years.map((year) => (
                      <div key={year} className="flex items-center space-x-2">
                        <Checkbox
                          id={year}
                          checked={allYears || selectedYears.includes(year)}
                          onCheckedChange={() => handleYearToggle(year)}
                          disabled={allYears}
                        />
                        <Label htmlFor={year} className="cursor-pointer">
                          {year}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Factors Selection */}
            <Card className="border-[#E5E7EB] shadow-md bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">주요 위험 요인</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  AI 분석 시 중요하게 고려할 위험요인을 선택하세요.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="all-risks"
                      checked={allRisks}
                      onCheckedChange={handleAllRisksToggle}
                    />
                    <Label htmlFor="all-risks" className="cursor-pointer">
                      전체
                    </Label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pl-6">
                    {risks.map((risk) => (
                      <div key={risk} className="flex items-center space-x-2">
                        <Checkbox
                          id={risk}
                          checked={allRisks || selectedRisks.includes(risk)}
                          onCheckedChange={() => handleRiskToggle(risk)}
                          disabled={allRisks}
                        />
                        <Label htmlFor={risk} className="cursor-pointer text-sm">
                          {risk}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - AI Analysis Info */}
          <div className="space-y-6">
            {/* AI Analysis Items */}
            <Card className="border-[#2F5D50] shadow-md bg-gradient-to-br from-white to-[#2F5D50]/5">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 flex items-center">
                  <Sparkles className="h-5 w-5 text-[#2F5D50] mr-2" />
                  AI 분석 항목
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {aiAnalysisItems.map((item) => (
                    <li key={item} className="flex items-start">
                      <span className="text-[#2F5D50] mr-2">•</span>
                      <span className="text-sm text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Analysis Time */}
            <Card className="border-[#E5E7EB] shadow-md bg-white">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-[#2F5D50]/10 rounded-lg">
                    <Clock className="h-5 w-5 text-[#2F5D50]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">예상 분석 시간</p>
                    <p className="font-semibold text-gray-900">약 5~10초</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Sources */}
            <Card className="border-[#E5E7EB] shadow-md bg-white">
              <CardHeader>
                <CardTitle className="text-base text-gray-900 flex items-center">
                  <Database className="h-5 w-5 text-[#2F5D50] mr-2" />
                  활용 데이터
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {dataSources.map((source) => (
                    <li key={source} className="flex items-start">
                      <span className="text-[#2F5D50] mr-2 text-xs">•</span>
                      <span className="text-sm text-gray-700">{source}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-12 text-center">
          <Button
            size="lg"
            onClick={handleStartAnalysis}
            className="bg-[#2F5D50] hover:bg-[#2F5D50]/90 text-white px-12 py-6 text-base"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            AI 기반 복원 우선순위 분석 시작
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
