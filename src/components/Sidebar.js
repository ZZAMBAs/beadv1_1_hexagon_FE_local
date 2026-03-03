import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { isLoggedIn, role } = authState;

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleNavigate = (to) => () => {
    onClose?.();
    navigate(to);
  };

  const hasClientRole = role === "CLIENT" || role === "BOTH";
  const hasFreelancerRole = role === "FREELANCER" || role === "BOTH";

  return (
      <>
        {/* overlay */}
        <div
            className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${
                open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            onClick={onClose}
        />

        {/* drawer */}
        <aside
            className={`fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-xl transition-transform duration-300 ease-out ${
                open ? "translate-x-0" : "-translate-x-full"
            }`}
            aria-hidden={!open}
        >
          <div className="flex items-center justify-between px-4 h-14 border-b">
            <span className="font-semibold">메뉴</span>
            <button
                onClick={onClose}
                aria-label="닫기"
                className="p-2 rounded hover:bg-slate-100"
            >
              ✕
            </button>
          </div>

          <nav className="p-3 text-sm space-y-4">
            {/* 공통 메뉴 (역할/로그인 무관) */}
            <div>
              <p className="px-3 mb-1 text-xs font-semibold text-slate-400">
                공통 메뉴
              </p>
              <button
                  onClick={handleNavigate("/search/commissions")}
                  className="w-full text-left px-3 py-2 rounded hover:bg-slate-100"
              >
                의뢰글 검색
              </button>
              <button
                  onClick={handleNavigate("/search/promotions")}
                  className="w-full text-left px-3 py-2 rounded hover:bg-slate-100"
              >
                셀프 프로모션 검색
              </button>
            </div>

            {!isLoggedIn ? (
                <div>
                  <p className="px-3 mb-1 text-xs font-semibold text-slate-400">
                    계정
                  </p>
                  <button
                      onClick={handleNavigate("/login")}
                      className="w-full text-left px-3 py-2 rounded hover:bg-slate-100"
                  >
                    로그인
                  </button>
                </div>
            ) : (
                <>
                  {/* 로그인 공통 (역할 상관없이 사용 가능) */}
                  <div>
                    <p className="px-3 mb-1 text-xs font-semibold text-slate-400">
                      로그인 공통
                    </p>
                    <button
                        onClick={handleNavigate("/chat")}
                        className="w-full text-left px-3 py-2 rounded hover:bg-slate-100"
                    >
                      채팅
                    </button>
                    <button
                        onClick={handleNavigate("/mypage/deposits")}
                        className="w-full text-left px-3 py-2 rounded hover:bg-slate-100"
                    >
                      예치금 조회
                    </button>
                    <button
                        onClick={handleNavigate("/mypage/contracts")}
                        className="w-full text-left px-3 py-2 rounded hover:bg-slate-100"
                    >
                      계약 조회
                    </button>
                    <button
                        onClick={handleNavigate("/mypage")}
                        className="w-full text-left px-3 py-2 rounded hover:bg-slate-100"
                    >
                      마이페이지
                    </button>
                  </div>

                  {/* 클라이언트 전용 메뉴 */}
                  <div>
                    <p className="px-3 mb-1 text-xs font-semibold text-slate-400">
                      클라이언트 메뉴
                    </p>
                    {hasClientRole ? (
                        <>
                          <button
                              onClick={handleNavigate("/mypage/commissions/own")}
                              className="w-full text-left px-3 py-2 rounded hover:bg-slate-100"
                          >
                            내 의뢰글
                          </button>
                          <button
                              onClick={handleNavigate("/cart")}
                              className="w-full text-left px-3 py-2 rounded hover:bg-slate-100"
                          >
                            장바구니
                          </button>
                        </>
                    ) : (
                        <p className="px-3 py-1 text-xs text-slate-400">
                          클라이언트 역할 등록 후 사용 가능합니다.
                        </p>
                    )}
                  </div>

                  {/* 프리랜서 전용 메뉴 */}
                  <div>
                    <p className="px-3 mb-1 text-xs font-semibold text-slate-400">
                      프리랜서 메뉴
                    </p>
                    {hasFreelancerRole ? (
                        <button
                            onClick={handleNavigate("/mypage/promotion")}
                            className="w-full text-left px-3 py-2 rounded hover:bg-slate-100"
                        >
                          내 셀프 프로모션
                        </button>
                    ) : (
                        <p className="px-3 py-1 text-xs text-slate-400">
                          프리랜서 역할 등록 후 사용 가능합니다.
                        </p>
                    )}
                  </div>
                </>
            )}
          </nav>
        </aside>
      </>
  );
};

export default Sidebar;
