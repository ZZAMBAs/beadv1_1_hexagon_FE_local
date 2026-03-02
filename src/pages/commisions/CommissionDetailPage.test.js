import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CommissionDetailPage from "./CommissionDetailPage";
import api from "../../api/api";
import { useAuth } from "../../components/AuthContext";

jest.mock("../../api/api", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

jest.mock("../../components/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const commission = {
  code: "commission-123",
  title: "브랜드 사이트 리뉴얼",
  content: "메인 페이지와 소개 페이지를 개편합니다.",
  memberCode: "client-456",
  memberNickname: "클라이언트",
  startedAt: "2026-03-10",
  endedAt: "2026-04-10",
  paymentType: "MONTHLY",
  payAmount: 3000000,
  tags: ["react", "design"],
  isOpen: true,
};

const renderPage = () =>
  render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: `/commissions/${commission.code}`,
          state: { commission },
        },
      ]}
    >
      <Routes>
        <Route path="/commissions/:code" element={<CommissionDetailPage />} />
        <Route path="/mypage/contracts" element={<div>contracts list</div>} />
        <Route path="/mypage/contracts/:code" element={<div>contract detail</div>} />
      </Routes>
    </MemoryRouter>
  );

describe("CommissionDetailPage contract flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockResolvedValue({ data: { data: commission } });
    window.confirm = jest.fn(() => true);
    window.alert = jest.fn();
  });

  it("hides the contract action for non-freelancer roles", async () => {
    useAuth.mockReturnValue({
      authState: {
        role: "CLIENT",
        memberCode: "freelancer-123",
      },
    });

    renderPage();

    expect(await screen.findByText("브랜드 사이트 리뉴얼")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "계약하기" })).not.toBeInTheDocument();
    expect(
      screen.getByText("프리랜서 또는 BOTH 역할 사용자만 계약을 생성할 수 있습니다.")
    ).toBeInTheDocument();
  });

  it("creates a contract draft from commission and logged-in freelancer data", async () => {
    useAuth.mockReturnValue({
      authState: {
        role: "FREELANCER",
        memberCode: "freelancer-123",
      },
    });
    api.post.mockResolvedValue({ data: { data: { code: "contract-999" } } });

    renderPage();

    const actionButton = await screen.findByRole("button", { name: "계약하기" });
    expect(screen.getByText("계약 생성 기본값")).toBeInTheDocument();
    expect(screen.getByText("클라이언트 코드: client-456")).toBeInTheDocument();
    expect(screen.getByText("프리랜서 코드: freelancer-123")).toBeInTheDocument();

    await userEvent.click(actionButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledTimes(1);
    });

    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining("계약명: 브랜드 사이트 리뉴얼 계약")
    );
    expect(api.post).toHaveBeenCalledWith("/contracts", {
      clientCode: "client-456",
      freelancerCode: "freelancer-123",
      commissionCode: "commission-123",
      startedAt: expect.stringMatching(/^2026-03-10T/),
      endedAt: expect.stringMatching(/^2026-04-10T/),
      paymentType: "MONTHLY",
      unitAmount: 3000000,
      name: "브랜드 사이트 리뉴얼 계약",
      body: expect.stringContaining("[자동 생성 초안]"),
    });
    expect(api.post.mock.calls[0]).toHaveLength(2);
  });
});
