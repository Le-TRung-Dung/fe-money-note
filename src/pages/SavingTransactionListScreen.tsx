import { useEffect, useMemo, useState } from "react";
import { Empty, Skeleton, message } from "antd";
import {
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowUpOutlined,
  FilterOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import { STORAGE_KEYS } from "../shared/constants/storageKeys";
import { formatMoney } from "../shared/utils/formatMoney";
import type { SavingTransaction } from "../database/db";
import type {
  SavingDateRange,
  SavingTypeFilter,
} from "../features/savings/services/savingListService";
import { getSavingTransactionListData } from "../features/savings/services/savingListService";
import vi from "../assets/vi.png";
import { rangeOptions } from "../shared/constants/options";
import { SavingFilterModal } from "../Modal/SavingFilterModal";

function SavingTransactionListScreen() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [range, setRange] = useState<SavingDateRange>("last30days");
  const [type, setType] = useState<SavingTypeFilter>("all");
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format("YYYY-MM"));
  const [selectedYear, setSelectedYear] = useState(dayjs().format("YYYY"));

  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState<SavingTransaction[]>([]);

  const [totalDeposit, setTotalDeposit] = useState(0);
  const [totalWithdraw, setTotalWithdraw] = useState(0);

  const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);

  useEffect(() => {
    loadData();
  }, [range, type, selectedMonth, selectedYear]);

  const loadData = async () => {
    try {
      if (!currentUserId) {
        message.error("Bạn cần đăng nhập lại");
        navigate("/login");
        return;
      }

      setLoading(true);

      const data = await getSavingTransactionListData({
        userId: currentUserId,
        range,
        type,
        selectedMonth,
        selectedYear,
      });

      setWalletBalance(data.wallet?.balance || 0);
      setTransactions(data.transactions);
      setTotalDeposit(data.totalDepositInRange);
      setTotalWithdraw(data.totalWithdrawInRange);
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : "Không thể tải giao dịch tiết kiệm",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = (filters: {
    range: SavingDateRange;
    type: SavingTypeFilter;
    selectedMonth: string;
    selectedYear: string;
  }) => {
    setRange(filters.range);
    setType(filters.type);
    setSelectedMonth(filters.selectedMonth);
    setSelectedYear(filters.selectedYear);
    setIsFilterModalOpen(false);
  };

  const groupedTransactions = useMemo(() => {
    return transactions.reduce<Record<string, SavingTransaction[]>>(
      (result, item) => {
        if (!result[item.date]) {
          result[item.date] = [];
        }

        result[item.date].push(item);

        return result;
      },
      {},
    );
  }, [transactions]);

  const groupDates = Object.keys(groupedTransactions).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  const currentRangeLabel = useMemo(() => {
    if (range === "customMonth") {
      return `Tháng ${dayjs(`${selectedMonth}-01`).format("MM/YYYY")}`;
    }

    if (range === "customYear") {
      return `Năm ${selectedYear}`;
    }

    return (
      rangeOptions.find((item) => item.value === range)?.label || "30 ngày"
    );
  }, [range, selectedMonth, selectedYear]);

  if (loading) {
    return (
      <div className="bg-[#F7F9FF] p-5 pt-8">
        <Skeleton active avatar paragraph={{ rows: 8 }} />
      </div>
    );
  }

  return (
    <div className="bg-[#F7F9FF] font-sans">
      <div className="pointer-events-none fixed left-0 top-0 z-0 h-64 w-64 -translate-x-1/3 -translate-y-1/3 rounded-full bg-[#E0E7FF] opacity-70 blur-[80px]" />
      <div className="pointer-events-none fixed right-0 top-20 z-0 h-72 w-72 translate-x-1/3 rounded-full bg-[#F3E8FF] opacity-60 blur-[80px]" />

      <div className="sticky top-0 z-20 bg-[#F7F9FF]/80 px-5 pb-3 pt-8 backdrop-blur-md shadow-[0_4px_10px_-4px_rgba(0,0,0,0.05)]">
        <div className="mx-auto max-w-[760px] flex items-center justify-between">
          <ArrowLeftOutlined
            className="cursor-pointer text-xl text-[#111438]"
            onClick={() => navigate("/savings")}
          />
          <h1 className="m-0 text-lg font-black text-[#111438]">
            Lịch sử tiết kiệm
          </h1>
          <QuestionCircleOutlined className="cursor-pointer text-xl text-[#111438]" />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[760px] px-5 pb-6 pt-5">
        {/* Balance */}
        <div className="mb-5 rounded-[28px] border border-white bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
          <div className="flex items-start justify-between">
            <div className="ml-3">
              <div className="mb-1 text-[14px] font-semibold text-gray-500">
                Tổng tiền tiết kiệm
              </div>

              <div className="text-[25px] font-black text-[#111438]">
                {formatMoney(walletBalance)}
              </div>

              <div className="mt-2 text-[12px] font-semibold text-gray-400">
                Danh sách đang lọc: {currentRangeLabel}
              </div>
            </div>

            <img src={vi} className="h-20" alt="icon" />
          </div>
        </div>

        {/* Summary */}
        <div className="mb-5 grid grid-cols-2 gap-2">
          <SummaryBox label="Đã gửi" value={totalDeposit} color="#22C55E" />
          <SummaryBox label="Đã rút" value={totalWithdraw} color="#EF4444" />
        </div>

        {/* Search + Filter */}
        <div className="mb-6 mt-6 flex gap-3">
          <div
            onClick={() => navigate("/savings/transactions/search")}
            className="flex flex-1 cursor-pointer items-center gap-3 rounded-2xl border border-gray-50 bg-white px-3 py-2 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition hover:bg-gray-50"
          >
            <SearchOutlined className="text-lg text-gray-400" />
            <span className="text-[14px] font-medium text-gray-400">
              Tìm ghi chú tiết kiệm...
            </span>
          </div>

          <div
            onClick={() => setIsFilterModalOpen(true)}
            className="flex cursor-pointer items-center gap-2 rounded-2xl border border-gray-50 bg-white px-3 py-2 font-bold text-gray-700 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition hover:bg-gray-50"
          >
            <FilterOutlined /> Lọc
          </div>
        </div>

        {/* List */}
        {transactions.length === 0 ? (
          <div className="rounded-[28px] bg-white p-10 text-center shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
            <Empty description="Không có giao dịch tiết kiệm nào" />
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {groupDates.map((date) => {
              const items = groupedTransactions[date];

              const dayTotal = items.reduce((sum, item) => {
                if (item.type === "deposit") return sum + item.amount;
                return sum - item.amount;
              }, 0);

              const isPositive = dayTotal >= 0;

              return (
                <div
                  key={date}
                  className="rounded-[24px] bg-white p-3 shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
                >
                  <div className="mb-4 flex items-center justify-between border-b border-gray-50 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[15px] font-black text-[#111438]">
                        {getDateLabel(date)}
                      </span>

                      <span className="text-[12px] font-medium text-gray-400">
                        {items.length} giao dịch
                      </span>
                    </div>

                    <div className="text-[13px] font-semibold text-gray-500">
                      Tổng {isPositive ? "gửi" : "rút"}:{" "}
                      <span
                        className={
                          isPositive ? "text-[#22C55E]" : "text-[#EF4444] ml-1"
                        }
                      >
                        {isPositive ? "+" : ""}
                        {formatMoney(dayTotal)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    {items.map((tx) => (
                      <SavingTransactionItem
                        key={tx.id}
                        tx={tx}
                        onClick={() => navigate(`/savings/${tx.id}/edit`)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <SavingFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilter}
        currentRange={range}
        currentType={type}
        currentSelectedMonth={selectedMonth}
        currentSelectedYear={selectedYear}
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #E5E7EB;
          border-radius: 4px;
        }

        .custom-modal .ant-picker {
          border-color: #E5E7EB;
        }

        .custom-modal .ant-picker-focused {
          border-color: #895BFF;
          box-shadow: 0 0 0 2px rgba(137,91,255,0.1);
        }
      `}</style>
    </div>
  );
}

// Giữ nguyên các sub-component Helper phía bên dưới
function SummaryBox({
  label,
  value,
  color,
  prefix = "",
}: {
  label: string;
  value: number;
  color: string;
  prefix?: string;
}) {
  return (
    <div className="rounded-[20px] bg-white px-3 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
      <div className="mb-1 text-[12px] font-semibold text-gray-400">
        {label}
      </div>

      <div className="truncate text-[14px] font-black" style={{ color }}>
        {prefix}
        {formatMoney(value)}
      </div>
    </div>
  );
}

function SavingTransactionItem({
  tx,
  onClick,
}: {
  tx: SavingTransaction;
  onClick: () => void;
}) {
  const isDeposit = tx.type === "deposit";

  const color = isDeposit ? "#22C55E" : "#EF4444";
  const prefix = isDeposit ? "+" : "-";

  return (
    <div
      onClick={onClick}
      className="group flex cursor-pointer items-center justify-between rounded-xl p-1 transition-colors hover:bg-gray-50/50"
    >
      <div className="flex w-[70%] items-center gap-3">
        <div
          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full text-[18px]"
          style={{
            backgroundColor: `${color}15`,
            color,
          }}
        >
          {isDeposit ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
        </div>

        <div className="truncate">
          <div className="truncate text-[15px] font-bold text-[#111438]">
            {tx.note || (isDeposit ? "Gửi tiết kiệm" : "Rút tiết kiệm")}
          </div>

          {tx.description && (
            <div className="mt-0.5 truncate text-[12px] font-medium text-gray-400">
              {tx.description}
            </div>
          )}
        </div>
      </div>

      <div className="flex w-[30%] items-center justify-end">
        <div
          className="whitespace-nowrap text-[15px] font-black"
          style={{ color }}
        >
          {prefix}
          {formatMoney(tx.amount)}
        </div>
      </div>
    </div>
  );
}

function getDateLabel(date: string) {
  if (dayjs(date).isSame(dayjs(), "day")) {
    return "Hôm nay";
  }

  if (dayjs(date).isSame(dayjs().subtract(1, "day"), "day")) {
    return "Hôm qua";
  }

  return dayjs(date).format("DD/MM/YYYY");
}

export default SavingTransactionListScreen;