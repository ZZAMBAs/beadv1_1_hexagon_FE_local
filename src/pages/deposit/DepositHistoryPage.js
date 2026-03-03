import React, { useEffect, useState } from "react";
import api from "../../api/api";
import { getStoredAccessToken } from "../../auth/tokenStorage";

const formatDateTime = (isoString) => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    // 로컬 날짜/시간, 초까지 표시
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch (e) {
    return isoString;
  }
};

const formatAmount = (num) => {
  if (typeof num !== "number") return "0";
  return num.toLocaleString();
};

const DepositHistoryPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [cursor, setCursor] = useState({ code: null, date: null });

  const getToken = () => {
    let token = getStoredAccessToken();
    if (!token) return null;
    if (token.startsWith("Bearer ")) token = token.replace("Bearer ", "");
    return token;
  };

  const fetchHistories = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) throw new Error("로그인이 필요합니다.");

      const res = await api.get("/deposits/histories", {
        params: {
          "cursor-date": cursor.date || undefined,
          "cursor-code": cursor.code || undefined,
        },
      });

      const data = res?.data?.data || {};
      const infos = Array.isArray(data.infos) ? data.infos : [];

      setItems((prev) => [...prev, ...infos]);
      setHasNext(Boolean(data.hasNext));
      // 다음 요청을 위해 마지막 커서 저장
      setCursor({ code: data.cursorCode || null, date: data.cursorDate || null });
    } catch (e) {
      console.error("예치금 내역 조회 실패:", e);
      const msg = e.response?.data?.message || e.message || "조회 중 오류가 발생했습니다.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadMore = () => {
    if (!loading && hasNext) {
      fetchHistories();
    }
  };

  const renderItem = (it, idx) => {
    const isPlus = typeof it.changeAmount === "number" && it.changeAmount > 0;
    const changeCls = isPlus ? "text-green-700" : "text-red-700";
    const sign = isPlus ? "+" : "";
    return (
      <div key={`${it.cursorCode || it.code || idx}-${it.createdAt}`} className="p-4 border border-blue-100 rounded-lg bg-blue-50 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">{formatDateTime(it.createdAt)}</div>
            <div className="mt-1 text-gray-800">{it.summary}</div>
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold ${changeCls}`}>
              {sign}{formatAmount(it.changeAmount)}원
            </div>
            <div className="text-xs text-gray-500">변경 후 잔액: {formatAmount(it.resultAmount)}원</div>
          </div>
        </div>
      </div>
    );
  };

  if (loading && items.length === 0) {
    return <div className="p-8 text-center text-gray-600">예치금 내역을 불러오는 중...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">예치금 내역</h2>

      {error && (
        <div className="p-4 mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700">{error}</div>
      )}

      {items.length === 0 && !error && (
        <div className="text-center text-gray-500 py-10">표시할 내역이 없습니다.</div>
      )}

      <div className="space-y-3">
        {items.map((it, idx) => renderItem(it, idx))}
      </div>

      <div className="mt-8 text-center">
        {hasNext && (
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className={`px-6 py-3 font-semibold rounded-lg transition duration-200 ${
              loading ? "bg-gray-300 text-gray-600 cursor-wait" : "bg-indigo-500 text-white hover:bg-indigo-600"
            }`}
          >
            {loading ? "더 불러오는 중..." : "더 보기"}
          </button>
        )}
        {!hasNext && items.length > 0 && (
          <p className="text-gray-500">모든 내역을 불러왔습니다.</p>
        )}
      </div>
    </div>
  );
};

export default DepositHistoryPage;
