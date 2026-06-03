import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Typography,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  RightOutlined,
  UpOutlined,
  DownOutlined,
  ShoppingCartOutlined,
  CalendarOutlined,
  TeamOutlined,
  WalletOutlined,
  ArrowUpOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";

import { STORAGE_KEYS } from "../shared/constants/storageKeys";
import { ensureDefaultDataForUser } from "../database/seed";
import type {
  Category,
  DebtType,
  TransactionType,
  Wallet,
} from "../database/db";
import {
  createTransaction,
  deleteTransaction,
  getCategoriesByType,
  getDefaultWalletByUser,
  getTransactionById,
  updateTransaction,
} from "../features/transactions/services/transactionService";
import { formatMoney } from "../shared/utils/formatMoney";
import CategoryCreateModal from "../Modal/ModalAddType";

const { Title, Text } = Typography;
const { TextArea } = Input;

type FormValues = {
  type: TransactionType;
  debtType?: DebtType;
  categoryId: string;
  amount: number;
  note?: string;
  description?: string;
  partner?: string;
  date: dayjs.Dayjs;
};

const debtTypeOptions = [
  { label: "Tôi vay", value: "borrow" },
  { label: "Tôi cho vay", value: "lend" },
  { label: "Tôi trả nợ", value: "repay" },
  { label: "Người khác trả tôi", value: "collect" },
];

