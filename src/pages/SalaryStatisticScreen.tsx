import { useEffect, useMemo, useState } from "react";
import { Button, DatePicker, Empty, Modal, Skeleton, message } from "antd";
import {
  ArrowLeftOutlined,
  BarChartOutlined,
  CalendarOutlined,
  FileExcelOutlined,
  FilterOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import * as XLSX from "xlsx";

import { STORAGE_KEYS } from "../shared/constants/storageKeys";
import { formatMoney } from "../shared/utils/formatMoney";
import {
  getSalaryStatistic,
  type SalaryMonthlyChartItem,
} from "../features/salary/services/salaryStatisticService";
import {
  getSalaryTypeColor,
  getSalaryTypeIcon,
  getSalaryTypeLabel,
} from "../features/salary/types";
import type { SalaryRecord } from "../database/db";

type StatisticMode = "year" | "range";

function SalaryStatisticScreen() {
  const navigate = useNavigate();

  const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);

  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const [mode, setMode] = useState<StatisticMode>("year");
  const [year, setYear] = useState(dayjs().format("YYYY"));
  const [fromMonth, setFromMonth] = useState(
    dayjs().startOf("year").format("YYYY-MM"),
  );
  const [toMonth, setToMonth] = useState(dayjs().format("YYYY-MM"));

  const [draftMode, setDraftMode] = useState<StatisticMode>("year");
  const [draftYear, setDraftYear] = useState(dayjs().format("YYYY"));
  const [draftFromMonth, setDraftFromMonth] = useState(
    dayjs().startOf("year").format("YYYY-MM"),
  );
  const [draftToMonth, setDraftToMonth] = useState(dayjs().format("YYYY-MM"));

  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadStatistic();
  }, [currentUserId, mode, year, fromMonth, toMonth]);

  const loadStatistic = async () => {
    try {
      if (!currentUserId) {
        message.error("Bạn cần đăng nhập lại");
        navigate("/login");
        return;
      }

      setLoading(true);

      const result = await getSalaryStatistic({
        userId: currentUserId,
        mode,
        year,
        fromMonth,
        toMonth,
      });

      setData(result);
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Không thể tải thống kê lương",
      );
    } finally {
      setLoading(false);
    }
  };

  const openFilter = () => {
    setDraftMode(mode);
    setDraftYear(year);
    setDraftFromMonth(fromMonth);
    setDraftToMonth(toMonth);
    setFilterOpen(true);
  };

  const applyFilter = () => {
    if (draftMode === "range" && draftFromMonth > draftToMonth) {
      message.error("Tháng bắt đầu không được lớn hơn tháng kết thúc");
      return;
    }

    setMode(draftMode);
    setYear(draftYear);
    setFromMonth(draftFromMonth);
    setToMonth(draftToMonth);
    setFilterOpen(false);
  };

  const rangeLabel = useMemo(() => {
    if (!data) return "";

    if (mode === "year") {
      return `Năm ${year}`;
    }

    return `${dayjs(`${data.fromMonth}-01`).format("MM/YYYY")} - ${dayjs(
      `${data.toMonth}-01`,
    ).format("MM/YYYY")}`;
  }, [data, mode, year]);

  const maxChartValue = useMemo(() => {
    if (!data?.chartData?.length) return 1;

    return Math.max(
      ...data.chartData.flatMap((item: SalaryMonthlyChartItem) => [
        item.salary,
        item.bonus,
        item.taxRefund,
      ]),
      1,
    );
  }, [data]);

  const handleExportExcel = () => {
    if (!data) {
      message.error("Không có dữ liệu để xuất Excel");
      return;
    }

    const summaryRows = [
      {
        "Chỉ số": "Khoảng thời gian",
        "Giá trị": rangeLabel,
      },
      {
        "Chỉ số": "Tổng thu nhập",
        "Giá trị": data.totalIncome,
      },
      {
        "Chỉ số": "Tổng lương",
        "Giá trị": data.totalSalary,
      },
      {
        "Chỉ số": "Tổng thưởng",
        "Giá trị": data.totalBonus,
      },
      {
        "Chỉ số": "Tổng hoàn thuế",
        "Giá trị": data.totalTaxRefund,
      },
      {
        "Chỉ số": "Trung bình/tháng",
        "Giá trị": data.averagePerMonth,
      },
      {
        "Chỉ số": "Số khoản ghi nhận",
        "Giá trị": data.records.length,
      },
      {
        "Chỉ số": "Tháng cao nhất",
        "Giá trị": data.highestMonth?.total
          ? `${dayjs(`${data.highestMonth.month}-01`).format("MM/YYYY")} - ${
              data.highestMonth.total
            }`
          : "Không có",
      },
    ];

    const monthlyRows = data.chartData.map((item: SalaryMonthlyChartItem) => ({
      Tháng: dayjs(`${item.month}-01`).format("MM/YYYY"),
      Lương: item.salary,
      Thưởng: item.bonus,
      "Hoàn thuế": item.taxRefund,
      "Tổng thu nhập": item.total,
    }));

    const historyRows = [...data.records]
      .sort((a: SalaryRecord, b: SalaryRecord) => {
        return (
          dayjs(b.receivedDate).valueOf() - dayjs(a.receivedDate).valueOf()
        );
      })
      .map((item: SalaryRecord) => ({
        "Loại khoản": getSalaryTypeLabel(item.type),
        "Số tiền": item.amount,
        "Tháng lương": dayjs(`${item.month}-01`).format("MM/YYYY"),
        "Ngày nhận": dayjs(item.receivedDate).format("DD/MM/YYYY"),
        "Công ty / Nguồn nhận": item.company || "",
        "Ghi chú": item.note || "",
        "Mô tả": item.description || "",
        "Ngày tạo": item.createdAt
          ? dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")
          : "",
        "Ngày cập nhật": item.updatedAt
          ? dayjs(item.updatedAt).format("DD/MM/YYYY HH:mm")
          : "",
      }));

    const workbook = XLSX.utils.book_new();

    const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
    const monthlySheet = XLSX.utils.json_to_sheet(monthlyRows);
    const historySheet = XLSX.utils.json_to_sheet(historyRows);

    XLSX.utils.book_append_sheet(workbook, summarySheet, "Tong quan");
    XLSX.utils.book_append_sheet(workbook, monthlySheet, "Theo thang");
    XLSX.utils.book_append_sheet(workbook, historySheet, "Lich su luong");

    const fileName = `thong-ke-vi-luong-${dayjs().format("YYYYMMDD-HHmm")}.xlsx`;

    XLSX.writeFile(workbook, fileName);

    message.success("Đã xuất file Excel thống kê lương");
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
        <Empty description="Không có dữ liệu thống kê lương" />
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
            onClick={() => navigate("/salary")}
            className="flex h-10 w-10 items-center justify-center rounded-full border-none bg-white text-[#111438] shadow-sm"
          >
            <ArrowLeftOutlined />
          </button>

          <div className="text-center">
            <h1 className="m-0 text-lg font-black text-[#111438]">
              Thống kê lương
            </h1>
            <div className="mt-1 text-xs font-medium text-gray-400">
              {rangeLabel}
            </div>
          </div>

          <button
            onClick={openFilter}
            className="flex h-10 w-10 items-center justify-center rounded-full border-none bg-white text-[#111438] shadow-sm"
          >
            <FilterOutlined />
          </button>
        </div>

        <div className="mb-5 rounded-[30px] bg-gradient-to-br from-[#22C55E] to-[#895BFF] p-5 text-white shadow-[0_16px_40px_rgba(34,197,94,0.22)]">
          <div className="mb-2 text-sm font-semibold opacity-85">
            Tổng thu nhập
          </div>

          <div className="break-words text-[32px] font-black leading-tight">
            {formatMoney(data.totalIncome)}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-md">
              <div className="text-xs font-medium opacity-80">
                Trung bình/tháng
              </div>
              <div className="mt-1 break-words text-[16px] font-black">
                {formatMoney(data.averagePerMonth)}
              </div>
            </div>

            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-md">
              <div className="text-xs font-medium opacity-80">
                Số khoản ghi nhận
              </div>
              <div className="mt-1 text-[16px] font-black">
                {data.records.length} khoản
              </div>
            </div>
          </div>
        </div>

        <div className="mb-5">
          <Button
            icon={<FileExcelOutlined />}
            onClick={handleExportExcel}
            block
            className="h-12 rounded-[18px] border-none bg-white text-[15px] font-black text-[#15803D] shadow-[0_8px_30px_rgba(0,0,0,0.03)]"
          >
            Xuất Excel thống kê lương
          </Button>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-3">
          <StatisticSummaryCard
            title="Lương"
            value={data.totalSalary}
            icon="💵"
            color="#22C55E"
          />

          <StatisticSummaryCard
            title="Thưởng"
            value={data.totalBonus}
            icon="🎁"
            color="#895BFF"
          />

          <StatisticSummaryCard
            title="Hoàn thuế"
            value={data.totalTaxRefund}
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
                So sánh lương, thưởng và hoàn thuế
              </div>
            </div>

            <BarChartOutlined className="text-xl text-[#22C55E]" />
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-[#FAFAFF] px-3 py-2">
            <ChartLegend color="#22C55E" label="Lương" />
            <ChartLegend color="#895BFF" label="Thưởng" />
            <ChartLegend color="#F59E0B" label="Hoàn thuế" />
          </div>

          <div className="relative h-52 rounded-2xl bg-[#FAFAFF] px-3 pb-9 pt-4">
            <div className="flex h-full items-end justify-between gap-2">
              {data.chartData.map((item: SalaryMonthlyChartItem) => {
                const salaryHeight = (item.salary / maxChartValue) * 100;
                const bonusHeight = (item.bonus / maxChartValue) * 100;
                const taxRefundHeight = (item.taxRefund / maxChartValue) * 100;

                return (
                  <div
                    key={item.month}
                    className="relative flex h-full flex-1 flex-col items-center justify-end"
                  >
                    <div className="flex h-full w-full items-end justify-center gap-[2px]">
                      <ChartBar
                        value={item.salary}
                        heightPercent={salaryHeight}
                        color="#22C55E"
                      />

                      <ChartBar
                        value={item.bonus}
                        heightPercent={bonusHeight}
                        color="#895BFF"
                      />

                      <ChartBar
                        value={item.taxRefund}
                        heightPercent={taxRefundHeight}
                        color="#F59E0B"
                      />
                    </div>

                    <div className="absolute -bottom-6 text-[10px] font-medium text-gray-400">
                      T{dayjs(`${item.month}-01`).format("M")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {data.highestMonth?.total > 0 && (
            <div className="mt-4 rounded-2xl bg-[#F0FDF4] p-3 text-sm">
              <span className="font-bold text-[#15803D]">Tháng cao nhất: </span>
              <span className="font-black text-[#111438]">
                {dayjs(`${data.highestMonth.month}-01`).format("MM/YYYY")} ·{" "}
                {formatMoney(data.highestMonth.total)}
              </span>
            </div>
          )}
        </div>

        <div className="mb-5 rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-[16px] font-black text-[#111438]">
                Lịch sử trong kỳ
              </div>
              <div className="text-xs font-medium text-gray-400">
                {data.records.length} khoản thu nhập
              </div>
            </div>

            <RiseOutlined className="text-xl text-[#22C55E]" />
          </div>

          {data.records.length === 0 ? (
            <Empty description="Không có dữ liệu trong khoảng thời gian này" />
          ) : (
            <div className="flex flex-col gap-3">
              {[...data.records]
                .sort((a: SalaryRecord, b: SalaryRecord) => {
                  return (
                    dayjs(b.receivedDate).valueOf() -
                    dayjs(a.receivedDate).valueOf()
                  );
                })
                .map((item: SalaryRecord) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/salary/${item.id}/edit`)}
                    className="flex cursor-pointer items-center justify-between rounded-2xl bg-[#FAFAFF] p-3 transition hover:bg-[#F0EEFF]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg"
                        style={{
                          backgroundColor: `${getSalaryTypeColor(item.type)}18`,
                        }}
                      >
                        {getSalaryTypeIcon(item.type)}
                      </div>

                      <div className="min-w-0">
                        <div className="truncate text-[14px] font-bold text-[#111438]">
                          {getSalaryTypeLabel(item.type)}
                          {item.company ? ` · ${item.company}` : ""}
                        </div>

                        <div className="mt-0.5 text-xs text-gray-400">
                          Tháng {dayjs(`${item.month}-01`).format("MM/YYYY")} ·{" "}
                          Nhận {dayjs(item.receivedDate).format("DD/MM/YYYY")}
                        </div>

                        {item.note && (
                          <div className="mt-0.5 max-w-[190px] truncate text-xs text-gray-400">
                            {item.note}
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      className="ml-3 shrink-0 text-right text-[14px] font-black"
                      style={{ color: getSalaryTypeColor(item.type) }}
                    >
                      +{formatMoney(item.amount)}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        title={
          <span className="text-lg font-black text-[#111438]">
            Bộ lọc thống kê lương
          </span>
        }
        open={filterOpen}
        onCancel={() => setFilterOpen(false)}
        footer={null}
        centered
      >
        <div className="flex flex-col gap-5 pt-4">
          <div>
            <div className="mb-3 text-sm font-bold text-gray-700">
              Kiểu thống kê
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDraftMode("year")}
                className={`rounded-xl border-none px-4 py-3 text-[13px] font-bold ${
                  draftMode === "year"
                    ? "bg-[#22C55E] text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                Theo năm
              </button>

              <button
                type="button"
                onClick={() => setDraftMode("range")}
                className={`rounded-xl border-none px-4 py-3 text-[13px] font-bold ${
                  draftMode === "range"
                    ? "bg-[#22C55E] text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                Theo khoảng tháng
              </button>
            </div>
          </div>

          {draftMode === "year" && (
            <div>
              <div className="mb-3 text-sm font-bold text-gray-700">
                Chọn năm
              </div>

              <DatePicker
                picker="year"
                format="YYYY"
                value={dayjs(`${draftYear}-01-01`)}
                onChange={(value) => {
                  if (!value) return;
                  setDraftYear(value.format("YYYY"));
                }}
                className="h-11 w-full rounded-xl"
                suffixIcon={<CalendarOutlined />}
              />
            </div>
          )}

          {draftMode === "range" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="mb-3 text-sm font-bold text-gray-700">
                  Từ tháng
                </div>

                <DatePicker
                  picker="month"
                  format="MM/YYYY"
                  value={dayjs(`${draftFromMonth}-01`)}
                  onChange={(value) => {
                    if (!value) return;
                    setDraftFromMonth(value.format("YYYY-MM"));
                  }}
                  className="h-11 w-full rounded-xl"
                />
              </div>

              <div>
                <div className="mb-3 text-sm font-bold text-gray-700">
                  Đến tháng
                </div>

                <DatePicker
                  picker="month"
                  format="MM/YYYY"
                  value={dayjs(`${draftToMonth}-01`)}
                  onChange={(value) => {
                    if (!value) return;
                    setDraftToMonth(value.format("YYYY-MM"));
                  }}
                  className="h-11 w-full rounded-xl"
                />
              </div>
            </div>
          )}

          <Button
            type="primary"
            onClick={applyFilter}
            className="h-12 rounded-[16px] border-none bg-[#22C55E] font-bold"
          >
            Áp dụng
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function StatisticSummaryCard({
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
        opacity: value > 0 ? 0.85 : 0,
      }}
    />
  );
}

export default SalaryStatisticScreen;
