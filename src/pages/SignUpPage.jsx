import React, { useState, useEffect } from "react"; // useEffect 명확히 import
import { useNavigate } from "react-router-dom";
import { styles } from "../styles/signup";
import { useAuth } from "../components/AuthContext";

import api from "../api/api";
import axios from "axios";

const EC2_DOMAIN = process.env.REACT_APP_EC2_DOMAIN;
const REISSUE_URL = process.env.REACT_APP_REISSUE_URL;
const S3_BASE_URL = process.env.REACT_APP_S3_BASE_URL;

export default function SignUpPage() {
  const navigate = useNavigate();
  const { updateToken } = useAuth();

  useEffect(() => {
  if (localStorage.getItem("accessToken")) return;
    const initializeToken = async () => {
      const axiosConfig = { withCredentials: true };

      try {
        const res = await axios.post(REISSUE_URL, {}, axiosConfig);
        const authHeader = res.headers["authorization"];

        if (authHeader) {
          const accessToken = authHeader.replace("Bearer ", "");
          const base64Payload = accessToken.split(".")[1];
          const decodedPayload = JSON.parse(atob(base64Payload));
          const memberCode = decodedPayload["member-code"];

          console.log("페이지 로드 시 토큰 초기화 완료:", memberCode);
          updateToken(accessToken);
          localStorage.setItem("accessToken", accessToken);
        }
      } catch (error) {
        console.warn("토큰 reissue 실패 (임시 계정 아님):", error);
        // reissue 실패해도 회원가입 페이지 접근 가능 (임시 계정 아닌 경우)
      }
    };

    initializeToken();
  }, [updateToken]); // updateToken 변경 시 재실행


  // 입력 데이터를 관리하는 State
  const [formData, setFormData] = useState({
    phoneNumber: "",
    birthDate: "",
    gender: "MAN", // 기본값: 남성 (이미지 데이터 기반)
    name: "",
    profileImageKey: "", // 프로필 이미지 키 추가
  });

  // 닉네임 중복 확인 여부
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  // 프로필 이미지 미리보기 URL
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // 닉네임이 변경되면 중복 확인 상태를 리셋
    if (name === "name") {
      setIsNicknameChecked(false);
    }
  };

  // 성별 선택 핸들러
  const handleGenderChange = (selectedGender) => {
    setFormData({
      ...formData,
      gender: selectedGender,
    });
  };

  // 닉네임 중복 체크 핸들러
  const handleNicknameCheck = async () => {
    if (!formData.name) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    try {
      // =======================================================
      // API: 닉네임 중복 확인
      // =======================================================
      // TODO: 실제 닉네임 중복 확인 API 엔드포인트로 수정해야 합니다.
      await api.get(`/members/check-name?name=${formData.nickname}`);
      alert("사용 가능한 닉네임입니다.");
      setIsNicknameChecked(true);
    } catch (error) {
      // TODO: API 스펙에 따라 에러 메시지를 처리해야 합니다.
      console.error("닉네임 중복 확인 에러:", error);
      alert("이미 사용 중인 닉네임입니다.");
      setIsNicknameChecked(false);
    }
  };

  // 프로필 이미지 변경 핸들러
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setProfileImagePreview(null); // 이미지를 선택하지 않은 경우 미리보기 제거
      setFormData((prevData) => ({
        ...prevData,
        profileImageKey: null, // 프로필 이미지 키 초기화
      }));
      return;
    }

    // 미리보기 URL 생성
    const previewUrl = URL.createObjectURL(file);
    setProfileImagePreview(previewUrl);

    try {
      // =======================================================
      // API: S3 Presigned URL 요청
      // =======================================================
      // TODO: 실제 Presigned URL 요청 API 엔드포인트로 수정해야 합니다.
      const presignedResponse = await api.post("/s3/upload-url", {
        serviceName: "MEMBERS",
        fileName: file.name,
        contentType: file.type,
      })

      const { key, queryString } = presignedResponse.data.data
      const presignedUrl = `${S3_BASE_URL}/${key}${queryString}`

      await axios.put(presignedUrl, file, {
        headers: { "Content-Type": file.type },
      })

      setFormData((prev) => ({
        ...prev,
        profileImageKey: key,
      }))

      // =======================================================
      // API: Presigned URL로 이미지 업로드
      // =======================================================

      alert("이미지 업로드가 완료되었습니다.");

      // 이미지 키를 state에 저장
      setFormData((prevData) => ({
        ...prevData,
        profileImageKey: key,
      }));
    } catch (error) {
      console.error("이미지 업로드 에러:", error);
      alert("이미지 업로드 중 오류가 발생했습니다.");
      // setProfileImagePreview(null); // 실패 시 미리보기 제거
    }
  };

  // 회원가입 완료 버튼 클릭 핸들러
  const handleSubmit = async () => {
    if (!formData.phoneNumber || !formData.birthDate || !formData.name) {
      alert("모든 정보를 입력해주세요.");
      return;
    }


    if (!isNicknameChecked) {
      alert("닉네임 중복 확인을 해주세요.");
      return;
    }

    try {
      // -------------------------------------------------------
      // [Step 1] 쿠키 전송 -> 헤더에서 임시 AccessToken 추출
      // -------------------------------------------------------
      const res1 = await axios.post(
          REISSUE_URL,
          {},
          {
            withCredentials: true, // 쿠키 포함
          }
      );
      const authHeader = res1.headers["authorization"];

      if (!authHeader) {
        throw new Error("임시 토큰을 찾을 수 없습니다.");
      }

      const tempAccessToken = authHeader.replace("Bearer ", "");

      // -------------------------------------------------------
      // [Step 2] 토큰(tempAccessToken)에서 member-code 직접 추출 로직
      // -------------------------------------------------------
      const base64Payload = tempAccessToken.split(".")[1]; // 페이로드 부분 추출
      const decodedPayload = JSON.parse(atob(base64Payload)); // Base64 디코딩

      // yml 설정에서 claims 필드로 지정된 'member-code'를 꺼냅니다.
      const rawMemberCode = decodedPayload["member-code"];

      console.log("토큰에서 추출된 멤버 코드:", rawMemberCode);

      // -------------------------------------------------------
      // [Step 3] 회원가입 정보 + 임시 AccessToken(Header) 전송
      // -------------------------------------------------------
      await axios.post(
          `${EC2_DOMAIN}/api/members`,
          formData, {
        headers: {
          Authorization: `Bearer ${tempAccessToken}`,
        },
      });

      console.log("2단계 성공: 회원가입 정보 등록");

      // -------------------------------------------------------
      // [Step 4] 쿠키 재전송 -> 헤더에서 정식 AccessToken 추출
      // -------------------------------------------------------
      const res3 = await api.post("/auth/reissue", {});

      // 마찬가지로 소문자 키로 접근
      const finalAuthHeader = res3.headers["authorization"];

      if (!finalAuthHeader) {
        throw new Error("헤더에서 정식 토큰을 찾을 수 없습니다.");
      }

      const finalAccessToken = finalAuthHeader.replace("Bearer ", "");
      console.log("3단계 성공: 정식 토큰 추출 완료");
      console.log("정식 토큰:", finalAccessToken);

      // -------------------------------------------------------
      // [Final] 토큰 저장 및 이동
      // -------------------------------------------------------
      updateToken(finalAccessToken);
      localStorage.setItem("accessToken", finalAccessToken);

      alert("회원가입이 성공적으로 완료되었습니다!");
      navigate("/charge", { replace: true });
    } catch (error) {
      console.error("회원가입 프로세스 에러:", error);
      const msg = error.response?.data?.message || error.message;
      alert(`회원가입 처리 중 오류가 발생했습니다: ${msg}`);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <span style={styles.headerLogo}>이어드림</span>
      </header>

      <main style={styles.mainContent}>
        <div style={styles.titleSection}>
          <h2 style={styles.title}>회원가입</h2>
          <p style={styles.subtitle}>
            서비스 이용을 위해 추가 정보를 입력해주세요.
          </p>
        </div>

        <div style={styles.formContainer}>

          {/* 프로필 이미지 등록 */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>프로필 이미지</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ ...styles.input, marginBottom: "10px" }}
            />
            {profileImagePreview && (
              <img
                src={profileImagePreview}
                alt="Profile Preview"
                style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "50%" }}
              />
            )}
          </div>

          {/* 닉네임 입력 */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>닉네임</label>
            <div style={{ display: "flex", alignItems: "center" }}>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="닉네임을 입력하세요"
                style={{ ...styles.input, flex: 1 }}
              />
              <button
                onClick={handleNicknameCheck}
                style={{
                  ...styles.genderButton,
                  marginLeft: "10px",
                  backgroundColor: isNicknameChecked ? "#4CAF50" : "#f0f0f0",
                  color: isNicknameChecked ? "white" : "black"
                 }}
              >
                {isNicknameChecked ? "확인완료" : "중복확인"}
              </button>
            </div>
          </div>

                   {/* 전화번호 입력 */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>전화번호</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="010-0000-0000"
              style={styles.input}
            />
          </div>

          {/* 생년월일 입력 */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>생년월일</label>
            <input
              type="date" // 달력 UI 제공
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          {/* 성별 선택 (MAN / WOMAN) */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>성별</label>
            <div style={styles.genderContainer}>
              <button
                style={
                  formData.gender === "MAN"
                    ? styles.genderButtonActive
                    : styles.genderButton
                }
                onClick={() => handleGenderChange("MAN")}
              >
                남성
              </button>
              <button
                style={
                  formData.gender === "FEMALE"
                    ? styles.genderButtonActive
                    : styles.genderButton
                }
                onClick={() => handleGenderChange("FEMALE")}
              >
                여성
              </button>
            </div>
          </div>

          {/* 완료 버튼 */}
          <button style={styles.submitButton} onClick={handleSubmit}>
            회원가입 완료
          </button>
        </div>
      </main>
    </div>
  );
}
