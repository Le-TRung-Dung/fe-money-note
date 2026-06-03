import { useEffect, useState } from "react";
import { Empty, Input, Spin, message } from "antd"; // Thay Skeleton bằng Spin
import { ArrowLeftOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import { STORAGE_KEYS } from "../shared/constants/storageKeys";
import { formatMoney } from "../shared/utils/formatMoney";
import type { TransactionWithCategory } from "../features/transactions/services/transactionListService";
import { searchTransactions } from "../features/transactions/services/transactionListService";

function TransactionSearchScreen() {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TransactionWithCategory[]>([]);

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

      const data = await searchTransactions({
        userId: currentUserId,
        keyword: value,
      });

      setResults(data);
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Không thể tìm kiếm"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FF] px-5 py-8 pb-32">
      <div className="mx-auto max-w-[760px]">
        <div className="mb-5 flex items-center gap-3">
          <button
            onClick={() => navigate("/transactions")}
            className="flex h-10 w-10 items-center justify-center rounded-full border-none bg-white text-[#111438] shadow-sm"
          >
            <ArrowLeftOutlined />
          </button>

          <Input
            autoFocus
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Tìm theo nhóm, ghi chú, mô tả, với ai..."
            className="h-12 rounded-2xl"
            allowClear
          />
        </div>

        <div className="mb-4 text-sm font-medium text-gray-400">
          {keyword
            ? `Tìm thấy ${results.length} kết quả`
            : "Nhập từ khóa để tìm giao dịch"}
        </div>

        {/* Hiển thị xoay xoay (Spinner) ở giữa khi đang loading */}
        {loading && (
          <div className="mt-20 flex justify-center">
            <Spin size="large" />
          </div>
        )}

        {!loading && results.length === 0 && (
          <div className="mt-20">
            <Empty description="Không tìm thấy giao dịch phù hợp" />
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
            <div className="flex flex-col gap-3">
              {results.map((tx) => {
                const isIncome = tx.type === "income";
                const isExpense = tx.type === "expense";

                const color = isIncome
                  ? "#22C55E"
                  : isExpense
                    ? "#EF4444"
                    : "#895BFF";

                const prefix = isIncome ? "+" : isExpense ? "-" : "";

                return (
                  <div
                    key={tx.id}
                    onClick={() => navigate(`/transactions/${tx.id}/edit`)}
                    className="flex cursor-pointer items-center justify-between rounded-2xl bg-[#FAFAFF] px-3 py-3 transition hover:bg-[#F0EEFF]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-full text-lg"
                        style={{
                          backgroundColor: `${tx.category?.color || color}18`,
                        }}
                      >
                        {tx.category?.icon || "✨"}
                      </div>

                      <div>
                        <div className="text-[14px] font-bold text-[#111438]">
                          {tx.note || tx.category?.name || "Giao dịch"}
                        </div>

                        <div className="mt-0.5 text-xs text-gray-400">
                          {tx.category?.name || "Không rõ nhóm"} ·{" "}
                          {dayjs(tx.date).format("DD/MM/YYYY")} ·{" "}
                          {dayjs(tx.createdAt).format("HH:mm")}
                        </div>

                        {tx.partner && (
                          <div className="mt-0.5 text-xs text-gray-400">
                            Với: {tx.partner}
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
  );
}

export default TransactionSearchScreen;