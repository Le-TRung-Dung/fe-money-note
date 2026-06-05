import { useEffect, useState } from "react";
import { Button, DatePicker, Modal } from "antd";
import dayjs from "dayjs";
import type {
  SavingDateRange,
  SavingTypeFilter,
} from "../features/savings/services/savingListService";
import { rangeOptions, typeOptions } from "../shared/constants/options";

interface SavingFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: {
    range: SavingDateRange;
    type: SavingTypeFilter;
    selectedMonth: string;
    selectedYear: string;
  }) => void;
  currentRange: SavingDateRange;
  currentType: SavingTypeFilter;
  currentSelectedMonth: string;
  currentSelectedYear: string;
}

export function SavingFilterModal({
  isOpen,
  onClose,
  onApply,
  currentRange,
  currentType,
  currentSelectedMonth,
  currentSelectedYear,
}: SavingFilterModalProps) {
  const [draftRange, setDraftRange] = useState<SavingDateRange>(currentRange);
  const [draftType, setDraftType] = useState<SavingTypeFilter>(currentType);
  const [draftSelectedMonth, setDraftSelectedMonth] = useState(currentSelectedMonth);
  const [draftSelectedYear, setDraftSelectedYear] = useState(currentSelectedYear);

  useEffect(() => {
    if (isOpen) {
      setDraftRange(currentRange);
      setDraftType(currentType);
      setDraftSelectedMonth(currentSelectedMonth);
      setDraftSelectedYear(currentSelectedYear);
    }
  }, [isOpen, currentRange, currentType, currentSelectedMonth, currentSelectedYear]);

  const handleApplyFilter = () => {
    onApply({
      range: draftRange,
      type: draftType,
      selectedMonth: draftSelectedMonth,
      selectedYear: draftSelectedYear,
    });
  };

  return (
    <Modal
      title={
        <span className="text-lg font-black text-[#111438]">
          Bộ lọc tiết kiệm
        </span>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      className="custom-modal"
    >
      <div className="flex flex-col pt-2">
        <div className="custom-scrollbar flex max-h-[60dvh] flex-col gap-6 overflow-y-auto pb-4 pr-2">
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
                  onClick={() => setDraftType(opt.value)}
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
        </div>

        <div className="mt-2 border-t border-gray-100 pt-4">
          <Button
            type="primary"
            size="large"
            className="h-12 w-full rounded-[16px] border-none bg-[#895BFF] font-bold shadow-[0_8px_20px_rgba(137,91,255,0.25)]"
            onClick={handleApplyFilter}
          >
            Áp dụng
          </Button>
        </div>
      </div>
    </Modal>
  );
}