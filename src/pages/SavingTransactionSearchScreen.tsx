import { useEffect, useState } from "react";
import { Empty, Input, Spin, message } from "antd";
import {
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowUpOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import { STORAGE_KEYS } from "../shared/constants/storageKeys";
import { formatMoney } from "../shared/utils/formatMoney";
import type { SavingTransaction } from "../database/db";
import { searchSavingTransactions } from "../features/savings/services/savingListService";

function SavingTransactionSearchScreen() {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SavingTransaction[]>([]);

  const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(keyword);
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword]);

  const handleSearch = async (value: string) => {
    try {
      if (!currentUserId) {
        message.error("Bạn cần đăng nhập lại");
        navigate("/login");
        return;
      }

      setLoading(true);

      const data = await searchSavingTransactions({
        userId: currentUserId,
        keyword: value,
      });

      if (!value.trim()) {
        setResults(data.slice(0, 10));
      } else {
        setResults(data);
      }
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : "Không thể tìm kiếm giao dịch tiết kiệm",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F7F9FF]">
      {/* Header sticky */}
      <div className="sticky top-0 z-20 bg-[#F7F9FF] px-5 pb-3 pt-8 shadow-[0_4px_10px_-4px_rgba(0,0,0,0.05)]">
        <div className="mx-auto max-w-[760px]">
          <div className="mb-5 flex items-center gap-3">
            <button
              onClick={() => navigate("/savings/transactions")}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-none bg-white text-[#111438] shadow-sm"
            >
              <ArrowLeftOutlined />
            </button>

            <Input
              autoFocus
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Tìm ghi chú, mô tả, gửi tiết kiệm, rút tiết kiệm..."
              className="h-12 rounded-2xl"
              allowClear
            />
          </div>

          <div className="text-sm font-medium text-gray-400">
            {keyword.trim()
              ? `Tìm thấy ${results.length} kết quả`
              : "10 giao dịch tiết kiệm gần nhất"}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="px-5 pb-6 pt-4">
        <div className="mx-auto max-w-[760px]">
          {loading && (
            <div className="mt-10 flex justify-center">
              <Spin size="large" />
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="mt-10">
              <Empty description="Không tìm thấy giao dịch tiết kiệm phù hợp" />
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
              <div className="flex flex-col gap-3">
                {results.map((tx) => {
                  const isDeposit = tx.type === "deposit";
                  const color = isDeposit ? "#22C55E" : "#EF4444";
                  const prefix = isDeposit ? "+" : "-";

                  return (
                    <div
                      key={tx.id}
                      onClick={() => navigate(`/savings/${tx.id}/edit`)}
                      className="flex cursor-pointer items-center justify-between rounded-2xl bg-[#FAFAFF] px-3 py-3 transition hover:bg-[#F0EEFF]"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg"
                          style={{
                            backgroundColor: `${color}18`,
                            color,
                          }}
                        >
                          {isDeposit ? (
                            <ArrowUpOutlined />
                          ) : (
                            <ArrowDownOutlined />
                          )}
                        </div>

                        <div>
                          <div className="text-[14px] font-bold text-[#111438]">
                            {tx.note ||
                              (isDeposit
                                ? "Gửi tiết kiệm"
                                : "Rút tiết kiệm")}
                          </div>

                          <div className="mt-0.5 text-xs text-gray-400">
                            {isDeposit ? "Gửi tiết kiệm" : "Rút tiết kiệm"} ·{" "}
                            {dayjs(tx.date).format("DD/MM/YYYY")} ·{" "}
                            {dayjs(tx.createdAt).format("HH:mm")}
                          </div>

                          {tx.description && (
                            <div className="mt-0.5 max-w-[210px] truncate text-xs text-gray-400">
                              {tx.description}
                            </div>
                          )}
                        </div>
                      </div>

                      <div
                        className="whitespace-nowrap text-[14px] font-black"
                        style={{ color }}
                      >
                        {prefix}
                        {formatMoney(tx.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SavingTransactionSearchScreen;