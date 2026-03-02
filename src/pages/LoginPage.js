import React from "react";
// 상위 폴더(src)의 styles.js에서 loginStyles 가져오기
import { loginStyles } from "../styles/styles";

const EC2_DOMAIN = process.env.REACT_APP_EC2_DOMAIN;

export default function LoginPage() {
  const handleSocialLogin = (provider) => {
    const oauthUrls = {
      // [수정 1] 주소가 서로 바뀌어 있어서 올바르게 매칭했습니다.
      kakao: `${EC2_DOMAIN}/oauth2/authorization/kakao`,
      naver: `${EC2_DOMAIN}/oauth2/authorization/naver`,
      google: `${EC2_DOMAIN}/oauth2/authorization/google`,
    };

    const targetUrl = oauthUrls[provider];

    if (targetUrl) {
      // [수정 2] 외부 URL(백엔드)로 이동할 때는 window.location.href를 사용합니다.
      window.location.href = targetUrl;
    }
  };

  return (
    <div style={loginStyles.container}>
      <main style={loginStyles.mainContent}>
        <div style={loginStyles.titleSection}>
          <h1 style={loginStyles.mainLogo}>이어드림</h1>
          <h2 style={loginStyles.subTitle}>새로운 커리어의 시작</h2>
          <p style={loginStyles.description}>
            새로워진 이어드림에서
            <br />더 많은 기회와 도전을 만나보세요!
          </p>
        </div>

        <div style={loginStyles.buttonGroup}>
          <button
            style={loginStyles.socialButton}
            onClick={() => handleSocialLogin("kakao")}
          >
            <div style={loginStyles.iconWrapper}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#3c1e1e">
                <path d="M12 3C5.373 3 0 6.665 0 11.188C0 13.876 1.772 16.255 4.556 17.726L3.568 21.365C3.482 21.681 3.838 21.938 4.113 21.755L8.663 18.744C9.734 19.086 10.866 19.276 12.039 19.276C18.666 19.276 24.039 15.611 24.039 11.088C24.039 6.565 18.666 3 12 3Z" />
              </svg>
            </div>
            <span style={loginStyles.buttonText}>카카오로 시작하기</span>
          </button>

          <button
            style={loginStyles.socialButton}
            onClick={() => handleSocialLogin("naver")}
          >
            <div style={loginStyles.iconWrapper}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#03C75A">
                <path d="M16.42 22.018L8.77 11.032V22H0V2H7.653L15.3 12.984V2H24.072V22.018H16.42Z" />
              </svg>
            </div>
            <span style={loginStyles.buttonText}>네이버로 시작하기</span>
          </button>

          <button
            style={loginStyles.socialButton}
            onClick={() => handleSocialLogin("google")}
          >
            <div style={loginStyles.iconWrapper}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            </div>
            <span style={loginStyles.buttonText}>구글로 시작하기</span>
          </button>
        </div>
      </main>
    </div>
  );
}
