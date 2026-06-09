import { useEffect, useMemo, useState } from "react";
import { Button, Empty, Skeleton, message } from "antd";
import {
  ArrowLeftOutlined,
  BarChartOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import { STORAGE_KEYS } from "../shared/constants/storageKeys";
import { formatMoney } from "../shared/utils/formatMoney";
import {
  getSalaryStatistic,
  type SalaryMonthlyChartItem,
} from "../features/salary/services/salaryStatisticService";
import { getSalaryRecords } from "../features/salary/services/salaryListService";
import type { SalaryRecord } from "../database/db";
import {
  getSalaryTypeColor,
  getSalaryTypeIcon,
  getSalaryTypeLabel,
} from "../features/salary/types";

function SalaryScreen() {
  const navigate = useNavigate();

  const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);

  const [loading, setLoading] = useState(true);
  const [statistic, setStatistic] = useState<any>(null);
  const [recentRecords, setRecentRecords] = useState<SalaryRecord[]>([]);

  const currentYear = dayjs().format("YYYY");
  const currentMonth = dayjs().format("YYYY-MM");

  useEffect(() => {
    loadSalaryPage();
  }, [currentUserId]);

  const loadSalaryPage = async () => {
    try {
      if (!currentUserId) {
        message.error("Bạn cần đăng nhập lại");
        navigate("/login");
        return;
      }

      setLoading(true);

      const statisticData = await getSalaryStatistic({
        userId: currentUserId,
        mode: "year",
        year: currentYear,
        fromMonth: `${currentYear}-01`,
        toMonth: `${currentYear}-12`,
      });

      const records = await getSalaryRecords({
        userId: currentUserId,
        type: "all",
      });

      setStatistic(statisticData);
      setRecentRecords(records.slice(0, 5));
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Không thể tải ví lương",
      );
    } finally {
      setLoading(false);
    }
  };

  const salaryThisMonth = useMemo(() => {
    if (!statistic?.records) return 0;

    return statistic.records
      .filter((item: SalaryRecord) => item.month === currentMonth)
      .reduce((total: number, item: SalaryRecord) => total + item.amount, 0);
  }, [statistic, currentMonth]);

  const maxChartValue = useMemo(() => {
    if (!statistic?.chartData?.length) return 1;

    return Math.max(
      ...statistic.chartData.map((item: SalaryMonthlyChartItem) => item.total),
      1,
    );
  }, [statistic]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FF] p-5">
        <Skeleton active avatar paragraph={{ rows: 8 }} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#F7F9FF] px-5 py-8 pb-32 font-sans">
      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#DCFCE7] opacity-70 blur-[80px]" />
      <div className="pointer-events-none absolute right-0 top-20 h-80 w-80 translate-x-1/3 rounded-full bg-[#F3E8FF] opacity-70 blur-[80px]" />

      <div className="relative z-10 mx-auto max-w-[760px]">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/account")}
            className="flex h-10 w-10 items-center justify-center rounded-full border-none bg-white text-[#111438] shadow-sm"
          >
            <ArrowLeftOutlined />
          </button>

          <div className="text-center">
            <h1 className="m-0 text-lg font-black text-[#111438]">Ví lương</h1>
            <div className="mt-1 text-xs font-medium text-gray-400">
              Lương, thưởng và hoàn thuế
            </div>
          </div>

          <button
            onClick={() => navigate("/salary/search")}
            className="flex h-10 w-10 items-center justify-center rounded-full border-none bg-white text-[#111438] shadow-sm"
          >
            <SearchOutlined />
          </button>
        </div>

        <div className="mb-5 rounded-[30px] bg-gradient-to-br from-[#22C55E] to-[#895BFF] p-5 text-white shadow-[0_16px_40px_rgba(34,197,94,0.22)]">
          <div className="mb-2 text-sm font-semibold opacity-85">
            Tổng thu nhập năm {currentYear}
          </div>

          <div className="break-words text-[32px] font-black leading-tight">
            {formatMoney(statistic?.totalIncome || 0)}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-md">
              <div className="text-xs font-medium opacity-80">Tháng này</div>
              <div className="mt-1 break-words text-[16px] font-black">
                {formatMoney(salaryThisMonth)}
              </div>
            </div>

            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-md">
              <div className="text-xs font-medium opacity-80">
                Trung bình/tháng
              </div>
              <div className="mt-1 break-words text-[16px] font-black">
                {formatMoney(statistic?.averagePerMonth || 0)}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-3">
          <SalarySummaryCard
            title="Lương"
            value={statistic?.totalSalary || 0}
            icon="💵"
            color="#22C55E"
          />

          <SalarySummaryCard
            title="Thưởng"
            value={statistic?.totalBonus || 0}
            icon="🎁"
            color="#895BFF"
          />

          <SalarySummaryCard
            title="Hoàn thuế"
            value={statistic?.totalTaxRefund || 0}
            icon="🧾"
            color="#F59E0B"
          />
        </div>

        <div className="mb-5 rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-[16px] font-black text-[#111438]">
                Biểu đồ thu nhập
              </div>
              <div className="text-xs font-medium text-gray-400">
                Theo từng tháng trong năm {currentYear}
              </div>
            </div>

            <BarChartOutlined className="text-xl text-[#22C55E]" />
          </div>

          <div className="relative h-48 rounded-2xl bg-[#FAFAFF] px-3 pb-9 pt-4">
            <div className="flex h-full items-end justify-between gap-2">
              {(statistic?.chartData || []).map(
                (item: SalaryMonthlyChartItem) => {
                  const heightPercent = (item.total / maxChartValue) * 100;
                  const monthLabel = dayjs(`${item.month}-01`).format("M");

                  return (
                    <div
                      key={item.month}
                      className="relative flex h-full flex-1 flex-col items-center justify-end"
                    >
                      <div
                        className="w-full max-w-[12px] rounded-t-full bg-[#22C55E]/75 transition-all"
                        style={{
                          height: `${heightPercent}%`,
                          minHeight: item.total > 0 ? 6 : 0,
                        }}
                        title={formatMoney(item.total)}
                      />

                      <div className="absolute -bottom-6 text-[10px] font-medium text-gray-400">
                        T{monthLabel}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>

          {statistic?.highestMonth?.total > 0 && (
            <div className="mt-4 rounded-2xl bg-[#F0FDF4] p-3 text-sm">
              <span className="font-bold text-[#15803D]">Tháng cao nhất: </span>
              <span className="font-black text-[#111438]">
                {dayjs(`${statistic.highestMonth.month}-01`).format("MM/YYYY")}{" "}
                · {formatMoney(statistic.highestMonth.total)}
              </span>
            </div>
          )}
        </div>

        <div className="mb-5 rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-[16px] font-black text-[#111438]">
                Lịch sử gần đây
              </div>
              <div className="text-xs font-medium text-gray-400">
                Các khoản lương, thưởng, hoàn thuế mới nhất
              </div>
            </div>

            <div
              onClick={() => navigate("/salary/search")}
              className="cursor-pointer text-[13px] font-bold text-[#895BFF]"
            >
              Xem tất cả
            </div>
          </div>

          {recentRecords.length === 0 ? (
            <Empty description="Chưa có dữ liệu lương" />
          ) : (
            <div className="flex flex-col gap-3">
              {recentRecords.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/salary/${item.id}/edit`)}
                  className="flex cursor-pointer items-center justify-between rounded-2xl bg-[#FAFAFF] p-3 transition hover:bg-[#F0EEFF]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-full text-lg"
                      style={{
                        backgroundColor: `${getSalaryTypeColor(item.type)}18`,
                      }}
                    >
                      {getSalaryTypeIcon(item.type)}
                    </div>

                    <div>
                      <div className="text-[14px] font-bold text-[#111438]">
                        {getSalaryTypeLabel(item.type)}
                      </div>

                      <div className="mt-0.5 text-xs text-gray-400">
                        {dayjs(item.receivedDate).format("DD/MM/YYYY")} ·{" "}
                        {item.company || "Không có công ty"}
                      </div>

                      {item.note && (
                        <div className="mt-0.5 max-w-[180px] truncate text-xs text-gray-400">
                          {item.note}
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className="whitespace-nowrap text-[14px] font-black"
                    style={{ color: getSalaryTypeColor(item.type) }}
                  >
                    +{formatMoney(item.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            icon={<BarChartOutlined />}
            onClick={() => navigate("/salary/statistics")}
            className="h-12 rounded-[18px] border-none bg-white font-black text-[#111438] shadow-[0_8px_30px_rgba(0,0,0,0.03)]"
          >
            Thống kê
          </Button>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/salary/create")}
            className="h-12 rounded-[18px] border-none bg-[#22C55E] font-black shadow-[0_8px_22px_rgba(34,197,94,0.28)]"
          >
            Thêm khoản
          </Button>
        </div>
      </div>
    </div>
  );
}

function SalarySummaryCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
}) {
  return (
    <div className="min-w-0 rounded-[22px] bg-white p-3 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
      <div
        className="mb-2 flex h-9 w-9 items-center justify-center rounded-2xl text-base"
        style={{
          backgroundColor: `${color}18`,
        }}
      >
        {icon}
      </div>

      <div className="mb-1 text-[11px] font-semibold text-gray-400">
        {title}
      </div>

      <div
        className="break-words text-[13px] font-black leading-tight"
        style={{ color }}
      >
        {formatMoney(value)}
      </div>
    </div>
  );
}

export default SalaryScreen;