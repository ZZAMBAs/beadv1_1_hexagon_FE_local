import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/api";

const MemberRatingPage = () => {
  const { memberCode } = useParams();
  const [rating, setRating] = useState({
    satisfiedCount: 0,
    unsatisfiedCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchRating = useCallback(async () => {
    setLoading(true);
    try {
      // GET /api/ratings/{memberCode}
      const response = await api.get(`/ratings/${memberCode}`);
      setRating(response.data.data);
    } catch (error) {
      console.error(`${memberCode}의 평가 조회 실패:`, error);
    } finally {
      setLoading(false);
    }
  }, [memberCode]);

  useEffect(() => {
    fetchRating();
  }, [fetchRating]);

  const handleUpdateRating = async (isSatisfied) => {
    try {
      // POST /api/ratings/{memberCode}
      await api.post(`/ratings/${memberCode}`, { isSatisfied });
      alert(`평가 완료: ${isSatisfied ? "만족" : "불만족"}`);
      fetchRating(); // 업데이트된 결과 새로고침
    } catch (error) {
      console.error("평가 업데이트 실패:", error);
      alert("평가에 실패했습니다: " + error.response?.data.message);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-600">회원 평가 로딩 중...</div>
    );

  const totalCount = rating.satisfiedCount + rating.unsatisfiedCount;
  const satisfiedRatio =
    totalCount > 0 ? (rating.satisfiedCount / totalCount) * 100 : 0;

  return (
    <div className="max-w-lg mx-auto p-8 bg-white shadow-2xl rounded-xl text-center">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">
        ⭐ 회원 평가: {memberCode}
      </h2>

      <div className="rating-summary mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-lg font-semibold text-gray-700">
          총 평가:{" "}
          <span className="text-blue-600 font-extrabold">{totalCount} 건</span>
        </p>
        <div className="flex justify-around mt-4">
          <p className="text-2xl font-bold text-green-600">
            만족:{" "}
            <span className="font-extrabold">{rating.satisfiedCount}</span>
          </p>
          <p className="text-2xl font-bold text-red-600">
            불만족:{" "}
            <span className="font-extrabold">{rating.unsatisfiedCount}</span>
          </p>
        </div>
        <div className="mt-4 h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${satisfiedRatio}%` }}
            title={`만족도: ${satisfiedRatio.toFixed(1)}%`}
          ></div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          만족도: {satisfiedRatio.toFixed(1)}%
        </p>
      </div>

      <div className="rating-actions">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          이 회원에 대해 평가하기:
        </h3>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => handleUpdateRating(true)}
            className="flex items-center px-6 py-3 text-lg font-bold text-white bg-green-500 rounded-xl hover:bg-green-600 transition duration-150 shadow-md"
          >
            👍 만족 (+1)
          </button>
          <button
            onClick={() => handleUpdateRating(false)}
            className="flex items-center px-6 py-3 text-lg font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition duration-150 shadow-md"
          >
            👎 불만족 (+1)
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberRatingPage;
