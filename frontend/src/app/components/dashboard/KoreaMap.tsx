import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface KoreaMapProps {
  onSelectCandidate: (candidate: any) => void;
}

export default function KoreaMap({ onSelectCandidate }: KoreaMapProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  // Provinces with realistic priority distribution
  const provinces = [
    { name: "강원도", path: "M 60 15 L 75 18 L 82 25 L 85 32 L 82 38 L 75 42 L 68 40 L 62 35 L 58 28 L 57 20 Z", priority: 2, x: 70, y: 28 },
    { name: "경상북도", path: "M 68 40 L 75 42 L 82 48 L 85 55 L 83 62 L 78 68 L 70 70 L 65 65 L 62 58 L 60 50 L 62 43 Z", priority: 1, x: 72, y: 56 },
    { name: "경상남도", path: "M 60 68 L 70 70 L 78 75 L 78 82 L 72 88 L 65 90 L 58 88 L 52 83 L 50 76 L 52 70 L 56 68 Z", priority: 1, x: 64, y: 78 },
    { name: "충청북도", path: "M 48 38 L 58 38 L 62 43 L 62 50 L 58 55 L 52 58 L 45 56 L 42 50 L 43 43 Z", priority: 2, x: 52, y: 48 },
    { name: "전라남도", path: "M 35 68 L 45 70 L 52 75 L 52 83 L 48 90 L 40 95 L 32 93 L 28 88 L 25 80 L 27 72 L 32 68 Z", priority: 3, x: 40, y: 82 },
  ];

  const mockCandidates = [
    { id: 1, name: "후보지 A", x: 72, y: 56, grade: 1, location: "경상북도 의성군", rank: 1 },
    { id: 2, name: "후보지 B", x: 75, y: 30, grade: 1, location: "강원도 삼척시", rank: 2 },
    { id: 3, name: "후보지 C", x: 64, y: 78, grade: 1, location: "경상남도 거창군", rank: 3 },
    { id: 4, name: "후보지 D", x: 40, y: 85, grade: 1, location: "전라남도 구례군", rank: 4 },
    { id: 5, name: "후보지 E", x: 52, y: 48, grade: 2, location: "충청북도 제천시", rank: 5 },
    { id: 6, name: "후보지 F", x: 78, y: 52, grade: 2, location: "경상북도 봉화군", rank: 6 },
    { id: 7, name: "후보지 G", x: 80, y: 35, grade: 2, location: "강원도 양양군", rank: 7 },
    { id: 8, name: "후보지 H", x: 55, y: 82, grade: 2, location: "경상남도 산청군", rank: 8 },
    { id: 9, name: "후보지 I", x: 62, y: 72, grade: 3, location: "경상남도 함양군", rank: 9 },
    { id: 10, name: "후보지 J", x: 56, y: 52, grade: 3, location: "충청북도 단양군", rank: 10 },
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

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return "#D32F2F";
      case 2: return "#F57C00";
      case 3: return "#FBC02D";
      case 4: return "#7CB342";
      case 5: return "#388E3C";
      default: return "#E5E7EB";
    }
  };

  const handleCandidateClick = (candidate: any) => {
    setSelectedCandidate(candidate.id);
    onSelectCandidate({
      name: candidate.name,
      location: candidate.location,
      grade: `${candidate.grade}등급`,
      score: 92.4 - (candidate.rank - 1) * 1.5,
      metrics: {
        fireDamage: 87 - (candidate.rank - 1) * 2,
        disasterRisk: 72 - (candidate.rank - 1) * 1.5,
        exposure: 65 - (candidate.rank - 1) * 1,
        recoveryDifficulty: 78 - (candidate.rank - 1) * 1.2,
      },
    });
  };

  return (
    <Card className="border-[#E5E7EB] shadow-sm h-full">
      <CardHeader className="border-b border-[#E5E7EB] bg-gradient-to-r from-[#2F5D50]/5 to-transparent">
        <CardTitle className="text-lg font-semibold text-gray-900">전국 복원 우선순위 현황도</CardTitle>
        <p className="text-xs text-gray-600 mt-1">산림청 GIS 기반 의사결정 지원 시스템</p>
      </CardHeader>
      <CardContent className="p-4">
        {/* Map Container */}
        <div className="relative bg-[#f0f4f8] rounded-lg border border-[#E5E7EB] aspect-[4/5] overflow-hidden">
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 110"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Province Regions with Heatmap Colors */}
            <g>
              {provinces.map((province) => (
                <g key={province.name}>
                  <path
                    d={province.path}
                    fill={getPriorityColor(province.priority)}
                    fillOpacity="0.3"
                    stroke="#2F5D50"
                    strokeWidth="0.5"
                    className="hover:fill-opacity-50 transition-all cursor-pointer"
                    onMouseEnter={() => setHoveredRegion(province.name)}
                    onMouseLeave={() => setHoveredRegion(null)}
                  />
                  {/* Province Labels */}
                  <text
                    x={province.x}
                    y={province.y}
                    textAnchor="middle"
                    className="text-[3px] font-semibold pointer-events-none"
                    fill="#1a3a2f"
                    opacity="0.8"
                  >
                    {province.name}
                  </text>
                </g>
              ))}
            </g>

            {/* Coastline and Borders */}
            <path
              d="M 45 10 L 52 12 L 60 15 L 68 18 L 75 22 L 80 28 L 85 35 L 88 42 L 88 50 L 86 58 L 83 65 L 78 72 L 72 80 L 65 87 L 58 92 L 50 95 L 42 96 L 35 94 L 28 90 L 23 84 L 20 76 L 18 68 L 17 60 L 18 52 L 20 45 L 24 38 L 28 32 L 33 26 L 38 20 L 42 15 Z"
              fill="none"
              stroke="#2F5D50"
              strokeWidth="0.8"
              strokeLinejoin="round"
            />

            {/* Sea Label */}
            <text x="12" y="50" className="text-[2.5px]" fill="#4A90E2" opacity="0.6">동해</text>
            <text x="85" y="85" className="text-[2.5px]" fill="#4A90E2" opacity="0.6">남해</text>
          </svg>

          {/* Candidate Markers */}
          {mockCandidates.map((candidate) => (
            <button
              key={candidate.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all focus:outline-none group"
              style={{
                left: `${candidate.x}%`,
                top: `${candidate.y}%`,
                zIndex: selectedCandidate === candidate.id ? 50 : 10,
              }}
              onClick={() => handleCandidateClick(candidate)}
              onMouseEnter={() => setHoveredRegion(candidate.name)}
              onMouseLeave={() => setHoveredRegion(null)}
            >
              {/* Glow Effect for Selected */}
              {selectedCandidate === candidate.id && (
                <div
                  className="absolute inset-0 rounded-lg animate-pulse"
                  style={{
                    backgroundColor: getGradeColor(candidate.grade),
                    width: "40px",
                    height: "40px",
                    opacity: 0.3,
                    filter: "blur(8px)",
                    transform: "translate(-8px, -8px)",
                  }}
                ></div>
              )}

              {/* Marker Badge */}
              <div
                className={`relative flex items-center justify-center w-8 h-8 rounded-lg border-2 border-white shadow-lg font-bold text-white text-sm transition-transform ${
                  selectedCandidate === candidate.id ? "scale-125" : "hover:scale-110"
                }`}
                style={{
                  backgroundColor: getGradeColor(candidate.grade),
                }}
              >
                #{candidate.rank}
              </div>

              {/* Tooltip on Hover */}
              {(hoveredRegion === candidate.name || selectedCandidate === candidate.id) && (
                <div className="absolute left-1/2 -translate-x-1/2 -top-16 bg-white rounded-lg shadow-xl px-3 py-2 whitespace-nowrap z-50 border-2 border-[#2F5D50]">
                  <div className="text-xs font-bold text-gray-900">{candidate.name}</div>
                  <div className="text-xs text-gray-600">{candidate.location}</div>
                  <div
                    className="text-xs font-semibold mt-1"
                    style={{ color: getGradeColor(candidate.grade) }}
                  >
                    복원 우선순위 {candidate.grade}등급
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
            <div className="text-xs font-bold text-gray-900 mb-2 border-b border-gray-200 pb-1">복원 우선순위</div>
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
                <span className="font-bold text-gray-900">1,842</span>
              </div>
              <div className="flex items-center justify-between space-x-3">
                <span className="text-gray-600">1등급</span>
                <span className="font-bold text-[#D32F2F]">126</span>
              </div>
              <div className="flex items-center justify-between space-x-3">
                <span className="text-gray-600">2등급</span>
                <span className="font-bold text-[#F57C00]">287</span>
              </div>
              <div className="flex items-center justify-between space-x-3">
                <span className="text-gray-600">3등급</span>
                <span className="font-bold text-[#FBC02D]">512</span>
              </div>
            </div>
          </div>

          {/* Scale Bar */}
          <div className="absolute bottom-4 right-4 bg-white rounded px-2 py-1 shadow border border-gray-300">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-0.5 bg-gray-900"></div>
              <span className="text-[10px] font-semibold text-gray-900">50km</span>
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
            좌표계: GRS80 / 투영: UTM-K
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
