import { useEffect, useMemo, useState } from "react";
import { Button, DatePicker, Empty, Modal, Skeleton, message } from "antd";
import {
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowUpOutlined,
  FilterOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import { STORAGE_KEYS } from "../shared/constants/storageKeys";
import { formatMoney } from "../shared/utils/formatMoney";
import type { Category, TransactionType } from "../database/db";
import type {
  TransactionDateRange,
  TransactionWithCategory,
} from "../features/transactions/services/transactionListService";
import { getTransactionListData } from "../features/transactions/services/transactionListService";
import vi from "../assets/vi.png";

const rangeOptions: { label: string; value: TransactionDateRange }[] = [
  { label: "Hôm nay", value: "today" },
  { label: "30 ngày", value: "last30days" },
  { label: "Tuần này", value: "thisWeek" },
  { label: "Tuần trước", value: "lastWeek" },
  { label: "Tháng này", value: "thisMonth" },
  { label: "Theo tháng", value: "customMonth" },
  { label: "Theo năm", value: "customYear" },
];

const typeOptions: { label: string; value: TransactionType | "all" }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Khoản chi", value: "expense" },
  { label: "Khoản thu", value: "income" },
  { label: "Vay nợ", value: "debt" },
];

function TransactionListScreen() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  /**
   * Bộ lọc danh sách ĐÃ ÁP DỤNG
   */
  const [range, setRange] = useState<TransactionDateRange>("last30days");
  const [type, setType] = useState<TransactionType | "all">("all");
  const [categoryId, setCategoryId] = useState<string | "all">("all");
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format("YYYY-MM"));
  const [selectedYear, setSelectedYear] = useState(dayjs().format("YYYY"));

  /**
   * Bộ lọc danh sách NHÁP trong modal.
   */
  const [draftRange, setDraftRange] =
    useState<TransactionDateRange>("last30days");
  const [draftType, setDraftType] = useState<TransactionType | "all">("all");
  const [draftCategoryId, setDraftCategoryId] = useState<string | "all">("all");
  const [draftSelectedMonth, setDraftSelectedMonth] = useState(
    dayjs().format("YYYY-MM"),
  );
  const [draftSelectedYear, setDraftSelectedYear] = useState(
    dayjs().format("YYYY"),
  );

  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>(
    [],
  );
  const [categories, setCategories] = useState<Category[]>([]);

  const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);

  useEffect(() => {
    loadData();
  }, [range, type, categoryId, selectedMonth, selectedYear]);

  const loadData = async () => {
    try {
      if (!currentUserId) {
        message.error("Bạn cần đăng nhập lại");
        navigate("/login");
        return;
      }

      setLoading(true);

      const data = await getTransactionListData({
        userId: currentUserId,
        range,
        type,
        categoryId,
        selectedMonth,
        selectedYear,
        // Cố định biểu đồ theo tháng hiện tại
        chartRange: "month",
        chartMonth: dayjs().format("YYYY-MM"),
      });

      setWalletBalance(data.wallet?.balance || 0);
      setTransactions(data.transactions);
      setCategories(data.categories);
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Không thể tải giao dịch",
      );
    } finally {
      setLoading(false);
    }
  };

  const openFilterModal = () => {
    setDraftRange(range);
    setDraftType(type);
    setDraftCategoryId(categoryId);
    setDraftSelectedMonth(selectedMonth);
    setDraftSelectedYear(selectedYear);
    setIsFilterModalOpen(true);
  };

  const handleApplyFilter = () => {
    setRange(draftRange);
    setType(draftType);
    setCategoryId(draftCategoryId);
    setSelectedMonth(draftSelectedMonth);
    setSelectedYear(draftSelectedYear);
    setIsFilterModalOpen(false);
  };

  const draftCategoryOptions = useMemo(() => {
    return [
      { label: "Tất cả nhóm", value: "all" },
      ...categories
        .filter((item) => {
          if (draftType === "all") return true;
          return item.type === draftType;
        })
        .map((item) => ({
          label: `${item.icon || "✨"} ${item.name}`,
          value: item.id,
        })),
    ];
  }, [categories, draftType]);

  const groupedTransactions = useMemo(() => {
    return transactions.reduce<Record<string, TransactionWithCategory[]>>(
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FF] p-5">
        <Skeleton active avatar paragraph={{ rows: 8 }} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F7F9FF] pb-28 font-sans">
      <div className="pointer-events-none absolute left-0 top-0 h-64 w-64 -translate-x-1/3 -translate-y-1/3 rounded-full bg-[#E0E7FF] opacity-70 blur-[80px]" />
      <div className="pointer-events-none absolute right-0 top-20 h-72 w-72 translate-x-1/3 rounded-full bg-[#F3E8FF] opacity-60 blur-[80px]" />

      <div className="relative z-10 mx-auto max-w-[760px] px-5 pt-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <ArrowLeftOutlined
            className="text-xl cursor-pointer text-[#111438]"
            onClick={() => navigate("/dashboard")}
          />
          <h1 className="m-0 text-lg font-black text-[#111438]">
            Sổ giao dịch
          </h1>
          <QuestionCircleOutlined className="text-xl cursor-pointer text-[#111438]" />
        </div>

        {/* Balance & Chart */}
        <div className="mb-5 rounded-[28px] border border-white bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
          <div className="flex items-start justify-between">
            <div className="ml-3">
              <div className="mb-1 text-[14px] font-semibold text-gray-500">
                Tổng số dư
              </div>
              <div className="text-[25px] font-black text-[#111438]">
                {formatMoney(walletBalance)}
              </div>
            </div>
            <img src={vi} className="h-20" />
          </div>
        </div>

        {/* Search + Filter */}
        <div className="mb-6 mt-8 flex gap-3">
          <div
            onClick={() => navigate("/transactions/search")}
            className="flex flex-1 cursor-pointer items-center gap-3 rounded-2xl border border-gray-50 bg-white px-4 py-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition hover:bg-gray-50"
          >
            <SearchOutlined className="text-lg text-gray-400" />
            <span className="text-[14px] font-medium text-gray-400">
              Tìm theo nhóm,...
            </span>
          </div>

          <div
            onClick={openFilterModal}
            className="flex cursor-pointer items-center gap-2 rounded-2xl border border-gray-50 bg-white px-4 py-3.5 font-bold text-gray-700 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition hover:bg-gray-50"
          >
            <FilterOutlined /> Lọc
          </div>
        </div>

        {/* Transactions List */}
        {transactions.length === 0 ? (
          <div className="rounded-[28px] bg-white p-10 text-center shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
            <Empty description="Không có giao dịch nào" />
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {groupDates.map((date) => {
              const items = groupedTransactions[date];

              const dayTotal = items.reduce((sum, item) => {
                if (item.type === "expense") return sum - item.amount;
                if (item.type === "income") return sum + item.amount;
                return sum;
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
                      Tổng {isPositive ? "thu" : "chi"}:{" "}
                      <span
                        className={
                          isPositive ? "text-[#22C55E]" : "text-[#EF4444]"
                        }
                      >
                        {isPositive ? "+" : ""}
                        {formatMoney(dayTotal)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    {items.map((tx) => (
                      <TransactionItem
                        key={tx.id}
                        tx={tx}
                        onClick={() => navigate(`/transactions/${tx.id}/edit`)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transaction Filter Modal */}
      <Modal
        title={
          <span className="text-lg font-black text-[#111438]">
            Bộ lọc giao dịch
          </span>
        }
        open={isFilterModalOpen}
        onCancel={() => setIsFilterModalOpen(false)}
        footer={null}
        centered
        className="custom-modal"
      >
        <div className="flex flex-col gap-6 pt-4">
          <div>
            <div className="mb-3 text-sm font-bold text-gray-700">
              Thời gian danh sách
            </div>

            <div className="flex flex-wrap gap-2">
              {rangeOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => setDraftRange(opt.value)}
                  className={`cursor-pointer rounded-xl px-4 py-2 text-[13px] transition-colors ${
                    draftRange === opt.value
                      ? "bg-[#895BFF] font-bold text-white shadow-md"
                      : "bg-gray-100 font-medium text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {opt.label}
                </div>
              ))}
            </div>

            {draftRange === "customMonth" && (
              <div className="mt-3">
                <DatePicker
                  picker="month"
                  className="h-11 w-full rounded-xl"
                  value={dayjs(`${draftSelectedMonth}-01`)}
                  format="MM/YYYY"
                  placeholder="Chọn tháng"
                  onChange={(value) => {
                    if (!value) return;
                    setDraftSelectedMonth(value.format("YYYY-MM"));
                  }}
                />
              </div>
            )}

            {draftRange === "customYear" && (
              <div className="mt-3">
                <DatePicker
                  picker="year"
                  className="h-11 w-full rounded-xl"
                  value={dayjs(`${draftSelectedYear}-01-01`)}
                  format="YYYY"
                  placeholder="Chọn năm"
                  onChange={(value) => {
                    if (!value) return;
                    setDraftSelectedYear(value.format("YYYY"));
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <div className="mb-3 text-sm font-bold text-gray-700">
              Loại giao dịch
            </div>

            <div className="flex flex-wrap gap-2">
              {typeOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    setDraftType(opt.value);
                    setDraftCategoryId("all");
                  }}
                  className={`cursor-pointer rounded-xl px-4 py-2 text-[13px] transition-colors ${
                    draftType === opt.value
                      ? "bg-[#895BFF] font-bold text-white shadow-md"
                      : "bg-gray-100 font-medium text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-3 text-sm font-bold text-gray-700">
              Nhóm chi tiêu
            </div>

            <div className="custom-scrollbar flex max-h-48 flex-wrap gap-2 overflow-y-auto pb-2">
              {draftCategoryOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => setDraftCategoryId(opt.value)}
                  className={`cursor-pointer rounded-xl border px-4 py-2 text-[13px] transition-colors ${
                    draftCategoryId === opt.value
                      ? "border-[#895BFF] bg-[#F0EEFF] font-bold text-[#895BFF]"
                      : "border-transparent bg-gray-100 font-medium text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          </div>

          <Button
            type="primary"
            size="large"
            className="mt-2 h-12 rounded-[16px] border-none bg-[#895BFF] font-bold shadow-[0_8px_20px_rgba(137,91,255,0.25)]"
            onClick={handleApplyFilter}
            block
          >
            Áp dụng
          </Button>
        </div>
      </Modal>

      <style>{`
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom, 16px);
        }

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

function TransactionItem({
  tx,
  onClick,
}: {
  tx: TransactionWithCategory;
  onClick: () => void;
}) {
  const isIncome = tx.type === "income";
  const isExpense = tx.type === "expense";

  const color = isIncome ? "#22C55E" : isExpense ? "#EF4444" : "#895BFF";
  const prefix = isIncome ? "+" : isExpense ? "-" : "";

  const icon = isIncome ? (
    <ArrowUpOutlined />
  ) : isExpense ? (
    <ArrowDownOutlined />
  ) : (
    <SwapOutlined />
  );

  return (
    <div
      onClick={onClick}
      className="group flex cursor-pointer items-center justify-between rounded-xl p-1 transition-colors hover:bg-gray-50/50"
    >
      <div className="flex w-[70%] items-center gap-3">
        <div
          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full text-[20px]"
          style={{
            backgroundColor: `${tx.category?.color || color}15`,
            color: tx.category?.color || color,
          }}
        >
          {tx.category?.icon || icon}
        </div>

        <div className="truncate">
          <div className="truncate text-[15px] font-bold text-[#111438]">
            {tx.category?.name || "Không rõ nhóm"}
          </div>
        </div>
      </div>

      <div className="flex w-[30%] items-center justify-end gap-3">
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

export default TransactionListScreen;
