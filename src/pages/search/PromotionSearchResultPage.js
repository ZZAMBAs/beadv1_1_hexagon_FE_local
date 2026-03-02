import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/api";

const PromotionSearchResultPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // ✅ URL에서 현재 필터값 읽기 (화면 초기값으로 사용)
    const query = searchParams.get("query") || "";
    const scope = searchParams.get("scope") || "ALL";
    const paymentType = searchParams.get("payment-type") || "";
    const maxPay = searchParams.get("max-pay") || "";

    const pageFromUrl = Number(searchParams.get("page") ?? 0);
    const sizeFromUrl = Number(searchParams.get("size") ?? 10);

    const safePage = Number.isFinite(pageFromUrl) && pageFromUrl >= 0 ? pageFromUrl : 0;
    const safeSize = Number.isFinite(sizeFromUrl) && sizeFromUrl >= 1 ? sizeFromUrl : 10;

    // ✅ 화면 상태
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // ✅ 현재 페이지는 URL을 따라가게 만들기
    const [currentPage, setCurrentPage] = useState(safePage);

    // ✅ 입력폼 state (사용자가 입력/선택하는 값)
    const [inputQuery, setInputQuery] = useState(query);
    const [inputScope, setInputScope] = useState(scope);
    const [inputPaymentType, setInputPaymentType] = useState(paymentType);
    const [inputMaxPay, setInputMaxPay] = useState(maxPay);

    // ===== ✅ 추천 검색어 state =====
    const [suggestions, setSuggestions] = useState([]); // string[]
    const [suggestLoading, setSuggestLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const suggestTimerRef = useRef(null);
    const skipNextSuggestRef = useRef(false);

    // ✅ URL이 바뀌면 입력폼도 동기화 (뒤로가기/링크 공유 대응)
    useEffect(() => setInputQuery(query), [query]);
    useEffect(() => setInputScope(scope), [scope]);
    useEffect(() => setInputPaymentType(paymentType), [paymentType]);
    useEffect(() => setInputMaxPay(maxPay), [maxPay]);

    // ✅ URL page가 바뀌면 currentPage도 맞춰줌
    useEffect(() => {
        setCurrentPage(safePage);
    }, [safePage]);

    // ✅ content 자르기 유틸
    const truncateText = (text, maxLen = 30) => {
        if (!text) return "";
        return text.length > maxLen ? text.slice(0, maxLen) + "..." : text;
    };

    // ✅ URL 업데이트 유틸
    const updateUrlParams = (next) => {
        const params = new URLSearchParams(searchParams);

        Object.entries(next).forEach(([k, v]) => {
            const value = (v ?? "").toString().trim();
            if (value === "") params.delete(k);
            else params.set(k, value);
        });

        // ✅ size가 URL에 없으면 기본값 유지
        if (!params.get("size")) params.set("size", String(safeSize));

        setSearchParams(params);
    };

    // ✅ 검색 버튼 (page는 0으로 리셋)
    const onSearch = () => {
        setShowSuggestions(false);

        updateUrlParams({
            query: inputQuery,
            scope: inputScope,
            "payment-type": inputPaymentType,
            "max-pay": inputMaxPay,
            page: "0",
            size: String(safeSize),
        });
    };

    // ✅ Enter로 검색
    const onKeyDown = (e) => {
        if (e.key === "Enter") onSearch();
    };

    // ✅ 페이지 이동: URL의 page만 변경
    const movePage = (nextPage) => {
        if (nextPage < 0) return;
        updateUrlParams({ page: String(nextPage) });
    };

    // ✅ 의존성 안정화

    // ✅ API 호출 (검색 결과)
    useEffect(() => {
        const controller = new AbortController();

        const fetchSearchResults = async () => {
            setLoading(true);
            try {
                const response = await api.get("/search/self-promotions", {
                    signal: controller.signal,
                    params: {
                        query,
                        scope,
                        "payment-type": paymentType,
                        "max-pay": maxPay,
                        page: currentPage,
                        size: safeSize,
                    },
                });

                setResults(response.data?.data?.content ?? []);
            } catch (error) {
                if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") return;
                console.error("프로모션 검색 실패:", error);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        fetchSearchResults();
        return () => controller.abort();
    }, [currentPage, maxPay, paymentType, query, safeSize, scope]);

    // ✅ 추천 검색어 API 호출 (inputQuery 타이핑할 때)
    useEffect(() => {
        if (skipNextSuggestRef.current) {
            skipNextSuggestRef.current = false;
            return;
        }

        const q = (inputQuery ?? "").trim();

        if (q.length === 0) {
            setSuggestions([]);
            setShowSuggestions(false);
            setSuggestLoading(false);
            return;
        }

        if (suggestTimerRef.current) clearTimeout(suggestTimerRef.current);

        const controller = new AbortController();

        suggestTimerRef.current = setTimeout(async () => {
            setSuggestLoading(true);
            try {
                const res = await api.get("/search/self-promotions/suggest", {
                    signal: controller.signal,
                    params: { query: q },
                });

                const list = res.data?.data ?? [];
                setSuggestions(Array.isArray(list) ? list : []);
                setShowSuggestions(true);
            } catch (err) {
                if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
                console.error("추천 검색어 조회 실패:", err);
                setSuggestions([]);
                setShowSuggestions(false);
            } finally {
                if (!controller.signal.aborted) setSuggestLoading(false);
            }
        }, 250);

        return () => {
            controller.abort();
            if (suggestTimerRef.current) clearTimeout(suggestTimerRef.current);
        };
    }, [inputQuery]);

    // ✅ 추천 클릭: inputQuery만 채우고, 추천창은 닫고, "바로 검색"은 안 함
    const onPickSuggestion = (text) => {
        skipNextSuggestRef.current = true;
        setInputQuery(text);
        setShowSuggestions(false);
    };

    return (
        <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-xl">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">🔎 Self Promotion 검색</h2>

            {/* ✅ 검색 입력 UI */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* query */}
                    <div className="md:col-span-2 relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">키워드</label>
                        <input
                            className="w-full border rounded px-3 py-2"
                            placeholder="예: 백엔드"
                            value={inputQuery}
                            onChange={(e) => setInputQuery(e.target.value)}
                            onKeyDown={onKeyDown}
                            onFocus={() => {
                                if ((inputQuery ?? "").trim().length > 0 && suggestions.length > 0) {
                                    setShowSuggestions(true);
                                }
                            }}
                            onBlur={() => {
                                setTimeout(() => setShowSuggestions(false), 150);
                            }}
                        />

                        {/* ✅ 추천 검색어 드롭다운 */}
                        {showSuggestions && (
                            <div className="absolute z-20 mt-1 w-full bg-white border rounded shadow-md overflow-hidden">
                                {suggestLoading && (
                                    <div className="px-3 py-2 text-sm text-gray-500">추천 검색어 불러오는 중...</div>
                                )}

                                {!suggestLoading && suggestions.length === 0 && (
                                    <div className="px-3 py-2 text-sm text-gray-500">추천 검색어가 없습니다.</div>
                                )}

                                {!suggestLoading &&
                                    suggestions.map((s, idx) => (
                                        <button
                                            key={`${s}-${idx}`}
                                            type="button"
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => onPickSuggestion(s)}
                                        >
                                            {s}
                                        </button>
                                    ))}
                            </div>
                        )}
                    </div>

                    {/* scope */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">검색 범위</label>
                        <select
                            className="w-full border rounded px-3 py-2"
                            value={inputScope}
                            onChange={(e) => setInputScope(e.target.value)}
                        >
                            <option value="ALL">제목 + 내용</option>
                            <option value="TITLE">제목</option>
                            <option value="CONTENT">내용</option>
                        </select>
                    </div>

                    {/* max-pay */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">최대 급여</label>
                        <input
                            className="w-full border rounded px-3 py-2"
                            placeholder="예: 500000"
                            value={inputMaxPay}
                            onChange={(e) => {
                                const v = e.target.value;
                                if (v === "" || /^\d+$/.test(v)) setInputMaxPay(v);
                            }}
                            onKeyDown={onKeyDown}
                        />
                    </div>

                    {/* ✅ 페이지 크기(size) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">페이지 크기</label>
                        <select
                            className="w-full border rounded px-3 py-2"
                            value={String(safeSize)}
                            onChange={(e) => updateUrlParams({ size: e.target.value, page: "0" })}
                        >
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="30">30</option>
                        </select>
                    </div>
                </div>

                {/* payment-type 라디오 */}
                <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">지급 방식 (payment-type)</p>

                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="paymentType"
                                value="MONTHLY"
                                checked={inputPaymentType === "MONTHLY"}
                                onChange={() => setInputPaymentType("MONTHLY")}
                            />
                            <span>월급</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="paymentType"
                                value="PER_JOB"
                                checked={inputPaymentType === "PER_JOB" || inputPaymentType === "PERJOB"}
                                onChange={() => setInputPaymentType("PER_JOB")}
                            />
                            <span>건당</span>
                        </label>

                        <button
                            type="button"
                            className="ml-auto text-sm px-3 py-2 rounded bg-gray-200"
                            onClick={() => setInputPaymentType("")}
                        >
                            선택 해제
                        </button>
                    </div>
                </div>

                {/* 검색 버튼 */}
                <div className="mt-4 flex gap-2">
                    <button className="px-4 py-2 rounded bg-indigo-600 text-white" onClick={onSearch}>
                        검색
                    </button>
                    <button
                        className="px-4 py-2 rounded bg-gray-200"
                        onClick={() => {
                            setInputQuery("");
                            setInputScope("ALL");
                            setInputPaymentType("");
                            setInputMaxPay("");
                            setSuggestions([]);
                            setShowSuggestions(false);

                            updateUrlParams({
                                query: "",
                                scope: "ALL",
                                "payment-type": "",
                                "max-pay": "",
                                page: "0",
                            });
                        }}
                    >
                        초기화
                    </button>
                </div>

                {/* 현재 적용값 표시(디버그용) */}
                <div className="mt-3 text-sm text-gray-500">
                    적용됨: query=<b>{query || "(없음)"}</b> / scope=<b>{scope}</b> / payment-type=
                    <b>{paymentType || "(없음)"}</b> / max-pay=<b>{maxPay || "(없음)"}</b> / page=
                    <b>{currentPage}</b> / size=<b>{safeSize}</b>
                </div>
            </div>

            {/* ✅ 로딩 표시 */}
            {loading && (
                <div className="p-3 mb-4 text-center text-gray-600 bg-gray-50 rounded">Self Promotion 검색 중...</div>
            )}

            {/* ✅ 결과 리스트 */}
            <div className="space-y-4">
                {results.length === 0 && !loading ? (
                    <p className="text-gray-500 italic text-center py-8">검색 결과가 없습니다.</p>
                ) : (
                    results.map((item) => (
                        <div
                            key={item.code}
                            role="button"
                            tabIndex={0}
                            onClick={() => navigate(`/self-promotions/${item.code}`)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    navigate(`/self-promotions/${item.code}`);
                                }
                            }}
                            className="p-5 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        >
                            <h4 className="text-xl font-semibold text-indigo-700">{item.title}</h4>

                            {item.content && <p className="mt-2 text-gray-700">{truncateText(item.content, 50)}</p>}

                            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                                {/* ✅ 닉네임 클릭 -> members/{memberCode} */}
                                <button
                                    type="button"
                                    className="font-medium text-gray-800 hover:underline"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/members/${item.memberCode}`);
                                    }}
                                    onKeyDown={(e) => {
                                        e.stopPropagation();
                                        if (e.key === "Enter" || e.key === " ") {
                                            navigate(`/members/${item.memberCode}`);
                                        }
                                    }}
                                >
                                    {item.memberNickname}
                                </button>

                                <span className="text-gray-400">|</span>

                                {item.paymentType && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                    {item.paymentType}
                  </span>
                                )}
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="font-bold text-green-600">
                  {item.payAmount?.toLocaleString?.() ?? item.payAmount}원
                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ✅ 이전/다음 */}
            <div className="flex justify-between mt-6">
                <button
                    className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50"
                    disabled={currentPage === 0}
                    onClick={() => movePage(currentPage - 1)}
                >
                    이전
                </button>

                <button className="px-4 py-2 rounded bg-gray-200" onClick={() => movePage(currentPage + 1)}>
                    다음
                </button>
            </div>
        </div>
    );
};

export default PromotionSearchResultPage;
