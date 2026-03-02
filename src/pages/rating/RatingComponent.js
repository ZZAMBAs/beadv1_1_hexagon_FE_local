import React, { useEffect, useState, useCallback } from "react";
import api from "../../api/api";

// memberCode: 평가를 받을 상대방의 코드
// contractCode: 해당 평가의 근거가 되는 계약 코드 (부모 컴포넌트에서 넘겨받아야 함)
const RatingComponent = ({ memberCode, contractCode }) => {
  const [rating, setRating] = useState({
    satisfiedCount: 0,
    unsatisfiedCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchRating = useCallback(async () => {
    if (!memberCode) return;
    try {
      const res = await api.get(`/ratings/${memberCode}`);
      setRating(res.data.data);
    } catch (e) {
      console.error("평가 데이터 로드 실패");
    } finally {
      setLoading(false);
    }
  }, [memberCode]);

  useEffect(() => {
    fetchRating();
  }, [fetchRating]);

  const handleRate = async (isSatisfied) => {
    if (!contractCode) {
      alert("평가를 진행할 계약 정보가 없습니다.");
      return;
    }

    try {
      // 백엔드 RatingRequest 구조: { contractCode, satisfied }
      const res = await api.patch(`/ratings/${memberCode}`, {
        contractCode: contractCode,
        satisfied: isSatisfied,
      });

      setRating(res.data.data);
      alert(
        isSatisfied
          ? "만족 평가가 반영되었습니다! 👍"
          : "불만족 평가가 반영되었습니다. 👎"
      );
    } catch (e) {
      const errorMsg =
        e.response?.data?.message ||
        "본인은 평가할 수 없거나 이미 완료된 평가입니다.";
      alert(errorMsg);
    }
  };

  if (loading)
    return (
      <div className="text-gray-400 text-xs text-center">불러오는 중...</div>
    );

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
      <div className="flex flex-col">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
          회원 신뢰도
        </span>
        <div className="flex gap-4">
          {/* 만족 버튼 */}
          <button
            onClick={() => handleRate(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors group"
          >
            <span className="text-xl group-hover:scale-120 transition-transform">
              👍
            </span>
            <span className="text-lg font-extrabold text-blue-600">
              {rating.satisfiedCount}
            </span>
          </button>

          {/* 구분선 */}
          <div className="w-px h-8 bg-gray-200 my-auto"></div>

          {/* 불만족 버튼 */}
          <button
            onClick={() => handleRate(false)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors group"
          >
            <span className="text-xl group-hover:scale-120 transition-transform">
              👎
            </span>
            <span className="text-lg font-extrabold text-red-500">
              {rating.unsatisfiedCount}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingComponent;
