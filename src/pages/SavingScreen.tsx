import { useEffect, useState } from "react";
import { Button, Empty, Skeleton, message } from "antd";
import {
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowUpOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import { STORAGE_KEYS } from "../shared/constants/storageKeys";
import { formatMoney } from "../shared/utils/formatMoney";
import { ensureDefaultDataForUser } from "../database/seed";
import type { SavingTransaction, Wallet } from "../database/db";
import {
  getSavingTransactions,
  getSavingWalletByUser,
} from "../features/savings/services/savingService";

function SavingScreen() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<SavingTransaction[]>([]);

  const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (!currentUserId) {
        message.error("Bạn cần đăng nhập lại");
        navigate("/login");
        return;
      }

      await ensureDefaultDataForUser(currentUserId);

      const savingWallet = await getSavingWalletByUser(currentUserId);
      const savingTransactions = await getSavingTransactions(currentUserId);

      setWallet(savingWallet);
      setTransactions(savingTransactions);
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Không thể tải ví tiết kiệm"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FF] p-5">
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FF] px-5 py-8 pb-28">
      <div className="mx-auto max-w-[760px]">
        <div className="mb-5 flex items-center justify-between">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/dashboard")}
          >
            Quay lại
          </Button>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/savings/create")}
          >
            Thêm
          </Button>
        </div>

        <div className="mb-5">
          <div className="text-[24px] font-black text-[#111438]">
            Ví tiết kiệm
          </div>
          <div className="text-sm text-gray-500">
            Theo dõi tiền tiết kiệm riêng, không ảnh hưởng ví chi tiêu
          </div>
        </div>

        <div className="mb-6 rounded-[28px] bg-gradient-to-br from-[#895BFF] to-[#5B62FF] p-6 text-white shadow-[0_18px_40px_rgba(91,98,255,0.25)]">
          <div className="text-sm opacity-80">Tổng tiền tiết kiệm</div>
          <div className="mt-2 text-[32px] font-black">
            {formatMoney(wallet?.balance || 0)}
          </div>
          <div className="mt-2 text-sm opacity-80">
            {wallet?.name || "Ví tiết kiệm"}
          </div>
        </div>

        <div className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
          <div className="mb-5 text-[16px] font-bold text-[#111438]">
            Lịch sử tiết kiệm
          </div>

          {transactions.length === 0 && (
            <Empty description="Chưa có giao dịch tiết kiệm" />
          )}

          <div className="flex flex-col gap-3">
            {transactions.map((item) => {
              const isDeposit = item.type === "deposit";

              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/savings/${item.id}/edit`)}
                  className="flex cursor-pointer items-center justify-between rounded-2xl border-b border-gray-100 px-2 py-3 transition hover:bg-[#F7F8FF] last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-full text-lg ${
                        isDeposit
                          ? "bg-[#ECFDF5] text-[#22C55E]"
                          : "bg-[#FEF2F2] text-[#EF4444]"
                      }`}
                    >
                      {isDeposit ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                    </div>

                    <div>
                      <div className="font-bold text-[#111438]">
                        {item.note ||
                          (isDeposit ? "Gửi tiết kiệm" : "Rút tiết kiệm")}
                      </div>
                      <div className="text-xs text-gray-400">
                        {dayjs(item.date).format("DD/MM/YYYY")}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`font-black ${
                      isDeposit ? "text-[#22C55E]" : "text-[#EF4444]"
                    }`}
                  >
                    {isDeposit ? "+" : "-"}
                    {formatMoney(item.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SavingScreen;