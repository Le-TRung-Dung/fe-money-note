import { useEffect, useState } from "react";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Typography,
  message,
} from "antd";
import {
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";

import { STORAGE_KEYS } from "../shared/constants/storageKeys";
import { ensureDefaultDataForUser } from "../database/seed";
import type {
  SavingTransactionType,
  Wallet,
} from "../database/db";
import {
  createSavingTransaction,
  deleteSavingTransaction,
  getSavingTransactionById,
  getSavingWalletByUser,
  updateSavingTransaction,
} from "../features/savings/services/savingService";
import { formatMoney } from "../shared/utils/formatMoney";

const { Title, Text } = Typography;
const { TextArea } = Input;

type FormValues = {
  type: SavingTransactionType;
  amount: number;
  note?: string;
  description?: string;
  date: dayjs.Dayjs;
};

function SavingCreateScreen() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [form] = Form.useForm<FormValues>();

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [savingType, setSavingType] =
    useState<SavingTransactionType>("deposit");

  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);

  useEffect(() => {
    const initPage = async () => {
      try {
        if (!currentUserId) {
          message.error("Bạn cần đăng nhập lại");
          navigate("/login");
          return;
        }

        await ensureDefaultDataForUser(currentUserId);

        const savingWallet = await getSavingWalletByUser(currentUserId);
        setWallet(savingWallet);

        if (isEditMode && id) {
          const transaction = await getSavingTransactionById(id);

          if (!transaction) {
            message.error("Không tìm thấy giao dịch tiết kiệm");
            navigate("/savings");
            return;
          }

          if (transaction.userId !== currentUserId) {
            message.error("Bạn không có quyền sửa giao dịch này");
            navigate("/savings");
            return;
          }

          setSavingType(transaction.type);

          form.setFieldsValue({
            type: transaction.type,
            amount: transaction.amount,
            note: transaction.note,
            description: transaction.description,
            date: dayjs(transaction.date),
          });

          return;
        }

        form.setFieldsValue({
          type: "deposit",
          date: dayjs(),
        });
      } catch (error) {
        message.error(
          error instanceof Error ? error.message : "Không thể tải dữ liệu"
        );
      } finally {
        setPageLoading(false);
      }
    };

    initPage();
  }, [currentUserId, form, navigate, id, isEditMode]);

  const handleChangeType = (type: SavingTransactionType) => {
    setSavingType(type);
    form.setFieldsValue({ type });
  };

  const onFinish = async (values: FormValues) => {
    try {
      if (!currentUserId) {
        message.error("Bạn cần đăng nhập lại");
        navigate("/login");
        return;
      }

      if (!wallet) {
        message.error("Không tìm thấy Ví tiết kiệm");
        return;
      }

      setLoading(true);

      if (isEditMode && id) {
        await updateSavingTransaction(id, {
          userId: currentUserId,
          walletId: wallet.id,
          type: values.type,
          amount: values.amount,
          note: values.note,
          description: values.description,
          date: values.date.format("YYYY-MM-DD"),
        });

        message.success("Đã cập nhật giao dịch tiết kiệm");
        navigate("/savings");
        return;
      }

      await createSavingTransaction({
        userId: currentUserId,
        walletId: wallet.id,
        type: values.type,
        amount: values.amount,
        note: values.note,
        description: values.description,
        date: values.date.format("YYYY-MM-DD"),
      });

      message.success("Đã lưu giao dịch tiết kiệm");
      navigate("/savings");
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Lưu giao dịch thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (!id) return;

      setDeleteLoading(true);

      await deleteSavingTransaction(id);

      message.success("Đã xóa giao dịch tiết kiệm");
      navigate("/savings");
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Xóa giao dịch thất bại"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#F7F9FF] p-5">
        <Text>Đang tải dữ liệu...</Text>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F7F8FF] px-5 py-6 overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#E0E7FF] rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 opacity-60 pointer-events-none" />
      <div className="absolute top-20 right-0 w-80 h-80 bg-[#F3E8FF] rounded-full blur-[80px] translate-x-1/3 -translate-y-1/3 opacity-60 pointer-events-none" />

      <div className="relative mx-auto max-w-[760px] z-10">
        <div className="mb-4 flex items-center justify-between gap-4">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/savings")}
            className="text-gray-600 hover:text-gray-900 bg-white/50"
          >
            Quay lại
          </Button>

          <div className="text-right bg-white/60 px-3 py-1 rounded-xl backdrop-blur-sm shadow-sm">
            <div className="text-sm text-[#111438]">
              {wallet?.name}: {formatMoney(wallet?.balance || 0)}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center mb-5">
          <Title
            level={2}
            style={{ marginBottom: 4, color: "#111438", fontWeight: 800 }}
          >
            {isEditMode ? "Sửa tiết kiệm" : "Thêm tiết kiệm"}
          </Title>
          <Text type="secondary" className="text-[15px]">
            Quản lý tiền tiết kiệm riêng, không ảnh hưởng ví chi tiêu
          </Text>
        </div>

        <Card
          className="border-none shadow-[0_20px_50px_rgba(91,98,255,0.08)] bg-white/90 backdrop-blur-md"
          style={{ borderRadius: 28 }}
          bodyStyle={{ padding: "16px 16px" }}
        >
          <Form<FormValues>
            form={form}
            layout="vertical"
            size="large"
            requiredMark={false}
            onFinish={onFinish}
            initialValues={{
              type: "deposit",
              date: dayjs(),
            }}
          >
            <Form.Item name="type" className="mb-2">
              <div className="flex p-[6px] rounded-[20px] bg-[#F7F8FF] shadow-inner gap-2">
                <div
                  onClick={() => handleChangeType("deposit")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[16px] cursor-pointer font-semibold transition-all duration-300 ${
                    savingType === "deposit"
                      ? "bg-[#22C55E] text-white shadow-md"
                      : "text-[#22C55E] hover:bg-white/50"
                  }`}
                >
                  <ArrowUpOutlined /> Gửi tiết kiệm
                </div>

                <div
                  onClick={() => handleChangeType("withdraw")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[16px] cursor-pointer font-semibold transition-all duration-300 ${
                    savingType === "withdraw"
                      ? "bg-[#EF4444] text-white shadow-md"
                      : "text-[#EF4444] hover:bg-white/50"
                  }`}
                >
                  <ArrowDownOutlined /> Rút tiết kiệm
                </div>
              </div>
            </Form.Item>

            <Form.Item
              name="amount"
              label="Số tiền (VND)"
              rules={[
                { required: true, message: "Vui lòng nhập số tiền" },
                {
                  validator: (_, value) => {
                    if (!value || value <= 0) {
                      return Promise.reject(
                        new Error("Số tiền phải lớn hơn 0")
                      );
                    }

                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                className="w-full custom-input-number"
                min={0}
                placeholder="0 đ"
                controls={false}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                }
                parser={(value) => Number(value?.replace(/\./g, "") || 0) as 0}
              />
            </Form.Item>

            <Form.Item name="note" label="Ghi chú">
              <Input
                placeholder={
                  savingType === "deposit"
                    ? "Ví dụ: Gửi tiết kiệm tháng này"
                    : "Ví dụ: Rút tiền tiết kiệm"
                }
              />
            </Form.Item>

            <Form.Item name="description" label="Chi tiết mô tả">
              <TextArea
                rows={3}
                placeholder="Mô tả chi tiết hơn nếu cần"
                maxLength={300}
                showCount
              />
            </Form.Item>

            <Form.Item
              name="date"
              label="Ngày"
              rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
            >
              <DatePicker
                className="w-full"
                format="DD/MM/YYYY"
                placeholder="Chọn ngày"
              />
            </Form.Item>

            <div className="mt-5">
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                className="saving-save-button"
              >
                {isEditMode ? "Lưu thay đổi" : "Lưu"}
              </Button>

              {isEditMode && (
                <Popconfirm
                  title="Xóa giao dịch tiết kiệm"
                  description="Bạn có chắc muốn xóa giao dịch này không?"
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                  onConfirm={handleDelete}
                >
                  <Button
                    danger
                    block
                    loading={deleteLoading}
                    className="mt-3"
                    style={{
                      height: 42,
                      borderRadius: 16,
                      fontWeight: 700,
                    }}
                  >
                    Xóa giao dịch
                  </Button>
                </Popconfirm>
              )}
            </div>
          </Form>
        </Card>
      </div>

      <style>{`
        .custom-input-number .ant-input-number-input {
          height: 52px !important;
          font-size: 22px !important;
          font-weight: 600 !important;
          color: #895BFF;
          padding-left: 16px;
        }

        .custom-input-number.ant-input-number {
          border-radius: 14px !important;
          border: 1px solid #E5E7EB !important;
        }

        .custom-input-number.ant-input-number-focused {
          border-color: #5B62FF !important;
          box-shadow: 0 0 0 2px rgba(91,98,255,0.1) !important;
        }

        .saving-save-button {
          height: 44px !important;
          border-radius: 16px !important;
          font-size: 18px !important;
          font-weight: 700 !important;
          background: linear-gradient(90deg, #6C5CE7 0%, #3453FF 100%) !important;
          border: none !important;
          box-shadow: 0 8px 20px rgba(91,98,255,0.2) !important;
        }
      `}</style>
    </div>
  );
}

export default SavingCreateScreen;