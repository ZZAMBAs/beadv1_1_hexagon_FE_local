import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { styles } from "../styles/styles";

// Java 서버 주소
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function SuccessPage() {
    const [searchParams] = useState(new URLSearchParams(window.location.search));
    const [paymentResult, setPaymentResult] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const paymentKey = searchParams.get("paymentKey");
        const orderId = searchParams.get("orderId");
        // PaymentPage에서 저장한 금액을 가져옴
        const amount = sessionStorage.getItem("paymentAmount");

        // 필수 파라미터 확인
        if (!paymentKey || !orderId || !amount) {
            setIsLoading(false);
            setPaymentResult({ error: "필수 정보 누락" });
            return;
        }

        const requestPaymentConfirm = async () => {
            const axiosConfig = {
                withCredentials: true // 쿠키(Refresh Token 등)가 필요하다면 유지, 아니면 false
            };

            try {
                // 1. 로컬 스토리지에서 토큰 가져오기
                let token = localStorage.getItem('accessToken');

                // [중요 체크] 토큰이 아예 없으면 바로 에러 처리
                if (!token) {
                    throw new Error("로그인이 필요합니다. (토큰 없음)");
                }

                // [중요 해결책] 토큰 값 정제 (Bearer 중복 방지)
                // 만약 저장된 토큰에 이미 "Bearer "가 붙어있다면 제거하고 순수 토큰만 남김
                if (token.startsWith('Bearer ')) {
                    token = token.replace('Bearer ', '');
                }

                // 디버깅용: 실제로 나가는 토큰 확인 (배포 시 주석 처리)
                console.log("전송할 토큰:", token);

                // 2. Axios 요청 설정
                const response = await axios.post(
                    `${API_BASE_URL}/payments/confirm`,
                    {
                        paymentKey,
                        orderId,
                        amount
                    },
                    {
                        ...axiosConfig,
                        headers: {
                            "Content-Type": "application/json",
                            // 3. Bearer를 여기서 딱 한 번만 붙여서 완성
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                // 성공 시
                setPaymentResult(response.data);

            } catch (error) {
                console.error("결제 승인 에러 상세:", error);

                let errorMessage;

                // 401 에러일 경우 별도 메시지 처리
                if (error.response && error.response.status === 401) {
                    // 401 Unauthorized 에러 시, 로컬 스토리지 토큰 삭제 후 로그인 페이지로 리다이렉션
                    localStorage.removeItem('accessToken');
                    alert("세션이 만료되었거나 인증 정보가 잘못되었습니다. 다시 로그인해주세요.");
                    navigate('/login', { replace: true });
                    return; // 리다이렉션 후 로직 종료
                } else {
                    errorMessage = error.response?.data?.message || "결제 승인에 실패했습니다.";
                }

                setPaymentResult({ error: errorMessage });
            } finally {
                setIsLoading(false);
                sessionStorage.removeItem("paymentAmount");
            }
        };

        requestPaymentConfirm();
    }, [searchParams, navigate]);

    if (isLoading) {
        return (
            <div style={styles.successContainer}>
                {/* 스피너 애니메이션 */}
                <style>
                    {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    `}
                </style>
                <div style={styles.loadingSpinner}></div>
                <p style={{marginTop: '20px', color: '#666'}}>결제 승인 중입니다...</p>
            </div>
        );
    }

    return (
        <div style={styles.successContainer}>
            {paymentResult?.error ? (
                // 실패 화면
                <div style={{textAlign: 'center', width: '100%'}}>
                    <div style={{...styles.iconCircle, backgroundColor: '#f44336', boxShadow: '0 4px 10px rgba(244, 67, 54, 0.2)'}}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    </div>
                    <h2 style={styles.successTitle}>결제에 실패했어요</h2>
                    <p style={styles.errorMessage}>{paymentResult.error}</p>
                    <button onClick={() => navigate('/charge')} style={styles.homeButton}>홈으로 돌아가기</button>
                </div>
            ) : (
                // 성공 화면
                <div style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <div style={styles.iconCircle}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>

                    <h2 style={styles.successTitle}>결제를 완료했어요</h2>

                    <div style={styles.resultInfoBox}>
                        <p style={styles.amountText}>
                            {Number(paymentResult.totalAmount || paymentResult.amount).toLocaleString()}원
                        </p>
                        <div style={styles.detailRow}>
                            <span style={styles.label}>주문번호</span>
                            <span style={styles.value}>{paymentResult.orderId}</span>
                        </div>
                        <div style={styles.detailRow}>
                            <span style={styles.label}>결제수단</span>
                            <span style={styles.value}>{paymentResult.method || "간편결제"}</span>
                        </div>
                    </div>

                    <div style={styles.bottomButtonArea}>
                        <button onClick={() => navigate('/charge')} style={styles.confirmButton}>
                            확인
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
