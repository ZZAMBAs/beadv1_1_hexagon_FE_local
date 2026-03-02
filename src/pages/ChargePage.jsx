import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { styles } from "../styles/styles";
import axios from "axios"; // axios 기본 인스턴스 (인터셉터 우회 목적)
import { useAuth } from "../components/AuthContext"; // useAuth 훅

const REISSUE_URL = process.env.REACT_APP_REISSUE_URL;

// V1 위젯 클라이언트 키

// ==========================================
// 1. ChargePage (충전 금액 입력 화면 - 스크린샷 UI)
// ==========================================
function ChargePage() {
  const navigate = useNavigate();
  const { authState, login } = useAuth(); // 💡 useAuth로 login 함수와 상태 획득
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(true); // 💡 로딩 상태 추가 (토큰 획득 중 화면 깜빡임 방지)

  // 한 번만 재발급 시도하도록 플래그
  const attemptedReissueRef = useRef(false);

  // 💡 Access Token 획득 로직
  useEffect(() => {
    // 이미 Access Token이 있으면 로딩 종료
    if (authState.isLoggedIn) {
      setIsLoading(false);
      return;
    }

    // 이미 시도했으면 다시 시도하지 않음
    if (attemptedReissueRef.current) {
      setIsLoading(false);
      return;
    }

    // AccessToken이 로컬스토리지에 없으면 refresh로 재발급 시도
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
            // 헤더에 토큰이 없으면 로그인 필요 상태로 처리 (로그인 흐름에 맡김)
            console.warn("Reissue 응답에 authorization 헤더가 없습니다.");
          }
        } catch (error) {
          // 재발급 실패: 보통 RefreshToken 만료/없음. 로그인 유도(ProtectedRoute / AuthContext가 처리)
          console.error(
            "Access Token 재발급 실패:",
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
        로그인 인증 정보 처리 중...
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
      alert("0원 이상을 입력해주세요.");
      return;
    }
    navigate("/payment", { state: { price: finalAmount } });
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button
          style={styles.backButton}
          onClick={() => alert("뒤로가기")}
        ></button>
        <h2 style={styles.headerTitle}>
          충전하기 <span style={{ fontSize: "14px", color: "#999" }}></span>
        </h2>
        <span style={styles.headerRight}></span>
      </header>

      <div style={styles.content}>
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
          <button
            style={styles.amountBtn}
            onClick={() => handleAddAmount(10000)}
          >
            +1만
          </button>
          <button
            style={styles.amountBtn}
            onClick={() => handleAddAmount(50000)}
          >
            +5만
          </button>
          <button
            style={styles.amountBtn}
            onClick={() => handleAddAmount(100000)}
          >
            +10만
          </button>
          <button
            style={styles.amountBtn}
            onClick={() => handleAddAmount(1000000)}
          >
            +100만
          </button>
        </div>
      </div>

      <button
        style={{
          ...styles.submitButton,
          backgroundColor: amount ? "#3182f6" : "#E2E2E2",
          color: amount ? "white" : "#999",
        }}
        disabled={!amount}
        onClick={handleSubmit}
      >
        충전하기
      </button>
    </div>
  );
}

export default ChargePage;

// 스크린샷과 유사하게 만들기 위한 CSS-in-JS 스타일 객체
// const styles = {
//     container: {
//         maxWidth: '480px',
//         margin: '0 auto',
//         minHeight: '100vh',
//         backgroundColor: '#fff',
//         position: 'relative',
//         fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
//     },
//     header: {
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         padding: '15px 20px',
//         height: '56px',
//     },
//     backButton: {
//         background: 'none',
//         border: 'none',
//         fontSize: '20px',
//         cursor: 'pointer',
//     },
//     headerTitle: {
//         fontSize: '18px',
//         fontWeight: '600',
//         margin: 0,
//         display: 'flex',
//         alignItems: 'center',
//         gap: '4px',
//     },
//     headerRight: {
//         fontSize: '14px',
//         color: '#2AC1BC',
//         fontWeight: 'bold',
//         cursor: 'pointer',
//     },
//     content: {
//         padding: '20px',
//         paddingBottom: '100px', // 하단 고정 버튼을 위한 패딩
//     },
//     logoIcon: {
//         width: '32px',
//         height: '32px',
//         backgroundColor: '#00C73C',
//         borderRadius: '50%',
//         color: 'white',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         fontWeight: 'bold',
//         marginRight: '8px',
//     },
//     inputWrapper: {
//         borderBottom: '2px solid #333',
//         paddingBottom: '10px',
//         display: 'flex',
//         alignItems: 'center',
//         marginBottom: '20px',
//     },
//     input: {
//         width: '100%',
//         border: 'none',
//         fontSize: '24px',
//         outline: 'none',
//         fontWeight: 'bold',
//         color: '#333',
//         '::placeholder': { color: '#ccc' },
//     },
//     currencyUnit: {
//         fontSize: '24px',
//         fontWeight: 'bold',
//         marginLeft: '5px',
//     },
//     buttonGrid: {
//         display: 'grid',
//         gridTemplateColumns: '1fr 1fr 1fr 1fr',
//         gap: '8px',
//     },
//     amountBtn: {
//         padding: '10px 0',
//         backgroundColor: '#fff',
//         border: '1px solid #ddd',
//         borderRadius: '4px',
//         fontSize: '14px',
//         color: '#333',
//         cursor: 'pointer',
//         fontWeight: '600',
//     },
//     accountBox: {
//         marginTop: '10px',
//         border: '1px solid #eee',
//         borderRadius: '8px',
//         padding: '15px',
//         display: 'flex',
//         alignItems: 'center',
//         cursor: 'pointer',
//         boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
//     },
//     bankIcon: {
//         width: '40px',
//         height: '40px',
//         backgroundColor: '#FFE600',
//         borderRadius: '50%',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         fontWeight: 'bold',
//         fontSize: '20px',
//         marginRight: '12px',
//     },
//     submitButton: {
//         width: '100%',
//         padding: '18px',
//         fontSize: '18px',
//         fontWeight: 'bold',
//         border: 'none',
//         borderRadius: '8px',
//         cursor: 'pointer',
//         position: 'absolute',
//         bottom: 0,
//         left: 0,
//     },
// };
