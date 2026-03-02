import React, { useEffect, useRef, useState } from "react";
import { loadPaymentWidget } from "@tosspayments/payment-widget-sdk";
import { v4 as uuidv4 } from "uuid";
import { useLocation, useNavigate } from "react-router-dom";

const widgetClientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

export default function PaymentPage() {
  const location = useLocation(); // navigate로 넘겨준 state 받기
  const navigate = useNavigate();

  // 전달받은 금액이 없으면 기본값 0 또는 홈으로 리다이렉트 처리
  const initialPrice = location.state?.price || 0;

  const paymentWidgetRef = useRef(null);
  const [price] = useState(initialPrice); // 금액을 변경하지 않고 고정
  const customerKey = useRef(uuidv4());

  useEffect(() => {
    // 금액이 없이 들어왔다면 돌려보냄
    if (initialPrice === 0) {
      alert("잘못된 접근입니다. 금액을 입력해주세요.");
      navigate("/");
      return;
    }

    const fetchPaymentWidget = async () => {
      try {
        // ✅ 수정: import한 loadPaymentWidget 함수를 사용합니다.
        const paymentWidget = await loadPaymentWidget(
          widgetClientKey,
          customerKey.current
        );

        paymentWidget.renderPaymentMethods(
          "#payment-widget",
          price
        );

        paymentWidget.renderAgreement("#agreement");

        paymentWidgetRef.current = paymentWidget;
      } catch (error) {
        console.error("Error loading payment widget:", error);
      }
    };

    fetchPaymentWidget();
  }, [navigate, initialPrice, price]);

  const handlePaymentRequest = async () => {
    const paymentWidget = paymentWidgetRef.current;

    try {
      // 결제 승인 페이지(SuccessPage)를 위해 금액 저장
      sessionStorage.setItem("paymentAmount", price.toString());

      await paymentWidget?.requestPayment({
        orderId: uuidv4(),
        orderName: "포인트 충전",
        successUrl: `${window.location.origin}/success`,
        failUrl: `${window.location.origin}/fail`,
        customerEmail: "customer@example.com",
        customerName: "사용자",
      });
    } catch (error) {
      console.error("Error requesting payment:", error);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <button
        onClick={() => navigate("/")}
        style={{
          marginBottom: "20px",
          border: "none",
          background: "none",
          fontSize: "16px",
        }}
      >
        ← 뒤로
      </button>
      <h1>결제 확인</h1>
      <p style={{ fontSize: "20px", fontWeight: "bold" }}>
        결제 금액: {price.toLocaleString()}원
      </p>

      <div id="payment-widget" style={{ width: "100%" }} />
      <div id="agreement" style={{ width: "100%" }} />

      <button
        style={{
          width: "100%",
          padding: "15px",
          fontSize: "18px",
          marginTop: "20px",
          backgroundColor: "#3182f6",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
        onClick={handlePaymentRequest}
      >
        결제하기
      </button>
    </div>
  );
}
