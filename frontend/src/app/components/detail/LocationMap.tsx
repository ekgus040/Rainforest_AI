import { useState } from "react";
import { Home, MapPin, Waves } from "lucide-react";

export default function LocationMap() {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const residences = [
    { id: 1, x: 35, y: 70, count: 4 },
    { id: 2, x: 40, y: 65, count: 3 },
    { id: 3, x: 32, y: 75, count: 5 },
  ];

  const roads = [
    { id: 1, path: "M 10 80 Q 30 70, 50 60 T 90 50", type: "주요 도로" },
    { id: 2, path: "M 20 90 L 40 75 L 60 70", type: "지방도" },
  ];

  const rivers = [
    { id: 1, path: "M 5 85 Q 25 75, 45 80 T 85 90", width: 8 },
  ];

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <div className="relative bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] rounded-lg border-2 border-[#E5E7EB] aspect-[16/10] overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Terrain Background */}
          <defs>
            <pattern id="terrain" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.5" fill="#2F5D50" opacity="0.1" />
              <circle cx="7" cy="7" r="0.5" fill="#2F5D50" opacity="0.1" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#terrain)" />

          {/* Fire Damage Area (Center) */}
          <ellipse
            cx="50"
            cy="45"
            rx="25"
            ry="20"
            fill="#D32F2F"
            opacity="0.2"
            stroke="#D32F2F"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
          <text x="50" y="45" textAnchor="middle" className="text-xs font-semibold" fill="#D32F2F">
            피해 지역
          </text>

          {/* Rivers */}
          {rivers.map((river) => (
            <g key={river.id}>
              <path
                d={river.path}
                fill="none"
                stroke="#3B82F6"
                strokeWidth={river.width}
                opacity="0.6"
                strokeLinecap="round"
              />
              <path
                d={river.path}
                fill="none"
                stroke="#60A5FA"
                strokeWidth={river.width - 2}
                opacity="0.8"
                strokeLinecap="round"
              />
            </g>
          ))}

          {/* Roads */}
          {roads.map((road) => (
            <g key={road.id}>
              <path
                d={road.path}
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d={road.path}
                fill="none"
                stroke="#F3F4F6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="4,4"
              />
            </g>
          ))}

          {/* Residences */}
          {residences.map((residence) => (
            <g
              key={residence.id}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setSelectedFeature(`residence-${residence.id}`)}
            >
              <circle
                cx={residence.x}
                cy={residence.y}
                r="4"
                fill="#FBC02D"
                stroke="white"
                strokeWidth="0.5"
              />
              <circle
                cx={residence.x}
                cy={residence.y}
                r="6"
                fill="none"
                stroke="#FBC02D"
                strokeWidth="0.3"
                opacity="0.5"
              />
              <text
                x={residence.x}
                y={residence.y - 6}
                textAnchor="middle"
                className="text-xs font-semibold"
                fill="#F59E0B"
              >
                {residence.count}가구
              </text>
            </g>
          ))}

          {/* Distance Lines */}
          <line
            x1="50"
            y1="45"
            x2="35"
            y2="70"
            stroke="#FBC02D"
            strokeWidth="0.5"
            strokeDasharray="2,2"
            opacity="0.7"
          />
          <text x="42" y="57" className="text-xs" fill="#F59E0B">
            480m
          </text>
        </svg>

        {/* Legend */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur rounded-lg p-3 shadow-lg border border-[#E5E7EB]">
          <div className="text-xs font-semibold text-gray-900 mb-2">범례</div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-[#D32F2F] opacity-20 border border-[#D32F2F]"></div>
              <span className="text-xs text-gray-700">산불 피해 지역</span>
            </div>
            <div className="flex items-center space-x-2">
              <Home className="h-4 w-4 text-[#FBC02D]" />
              <span className="text-xs text-gray-700">민가</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-1 bg-gray-400 rounded"></div>
              <span className="text-xs text-gray-700">도로</span>
            </div>
            <div className="flex items-center space-x-2">
              <Waves className="h-4 w-4 text-[#3B82F6]" />
              <span className="text-xs text-gray-700">하천</span>
            </div>
          </div>
        </div>

        {/* Scale Bar */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-lg px-3 py-2 shadow-lg border border-[#E5E7EB]">
          <div className="flex items-center space-x-2">
            <div className="w-16 h-1 bg-gray-900"></div>
            <span className="text-xs font-semibold text-gray-900">500m</span>
          </div>
        </div>

        {/* Compass */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur rounded-full p-3 shadow-lg border border-[#E5E7EB]">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <MapPin className="h-6 w-6 text-[#2F5D50]" />
            </div>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-xs font-bold text-[#D32F2F]">
              N
            </div>
          </div>
        </div>
      </div>

      {/* Location Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#FBC02D]/10 rounded-lg p-4 border border-[#FBC02D]/30">
          <div className="flex items-center space-x-2 mb-2">
            <Home className="h-5 w-5 text-[#F59E0B]" />
            <div className="text-sm font-semibold text-gray-900">민가 위치</div>
          </div>
          <div className="text-xs text-gray-700 space-y-1">
            <p>• 총 12가구 인접</p>
            <p>• 최단 거리: 480m</p>
            <p>• 하류 방향 위치</p>
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-4 border border-gray-300">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-5 h-2 bg-gray-400 rounded"></div>
            <div className="text-sm font-semibold text-gray-900">도로 위치</div>
          </div>
          <div className="text-xs text-gray-700 space-y-1">
            <p>• 국도 32호선: 800m</p>
            <p>• 지방도 912호: 1.2km</p>
            <p>• 진입로 연결 가능</p>
          </div>
        </div>

        <div className="bg-[#3B82F6]/10 rounded-lg p-4 border border-[#3B82F6]/30">
          <div className="flex items-center space-x-2 mb-2">
            <Waves className="h-5 w-5 text-[#3B82F6]" />
            <div className="text-sm font-semibold text-gray-900">하천 위치</div>
          </div>
          <div className="text-xs text-gray-700 space-y-1">
            <p>• 의성천: 1.5km</p>
            <p>• 소하천: 600m</p>
            <p>• 토사유출 경로 확인</p>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-[#D32F2F]/5 rounded-lg p-4 border border-[#D32F2F]/20">
        <div className="text-sm font-semibold text-gray-900 mb-2">위치 기반 위험 평가</div>
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            • <span className="font-semibold text-[#D32F2F]">민가 노출도 높음:</span> 피해 지역 하류 500m 이내 12가구 거주
          </p>
          <p>
            • <span className="font-semibold text-[#F57C00]">토사유출 위험:</span> 하천 방향 경사지로 집중호우 시 위험
          </p>
          <p>
            • <span className="font-semibold text-[#FBC02D]">접근성 양호:</span> 주요 도로 연결로 복원 장비 투입 용이
          </p>
        </div>
      </div>
    </div>
  );
}
