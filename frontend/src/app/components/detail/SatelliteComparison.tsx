import { useState } from "react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

export default function SatelliteComparison() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  return (
    <div className="space-y-4">
      {/* Comparison Viewer */}
      <div
        className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border-2 border-[#E5E7EB] cursor-col-resize select-none"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        {/* After Image (Background) */}
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1603048588665-791ca8aea617?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920"
            alt="산불 후"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 bg-[#D32F2F] text-white px-4 py-2 rounded-lg font-semibold shadow-lg">
            산불 후 (2025.04)
          </div>
        </div>

        {/* Before Image (Clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1511497584788-876760111969?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920"
            alt="산불 전"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 bg-[#2F5D50] text-white px-4 py-2 rounded-lg font-semibold shadow-lg">
            산불 전 (2024.11)
          </div>
        </div>

        {/* Slider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-col-resize z-10"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          {/* Slider Knob */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl border-4 border-[#2F5D50] flex items-center justify-center cursor-grab active:cursor-grabbing">
            <div className="flex space-x-0.5">
              <div className="w-0.5 h-6 bg-[#2F5D50] rounded"></div>
              <div className="w-0.5 h-6 bg-[#2F5D50] rounded"></div>
            </div>
          </div>
        </div>

        {/* Instructions Overlay */}
        {sliderPosition === 50 && !isDragging && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm animate-pulse">
            슬라이더를 드래그하여 비교
          </div>
        )}
      </div>

      {/* Analysis Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#F8FAF8] rounded-lg p-4 border border-[#E5E7EB]">
          <div className="text-xs text-gray-600 mb-1">피해 면적</div>
          <div className="text-2xl font-bold text-[#D32F2F] mb-1">127 ha</div>
          <div className="text-xs text-gray-500">전체 대상 지역의 78%</div>
        </div>
        <div className="bg-[#F8FAF8] rounded-lg p-4 border border-[#E5E7EB]">
          <div className="text-xs text-gray-600 mb-1">식생 훼손도</div>
          <div className="text-2xl font-bold text-[#F57C00] mb-1">94점</div>
          <div className="text-xs text-gray-500">매우 심각 (90점 이상)</div>
        </div>
        <div className="bg-[#F8FAF8] rounded-lg p-4 border border-[#E5E7EB]">
          <div className="text-xs text-gray-600 mb-1">분석 정확도</div>
          <div className="text-2xl font-bold text-[#2F5D50] mb-1">98.2%</div>
          <div className="text-xs text-gray-500">AI 위성영상 분석</div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="bg-[#2F5D50]/5 rounded-lg p-4 border border-[#2F5D50]/20">
        <div className="text-sm font-semibold text-gray-900 mb-2">분석 방법</div>
        <div className="text-sm text-gray-700 space-y-1">
          <p>• Sentinel-2 위성 영상 (해상도 10m)</p>
          <p>• NDVI(정규식생지수) 변화율 분석</p>
          <p>• 딥러닝 기반 식생 피해도 자동 측정</p>
          <p>• 산불 발생 전후 6개월 데이터 비교</p>
        </div>
      </div>
    </div>
  );
}
