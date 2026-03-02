import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../components/AuthContext";
import { styles } from "../styles/styles";

const REISSUE_URL = process.env.REACT_APP_REISSUE_URL;

function ChargePage() {
  const navigate = useNavigate();
  const { authState, login } = useAuth();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const attemptedReissueRef = useRef(false);

  useEffect(() => {
    if (authState.isLoggedIn) {
      setIsLoading(false);
      return;
    }

    if (attemptedReissueRef.current) {
      setIsLoading(false);
      return;
    }

    if (!localStorage.getItem("accessToken")) {
      attemptedReissueRef.current = true;

      const attemptReissue = async () => {
        try {
          const response = await axios.post(
            REISSUE_URL,
            {},
            { withCredentials: true }
          );
          const newAccessToken = response.headers["authorization"]?.replace(
            "Bearer ",
            ""
          );

          if (newAccessToken) {
            login(newAccessToken);
          } else {
            console.warn("Reissue response is missing the authorization header.");
          }
        } catch (error) {
          console.error(
            "Access token reissue failed:",
            error?.response?.data || error?.message || error
          );
        } finally {
          setIsLoading(false);
        }
      };

      attemptReissue();
    } else {
      setIsLoading(false);
    }
  }, [authState.isLoggedIn, login]);

  if (isLoading && !authState.isLoggedIn) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        로그인 인증 정보를 처리 중입니다...
      </div>
    );
  }

  const handleAddAmount = (val) => {
    setAmount((prev) => {
      const current = prev === "" ? 0 : parseInt(prev.replace(/,/g, ""), 10);
      return (current + val).toLocaleString();
    });
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/,/g, "");
    if (value === "") {
      setAmount("");
      return;
    }
    if (!isNaN(value)) {
      setAmount(parseInt(value, 10).toLocaleString());
    }
  };

  const handleSubmit = () => {
    const finalAmount =
      amount === "" ? 0 : parseInt(amount.replace(/,/g, ""), 10);
    if (finalAmount <= 0) {
      alert("0원 이상을 입력해 주세요.");
      return;
    }
    navigate("/payment", { state: { price: finalAmount } });
  };

  const isEnabled = !!amount;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate(-1)} />
        <h2 style={styles.headerTitle}>
          충전하기 <span style={{ fontSize: "14px", color: "#999" }} />
        </h2>
        <span style={styles.headerRight} />
      </header>

      <div
        style={{
          ...styles.content,
          paddingBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <span style={{ fontSize: "18px", fontWeight: "bold" }}>
            충전 머니로
          </span>
        </div>

        <div style={styles.inputWrapper}>
          <input
            type="text"
            placeholder="충전할 금액을 입력해 주세요."
            value={amount}
            onChange={handleInputChange}
            style={styles.input}
          />
          {amount && <span style={styles.currencyUnit}>원</span>}
        </div>

        <div style={styles.buttonGrid}>
          <button style={styles.amountBtn} onClick={() => handleAddAmount(10000)}>
            +1만
          </button>
          <button style={styles.amountBtn} onClick={() => handleAddAmount(50000)}>
            +5만
          </button>
          <button style={styles.amountBtn} onClick={() => handleAddAmount(100000)}>
            +10만
          </button>
          <button style={styles.amountBtn} onClick={() => handleAddAmount(1000000)}>
            +100만
          </button>
        </div>

        <button
          style={{
            ...styles.submitButton,
            position: "static",
            left: "auto",
            bottom: "auto",
            marginTop: "16px",
            backgroundColor: isEnabled ? "#3182f6" : "#E2E2E2",
            color: isEnabled ? "white" : "#999",
          }}
          disabled={!isEnabled}
          onClick={handleSubmit}
        >
          충전하기
        </button>
      </div>
    </div>
  );
}

export default ChargePage;
