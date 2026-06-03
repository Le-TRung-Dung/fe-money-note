import { useEffect, useState } from "react";
import { Button, Empty, Progress, Skeleton, message } from "antd";
import {
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowUpOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import { STORAGE_KEYS } from "../shared/constants/storageKeys";
import { formatMoney } from "../shared/utils/formatMoney";
import { ensureDefaultDataForUser } from "../database/seed";
import type { SavingGoal, SavingTransaction, Wallet } from "../database/db";
import {
  getSavingTransactions,
  getSavingWalletByUser,
} from "../features/savings/services/savingService";
import { getSavingGoalsByUser } from "../features/savings/services/savingGoalService";
import SavingGoalModal from "../Modal/SavingGoalModal";
import { getSavingMonthlyReport, type SavingMonthlyReport } from "../features/savings/services/savingReportService";

const formatCompactMoney = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(".0", "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(0) + "K";
  return num.toString();
};

function SavingScreen() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<SavingTransaction[]>([]);
  console.log(transactions)


  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingGoal | null>(null);
  const [monthlyReport, setMonthlyReport] = useState<SavingMonthlyReport | null>(
  null
);

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
                <Skeleton active paragraph={{ rows: 6 }} />     {" "}
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

  return (
    <div className="min-h-screen bg-[#F7F9FF] px-5 py-8 pb-28">
      {monthlyReport && (
        <div className="mb-6 rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-[16px] font-bold text-[#111438]">
                Báo cáo tiết kiệm theo tháng
              </div>
              <div className="text-xs text-gray-400">
                So sánh số tiền tiết kiệm ròng giữa các tháng
              </div>
            </div>

            <div
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                monthlyReport.trend === "increase"
                  ? "bg-[#ECFDF5] text-[#16A34A]"
                  : monthlyReport.trend === "decrease"
                    ? "bg-[#FEF2F2] text-[#EF4444]"
                    : "bg-[#F3F4F6] text-gray-500"
              }`}
            >
              {monthlyReport.trend === "increase"
                ? "Tăng"
                : monthlyReport.trend === "decrease"
                  ? "Giảm"
                  : "Không đổi"}
            </div>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[#F7F8FF] p-4">
              <div className="text-xs font-medium text-gray-400">Tháng này</div>
              <div className="mt-1 text-[20px] font-black text-[#111438]">
                {formatMoney(monthlyReport.currentMonth.netAmount)}
              </div>
              <div className="mt-1 text-xs text-gray-400">
                {monthlyReport.currentMonth.monthLabel}
              </div>
            </div>

            <div className="rounded-2xl bg-[#F7F8FF] p-4">
              <div className="text-xs font-medium text-gray-400">
                Tháng trước
              </div>
              <div className="mt-1 text-[20px] font-black text-[#111438]">
                {monthlyReport.previousMonth
                  ? formatMoney(monthlyReport.previousMonth.netAmount)
                  : formatMoney(0)}
              </div>
              <div className="mt-1 text-xs text-gray-400">
                {monthlyReport.previousMonth?.monthLabel || "Chưa có dữ liệu"}
              </div>
            </div>
          </div>

          <div className="mb-5 rounded-2xl bg-[#FAFAFF] p-4">
            <div className="text-xs font-medium text-gray-400">
              So với tháng trước
            </div>

            <div
              className={`mt-1 text-[22px] font-black ${
                monthlyReport.diffAmount > 0
                  ? "text-[#16A34A]"
                  : monthlyReport.diffAmount < 0
                    ? "text-[#EF4444]"
                    : "text-[#111438]"
              }`}
            >
              {monthlyReport.diffAmount > 0 ? "+" : ""}
              {formatMoney(monthlyReport.diffAmount)}
            </div>

            <div className="mt-1 text-xs text-gray-400">
              {monthlyReport.diffPercent === null
                ? "Tháng trước chưa có số liệu để tính phần trăm"
                : `${monthlyReport.diffAmount > 0 ? "Tăng" : "Giảm"} ${Math.abs(
                    monthlyReport.diffPercent,
                  )}% so với tháng trước`}
            </div>
          </div>

          <div className="relative h-44 rounded-2xl bg-[#FAFAFF] px-3 pb-8 pt-4">
            <div className="absolute left-3 top-3 text-xs font-semibold text-gray-400">
              6 tháng gần nhất
            </div>

            <div className="flex h-full items-end justify-between gap-2 pt-8">
              {monthlyReport.monthlyData.map((item) => {
                const maxValue = Math.max(
                  ...monthlyReport.monthlyData.map((month) =>
                    Math.abs(month.netAmount),
                  ),
                  1,
                );

                const heightPercent = Math.min(
                  (Math.abs(item.netAmount) / maxValue) * 100,
                  100,
                );

                const isCurrentMonth =
                  item.month === monthlyReport.currentMonth.month;

                return (
                  <div
                    key={item.month}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                  >
                    <div className="relative flex h-full w-full items-end justify-center">
                      {item.netAmount !== 0 && (
                        <div className="absolute -top-5 whitespace-nowrap text-[10px] font-bold text-[#895BFF]">
                          {formatCompactMoney(Math.abs(item.netAmount))}
                        </div>
                      )}

                      <div
                        className={`w-full max-w-[28px] rounded-t-xl transition-all ${
                          item.netAmount >= 0 ? "bg-[#895BFF]" : "bg-[#EF4444]"
                        } ${isCurrentMonth ? "opacity-100" : "opacity-60"}`}
                        style={{
                          height: `${heightPercent}%`,
                          minHeight: item.netAmount !== 0 ? 8 : 0,
                        }}
                      />
                    </div>

                    <div
                      className={`text-[10px] font-bold ${
                        isCurrentMonth ? "text-[#895BFF]" : "text-gray-400"
                      }`}
                    >
                      {item.monthLabel.slice(0, 2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
           {" "}
      <div className="mx-auto max-w-[760px]">
               {" "}
        <div className="mb-5 flex items-center justify-between">
                   {" "}
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/dashboard")}
          >
                        Quay lại          {" "}
          </Button>
                   {" "}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/savings/create")}
          >
                        Thêm          {" "}
          </Button>
                 {" "}
        </div>
               {" "}
        <div className="mb-5">
                   {" "}
          <div className="text-[24px] font-black text-[#111438]">
                        Ví tiết kiệm          {" "}
          </div>
                   {" "}
          <div className="text-sm text-gray-500">
                        Theo dõi tiền tiết kiệm riêng, không ảnh hưởng ví chi
            tiêu          {" "}
          </div>
                 {" "}
        </div>
               {" "}
        <div className="mb-6 rounded-[28px] bg-gradient-to-br from-[#895BFF] to-[#5B62FF] p-6 text-white shadow-[0_18px_40px_rgba(91,98,255,0.25)]">
                   {" "}
          <div className="text-sm opacity-80">Tổng tiền tiết kiệm</div>         {" "}
          <div className="mt-2 text-[32px] font-black">
                        {formatMoney(wallet?.balance || 0)}         {" "}
          </div>
                   {" "}
          <div className="mt-2 text-sm opacity-80">
                        {wallet?.name || "Ví tiết kiệm"}         {" "}
          </div>
                 {" "}
        </div>
               {" "}
        <div className="mb-6 rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
                   {" "}
          <div className="mb-5 flex items-center justify-between">
                       {" "}
            <div>
                           {" "}
              <div className="text-[16px] font-bold text-[#111438]">
                                Mục tiêu tiết kiệm              {" "}
              </div>
                           {" "}
              <div className="text-xs text-gray-400">
                                Theo dõi tiến độ để có động lực tiết kiệm hơn  
                           {" "}
              </div>
                         {" "}
            </div>
                       {" "}
            <Button type="primary" onClick={handleOpenCreateGoal}>
                            + Tạo mục tiêu            {" "}
            </Button>
                     {" "}
          </div>
                   {" "}
          {goals.length === 0 && (
            <Empty description="Chưa có mục tiêu tiết kiệm" />
          )}
                   {" "}
          <div className="flex flex-col gap-4">
                       {" "}
            {goals.map((goal) => {
              const currentAmount = wallet?.balance || 0;

              const percent =
                goal.targetAmount > 0
                  ? Math.min(
                      Math.round((currentAmount / goal.targetAmount) * 100),
                      100,
                    )
                  : 0;

              const remainingAmount = Math.max(
                goal.targetAmount - currentAmount,
                0,
              );
              const isCompleted = percent >= 100;

              return (
                <div
                  key={goal.id}
                  onClick={() => handleOpenEditGoal(goal)}
                  className="cursor-pointer rounded-[22px] border border-[#EEF0FF] bg-[#FAFAFF] p-4 transition hover:bg-[#F7F8FF]"
                >
                                   {" "}
                  <div className="mb-3 flex items-start justify-between gap-3">
                                       {" "}
                    <div className="flex items-center gap-3">
                                           {" "}
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                        style={{
                          backgroundColor: `${goal.color || "#895BFF"}18`,
                        }}
                      >
                                                {goal.icon || "🎯"}             
                               {" "}
                      </div>
                                           {" "}
                      <div>
                                               {" "}
                        <div className="font-black text-[#111438]">
                                                    {goal.name}                 
                               {" "}
                        </div>
                                               {" "}
                        <div className="mt-0.5 text-xs text-gray-400">
                                                    Mục tiêu:{" "}
                          {formatMoney(goal.targetAmount)}                     
                           {" "}
                        </div>
                                             {" "}
                      </div>
                                         {" "}
                    </div>
                                       {" "}
                    <div
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        isCompleted
                          ? "bg-[#ECFDF5] text-[#16A34A]"
                          : "bg-[#F0EEFF] text-[#895BFF]"
                      }`}
                    >
                                           {" "}
                      {isCompleted ? "Hoàn thành" : `${percent}%`}             
                           {" "}
                    </div>
                                     {" "}
                  </div>
                                   {" "}
                  <Progress
                    percent={percent}
                    showInfo={false}
                    strokeColor={isCompleted ? "#22C55E" : "#895BFF"}
                    trailColor="#EEF0FF"
                  />
                                   {" "}
                  <div className="mt-3 grid grid-cols-2 gap-3">
                                       {" "}
                    <div className="rounded-2xl bg-white p-3">
                                           {" "}
                      <div className="text-xs text-gray-400">Đã có</div>       
                                   {" "}
                      <div className="mt-1 font-black text-[#111438]">
                                                {formatMoney(currentAmount)}   
                                         {" "}
                      </div>
                                         {" "}
                    </div>
                                       {" "}
                    <div className="rounded-2xl bg-white p-3">
                                           {" "}
                      <div className="text-xs text-gray-400">
                                               {" "}
                        {isCompleted ? "Vượt mục tiêu" : "Còn thiếu"}           
                                 {" "}
                      </div>
                                           {" "}
                      <div
                        className={`mt-1 font-black ${
                          isCompleted ? "text-[#16A34A]" : "text-[#EF4444]"
                        }`}
                      >
                                               {" "}
                        {isCompleted
                          ? formatMoney(currentAmount - goal.targetAmount)
                          : formatMoney(remainingAmount)}
                                             {" "}
                      </div>
                                         {" "}
                    </div>
                                     {" "}
                  </div>
                                   {" "}
                  {goal.deadline && (
                    <div className="mt-3 text-xs font-medium text-gray-400">
                                            Hạn mong muốn:{" "}
                      {dayjs(goal.deadline).format("DD/MM/YYYY")}               
                         {" "}
                    </div>
                  )}
                  {goal.description && (
                    <div className="mt-2 text-sm text-gray-500">
                      {goal.description}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
          <div className="mb-5 text-[16px] font-bold text-[#111438]">
            Lịch sử tiết kiệm
          </div>
          {transactions.length === 0 && (
            <Empty description="Chưa có giao dịch tiết kiệm" />
          )}
          <div className="flex flex-col gap-3">
            {transactions.map((item) => {
              const isDeposit = item.type === "deposit";

              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/savings/${item.id}/edit`)}
                  className="flex cursor-pointer items-center justify-between rounded-2xl border-b border-gray-100 px-2 py-3 transition hover:bg-[#F7F8FF] last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-full text-lg ${
                        isDeposit
                          ? "bg-[#ECFDF5] text-[#22C55E]"
                          : "bg-[#FEF2F2] text-[#EF4444]"
                      }`}
                    >
                      {isDeposit ? <ArrowUpOutlined /> : <ArrowDownOutlined />} 
                    </div>
                    <div>
                      <div className="text-[#111438]">
                          {isDeposit ? "Gửi tiết kiệm" : "Rút tiết kiệm"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {dayjs(item.date).format("DD/MM/YYYY")}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`font-black ${
                      isDeposit ? "text-[#22C55E]" : "text-[#EF4444]"
                    }`}
                  >
                    {isDeposit ? "+" : "-"} {formatMoney(item?.amount)}
                  </div>
                </div>
              );
            })}
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
