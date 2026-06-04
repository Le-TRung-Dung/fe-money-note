import { useEffect, useState } from "react";
import { Button, Empty, Skeleton, message } from "antd";
import {
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowUpOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  EyeOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ketsat from "../assets/ket_sat_tien_nen_trong_suot.png";
import dayjs from "dayjs";

import { STORAGE_KEYS } from "../shared/constants/storageKeys";
import { formatMoney } from "../shared/utils/formatMoney";
import { ensureDefaultDataForUser } from "../database/seed";
import conlon from "../assets/conlon.png";
import type { SavingGoal, SavingTransaction, Wallet } from "../database/db";
import {
  getSavingTransactions,
  getSavingWalletByUser,
} from "../features/savings/services/savingService";
import { getSavingGoalsByUser } from "../features/savings/services/savingGoalService";
import SavingGoalModal from "../Modal/SavingGoalModal";
import muiten from "../assets/muiten.png";
import {
  getSavingMonthlyReport,
  type SavingMonthlyReport,
} from "../features/savings/services/savingReportService";

function SavingScreen() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<SavingTransaction[]>([]);
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingGoal | null>(null);
  const [monthlyReport, setMonthlyReport] =
    useState<SavingMonthlyReport | null>(null);

  const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (!currentUserId) {
        message.error("Bạn cần đăng nhập lại");
        navigate("/login");
        return;
      }

      await ensureDefaultDataForUser(currentUserId);

      const savingWallet = await getSavingWalletByUser(currentUserId);
      const savingTransactions = await getSavingTransactions(currentUserId);
      const savingGoals = await getSavingGoalsByUser(currentUserId);
      const savingMonthlyReport = await getSavingMonthlyReport(
        currentUserId,
        6,
      );

      setWallet(savingWallet);
      setTransactions(savingTransactions);
      setGoals(savingGoals);
      setMonthlyReport(savingMonthlyReport);
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Không thể tải ví tiết kiệm",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FF] p-5">
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  const handleOpenCreateGoal = () => {
    setEditingGoal(null);
    setGoalModalOpen(true);
  };

  const handleOpenEditGoal = (goal: SavingGoal) => {
    setEditingGoal(goal);
    setGoalModalOpen(true);
  };

  const handleGoalSuccess = async () => {
    setGoalModalOpen(false);
    setEditingGoal(null);
    await loadData();
  };

  // Tính toán số dư chạy dồn (Running Balance) cho lịch sử giao dịch
  let runningBalance = wallet?.balance || 0;
  const mappedTransactions = transactions.map((t) => {
    const balanceAfter = runningBalance;
    if (t.type === "deposit") runningBalance -= t.amount;
    else runningBalance += t.amount;
    return { ...t, balanceAfter };
  });

  // -------------------------------------------------------------
  // Xử lý dữ liệu động cho Chart
  // -------------------------------------------------------------
  const chartData = monthlyReport?.monthlyData || [];
  const maxVal = Math.max(...chartData.map((d) => d.netAmount), 1);
  const minVal = Math.min(...chartData.map((d) => d.netAmount), 0);
  const range = maxVal - minVal;

  const points = chartData.map((d, i) => {
    const x = chartData.length > 1 ? i * (300 / (chartData.length - 1)) : 150;
    const y = range === 0 ? 80 : 80 - ((d.netAmount - minVal) / range) * 50;
    return { x, y, val: d.netAmount, label: d.monthLabel.split("/")[0] };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`)
    .join(" ");

  // -------------------------------------------------------------
  // Xử lý logic % so với tháng trước
  // -------------------------------------------------------------
  let diffPercentText = "0%";
  if (monthlyReport) {
    if (
      monthlyReport.diffPercent !== null &&
      monthlyReport.diffPercent !== undefined
    ) {
      diffPercentText = `${monthlyReport.diffPercent > 0 ? "+" : ""}${monthlyReport.diffPercent}%`;
    } else if (monthlyReport.diffAmount !== 0) {
      // Khi diffPercent null (do tháng trước = 0) nhưng diffAmount khác 0
      diffPercentText = monthlyReport.diffAmount > 0 ? "+100%" : "-100%";
    }
  }

  const isDecreaseTrend = monthlyReport?.trend === "decrease";

  return (
    <div className="min-h-screen bg-[#F7F9FF] px-4 py-6 font-sans">
      <div className="mx-auto max-w-[760px]">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <ArrowLeftOutlined
            className="text-xl cursor-pointer text-[#111438]"
            onClick={() => navigate("/dashboard")}
          />
          <h1 className="m-0 text-lg font-black text-[#111438]">
            Gửi tiết kiệm
          </h1>
          <QuestionCircleOutlined className="text-xl cursor-pointer text-[#111438]" />
        </div>

        {/* Top Chart Card */}
        <div className="relative mb-4 overflow-hidden rounded-[24px] bg-gradient-to-br from-[#895BFF] to-[#6744FF] p-5 text-white shadow-[0_12px_30px_rgba(137,91,255,0.25)]">
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 rounded-xl bg-white/20 px-3 py-1.5 text-xs font-medium backdrop-blur-md">
              Tháng {dayjs().format("M/YYYY")}{" "}
              <ArrowDownOutlined className="text-[10px]" />
            </div>

            {/* Logic render % tăng giảm ở đây */}
            {monthlyReport && (
              <div
                className={`flex items-center gap-1 rounded-xl bg-white/20 px-3 py-1.5 text-xs font-medium backdrop-blur-md ${
                  isDecreaseTrend ? "text-red-200" : "text-green-200"
                }`}
              >
                {isDecreaseTrend ? (
                  <ArrowDownOutlined className="text-[10px]" />
                ) : (
                  <ArrowUpOutlined className="text-[10px]" />
                )}
                {diffPercentText} với tháng trước
              </div>
            )}
          </div>

          {/* SVG Line Chart Simulator */}
          <div className="relative z-10 mt-6 h-32 w-full">
            <svg
              viewBox="-10 0 320 110"
              className="h-full w-full overflow-visible"
              preserveAspectRatio="none"
            >
              <path
                d={pathD}
                fill="none"
                stroke="rgba(255,255,255,0.8)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Vẽ các điểm tròn */}
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={i === points.length - 1 ? "5" : "3"}
                  fill="white"
                  className={
                    i === points.length - 1
                      ? "stroke-[#895BFF] stroke-[3px]"
                      : ""
                  }
                />
              ))}

              {/* Bong bóng giá trị nằm ở điểm cuối cùng */}
              {points.length > 0 && (
                <g
                  transform={`translate(${Math.max(
                    0,
                    Math.min(230, points[points.length - 1].x - 45),
                  )}, ${Math.max(0, points[points.length - 1].y - 30)})`}
                >
                  <rect
                    x="0"
                    y="0"
                    width="90"
                    height="22"
                    rx="11"
                    fill="white"
                  />
                  <text
                    x="45"
                    y="15"
                    textAnchor="middle"
                    fill="#895BFF"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    {formatMoney(points[points.length - 1].val)}
                  </text>
                  <polygon points="40,22 50,22 45,26" fill="white" />
                </g>
              )}

              {/* Nhãn trục X (Tháng) */}
              <g
                fill="rgba(255,255,255,0.6)"
                fontSize="10"
                transform="translate(0, 105)"
              >
                {points.map((p, i) => (
                  <text key={i} x={p.x} textAnchor="middle">
                    {p.label}
                  </text>
                ))}
              </g>
            </svg>
          </div>
        </div>

        {/* Total Money Card */}
        <div className="mb-4 flex items-center justify-between rounded-[24px] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div>
            <div className="mb-1 flex items-center gap-2 text-[13px] font-medium text-gray-500">
              Tổng tiền tiết kiệm <EyeOutlined className="text-gray-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[28px] font-black text-[#111438]">
                {formatMoney(wallet?.balance || 0)}
              </span>
            </div>
          </div>
          <div className="relative flex h-24 w-24 items-center justify-center">
            <img src={ketsat} />
          </div>
        </div>
        
        {goals.length === 0 && (
          <div
            onClick={handleOpenCreateGoal}
            className="mb-4 cursor-pointer rounded-[24px] border border-dashed border-[#C9B8FF] bg-white p-5 text-center shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition active:scale-[0.98]"
          >
            <div className="mb-2 text-[28px]">🎯</div>
            <div className="text-[15px] font-black text-[#111438]">
              Chưa có mục tiêu tiết kiệm
            </div>
            <div className="mt-1 text-[12px] font-medium text-gray-400">
              Tạo mục tiêu đầu tiên để biết bạn còn bao nhiêu % nữa là hoàn
              thành
            </div>
            <div className="mt-4 inline-flex h-10 items-center justify-center rounded-[14px] bg-[#895BFF] px-4 text-[13px] font-bold text-white">
              Tạo mục tiêu ngay
            </div>
          </div>
        )}

        {/* Goal Progress Card */}
        {goals.map((goal) => {
          const currentAmount = wallet?.balance || 0;
          const percent =
            goal.targetAmount > 0
              ? Math.min(
                  Math.round((currentAmount / goal.targetAmount) * 100),
                  100,
                )
              : 0;

          return (
            <div
              key={goal.id}
              onClick={() => handleOpenEditGoal(goal)}
              className="mb-4 cursor-pointer rounded-[24px] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition active:scale-[0.98]"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#F4F1FF]">
                    <img src={muiten} className="ml-1" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-[13px] text-gray-500">
                      Mục tiêu:{" "}
                      <span className="font-bold text-[#895BFF]">
                        {goal.name}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[15px] font-black text-[#111438]">
                      {formatMoney(currentAmount)}{" "}
                      <span className="text-xs font-medium text-gray-400">
                        / {formatMoney(goal.targetAmount)}
                      </span>
                    </div>
                  </div>
                </div>
                <RightOutlined className="text-xs text-gray-400" />
              </div>
              <div className="flex items-center gap-3">
                <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-[#F0F2F5]">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#895BFF] to-[#6744FF] transition-all duration-500 ease-out"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="rounded-full bg-[#F4F1FF] px-3 py-1 text-xs font-bold text-[#895BFF]">
                  {percent}%
                </div>
              </div>
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => navigate("/savings/create")}
          className="mb-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[14px] border-none bg-[#895BFF] px-4 text-white shadow-[0_8px_22px_rgba(137,91,255,0.28)] transition active:scale-95"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
            <PlusOutlined className="text-[13px] text-white" />
          </span>

          <span className="inline-block whitespace-nowrap text-[13px] leading-none text-white">
            Giao dịch
          </span>
        </button>

        {/* Transaction History */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-[16px] font-black text-[#111438]">
              Lịch sử giao dịch
            </div>
            <div
              className="cursor-pointer text-[13px] font-medium text-[#895BFF]"
              onClick={() => navigate("/savings/transactions")}
            >
              Xem tất cả <RightOutlined className="text-[10px]" />
            </div>
          </div>

          {transactions.length === 0 && (
            <Empty description="Chưa có giao dịch tiết kiệm" />
          )}

          <div className="flex flex-col gap-3 rounded-[24px] bg-white p-3 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            {mappedTransactions.slice(0, 3).map((item) => {
              const isDeposit = item.type === "deposit";
              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/savings/${item.id}/edit`)}
                  className="flex cursor-pointer items-center justify-between rounded-[16px] p-2 transition hover:bg-[#F7F9FF]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                        isDeposit
                          ? "bg-[#ECFDF5] text-[#10B981]"
                          : "bg-[#F4F1FF] text-[#895BFF]"
                      }`}
                    >
                      {isDeposit ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-[#111438]">
                        {isDeposit ? "Gửi tiết kiệm" : "Rút tiền"}
                      </div>
                      <div className="mt-0.5 text-[12px] font-medium text-gray-400">
                        {dayjs(item.date).format("DD/MM/YYYY HH:mm")}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-[15px] font-black ${
                        isDeposit ? "text-[#10B981]" : "text-[#111438]"
                      }`}
                    >
                      {isDeposit ? "+" : "-"}
                      {formatMoney(item.amount)}
                    </div>
                    <div className="mt-0.5 text-[11px] font-medium text-gray-400">
                      Số dư: {formatMoney(item.balanceAfter)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative mb-6 flex items-center overflow-hidden rounded-[24px] bg-gradient-to-r from-[#F0EEFF] to-[#E5E9FF] p-4 shadow-sm">
          <div className="flex w-1/2 items-center justify-center">
            <img
              src={conlon}
              alt="saving pig"
              className="h-[130px] w-full object-contain"
            />
          </div>

          <div className="relative z-10 flex w-1/2 flex-col items-start justify-center pl-3">
            <div className="mb-1 text-[15px] font-black leading-snug text-[#111438]">
              Tiết kiệm hôm nay, vững vàng tương lai
            </div>

            <div className="mb-4 text-[12px] font-medium leading-snug text-[#4B5563]">
              Tương lai tài chính thảnh thơi, tự do hơn mỗi ngày!
            </div>

            <Button
              type="primary"
              className="h-9 rounded-xl border-none bg-[#895BFF] px-4 text-[12px] font-bold shadow-md hover:bg-[#7846E6]"
              onClick={() => navigate("/savings/create")}
            >
              Gửi thêm ngay <RightOutlined className="ml-1 text-[10px]" />
            </Button>
          </div>
        </div>
      </div>

      <SavingGoalModal
        open={goalModalOpen}
        currentUserId={currentUserId}
        editingGoal={editingGoal}
        onCancel={() => {
          setGoalModalOpen(false);
          setEditingGoal(null);
        }}
        onSuccess={handleGoalSuccess}
      />
    </div>
  );
}

export default SavingScreen;
