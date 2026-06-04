import React, { useEffect, useState } from "react";
import { message, Skeleton } from "antd";
import {
  BellOutlined,
  RightOutlined,
  WalletFilled,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

// Import từ base code của bạn
import { STORAGE_KEYS } from "../shared/constants/storageKeys";
import { formatMoney } from "../shared/utils/formatMoney";
import { getDashboardSummary } from "../features/dashboard/services/dashboardService";
import logo from "../assets/logo.png";

const formatCompactMoney = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(".0", "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(0) + "K";
  return num.toString();
};

const DashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const [pageLoading, setPageLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);

  const loadDashboard = async () => {
    try {
      if (!currentUserId) {
        message.error("Bạn cần đăng nhập lại");
        navigate("/login");
        return;
      }

      setPageLoading(true);

      const summaryData = await getDashboardSummary(currentUserId);
      setData(summaryData);
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Không thể tải dữ liệu",
      );
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [currentUserId, navigate]);

  if (pageLoading || !data) {
    return (
      <div className="min-h-screen bg-[#F7F9FF] p-5 flex flex-col gap-4">
        <Skeleton active avatar paragraph={{ rows: 2 }} />
        <Skeleton
          active
          title={false}
          paragraph={{ rows: 4 }}
          className="mt-4"
        />
      </div>
    );
  }

  const totalChart =
    data.totalIncomeThisMonth +
    data.totalExpenseThisMonth +
    data.totalDebtThisMonth;
  const incomePercent =
    totalChart > 0
      ? Math.round((data.totalIncomeThisMonth / totalChart) * 100)
      : 0;
  const debtPercent =
    totalChart > 0
      ? Math.round((data.totalDebtThisMonth / totalChart) * 100)
      : 0;
  const expensePercent =
    totalChart > 0
      ? Math.round((data.totalExpenseThisMonth / totalChart) * 100)
      : 0;

  const stop1 = incomePercent;
  const stop2 = incomePercent + debtPercent;

  const maxExpense =
    data.dailyExpenseChartData.length > 0
      ? Math.max(...data.dailyExpenseChartData.map((d) => d.amount))
      : 0;

  const getLabelPosition = (startPercent: number, endPercent: number) => {
    const midPercent = (startPercent + endPercent) / 2;

    const angle = (midPercent / 100) * 360 - 90;
    const rad = (angle * Math.PI) / 180;

    const radius = 58; // khoảng cách label từ tâm chart
    const center = 70; // vì chart 140px

    return {
      left: `${center + radius * Math.cos(rad)}px`,
      top: `${center + radius * Math.sin(rad)}px`,
      transform: "translate(-50%, -50%)",
    };
  };

  return (
    <div className="relative min-h-screen bg-[#F7F9FF] overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#E0E7FF] rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 opacity-70 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#F3E8FF] rounded-full blur-[80px] translate-x-1/3 -translate-y-1/3 opacity-70 pointer-events-none" />
      <div className="absolute top-24 left-16 text-[#B4B8FF] text-2xl pointer-events-none">
        ✦
      </div>
      <div className="absolute top-12 right-32 text-[#B4B8FF] text-xl pointer-events-none">
        ✦
      </div>

      <div className="relative z-10 px-5 pt-12 max-w-[760px] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div
            onClick={() => navigate("/landing")}
            className="flex items-center gap-2"
          >
            <img src={logo} className="h-[59px]" />
          </div>
          <div className="relative">
            <div className="w-10 h-10 mr-5 rounded-full bg-white/60 backdrop-blur-md flex items-center justify-center border border-white shadow-sm">
              <BellOutlined className="text-xl text-gray-700" />
            </div>
          </div>
        </div>
        {/* Top Summary Cards */}
        <div className="flex flex-col gap-3 mb-6">
          {/* Ví chi tiêu */}
          <div className="bg-white rounded-[24px] p-4 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-white">
            <div className="flex items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-[#F0EEFF] flex items-center justify-center text-[#895BFF]">
                <WalletFilled className="text-2xl" />
              </div>
              <div>
                <div className="text-[13px] text-gray-500 font-medium mb-1">
                  Tổng tiền hiện có trong {data.wallet.name}
                </div>
                <div className="text-[22px] font-bold text-[#111438]">
                  {formatMoney(data.wallet.balance)}
                </div>
              </div>
            </div>
          </div>

          {/* Tổng thu */}
          <div className="bg-white rounded-[24px] p-4 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-white">
            <div className="flex items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-[#E6F9EE] flex items-center justify-center text-[#22C55E]">
                <ArrowUpOutlined className="text-2xl rotate-45" />
              </div>
              <div>
                <div className="text-[13px] text-gray-500 font-medium mb-1">
                  Tổng thu tháng này
                </div>
                <div className="text-[22px] font-bold text-[#22C55E]">
                  {formatMoney(data.totalIncomeThisMonth)}
                </div>
              </div>
            </div>
          </div>

          {/* Tổng chi */}
          <div className="bg-white rounded-[24px] p-4 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FEECEC] flex items-center justify-center text-[#EF4444]">
                <ArrowDownOutlined className="text-2xl -rotate-45" />
              </div>
              <div>
                <div className="text-[13px] text-gray-500 font-medium mb-1">
                  Tổng chi tháng này
                </div>
                <div className="text-[22px] font-bold text-[#EF4444]">
                  {formatMoney(data.totalExpenseThisMonth)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Donut Chart Card */}
        <div className="bg-white rounded-[24px] p-5 mb-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
          <div className="text-[16px] font-bold text-[#111438] mb-5">
            Biểu đồ thu / chi / vay nợ
          </div>
          <div className="flex items-center justify-between">
            <div className="relative w-[140px] h-[140px]">
              {/* CSS Donut Chart */}
              <div
                className="w-full h-full rounded-full transition-all duration-500"
                style={{
                  background:
                    totalChart > 0
                      ? `conic-gradient(#4ADE80 0% ${stop1}%, #A78BFA ${stop1}% ${stop2}%, #FB7185 ${stop2}% 100%)`
                      : `#f3f4f6`,
                }}
              />

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90px] h-[90px] bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                <span className="text-[11px] text-gray-400">Tổng cộng</span>
                <span className="text-[13px] font-bold text-[#111438]">
                  {formatMoney(totalChart)}
                </span>
              </div>

              {/* Label động theo đúng vùng màu */}
              {incomePercent > 0 && (
                <span
                  className="absolute text-white text-[10px] font-bold drop-shadow-md pointer-events-none"
                  style={getLabelPosition(0, incomePercent)}
                >
                  {incomePercent}%
                </span>
              )}

              {debtPercent > 0 && (
                <span
                  className="absolute text-white text-[10px] font-bold drop-shadow-md pointer-events-none"
                  style={getLabelPosition(
                    incomePercent,
                    incomePercent + debtPercent,
                  )}
                >
                  {debtPercent}%
                </span>
              )}

              {expensePercent > 0 && (
                <span
                  className="absolute text-white text-[10px] font-bold drop-shadow-md pointer-events-none"
                  style={getLabelPosition(incomePercent + debtPercent, 100)}
                >
                  {expensePercent}%
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3 flex-1 ml-6">
              <div className="flex justify-between items-center text-[13px]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#4ADE80]"></div>
                  <span className="font-medium text-gray-700">Thu</span>
                </div>
                <span className="text-gray-500">
                  {formatMoney(data.totalIncomeThisMonth)}
                </span>
              </div>
              <div className="flex justify-between items-center text-[13px]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FB7185]"></div>
                  <span className="font-medium text-gray-700">Chi</span>
                </div>
                <span className="text-gray-500">
                  {formatMoney(data.totalExpenseThisMonth)}
                </span>
              </div>
              <div className="flex justify-between items-center text-[13px]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#A78BFA]"></div>
                  <span className="font-medium text-gray-700">Vay nợ</span>
                </div>
                <span className="text-gray-500">
                  {formatMoney(data.totalDebtThisMonth)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bar Chart Card */}
        <div className="bg-white rounded-[24px] p-5 mb-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
          <div className="text-[16px] font-bold text-[#111438] mb-6">
            Chi tiêu theo ngày trong tháng
          </div>
          <div className="relative h-40 flex items-end justify-between px-1">
            {/* Grid lines (Trục Y) */}
            <div className="absolute w-full h-full flex flex-col justify-between pointer-events-none border-b border-dashed border-gray-200 pb-6">
              {[maxExpense, maxExpense * 0.66, maxExpense * 0.33, 0].map(
                (val, idx) => (
                  <div key={idx} className="w-full flex items-center">
                    <span className="text-[11px] text-gray-400 w-8">
                      {formatCompactMoney(val)}
                    </span>
                    <div className="flex-1 border-b border-dashed border-gray-100"></div>
                  </div>
                ),
              )}
            </div>

            {/* Bars */}
            <div className="w-full h-full flex items-end justify-between px-8 pb-6 relative z-10">
              {data.dailyExpenseChartData.map((item, index) => {
                const heightPercent =
                  maxExpense > 0 ? (item.amount / maxExpense) * 100 : 0;
                const isMax = item.amount === maxExpense && maxExpense > 0;
                // Chỉ hiển thị nhãn ngày cho các mốc chính để đỡ rối
                const showDayLabel = [
                  "1",
                  "5",
                  "10",
                  "15",
                  "20",
                  "25",
                  "30",
                ].includes(item.day);

                return (
                  <div
                    key={index}
                    className="flex flex-col items-center justify-end h-full w-[10px] relative group"
                  >
                    {/* Tooltip hiển thị khi đây là cột max */}
                    {isMax && (
                      <div className="absolute -top-7 bg-[#895BFF] text-white text-[10px] px-2 py-0.5 rounded-md font-bold whitespace-nowrap z-20">
                        {formatCompactMoney(item.amount)}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-[#895BFF]"></div>
                      </div>
                    )}
                    <div
                      className="w-[8px] bg-[#895BFF] rounded-t-sm hover:bg-[#6C5CE7] transition-all cursor-pointer"
                      style={{
                        height: `${heightPercent}%`,
                        opacity: isMax ? 1 : 0.6,
                        minHeight: heightPercent > 0 ? "4px" : "0px",
                      }}
                    ></div>
                    {showDayLabel && (
                      <div className="absolute -bottom-6 text-[11px] text-gray-400">
                        {item.day}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Spending Categories */}
        <div className="flex flex-col gap-3 mb-6">
          {data.topExpenseThisWeek.length > 0 && (
            <div className="bg-white rounded-[20px] p-4 flex justify-between items-center shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                  style={{
                    backgroundColor: `${data.topExpenseThisWeek[0].categoryColor}15`,
                  }}
                >
                  {data.topExpenseThisWeek[0].categoryIcon}
                </div>
                <div>
                  <div className="text-[13px] text-gray-500 mb-0.5">
                    Chi tiêu nhiều nhất tuần
                  </div>
                  <div className="text-[16px] font-bold text-[#111438]">
                    {data.topExpenseThisWeek[0].categoryName}
                  </div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <div className="text-[15px] font-bold text-[#895BFF]">
                  {formatMoney(data.topExpenseThisWeek[0].amount)}
                </div>
                <div className="bg-[#F0EEFF] text-[#895BFF] text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                  {Math.round(
                    (data.topExpenseThisWeek[0].amount /
                      (data.totalExpenseThisMonth || 1)) *
                      100,
                  )}
                  % tổng chi
                </div>
              </div>
            </div>
          )}

          {data.topExpenseThisMonth.length > 0 && (
            <div className="bg-white rounded-[20px] p-4 flex justify-between items-center shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                  style={{
                    backgroundColor: `${data.topExpenseThisMonth[0].categoryColor}15`,
                  }}
                >
                  {data.topExpenseThisMonth[0].categoryIcon}
                </div>
                <div>
                  <div className="text-[13px] text-gray-500 mb-0.5">
                    Chi nhiều nhất tháng
                  </div>
                  <div className="text-[16px] font-bold text-[#111438]">
                    {data.topExpenseThisMonth[0].categoryName}
                  </div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <div className="text-[15px] font-bold text-[#895BFF]">
                  {formatMoney(data.topExpenseThisMonth[0].amount)}
                </div>
                <div className="bg-[#F0EEFF] text-[#895BFF] text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                  {Math.round(
                    (data.topExpenseThisMonth[0].amount /
                      (data.totalExpenseThisMonth || 1)) *
                      100,
                  )}
                  % tổng chi
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
          <div className="flex justify-between items-center mb-5">
            <div className="text-[16px] font-bold text-[#111438]">
              Giao dịch gần đây
            </div>
            <div className="text-[13px] font-semibold text-[#895BFF] cursor-pointer hover:underline">
              Xem tất cả
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {data.recentTransactions.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-4">
                Chưa có giao dịch nào
              </div>
            )}
            {[...data.recentTransactions]
              .sort((a: any, b: any) => {
                const timeA = new Date(a.createdAt).getTime();
                const timeB = new Date(b.createdAt).getTime();

                return timeB - timeA;
              })
              .slice(0, 3)
              .map((tx: any) => {
                const txDate = dayjs(tx.date).format("DD/MM/YYYY");
                const isIncome = tx.type === "income";

                return (
                  <div
                    key={tx.id}
                    onClick={() => navigate(`/transactions/${tx.id}/edit`)}
                    className="flex cursor-pointer items-center justify-between rounded-2xl px-2 py-3 border-b border-gray-100 last:border-0 last:pb-3 hover:bg-[#F7F8FF] transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                        style={{
                          backgroundColor: `${tx.category?.color || "#895BFF"}15`,
                        }}
                      >
                        {tx.category?.icon || "✨"}
                      </div>

                      <div>
                        <div className="font-bold text-[#111438] text-[14px]">
                          {tx.note || tx.category?.name || "Giao dịch"}
                        </div>
                        <div className="text-[12px] text-gray-400 mt-0.5">
                          {tx.category?.name || "Không rõ nhóm"}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[12px] text-gray-400 mb-0.5">
                        {txDate}
                      </div>
                      <div
                        className="font-bold text-[14px]"
                        style={{ color: isIncome ? "#22C55E" : "#EF4444" }}
                      >
                        {isIncome ? "+" : "-"}
                        {formatMoney(tx.amount)}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
