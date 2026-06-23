interface RiskMetric {
  label: string;
  value: number;
  color: string;
}

interface RiskRadarChartProps {
  metrics: RiskMetric[];
}

export default function RiskRadarChart({ metrics }: RiskRadarChartProps) {
  const maxValue = 100;
  const centerX = 200;
  const centerY = 200;
  const maxRadius = 150;
  const levels = 5;

  const angleStep = (2 * Math.PI) / metrics.length;

  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const radius = (value / maxValue) * maxRadius;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { x, y };
  };

  const getLabelPoint = (index: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const radius = maxRadius + 40;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { x, y };
  };

  const dataPoints = metrics.map((metric, index) => getPoint(index, metric.value));
  const pathData =
    "M " +
    dataPoints.map((point) => `${point.x},${point.y}`).join(" L ") +
    " Z";

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 400 400"
        className="w-full max-w-md"
        style={{ maxHeight: "400px" }}
      >
        {/* Background Grid Circles */}
        {Array.from({ length: levels }).map((_, i) => {
          const radius = ((i + 1) / levels) * maxRadius;
          return (
            <circle
              key={i}
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          );
        })}

        {/* Axis Lines */}
        {metrics.map((_, index) => {
          const point = getPoint(index, maxValue);
          return (
            <line
              key={index}
              x1={centerX}
              y1={centerY}
              x2={point.x}
              y2={point.y}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          );
        })}

        {/* Data Polygon */}
        <path
          d={pathData}
          fill="#2F5D50"
          fillOpacity="0.2"
          stroke="#2F5D50"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Data Points */}
        {dataPoints.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="6"
              fill={metrics[index].color}
              stroke="white"
              strokeWidth="2"
            />
          </g>
        ))}

        {/* Labels */}
        {metrics.map((metric, index) => {
          const labelPoint = getLabelPoint(index);
          const angle = angleStep * index - Math.PI / 2;
          const isLeft = Math.cos(angle) < 0;
          const isTop = Math.sin(angle) < 0;

          return (
            <g key={index}>
              <text
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor={isLeft ? "end" : "start"}
                dominantBaseline={isTop ? "auto" : "hanging"}
                className="text-sm font-medium"
                fill="#374151"
              >
                {metric.label}
              </text>
              <text
                x={labelPoint.x}
                y={labelPoint.y + (isTop ? -16 : 16)}
                textAnchor={isLeft ? "end" : "start"}
                dominantBaseline={isTop ? "auto" : "hanging"}
                className="text-xs font-bold"
                fill={metric.color}
              >
                {metric.value}점
              </text>
            </g>
          );
        })}

        {/* Center Point */}
        <circle cx={centerX} cy={centerY} r="4" fill="#2F5D50" />

        {/* Level Labels */}
        {[20, 40, 60, 80, 100].map((level, i) => (
          <text
            key={i}
            x={centerX + 5}
            y={centerY - ((level / 100) * maxRadius)}
            className="text-xs"
            fill="#9CA3AF"
          >
            {level}
          </text>
        ))}
      </svg>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-md">
        {metrics.map((metric, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: metric.color }}
            ></div>
            <span className="text-xs text-gray-700">{metric.label}</span>
            <span className="text-xs font-semibold ml-auto" style={{ color: metric.color }}>
              {metric.value}
            </span>
          </div>
        ))}
      </div>

      {/* Risk Level Indicator */}
      <div className="mt-4 w-full max-w-md">
        <div className="bg-gradient-to-r from-[#388E3C] via-[#FBC02D] to-[#D32F2F] h-3 rounded-full relative">
          <div
            className="absolute top-1/2 -translate-y-1/2 w-1 h-6 bg-white shadow-lg border-2 border-gray-900"
            style={{
              left: `${
                (metrics.reduce((acc, m) => acc + m.value, 0) / metrics.length / 100) * 100
              }%`,
            }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>낮음</span>
          <span>보통</span>
          <span>높음</span>
        </div>
      </div>
    </div>
  );
}
