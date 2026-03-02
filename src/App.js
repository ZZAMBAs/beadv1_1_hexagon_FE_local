import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/Footer";
import Header from "./components/Header";

// Public Pages (로그인 없이 접근 가능)
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import FailPage from "./pages/FailPage";
import CommissionSearchResultPage from "./pages/search/CommissionSearchResultPage";
import PromotionSearchResultPage from "./pages/search/PromotionSearchResultPage";
import CommissionDetailPage from "./pages/commisions/CommissionDetailPage";

// Protected Pages (로그인 필수)
// 결제 관련
import ChargePage from "./pages/ChargePage";
import PaymentPage from "./pages/PaymentPage";
import SuccessPage from "./pages/SuccessPage";

// 마이페이지 및 등록/관리 관련
import CartPage from "./pages/cart/CartPage";
import CommissionUpsertPage from "./pages/commisions/CommissionUpsertPage"; // Create/Update 공용
import MyCommissionsPage from "./pages/commisions/MyCommissionsPage";
import MyContractsPage from "./pages/contract/MyContractsPage";
import MyProfilePage from "./pages/member/MyProfilePage";
import PaymentHistoryPage from "./pages/payment/PaymentHistoryPage";
import DepositHistoryPage from "./pages/deposit/DepositHistoryPage";
import DepositPage from "./pages/deposit/DepositPage";
import ResumeListPage from "./pages/resume/MyResumePage";
import SellerRegisterPage from "./pages/member/SellerRegisterPage";
import SelfPromotionUpsertPage from "./pages/selfPromotion/MySelfPromotionPage"; // Create/Update 공용
import TagManagementPage from "./pages/tag/TagManagementPage";
import MemberRatingPage from "./pages/rating/RatingComponent"; // 다른 회원 평가도 로그인 후 가능
import ContractDetailPage from "./pages/contract/ContractDetailPage";
import LoginSuccessPage from "./pages/LoginSuccessPage";
import MyPage from "./pages/member/MyPage";
import MyPage4 from "./pages/member/MyPage4";

import LandingPage from "./pages/LandingPage"; // 다른 회원 평가도 로그인 후 가능
import MemberUpdatePage from "./pages/member/MemberUpdatePage"; // 다른 회원 평가도 로그인 후 가능

import UserPage from "./pages/member/UserPage"; // 다른 회원 평가도 로그인 후 가능
import ChatListPage from "./pages/chat/ChatListPage";
import EmailVerification from "./components/EmailVerification";
import ClientRegisterPage from "./pages/ClientRegisterPage";

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <AuthProvider>
          <Header />
          <div className="flex-grow pt-16">
            <Routes>
              {/* Public Routes: 로그인 불필요 */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/member/:memberCode" element={<UserPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/login/need-signed-up" element={<SignUpPage />} />
              <Route path="/login/success" element={<LoginSuccessPage />} />
              <Route path="/fail" element={<FailPage />} />
              <Route
                path="/search/commissions"
                element={<CommissionSearchResultPage />}
              />

              <Route
                path="/search/promotions"
                element={<PromotionSearchResultPage />}
              />
                <Route path="/commissions/new" element={<CommissionUpsertPage action="create" />} />

                {/* 2. 그 다음 동적 파라미터(:code)가 들어간 경로를 씁니다. */}
                {/* 수정 페이지 */}
                <Route path="/commissions/:code/edit" element={<CommissionUpsertPage action="update" />} />

                {/* 상세 페이지 */}
                <Route path="/commissions/:code" element={<CommissionDetailPage />} />

              {/* Protected Routes: 로그인 필수 */}
              <Route element={<ProtectedRoute />}>
                {/* 결제/충전 */}
                <Route path="/charge" element={<ChargePage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/success" element={<SuccessPage />} />
                {/* 채팅 */}
                <Route path="/chat" element={<ChatListPage />} />

                {/* 의뢰글 등록/수정 (CommissionUpsertPage는 action props를 받아야 함) */}
                {/* Action props 전달을 위해 래핑 컴포넌트 사용 또는 페이지 내부에서 파싱 */}


                <Route path="/verify" element={<EmailVerification />} />
                <Route
                  path="/register/client"
                  element={<ClientRegisterPage />}
                />

                {/* 마이페이지/관리 영역 */}
                <Route path="/cart" element={<CartPage />} />
                <Route path="/mypage" element={<MyPage />} />
                <Route path="/mypage/update" element={<MemberUpdatePage />} />
                <Route path="/mypage/profile" element={<MyProfilePage />} />
                <Route path="/mypage/manage" element={<MyPage4 />} />
                <Route
                  path="/mypage/commissions/own"
                  element={<MyCommissionsPage />}
                />
                <Route path="/mypage/contracts" element={<MyContractsPage />} />
                <Route
                  path="/mypage/contracts/:code"
                  element={<ContractDetailPage />}
                />
                <Route
                  path="/mypage/payments"
                  element={<PaymentHistoryPage />}
                />
                <Route path="/mypage/deposits" element={<DepositPage />} />
                <Route
                  path="/mypage/deposits/histories"
                  element={<DepositHistoryPage />}
                />
                <Route path="/mypage/tags" element={<TagManagementPage />} />
                <Route path="/mypage/resumes" element={<ResumeListPage />} />
                <Route
                  path="/mypage/seller-register"
                  element={<SellerRegisterPage />}
                />
                <Route
                  path="/mypage/promotion"
                  element={<SelfPromotionUpsertPage />}
                />

                {/* 회원 평가 페이지 (로그인 상태에서 평가 가능하도록 Protected) */}
                <Route
                  path="/member/:memberCode/rating"
                  element={<MemberRatingPage />}
                />
              </Route>

              {/* 404 Not Found (모든 경로와 일치하지 않을 때) */}
              <Route
                path="*"
                element={
                  <h1 style={{ padding: "20px", textAlign: "center" }}>
                    404 Not Found
                  </h1>
                }
              />
            </Routes>
          </div>
        </AuthProvider>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
