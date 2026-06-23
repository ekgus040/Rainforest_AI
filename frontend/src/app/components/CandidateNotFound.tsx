import { useNavigate } from "react-router";
import { ArrowLeft, TreePine } from "lucide-react";

export default function CandidateNotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F4F6F4] flex flex-col items-center justify-center px-6">
      <div className="w-12 h-12 bg-[#2F5D50] rounded-lg flex items-center justify-center mb-6">
        <TreePine className="w-6 h-6 text-white" />
      </div>
      <h1 className="text-xl font-semibold text-gray-900 mb-2">후보지를 찾을 수 없습니다.</h1>
      <p className="text-[13px] text-gray-500 mb-6 text-center max-w-sm">
        요청하신 후보지 ID에 해당하는 분석 데이터가 없습니다.
      </p>
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 bg-[#2F5D50] hover:bg-[#254a3f] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        대시보드로 돌아가기
      </button>
    </div>
  );
}
