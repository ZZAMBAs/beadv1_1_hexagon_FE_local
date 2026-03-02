import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { decode } from "jwt-js-decode";
import instance from "../api/api";

// JWT Access Token의 Claim Key 상수화 (백엔드 JwtProperties와 일치해야 함)
const CLAIMS = {
  // 백엔드 @Value("${jwt.claims.member-code}") 값과 일치해야 함
  MEMBER_CODE: "member-code",
  // 백엔드 @Value("${jwt.claims.is-sign}") 값과 일치해야 함
  IS_SIGNED_UP: "is-signed-up",
  ROLE: "role",
};

// 외부 참조용 변수
let externalAuth = null;
export const getAuthService = () => externalAuth;

const initialAuthState = {
  isLoggedIn: false,
  memberCode: null,
  isSignedUp: false,
  role: null,
};

const AuthContext = createContext(initialAuthState);

// Auth Provider
export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(initialAuthState);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 토큰 디코딩 및 상태 설정 함수
  const decodeAndSetState = useCallback((token) => {
    try {
      const decodedToken = decode(token);
      const memberCode = decodedToken.payload[CLAIMS.MEMBER_CODE];
      const isSignedUp = decodedToken.payload[CLAIMS.IS_SIGNED_UP];
      const role = decodedToken.payload[CLAIMS.ROLE] || null;

      console.log("🛠️ 디코딩된 페이로드:", decodedToken.payload);
      console.log(
        "🛠️ 키 확인 (MemberCode):",
        decodedToken.payload[CLAIMS.MEMBER_CODE]
      );
      console.log(
        "🛠️ 키 확인 (is-sign):",
        decodedToken.payload[CLAIMS.IS_SIGNED_UP]
      );

      if (memberCode) {
        setAuthState({
          isLoggedIn: true,
          memberCode: memberCode,
          isSignedUp: isSignedUp === true || String(isSignedUp) === "true",
          role,
        });
        return true;
      }
    } catch (e) {
      console.error("Token decode failed:", e);
    }
    return false;
  }, []);

  // 로그아웃 처리 함수 (외부/내부 모두 사용 가능)
  const logout = useCallback(async (callBackend = true) => {
    localStorage.removeItem("accessToken");
    setAuthState(initialAuthState);

    if (callBackend) {
      try {
        // 백엔드 로그아웃 API 호출 (Refresh Token 무효화)
        // axios 인스턴스 import 후 사용 (Refresh Token은 쿠키로 자동 전송)
        await instance.delete("/auth/logout");
      } catch (e) {
        console.warn("Backend logout failed:", e);
      }
    }
    navigate("/login", { replace: true });
  }, [navigate]);

  // 로그인 처리 (Access Token 저장 및 상태 업데이트)
  const login = useCallback((accessToken) => {
    if (decodeAndSetState(accessToken)) {
      localStorage.setItem("accessToken", accessToken);
    } else {
      logout(false);
    }
  }, [decodeAndSetState, logout]);

  // 토큰만 업데이트 (인터셉터에서 사용)
  const updateToken = useCallback((accessToken) => {
    decodeAndSetState(accessToken);
    localStorage.setItem("accessToken", accessToken);
  }, [decodeAndSetState]);

  // 외부 참조 변수 초기화 (Hook 규칙을 준수하며 외부에 함수 제공)
  useEffect(() => {
    externalAuth = { logout, updateToken };
  }, [logout, updateToken]);

  // 컴포넌트 마운트 시 초기 토큰 상태 확인
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      decodeAndSetState(token);
    }
    setLoading(false);
  }, [decodeAndSetState]);

  return (
    <AuthContext.Provider
      value={{ authState, login, logout, updateToken, loading }}
    >
      {/* 로딩 중에는 children을 렌더링하지 않아 UX flickering 방지 */}
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook
export const useAuth = () => useContext(AuthContext);
