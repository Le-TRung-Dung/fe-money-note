import { useEffect, useMemo, useState } from "react";
import { Button, DatePicker, Empty, Modal, Skeleton, message } from "antd";
import {
  ArrowLeftOutlined,
  BarChartOutlined,
  FilterOutlined,
  RiseOutlined,
  SwapOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import * as XLSX from "xlsx";

import { STORAGE_KEYS } from "../shared/constants/storageKeys";
import { formatMoney } from "../shared/utils/formatMoney";
import {
  getTransactionStatisticData,
  type StatisticRangeType,
  type TransactionStatisticResult,
} from "../features/statistics/services/transactionStatsService";
import { FaFileExcel } from "react-icons/fa";
import { IoWallet } from "react-icons/io5";

const rangeOptions: { label: string; value: StatisticRangeType }[] = [
  { label: "Theo tuần", value: "week" },
  { label: "Theo tháng", value: "month" },
  { label: "Theo năm", value: "year" },
];

function TransactionStatisticScreen() {
  const navigate = useNavigate();

  const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);

  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const [rangeType, setRangeType] = useState<StatisticRangeType>("month");
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD"),
  );
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format("YYYY-MM"));
  const [selectedYear, setSelectedYear] = useState(dayjs().format("YYYY"));

  const [draftRangeType, setDraftRangeType] =
    useState<StatisticRangeType>("month");
  const [draftSelectedDate, setDraftSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD"),
  );
  const [draftSelectedMonth, setDraftSelectedMonth] = useState(
    dayjs().format("YYYY-MM"),
  );
  const [draftSelectedYear, setDraftSelectedYear] = useState(
    dayjs().format("YYYY"),
  );

  const [data, setData] = useState<TransactionStatisticResult | null>(null);

  useEffect(() => {
    loadData();
  }, [rangeType, selectedDate, selectedMonth, selectedYear]);

  const loadData = async () => {
    try {
      if (!currentUserId) {
        message.error("Bạn cần đăng nhập lại");
        navigate("/login");
        return;
      }

      setLoading(true);

      const result = await getTransactionStatisticData({
        userId: currentUserId,
        rangeType,
        selectedDate,
        selectedMonth,
        selectedYear,
      });

      setData(result);
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Không thể tải thống kê",
      );
    } finally {
      setLoading(false);
    }
  };

  const openFilter = () => {
    setDraftRangeType(rangeType);
    setDraftSelectedDate(selectedDate);
    setDraftSelectedMonth(selectedMonth);
    setDraftSelectedYear(selectedYear);
    setFilterOpen(true);
  };

  const applyFilter = () => {
    setRangeType(draftRangeType);
    setSelectedDate(draftSelectedDate);
    setSelectedMonth(draftSelectedMonth);
    setSelectedYear(draftSelectedYear);
    setFilterOpen(false);
  };

  const maxChartValue = useMemo(() => {
    if (!data) return 1;

    return Math.max(
      ...data.chartData.flatMap((item) => [
        item.expenseAmount,
        item.incomeAmount,
        item.debtAmount,
      ]),
      1,
    );
  }, [data]);

  const handleExportExcel = () => {
    if (!data) return;

    const summaryRows = [
      ["BÁO CÁO THỐNG KÊ GIAO DỊCH"],
      ["Khoảng thời gian", data.rangeLabel],
      ["Từ ngày", dayjs(data.startDate).format("DD/MM/YYYY")],
      ["Đến ngày", dayjs(data.endDate).format("DD/MM/YYYY")],
      [],
      ["Tổng chi", data.totalExpense],
      ["Tổng thu", data.totalIncome],
      ["Tổng vay nợ", data.totalDebt],
      ["Thu - chi", data.totalBalance],
      ["Số giao dịch", data.transactions.length],
    ];

    const topCategoryRows = [
      ["TOP 3 NHÓM CHI NHIỀU NHẤT"],
      ["STT", "Nhóm", "Số giao dịch", "Tổng tiền"],
      ...data.topExpenseCategories.map((item, index) => [
        index + 1,
        item.categoryName,
        item.transactionCount,
        item.totalAmount,
      ]),
    ];

    const transactionRows = [
      [
        "STT",
        "Ngày",
        "Giờ tạo",
        "Loại",
        "Nhóm",
        "Số tiền",
        "Ghi chú",
        "Mô tả",
        "Với ai",
      ],
      ...data.transactions.map((item, index) => [
        index + 1,
        dayjs(item.date).format("DD/MM/YYYY"),
        dayjs(item.createdAt).format("HH:mm"),
        getTransactionTypeLabel(item.type),
        item.category?.name || "Không rõ nhóm",
        item.amount,
        item.note || "",
        item.description || "",
        item.partner || "",
      ]),
    ];

    const workbook = XLSX.utils.book_new();

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
    const topSheet = XLSX.utils.aoa_to_sheet(topCategoryRows);
    const transactionSheet = XLSX.utils.aoa_to_sheet(transactionRows);

    summarySheet["!cols"] = [{ wch: 24 }, { wch: 28 }];
    topSheet["!cols"] = [{ wch: 8 }, { wch: 24 }, { wch: 16 }, { wch: 18 }];
    transactionSheet["!cols"] = [
      { wch: 8 },
      { wch: 14 },
      { wch: 12 },
      { wch: 14 },
      { wch: 24 },
      { wch: 18 },
      { wch: 28 },
      { wch: 32 },
      { wch: 20 },
    ];

    XLSX.utils.book_append_sheet(workbook, summarySheet, "Tong quan");
    XLSX.utils.book_append_sheet(workbook, topSheet, "Top chi tieu");
    XLSX.utils.book_append_sheet(workbook, transactionSheet, "Giao dich");

    const fileName = `Thong_ke_giao_dich_${dayjs().format("YYYYMMDD_HHmm")}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FF] p-5">
        <Skeleton active avatar paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#F7F9FF] p-5">
        <Empty description="Không có dữ liệu thống kê" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#F7F9FF] px-5 py-8 pb-32 font-sans">
      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E0E7FF] blur-[80px] opacity-70" />
      <div className="pointer-events-none absolute right-0 top-16 h-80 w-80 translate-x-1/3 rounded-full bg-[#F3E8FF] blur-[80px] opacity-70" />

      <div className="relative z-10 mx-auto max-w-[760px]">
        <div className="mb-6 flex items-center justify-between">
          <ArrowLeftOutlined
            className="cursor-pointer text-xl text-[#111438]"
            onClick={() => navigate("/account")}
          />

          <div className="text-center">
            <h1 className="m-0 text-lg font-black text-[#111438]">
              Thống kê giao dịch
            </h1>
            <div className="mt-1 text-xs font-medium text-gray-400">
              {data.rangeLabel}
            </div>
          </div>

          <FilterOutlined
            onClick={openFilter}
            className="cursor-pointer text-xl text-[#111438]"
          />
        </div>

        <div className="mb-5 rounded-[28px] bg-gradient-to-br from-[#895BFF] to-[#5B62FF] p-5 text-white shadow-[0_12px_30px_rgba(137,91,255,0.25)]">
          <div className="mb-2 text-sm font-semibold opacity-80">
            Tổng chi tiêu trong kỳ
          </div>

          <div className="text-[30px] font-black">
            {formatMoney(data.totalExpense)}
          </div>

          <div className="mt-2 text-xs font-medium opacity-80">
            {dayjs(data.startDate).format("DD/MM/YYYY")} -{" "}
            {dayjs(data.endDate).format("DD/MM/YYYY")}
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <SummaryCardSmall
              title="Tổng thu"
              value={data.totalIncome}
              color="#22C55E"
              icon={<RiseOutlined />}
            />

            <SummaryCardSmall
              title="Vay nợ"
              value={data.totalDebt}
              color="#895BFF"
              icon={<SwapOutlined />}
            />
          </div>
        </div>

        <div className="mb-5 rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-[16px] font-black text-[#111438]">
                So sánh thu chi
              </div>
              <div className="text-xs font-medium text-gray-400">
                Thu, chi và vay nợ theo {getRangeText(rangeType)}
              </div>
            </div>

            <BarChartOutlined className="text-xl text-[#895BFF]" />
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-[#FAFAFF] px-3 py-2">
            <ChartLegend color="#EF4444" label="Tổng chi" />
            <ChartLegend color="#22C55E" label="Tổng thu" />
            <ChartLegend color="#895BFF" label="Vay nợ" />
          </div>

          <div className="relative h-48 rounded-2xl bg-[#FAFAFF] px-3 pb-9 pt-4">
            <div className="flex h-full items-end justify-between gap-1">
              {data.chartData.map((item, index) => {
                const showLabel =
                  data.chartData.length > 15 ? index % 5 === 0 : true;

                const expenseHeight =
                  (item.expenseAmount / maxChartValue) * 100;
                const incomeHeight = (item.incomeAmount / maxChartValue) * 100;
                const debtHeight = (item.debtAmount / maxChartValue) * 100;

                return (
                  <div
                    key={`${item.label}-${index}`}
                    className="relative flex h-full flex-1 flex-col items-center justify-end"
                  >
                    <div className="flex h-full w-full items-end justify-center gap-[2px]">
                      <ChartBar
                        value={item.expenseAmount}
                        heightPercent={expenseHeight}
                        color="#EF4444"
                      />

                      <ChartBar
                        value={item.incomeAmount}
                        heightPercent={incomeHeight}
                        color="#22C55E"
                      />

                      <ChartBar
                        value={item.debtAmount}
                        heightPercent={debtHeight}
                        color="#895BFF"
                      />
                    </div>

                    {showLabel && (
                      <div className="absolute -bottom-6 text-[10px] font-medium text-gray-400">
                        {item.label}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mb-5 rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-[16px] font-black text-[#111438]">
                Top 3 nhóm chi nhiều nhất
              </div>
              <div className="text-xs font-medium text-gray-400">
                Tính theo khoảng thời gian đang chọn
              </div>
            </div>
          </div>

          {data.topExpenseCategories.length === 0 ? (
            <Empty description="Chưa có khoản chi nào" />
          ) : (
            <div className="flex flex-col gap-3">
              {data.topExpenseCategories.map((item, index) => (
                <div
                  key={item.categoryId}
                  className="flex items-center justify-between rounded-2xl bg-[#FAFAFF] p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F0EEFF] text-lg">
                      {item.categoryIcon || "✨"}
                    </div>

                    <div>
                      <div className="font-bold text-[#111438]">
                        #{index + 1} {item.categoryName}
                      </div>
                      <div className="text-xs text-gray-400">
                        {item.transactionCount} giao dịch
                      </div>
                    </div>
                  </div>

                  <div className="font-black text-[#EF4444]">
                    {formatMoney(item.totalAmount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-5 rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-[16px] font-black text-[#111438]">
                Giao dịch trong kỳ
              </div>
              <div className="text-xs font-medium text-gray-400">
                {data.transactions.length} giao dịch
              </div>
            </div>

            <IoWallet className="text-xl text-[#895BFF]" />
          </div>

          {data.transactions.length === 0 ? (
            <Empty description="Không có giao dịch nào trong kỳ" />
          ) : (
            <div className="flex flex-col gap-3">
              {data.transactions.slice(0, 8).map((item) => {
                const color =
                  item.type === "income"
                    ? "#22C55E"
                    : item.type === "expense"
                      ? "#EF4444"
                      : "#895BFF";

                const prefix =
                  item.type === "income"
                    ? "+"
                    : item.type === "expense"
                      ? "-"
                      : "";

                return (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/transactions/${item.id}/edit`)}
                    className="flex cursor-pointer items-center justify-between rounded-2xl bg-[#FAFAFF] p-3 transition hover:bg-[#F0EEFF]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
                        style={{
                          backgroundColor: `${item.category?.color || color}18`,
                        }}
                      >
                        {item.category?.icon || "✨"}
                      </div>

                      <div>
                        <div className="text-[14px] font-bold text-[#111438]">
                          {item.note || item.category?.name || "Giao dịch"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {dayjs(item.date).format("DD/MM/YYYY")} ·{" "}
                          {item.category?.name || "Không rõ nhóm"}
                        </div>
                      </div>
                    </div>

                    <div className="font-black" style={{ color }}>
                      {prefix}
                      {formatMoney(item.amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Button
          type="primary"
          icon={<FaFileExcel />}
          block
          onClick={handleExportExcel}
          className="h-12 rounded-[18px] border-none bg-[#895BFF] text-[15px] font-black shadow-[0_8px_22px_rgba(137,91,255,0.28)]"
        >
          Xuất báo cáo Excel
        </Button>
      </div>

      <Modal
        title={
          <span className="text-lg font-black text-[#111438]">
            Bộ lọc thống kê
          </span>
        }
        open={filterOpen}
        onCancel={() => setFilterOpen(false)}
        footer={null}
        centered
      >
        <div className="flex flex-col gap-6 pt-4">
          <div>
            <div className="mb-3 text-sm font-bold text-gray-700">
              Thống kê theo
            </div>

            <div className="flex flex-wrap gap-2">
              {rangeOptions.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setDraftRangeType(item.value)}
                  className={`rounded-xl border-none px-4 py-2 text-[13px] transition ${
                    draftRangeType === item.value
                      ? "bg-[#895BFF] font-bold text-white"
                      : "bg-gray-100 font-medium text-gray-600"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {draftRangeType === "week" && (
            <div>
              <div className="mb-3 text-sm font-bold text-gray-700">
                Chọn một ngày trong tuần
              </div>
              <DatePicker
                className="h-11 w-full rounded-xl"
                value={dayjs(draftSelectedDate)}
                format="DD/MM/YYYY"
                onChange={(value) => {
                  if (!value) return;
                  setDraftSelectedDate(value.format("YYYY-MM-DD"));
                }}
              />
            </div>
          )}

          {draftRangeType === "month" && (
            <div>
              <div className="mb-3 text-sm font-bold text-gray-700">
                Chọn tháng
              </div>
              <DatePicker
                picker="month"
                className="h-11 w-full rounded-xl"
                value={dayjs(`${draftSelectedMonth}-01`)}
                format="MM/YYYY"
                onChange={(value) => {
                  if (!value) return;
                  setDraftSelectedMonth(value.format("YYYY-MM"));
                }}
              />
            </div>
          )}

          {draftRangeType === "year" && (
            <div>
              <div className="mb-3 text-sm font-bold text-gray-700">
                Chọn năm
              </div>
              <DatePicker
                picker="year"
                className="h-11 w-full rounded-xl"
                value={dayjs(`${draftSelectedYear}-01-01`)}
                format="YYYY"
                onChange={(value) => {
                  if (!value) return;
                  setDraftSelectedYear(value.format("YYYY"));
                }}
              />
            </div>
          )}

          <Button
            type="primary"
            size="large"
            block
            onClick={applyFilter}
            className="h-12 rounded-[16px] border-none bg-[#895BFF] font-bold"
          >
            Áp dụng
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function SummaryCardSmall({
  title,
  value,
  color,
  icon,
}: {
  title: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-[22px] bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="min-w-0 text-[12px] font-semibold text-gray-400">
          {title}
        </div>

        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-base"
          style={{
            backgroundColor: `${color}18`,
            color,
          }}
        >
          {icon}
        </div>
      </div>

      <div
        className="break-words text-[18px] font-black leading-tight tracking-[-0.3px]"
        style={{ color }}
      >
        {formatMoney(value)}
      </div>
    </div>
  );
}

function ChartLegend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-[12px] font-bold text-gray-500">{label}</span>
    </div>
  );
}

function ChartBar({
  value,
  heightPercent,
  color,
}: {
  value: number;
  heightPercent: number;
  color: string;
}) {
  return (
    <div
      title={formatMoney(value)}
      className="w-full max-w-[7px] rounded-t-full transition-all"
      style={{
        height: `${heightPercent}%`,
        minHeight: value > 0 ? 6 : 0,
        backgroundColor: color,
        opacity: value > 0 ? 0.8 : 0,
      }}
    />
  );
}

function getRangeText(rangeType: StatisticRangeType) {
  if (rangeType === "week") return "tuần";
  if (rangeType === "month") return "tháng";
  return "năm";
}

function getTransactionTypeLabel(type: string) {
  if (type === "expense") return "Khoản chi";
  if (type === "income") return "Khoản thu";
  if (type === "debt") return "Vay nợ";
  return type;
}

export default TransactionStatisticScreen;
