import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface GyeongsangbukMapProps {
  onSelectCandidate: (candidate: any) => void;
}

export default function GyeongsangbukMap({ onSelectCandidate }: GyeongsangbukMapProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(1);

  // Cities and counties with realistic positions in Gyeongsangbuk-do
  const cities = [
    { name: "안동시", x: 35, y: 45 },
    { name: "영주시", x: 25, y: 35 },
    { name: "문경시", x: 18, y: 58 },
    { name: "의성군", x: 50, y: 50 },
    { name: "울진군", x: 75, y: 25 },
    { name: "청송군", x: 58, y: 40 },
    { name: "봉화군", x: 40, y: 25 },
    { name: "영양군", x: 55, y: 30 },
  ];

  // Restoration candidates distributed across the province
  const candidates = [
    { id: 1, name: "후보지 A", x: 50, y: 50, grade: 1, location: "경상북도 의성군", rank: 1, score: 92.4 },
    { id: 2, name: "후보지 B", x: 40, y: 25, grade: 1, location: "경상북도 봉화군", rank: 2, score: 91.2 },
    { id: 3, name: "후보지 C", x: 75, y: 28, grade: 2, location: "경상북도 울진군", rank: 3, score: 89.5 },
    { id: 4, name: "후보지 D", x: 58, y: 40, grade: 2, location: "경상북도 청송군", rank: 4, score: 87.8 },
    { id: 5, name: "후보지 E", x: 35, y: 45, grade: 2, location: "경상북도 안동시", rank: 5, score: 85.3 },
    { id: 6, name: "후보지 F", x: 55, y: 32, grade: 3, location: "경상북도 영양군", rank: 6, score: 83.1 },
    { id: 7, name: "후보지 G", x: 25, y: 35, grade: 3, location: "경상북도 영주시", rank: 7, score: 81.4 },
    { id: 8, name: "후보지 H", x: 18, y: 58, grade: 3, location: "경상북도 문경시", rank: 8, score: 79.6 },
  ];

  const getGradeColor = (grade: number) => {
    switch (grade) {
      case 1: return "#D32F2F";
      case 2: return "#F57C00";
      case 3: return "#FBC02D";
      case 4: return "#7CB342";
      case 5: return "#388E3C";
      default: return "#9E9E9E";
    }
  };

  const getCandidateData = (candidateId: number) => {
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) return null;

    return {
      name: candidate.name,
      location: candidate.location,
      grade: `${candidate.grade}등급`,
      score: candidate.score,
      metrics: {
        fireDamage: 87 - (candidate.rank - 1) * 3,
        disasterRisk: 72 - (candidate.rank - 1) * 2,
        exposure: 65 - (candidate.rank - 1) * 2,
        recoveryDifficulty: 78 - (candidate.rank - 1) * 2,
      },
    };
  };

  const handleCandidateClick = (candidate: any) => {
    setSelectedCandidate(candidate.id);
    const data = getCandidateData(candidate.id);
    if (data) {
      onSelectCandidate(data);
    }
  };

  return (
    <Card className="border-[#E5E7EB] shadow-md h-full">
      <CardHeader className="border-b border-[#E5E7EB] bg-gradient-to-r from-[#2F5D50]/5 to-transparent">
        <CardTitle className="text-lg font-semibold text-gray-900">경상북도 복원 우선순위 현황도</CardTitle>
        <p className="text-xs text-gray-600 mt-1">의성군 · 2024년 산불 기준</p>
      </CardHeader>
      <CardContent className="p-4">
        {/* Map Container */}
        <div className="relative bg-[#f0f4f8] rounded-lg border border-[#E5E7EB] aspect-[4/3] overflow-hidden">
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 80"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Gyeongsangbuk-do Province Boundary */}
            <path
              d="M 15 65 L 12 58 L 10 50 L 12 42 L 15 35 L 18 28 L 22 22 L 28 18 L 35 15 L 42 14 L 50 15 L 58 18 L 65 22 L 72 28 L 78 35 L 82 42 L 85 50 L 85 58 L 82 65 L 78 70 L 72 72 L 65 73 L 58 72 L 50 70 L 42 68 L 35 67 L 28 66 L 22 65 Z"
              fill="#E8F5E9"
              fillOpacity="0.4"
              stroke="#2F5D50"
              strokeWidth="0.8"
              strokeLinejoin="round"
            />

            {/* Internal County Boundaries */}
            <g stroke="#2F5D50" strokeWidth="0.3" opacity="0.3" fill="none">
              <path d="M 28 18 L 50 40 L 72 28" />
              <path d="M 22 22 L 40 50 L 65 45" />
              <path d="M 15 35 L 50 50 L 78 50" />
              <path d="M 12 50 L 50 60 L 85 58" />
            </g>

            {/* City/County Labels */}
            {cities.map((city) => (
              <text
                key={city.name}
                x={city.x}
                y={city.y}
                textAnchor="middle"
                className="text-[2.5px] font-medium pointer-events-none"
                fill="#1a3a2f"
                opacity="0.7"
              >
                {city.name}
              </text>
            ))}

            {/* Province Label */}
            <text
              x="50"
              y="10"
              textAnchor="middle"
              className="text-[4px] font-bold"
              fill="#2F5D50"
            >
              경상북도
            </text>
          </svg>

          {/* Candidate Markers */}
          {candidates.map((candidate) => (
            <button
              key={candidate.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all focus:outline-none group"
              style={{
                left: `${candidate.x}%`,
                top: `${candidate.y}%`,
                zIndex: selectedCandidate === candidate.id ? 50 : 10,
              }}
              onClick={() => handleCandidateClick(candidate)}
            >
              {/* Glow Effect for Selected */}
              {selectedCandidate === candidate.id && (
                <div
                  className="absolute inset-0 rounded-lg animate-pulse"
                  style={{
                    backgroundColor: getGradeColor(candidate.grade),
                    width: "48px",
                    height: "48px",
                    opacity: 0.3,
                    filter: "blur(10px)",
                    transform: "translate(-12px, -12px)",
                  }}
                ></div>
              )}

              {/* Marker Badge */}
              <div
                className={`relative flex items-center justify-center w-10 h-10 rounded-lg border-2 border-white shadow-xl font-bold text-white transition-transform ${
                  selectedCandidate === candidate.id ? "scale-125" : "hover:scale-110"
                }`}
                style={{
                  backgroundColor: getGradeColor(candidate.grade),
                }}
              >
                #{candidate.rank}
              </div>

              {/* Tooltip on Hover */}
              {selectedCandidate === candidate.id && (
                <div className="absolute left-1/2 -translate-x-1/2 -top-20 bg-white rounded-lg shadow-2xl px-4 py-2 whitespace-nowrap z-50 border-2 border-[#2F5D50]">
                  <div className="text-xs font-bold text-gray-900">{candidate.name}</div>
                  <div className="text-xs text-gray-600">{candidate.location}</div>
                  <div className="text-xs mt-1">
                    <span className="font-semibold" style={{ color: getGradeColor(candidate.grade) }}>
                      복원 우선순위 {candidate.grade}등급
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    AI 점수: {candidate.score}점
                  </div>
                  {/* Arrow */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-white border-r-2 border-b-2 border-[#2F5D50] transform rotate-45"
                  ></div>
                </div>
              )}
            </button>
          ))}

          {/* Professional GIS Legend */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-lg border-2 border-[#2F5D50]/30">
            <div className="text-xs font-bold text-gray-900 mb-2 border-b border-gray-200 pb-1">복원 우선등급</div>
            <div className="space-y-1">
              {[
                { grade: "1등급", color: "#D32F2F" },
                { grade: "2등급", color: "#F57C00" },
                { grade: "3등급", color: "#FBC02D" },
                { grade: "4등급", color: "#7CB342" },
                { grade: "5등급", color: "#388E3C" },
              ].map((item) => (
                <div key={item.grade} className="flex items-center space-x-2">
                  <div
                    className="w-4 h-3 border border-gray-300"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-xs text-gray-700 font-medium">■ {item.grade}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics Overlay */}
          <div className="absolute top-4 right-4 bg-white rounded-lg p-3 shadow-lg border border-[#E5E7EB]">
            <div className="text-xs font-bold text-gray-900 mb-2 border-b border-gray-200 pb-1">분석 현황</div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between space-x-3">
                <span className="text-gray-600">총 후보지</span>
                <span className="font-bold text-gray-900">8</span>
              </div>
              <div className="flex items-center justify-between space-x-3">
                <span className="text-gray-600">1등급</span>
                <span className="font-bold text-[#D32F2F]">2</span>
              </div>
              <div className="flex items-center justify-between space-x-3">
                <span className="text-gray-600">2등급</span>
                <span className="font-bold text-[#F57C00]">3</span>
              </div>
              <div className="flex items-center justify-between space-x-3">
                <span className="text-gray-600">3등급</span>
                <span className="font-bold text-[#FBC02D]">3</span>
              </div>
            </div>
          </div>

          {/* Scale Bar */}
          <div className="absolute bottom-4 right-4 bg-white rounded px-2 py-1 shadow border border-gray-300">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-0.5 bg-gray-900"></div>
              <span className="text-[10px] font-semibold text-gray-900">20km</span>
            </div>
          </div>
        </div>

        {/* Map Controls */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-[#2F5D50] rounded-sm"></div>
            <span>마커 선택: 상세 분석 보기</span>
          </div>
          <div className="text-gray-500">
            좌표계: GRS80 / 경북 지역
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
