import { useEffect, useState } from "react";
import { Button, DatePicker, Empty, Input, Modal, Select, Spin, message } from "antd";
import {
  ArrowLeftOutlined,
  FilterOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import { STORAGE_KEYS } from "../shared/constants/storageKeys";
import { formatMoney } from "../shared/utils/formatMoney";
import type { SalaryRecord, SalaryRecordType } from "../database/db";
import { getSalaryRecords } from "../features/salary/services/salaryListService";
import {
  SALARY_TYPE_OPTIONS,
  getSalaryTypeColor,
  getSalaryTypeIcon,
  getSalaryTypeLabel,
} from "../features/salary/types";

type SalaryFilterType = SalaryRecordType | "all";

function SalarySearchScreen() {
  const navigate = useNavigate();

  const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);

  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const [records, setRecords] = useState<SalaryRecord[]>([]);

  const [type, setType] = useState<SalaryFilterType>("all");
  const [fromMonth, setFromMonth] = useState("");
  const [toMonth, setToMonth] = useState("");

  const [draftType, setDraftType] = useState<SalaryFilterType>("all");
  const [draftFromMonth, setDraftFromMonth] = useState("");
  const [draftToMonth, setDraftToMonth] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRecords();
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword, type, fromMonth, toMonth]);

  const loadRecords = async () => {
    try {
      if (!currentUserId) {
        message.error("Bạn cần đăng nhập lại");
        navigate("/login");
        return;
      }

      setLoading(true);

      const data = await getSalaryRecords({
        userId: currentUserId,
        keyword,
        type,
        fromMonth,
        toMonth,
      });

      setRecords(data);
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Không thể tải lịch sử lương",
      );
    } finally {
      setLoading(false);
    }
  };

  const openFilter = () => {
    setDraftType(type);
    setDraftFromMonth(fromMonth);
    setDraftToMonth(toMonth);
    setFilterOpen(true);
  };

  const applyFilter = () => {
    if (draftFromMonth && draftToMonth && draftFromMonth > draftToMonth) {
      message.error("Tháng bắt đầu không được lớn hơn tháng kết thúc");
      return;
    }

    setType(draftType);
    setFromMonth(draftFromMonth);
    setToMonth(draftToMonth);
    setFilterOpen(false);
  };

  const resetFilter = () => {
    setDraftType("all");
    setDraftFromMonth("");
    setDraftToMonth("");
  };

  const totalAmount = records.reduce((total, item) => total + item.amount, 0);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#F7F9FF] px-5 py-8 font-sans">
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
              Lịch sử ví lương
            </h1>
            <div className="mt-1 text-xs font-medium text-gray-400">
              Tìm kiếm lương, thưởng, hoàn thuế
            </div>
          </div>

          <button
            onClick={openFilter}
            className="flex h-10 w-10 items-center justify-center rounded-full border-none bg-white text-[#111438] shadow-sm"
          >
            <FilterOutlined />
          </button>
        </div>

        <div className="sticky top-0 z-20 mb-5 rounded-[24px] bg-white/95 p-3 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl">
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Tìm theo công ty, ghi chú, mô tả, tháng..."
            className="h-12 rounded-2xl"
            allowClear
          />

          <div className="mt-3 flex items-center justify-between px-1 text-[12px] font-medium text-gray-400">
            <span>{records.length} khoản</span>
            <span>Tổng: {formatMoney(totalAmount)}</span>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          <FilterChip
            active={type !== "all"}
            label={
              type === "all" ? "Tất cả loại" : `Loại: ${getSalaryTypeLabel(type)}`
            }
            onClick={openFilter}
          />

          <FilterChip
            active={Boolean(fromMonth || toMonth)}
            label={
              fromMonth || toMonth
                ? `${fromMonth || "Đầu"} → ${toMonth || "Nay"}`
                : "Tất cả thời gian"
            }
            onClick={openFilter}
          />
        </div>

        {loading && (
          <div className="mt-12 flex justify-center">
            <Spin size="large" />
          </div>
        )}

        {!loading && records.length === 0 && (
          <div className="mt-12 rounded-[28px] bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
            <Empty description="Không tìm thấy dữ liệu lương phù hợp" />
          </div>
        )}

        {!loading && records.length > 0 && (
          <div className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
            <div className="mb-5">
              <div className="text-[16px] font-black text-[#111438]">
                Danh sách khoản lương
              </div>
              <div className="mt-1 text-xs font-medium text-gray-400">
                Ấn vào từng khoản để xem và chỉnh sửa
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {records.map((item) => (
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
          </div>
        )}
      </div>

      <Modal
        title={
          <span className="text-lg font-black text-[#111438]">
            Bộ lọc ví lương
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
              Loại khoản
            </div>

            <Select
              value={draftType}
              onChange={(value) => setDraftType(value)}
              className="w-full"
              size="large"
              options={[
                {
                  label: "Tất cả",
                  value: "all",
                },
                ...SALARY_TYPE_OPTIONS.map((item) => ({
                  label: `${item.icon} ${item.label}`,
                  value: item.value,
                })),
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="mb-3 text-sm font-bold text-gray-700">
                Từ tháng
              </div>
              <DatePicker
                picker="month"
                format="MM/YYYY"
                value={draftFromMonth ? dayjs(`${draftFromMonth}-01`) : null}
                onChange={(value) =>
                  setDraftFromMonth(value ? value.format("YYYY-MM") : "")
                }
                className="h-11 w-full rounded-xl"
                allowClear
              />
            </div>

            <div>
              <div className="mb-3 text-sm font-bold text-gray-700">
                Đến tháng
              </div>
              <DatePicker
                picker="month"
                format="MM/YYYY"
                value={draftToMonth ? dayjs(`${draftToMonth}-01`) : null}
                onChange={(value) =>
                  setDraftToMonth(value ? value.format("YYYY-MM") : "")
                }
                className="h-11 w-full rounded-xl"
                allowClear
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              onClick={resetFilter}
              className="h-11 rounded-xl font-bold"
            >
              Xóa lọc
            </Button>

            <Button
              type="primary"
              onClick={applyFilter}
              className="h-11 rounded-xl border-none bg-[#22C55E] font-bold"
            >
              Áp dụng
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border-none px-3 py-1.5 text-[12px] font-bold ${
        active ? "bg-[#DCFCE7] text-[#15803D]" : "bg-white text-gray-400"
      }`}
    >
      {label}
    </button>
  );
}

export default SalarySearchScreen;