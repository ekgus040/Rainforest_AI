import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { MapPin, TrendingUp, FileText } from "lucide-react";

interface CandidateSummaryProps {
  candidate: {
    name: string;
    location: string;
    grade: string;
    score: number;
    metrics: {
      fireDamage: number;
      disasterRisk: number;
      exposure: number;
      recoveryDifficulty: number;
    };
  };
}

export default function CandidateSummary({ candidate }: CandidateSummaryProps) {
  const navigate = useNavigate();

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "1등급":
        return "#D32F2F";
      case "2등급":
        return "#F57C00";
      case "3등급":
        return "#FBC02D";
      case "4등급":
        return "#7CB342";
      case "5등급":
        return "#388E3C";
      default:
        return "#9E9E9E";
    }
  };

  const metrics = [
    { label: "산불 피해도", value: candidate.metrics.fireDamage, color: "#D32F2F" },
    { label: "재해 위험도", value: candidate.metrics.disasterRisk, color: "#F57C00" },
    { label: "민가 노출도", value: candidate.metrics.exposure, color: "#FBC02D" },
    { label: "회복 난이도", value: candidate.metrics.recoveryDifficulty, color: "#7CB342" },
  ];

  return (
    <div className="space-y-4">
      {/* Candidate Info Card */}
      <Card className="border-[#E5E7EB] shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">선택 후보지</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div>
            <div className="text-2xl font-bold text-gray-900">{candidate.name}</div>
            <div className="flex items-center space-x-1.5 mt-1 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{candidate.location}</span>
            </div>
          </div>

          {/* Grade Badge */}
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1.5">복원 우선등급</div>
            <div
              className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-lg"
              style={{ backgroundColor: getGradeColor(candidate.grade) }}
            >
              {candidate.grade}
            </div>
          </div>

          {/* AI Score */}
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1.5">AI 점수</div>
            <div className="text-4xl font-bold text-[#2F5D50]">{candidate.score.toFixed(1)}점</div>
            <div className="text-xs text-gray-500 mt-1">100점 만점</div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Chart Card */}
      <Card className="border-[#E5E7EB] shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">세부 분석 지표</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                <span className="text-sm font-semibold" style={{ color: metric.color }}>
                  {metric.value}%
                </span>
              </div>
              <div className="relative">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${metric.value}%`,
                      backgroundColor: metric.color,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* AI Analysis Card */}
      <Card className="border-[#2F5D50] bg-[#2F5D50]/5 shadow-sm">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-[#2F5D50]" />
            <CardTitle className="text-base">AI 분석 결과</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm text-gray-700">
            <p className="leading-relaxed">
              <span className="font-semibold text-[#2F5D50]">• 산불 피해</span>가 매우 심각하며,
              피해 면적이 넓어 복원이 시급합니다.
            </p>
            <p className="leading-relaxed">
              <span className="font-semibold text-[#F57C00]">• 2차 재해 위험</span>이 높아 우기
              이전 조기 복원이 필요합니다.
            </p>
            <p className="leading-relaxed">
              <span className="font-semibold text-[#FBC02D]">• 민가 인접</span> 지역으로 사회적
              영향도가 높습니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button
          onClick={() => navigate("/candidate/1")}
          className="w-full bg-[#2F5D50] hover:bg-[#2F5D50]/90 text-white"
          size="lg"
        >
          <FileText className="mr-2 h-5 w-5" />
          상세 분석 보기
        </Button>
        <Button
          variant="outline"
          className="w-full border-[#2F5D50] text-[#2F5D50] hover:bg-[#2F5D50]/5"
          size="lg"
        >
          복원 계획 수립
        </Button>
      </div>

      {/* Quick Stats */}
      <Card className="border-[#E5E7EB] shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-xs text-gray-600 mb-1">피해 면적</div>
              <div className="text-xl font-bold text-gray-900">127ha</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">예상 복원 기간</div>
              <div className="text-xl font-bold text-gray-900">18개월</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">민가 인접</div>
              <div className="text-xl font-bold text-gray-900">2.3km</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">도로 인접</div>
              <div className="text-xl font-bold text-gray-900">0.8km</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