function TransactionCreateScreen() {
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [deleteLoading, setDeleteLoading] = useState(false);

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactionType, setTransactionType] =
    useState<TransactionType>("expense");

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);

  const categoryOptions = useMemo(() => {
    return categories.map((item) => ({
      label: (
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
            style={{ background: `${item.color || "#6366f1"}18` }}
          >
            {item.icon || "✨"}
          </span>
          <span className="font-semibold text-[#111438]">{item.name}</span>
        </div>
      ),
      value: item.id,
      searchLabel: item.name,
    }));
  }, [categories]);

  useEffect(() => {
    const initPage = async () => {
      try {
        if (!currentUserId) {
          message.error("Bạn cần đăng nhập lại");
          navigate("/login");
          return;
        }

        await ensureDefaultDataForUser(currentUserId);

        const defaultWallet = await getDefaultWalletByUser(currentUserId);
        setWallet(defaultWallet);

        if (isEditMode && id) {
          const transaction = await getTransactionById(id);

          if (!transaction) {
            message.error("Không tìm thấy giao dịch");
            navigate("/dashboard");
            return;
          }

          if (transaction.userId !== currentUserId) {
            message.error("Bạn không có quyền sửa giao dịch này");
            navigate("/dashboard");
            return;
          }

          setTransactionType(transaction.type);

          const editCategories = await getCategoriesByType(
            currentUserId,
            transaction.type,
          );

          setCategories(editCategories);

          form.setFieldsValue({
            type: transaction.type,
            debtType: transaction.debtType,
            categoryId: transaction.categoryId,
            amount: transaction.amount,
            note: transaction.note,
            description: transaction.description,
            partner: transaction.partner,
            date: dayjs(transaction.date),
          });

          if (transaction.description || transaction.partner) {
            setShowDetails(true);
          }

          return;
        }

        const defaultCategories = await getCategoriesByType(
          currentUserId,
          "expense",
        );

        setCategories(defaultCategories);

        form.setFieldsValue({
          type: "expense",
          date: dayjs(),
        });
      } catch (error) {
        message.error(
          error instanceof Error ? error.message : "Không thể tải dữ liệu",
        );
      } finally {
        setPageLoading(false);
      }
    };

    initPage();
  }, [currentUserId, form, navigate, id, isEditMode]);

  const handleTypeChange = async (value: TransactionType) => {
    if (!currentUserId) return;

    setTransactionType(value);
    form.setFieldsValue({
      type: value,
      categoryId: undefined as unknown as string,
      debtType: undefined,
    });

    const nextCategories = await getCategoriesByType(currentUserId, value);
    setCategories(nextCategories);
  };

  const handleCategorySuccess = async (newCategory: Category) => {
    if (!currentUserId) return;
    const nextCategories = await getCategoriesByType(
      currentUserId,
      transactionType,
    );
    setCategories(nextCategories);
    form.setFieldsValue({ categoryId: newCategory.id });
  };

  const onFinish = async (values: FormValues) => {
    try {
      if (!currentUserId) {
        message.error("Bạn cần đăng nhập lại");
        navigate("/login");
        return;
      }

      if (!wallet) {
        message.error("Không tìm thấy Ví chi tiêu");
        return;
      }

      setLoading(true);

      if (isEditMode && id) {
        await updateTransaction(id, {
          userId: currentUserId,
          walletId: wallet.id,
          type: values.type,
          debtType: values.debtType,
          categoryId: values.categoryId,
          amount: values.amount,
          note: values.note,
          description: values.description,
          partner: values.partner,
          date: values.date.format("YYYY-MM-DD"),
        });

        message.success("Đã cập nhật giao dịch");
        navigate("/dashboard");
        return;
      }

      await createTransaction({
        userId: currentUserId,
        walletId: wallet.id,
        type: values.type,
        debtType: values.debtType,
        categoryId: values.categoryId,
        amount: values.amount,
        note: values.note,
        description: values.description,
        partner: values.partner,
        date: values.date.format("YYYY-MM-DD"),
      });

      message.success("Đã lưu giao dịch");
      navigate("/dashboard");
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : isEditMode
            ? "Cập nhật giao dịch thất bại"
            : "Lưu giao dịch thất bại",
      );
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Text>Đang tải dữ liệu...</Text>
      </div>
    );
  }

  const handleDelete = async () => {
    try {
      if (!id) return;

      setDeleteLoading(true);

      await deleteTransaction(id);

      message.success("Đã xóa giao dịch");
      navigate("/dashboard");
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Xóa giao dịch thất bại",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F7F8FF] px-5 py-6 overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#E0E7FF] rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 opacity-60 pointer-events-none" />
      <div className="absolute top-20 right-0 w-80 h-80 bg-[#F3E8FF] rounded-full blur-[80px] translate-x-1/3 -translate-y-1/3 opacity-60 pointer-events-none" />

      <div className="absolute top-24 left-16 text-[#B4B8FF] text-2xl pointer-events-none">
        ✦
      </div>
      <div className="absolute top-32 right-12 text-[#B4B8FF] text-xl pointer-events-none">
        ✦
      </div>
      <div className="absolute top-40 right-20 grid grid-cols-3 gap-2 pointer-events-none">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="w-1 h-1 bg-[#D4D7FF] rounded-full" />
        ))}
      </div>

      <div className="relative mx-auto max-w-[760px] z-10">
        <div className="mb-4 flex items-center justify-between gap-4">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/dashboard")}
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

        <div className="flex flex-col items-center mb-3">
          <Title
            level={2}
            style={{ marginBottom: 4, color: "#111438", fontWeight: 800 }}
          >
            {isEditMode ? "Sửa giao dịch" : "Thêm giao dịch"}
          </Title>
          <Text type="secondary" className="text-[15px]">
            {isEditMode
              ? "Cập nhật thông tin giao dịch của bạn"
              : "Ghi lại khoản chi, thu nhập hoặc vay nợ"}
          </Text>
        </div>

        <Card
          className="custom-card border-none shadow-[0_20px_50px_rgba(91,98,255,0.08)] bg-white/90 backdrop-blur-md"
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
              type: "expense",
              date: dayjs(),
            }}
          >
            <Form.Item name="type" className="mb-2">
              <div className="flex p-[6px] rounded-[20px] bg-[#F7F8FF] shadow-inner gap-2">
                <div
                  onClick={() => handleTypeChange("expense")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[16px] cursor-pointer font-semibold transition-all duration-300 ${
                    transactionType === "expense"
                      ? "bg-[#5B62FF] text-white shadow-md"
                      : "text-[#5B62FF] hover:bg-white/50"
                  }`}
                >
                  <WalletOutlined /> Khoản chi
                </div>
                <div
                  onClick={() => handleTypeChange("income")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[16px] cursor-pointer font-semibold transition-all duration-300 ${
                    transactionType === "income"
                      ? "bg-[#22C55E] text-white shadow-md"
                      : "text-[#22C55E] hover:bg-white/50"
                  }`}
                >
                  <ArrowUpOutlined /> Khoản thu
                </div>
                <div
                  onClick={() => handleTypeChange("debt")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[16px] cursor-pointer font-semibold transition-all duration-300 ${
                    transactionType === "debt"
                      ? "bg-[#895BFF] text-white shadow-md"
                      : "text-[#895BFF] hover:bg-white/50"
                  }`}
                >
                  <SwapOutlined /> Vay nợ
                </div>
              </div>
            </Form.Item>

            {transactionType === "debt" && (
              <Form.Item
                name="debtType"
                label="Loại vay nợ"
                rules={[
                  { required: true, message: "Vui lòng chọn loại vay nợ" },
                ]}
                className="custom-form-item"
              >
                <Select
                  placeholder="Chọn loại vay nợ"
                  options={debtTypeOptions}
                  className="custom-select"
                />
              </Form.Item>
            )}

            <Form.Item
              name="amount"
              label="Số tiền (VND)"
              className="custom-form-item"
              rules={[
                { required: true, message: "Vui lòng nhập số tiền" },
                {
                  validator: (_, value) => {
                    if (!value || value <= 0)
                      return Promise.reject(
                        new Error("Số tiền phải lớn hơn 0"),
                      );
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

            <div className="relative">
              <div className="absolute left-3 top-[29px] z-10 w-9 h-9 rounded-full bg-[#F3F4FF] text-[#5B62FF] flex items-center justify-center">
                <ShoppingCartOutlined className="text-lg" />
              </div>
              <Form.Item
                name="categoryId"
                label={
                  transactionType === "expense"
                    ? "Nhóm chi tiêu"
                    : transactionType === "income"
                      ? "Nhóm thu nhập"
                      : "Nhóm vay nợ"
                }
                className="custom-form-item"
                rules={[{ required: true, message: "Vui lòng chọn nhóm" }]}
              >
                <Select
                  placeholder="Chọn nhóm"
                  options={categoryOptions}
                  showSearch
                  optionFilterProp="searchLabel"
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <div className="border-t border-[#EEF0FF] p-3">
                        <Button
                          type="dashed"
                          block
                          onClick={() => setCategoryModalOpen(true)}
                        >
                          + Thêm nhóm mới
                        </Button>
                      </div>
                    </>
                  )}
                />
              </Form.Item>
            </div>

            <Form.Item name="note" label="Ghi chú" className="custom-form-item">
              <TextArea
                placeholder="Nhập ghi chú (không bắt buộc)"
                className="custom-textarea"
                maxLength={200}
                showCount
                autoSize={{ minRows: 2, maxRows: 4 }}
              />
            </Form.Item>

            <div className="relative">
              <div className="absolute left-3 top-[38px] z-10 w-9 h-9 rounded-full bg-[#F3F4FF] text-[#5B62FF] flex items-center justify-center">
                <CalendarOutlined className="text-lg" />
              </div>
              <Form.Item
                name="date"
                label="Thứ, ngày tháng"
                className="custom-form-item"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày giao dịch" },
                ]}
              >
                <DatePicker
                  className="w-full custom-datepicker-with-icon"
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                  suffixIcon={<RightOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </div>

            <div className="flex items-center justify-center my-4 relative">
              <div className="absolute w-full h-[1px] bg-gray-100 left-0 top-1/2 -translate-y-1/2"></div>
              <div
                className="bg-white px-4 z-10 text-[#5B62FF] font-medium cursor-pointer flex items-center gap-2 hover:text-[#3453FF] transition-colors"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? (
                  <UpOutlined className="text-xs" />
                ) : (
                  <DownOutlined className="text-xs" />
                )}
                {showDetails ? "Ẩn chi tiết" : "Hiện chi tiết"}
              </div>
            </div>

            {showDetails && (
              <div className="animate-fade-in">
                <div className="relative">
                  <div className="absolute left-3 top-[38px] z-10 w-9 h-9 rounded-full bg-[#F3F4FF] text-[#5B62FF] flex items-center justify-center">
                    <TeamOutlined className="text-lg" />
                  </div>
                  <Form.Item
                    name="partner"
                    label="Tiêu với ai"
                    className="custom-form-item"
                  >
                    <Input
                      placeholder="Nhập tên hoặc chọn người"
                      className="custom-input-with-icon"
                      suffix={<RightOutlined className="text-gray-400" />}
                    />
                  </Form.Item>
                </div>

                <Form.Item
                  name="description"
                  label="Chi tiết mô tả"
                  className="custom-form-item"
                >
                  <TextArea
                    rows={3}
                    placeholder="Mô tả chi tiết hơn nếu cần"
                    maxLength={300}
                    showCount
                    className="custom-textarea"
                  />
                </Form.Item>
              </div>
            )}

            <div className="mt-5">
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                className="money-save-button"
              >
                {isEditMode ? "Lưu thay đổi" : "Lưu"}
              </Button>

              {isEditMode && (
                <Popconfirm
                  title="Xóa giao dịch"
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
                      height: 40,
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
        /* Giảm margin bottom mặc định của Antd từ 24px xuống 14px để thu hẹp khoảng cách */
        .custom-form-item {
          margin-bottom: 14px !important;
        }

        .custom-form-item .ant-form-item-label > label {
          font-weight: 600 !important;
          color: #111438 !important;
          font-size: 14px;
        }

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

        .custom-textarea {
          border-radius: 14px !important;
          border: 1px solid #E5E7EB !important;
          padding: 12px 16px !important;
          font-size: 15px;
        }
        
        .custom-select-with-icon .ant-select-selector {
          height: 52px !important;
          border-radius: 14px !important;
          border: 1px solid #E5E7EB !important;
          padding-left: 56px !important;
          display: flex;
          align-items: center;
          font-size: 15px;
        }
        .custom-select-with-icon.ant-select-focused .ant-select-selector {
          border-color: #5B62FF !important;
          box-shadow: 0 0 0 2px rgba(91,98,255,0.1) !important;
        }

        .custom-datepicker-with-icon {
          height: 52px !important;
          border-radius: 14px !important;
          border: 1px solid #E5E7EB !important;
          padding-left: 56px !important;
          font-size: 15px;
        }

        .custom-input-with-icon {
          height: 52px !important;
          border-radius: 14px !important;
          border: 1px solid #E5E7EB !important;
          padding-left: 56px !important;
          font-size: 15px;
        }

        .custom-select .ant-select-selector {
          height: 52px !important;
          border-radius: 14px !important;
          border: 1px solid #E5E7EB !important;
          display: flex;
          align-items: center;
        }

        .money-save-button {
          height: 40px !important;
          border-radius: 16px !important;
          font-size: 18px !important;
          font-weight: 700 !important;
          background: linear-gradient(90deg, #6C5CE7 0%, #3453FF 100%) !important;
          border: none !important;
          box-shadow: 0 8px 20px rgba(91,98,255,0.2) !important;
          transition: transform 0.2s, box-shadow 0.2s !important;
        }
        .money-save-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(91,98,255,0.3) !important;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <CategoryCreateModal
        open={categoryModalOpen}
        onCancel={() => setCategoryModalOpen(false)}
        transactionType={transactionType}
        currentUserId={currentUserId}
        onSuccess={handleCategorySuccess}
      />
    </div>
  );
}

export default TransactionCreateScreen;
