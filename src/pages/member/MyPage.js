import { useEffect, useState } from "react";
import api from "../../api/api";
import { Star, Mail, Briefcase, Award, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MyPage4 from "./MyPage4";
const S3_BASE_URL = process.env.REACT_APP_S3_BASE_URL;

const MyPage = () => {
  const [memberData, setMemberData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [roleToRevoke, setRoleToRevoke] = useState(null);
  const [revoking, setRevoking] = useState(false);
  const navigate = useNavigate();

  const buildS3DownloadUrl = (key, queryString) => {
    if (!key) return "";
    return `${S3_BASE_URL}/${key}${queryString ?? ""}`;
  };

  useEffect(() => {
    const fetchMyData = async () => {
      try {
        const response = await api.get("/members/me");
        setMemberData(response.data.data);
      } catch (err) {
        console.error("내 정보 조회 실패:", err);
        setError("내 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyData();
  }, []);

  const handleRevokeRole = async () => {
    if (!roleToRevoke) return;

    try {
      setRevoking(true);
      await api.delete("/members/state", {
        data: { role: roleToRevoke },
      });

      // 성공 후 memberData 업데이트
      setMemberData((prev) => ({
        ...prev,
        info: {
          ...prev.info,
          role:
            prev.info.role === "BOTH"
              ? roleToRevoke === "FREELANCER"
                ? "CLIENT"
                : "FREELANCER"
              : "NONE",
        },
      }));
      // 3) AccessToken 재발급 요청
      const reissueRes = await api.post(
        "/auth/reissue",
        {},
        {
          withCredentials: true,
        }
      );
      const authHeader =
        reissueRes.headers["authorization"] ||
        reissueRes.headers["Authorization"];

      console.log(authHeader);

      if (authHeader) {
        const newAccessToken = authHeader.replace("Bearer ", "");
        // AuthContext & localStorage 갱신
        localStorage.setItem("accessToken", newAccessToken);
      } else {
        console.warn("reissue 응답에서 Authorization 헤더를 찾지 못했습니다.");
      }
      setShowConfirmModal(false);
      setRoleToRevoke(null);
      window.location.reload();
    } catch (err) {
      console.error("역할 해제 실패:", err);
      alert("역할 해제에 실패했습니다.");
    } finally {
      setRevoking(false);
    }
  };

  const handleRegisterRole = (role) => {
    if (role === "FREELANCER") {
      navigate("/freelancer/register"); // 사용자가 채울 경로
    } else if (role === "CLIENT") {
      navigate("/register/client"); // 사용자가 채울 경로
    }
  };

  const handleRevokeClick = (role) => {
    setRoleToRevoke(role);
    setShowConfirmModal(true);
  };

  const hasFreelancerRole =
    memberData?.info?.role === "FREELANCER" ||
    memberData?.info?.role === "BOTH";
  const hasClientRole =
    memberData?.info?.role === "CLIENT" || memberData?.info?.role === "BOTH";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600 text-lg font-medium">
          내 정보 로딩 중...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-500 text-lg font-medium">{error}</div>
      </div>
    );
  }

  if (!memberData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600 text-lg font-medium">
          정보가 없습니다.
        </div>
      </div>
    );
  }

  const profileImage = memberData.images?.[0];
  const profileImageUrl = profileImage
    ? buildS3DownloadUrl(profileImage.key, profileImage.queryString)
    : null;

  const { info, rating, tags } = memberData;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
          {/* 프로필 이미지 */}
          {profileImageUrl ? (
            <div className="flex-shrink-0">
              <img
                src={profileImageUrl || "/placeholder.svg"}
                alt="프로필 이미지"
                className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-full shadow-md border-4 border-blue-100"
              />
            </div>
          ) : (
            <div className="flex-shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-md border-4 border-blue-100">
                <Briefcase className="w-16 h-16 text-blue-500" />
              </div>
            </div>
          )}

          {/* 기본 정보 */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {info?.nickName || "닉네임 미설정"}
              </h1>
              {info?.role === "BOTH" ? (
                <>
                  <span className="text-sm px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                    CLIENT
                  </span>
                  <span className="text-sm px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                    FREELANCER
                  </span>
                </>
              ) : (
                <span className="text-sm px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                  {info?.role || "NONE"}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{info?.email || "이메일 미설정"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span>{info?.phoneNumber || "전화번호 미설정"}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate("/mypage/update")}
            className="mt-4 md:mt-0 px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold shadow hover:bg-blue-600 transition-colors"
          >
            정보 수정
          </button>
        </div>
        {rating &&
          (() => {
            const satisfied = rating.satisfiedCount ?? 0;
            const unsatisfied = rating.unsatisfiedCount ?? 0;
            const total = satisfied + unsatisfied;
            const satisfiedRate = total > 0 ? (satisfied / total) * 100 : 0;

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* 만족/불만족 비율 카드 */}
                <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Star className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-semibold">
                      만족 비율
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {total > 0 ? `${satisfiedRate.toFixed(1)}%` : "평가 없음"}
                    </p>
                  </div>
                </div>

                {/* 총 평가 수 카드 */}
                <div className="bg-purple-50 rounded-xl p-4 flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Award className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs text-purple-600 font-semibold">
                      총 평가 수
                    </p>
                    <p className="text-2xl font-bold text-purple-900">
                      {total} 회
                    </p>
                  </div>
                </div>

                {/* 만족/불만족 개수 카드 */}
                <div className="bg-emerald-50 rounded-xl p-4 flex items-center gap-4">
                  <div className="p-3 bg-emerald-100 rounded-full">
                    <Star className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-600 font-semibold">
                      만족 / 불만족
                    </p>
                    <p className="text-2xl font-bold text-emerald-900">
                      {satisfied} / {unsatisfied}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

        {tags && tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">
              보유 스킬
            </h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag.tagCode || tag.name}
                  className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm"
                >
                  {tag.skill || tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8 pb-8 border-b border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            역할 관리
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* FREELANCER 역할 */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-3">프리랜서</p>
              {hasFreelancerRole ? (
                <button
                  onClick={() => handleRevokeClick("FREELANCER")}
                  className="w-full px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
                >
                  해제
                </button>
              ) : (
                <button
                  onClick={() => handleRegisterRole("FREELANCER")}
                  className="w-full px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors"
                >
                  등록
                </button>
              )}
            </div>

            {/* CLIENT 역할 */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-3">클라이언트</p>
              {hasClientRole ? (
                <button
                  onClick={() => handleRevokeClick("CLIENT")}
                  className="w-full px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
                >
                  해제
                </button>
              ) : (
                <button
                  onClick={() => handleRegisterRole("CLIENT")}
                  className="w-full px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors"
                >
                  등록
                </button>
              )}
            </div>
          </div>
        </div>

        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  역할 해제 확인
                </h2>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                정말 <span className="font-semibold">{roleToRevoke}</span>{" "}
                역할을 해제하시겠습니까?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleRevokeRole}
                  disabled={revoking}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {revoking ? "해제 중..." : "확인"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 border-t-4 border-dashed border-gray-200 pt-10">
          <MyPage4 />
        </div>
      </div>
    </div>
  );
};

export default MyPage;
