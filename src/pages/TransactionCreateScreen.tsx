import { useEffect, useMemo, useRef, useState } from "react";
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
  Spin,
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
import { FaArrowDown, FaArrowUp } from "react-icons/fa";

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
  const { id } = useParams();
  const [form] = Form.useForm<FormValues>();

  const pageRef = useRef<HTMLDivElement | null>(null);

  const isEditMode = Boolean(id);
  const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);

  const [loading, setLoading] = useState(false);
  const [successLoading, setSuccessLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactionType, setTransactionType] =
    useState<TransactionType>("expense");

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const [mobilePopupOpen, setMobilePopupOpen] = useState(false);

  const categoryOptions = useMemo(() => {
    return categories.map((item) => ({
      label: (
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg"
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
    if (!mobilePopupOpen) return;

    const scrollY = window.scrollY;

    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;
    const originalOverflow = document.body.style.overflow;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      document.body.style.overflow = originalOverflow;

      window.scrollTo(0, scrollY);
    };
  }, [mobilePopupOpen]);

  useEffect(() => {
    let focusTimer: ReturnType<typeof setTimeout> | null = null;
    const isEditableElement = (element: HTMLElement | null) => {
      if (!element) return false;

      return (
        element.tagName === "INPUT" ||
        element.tagName === "TEXTAREA" ||
        Boolean(element.closest(".ant-input-number"))
      );
    };
    const scrollToFocusedInput = () => {
      const activeElement = document.activeElement as HTMLElement | null;

      if (!isEditableElement(activeElement)) return;

      const formItem = activeElement?.closest(".ant-form-item") as HTMLElement;
      const target = formItem || activeElement;

      target.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    };

    const handleFocusIn = () => {
      if (focusTimer) {
        clearTimeout(focusTimer);
      }

      focusTimer = setTimeout(() => {
        scrollToFocusedInput();
      }, 350);
    };

    window.addEventListener("focusin", handleFocusIn);

    return () => {
      if (focusTimer) {
        clearTimeout(focusTimer);
      }

      window.removeEventListener("focusin", handleFocusIn);
    };
  }, []);

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

  const getMobilePopupContainer = (triggerNode: HTMLElement) => {
    return triggerNode.parentElement || document.body;
  };

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

      const transactionPayload = {
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
      };

      if (isEditMode && id) {
        await updateTransaction(id, transactionPayload);
      } else {
        await createTransaction(transactionPayload);
      }

      setLoading(false);
      setSuccessLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      message.success(isEditMode ? "Đã cập nhật giao dịch" : "Đã lưu giao dịch");
      navigate("/dashboard");
    } catch (error) {
      setLoading(false);
      message.error(
        error instanceof Error
          ? error.message
          : isEditMode
            ? "Cập nhật giao dịch thất bại"
            : "Lưu giao dịch thất bại",
      );
    }
  };

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

  if (pageLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Text>Đang tải dữ liệu...</Text>
      </div>
    );
  }

  return (
    <div
      ref={pageRef}
      className="transaction-mobile-page relative min-h-screen bg-[#F7F8FF] px-3 py-4 overflow-x-hidden"
    >
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#E0E7FF] rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 opacity-60 pointer-events-none" />
      <div className="absolute top-20 right-0 w-80 h-80 bg-[#F3E8FF] rounded-full blur-[80px] translate-x-1/3 -translate-y-1/3 opacity-60 pointer-events-none" />

      <div className="absolute top-24 left-16 text-[#B4B8FF] text-2xl pointer-events-none">
        ✦
      </div>

      <div className="absolute top-32 right-12 text-[#B4B8FF] text-xl pointer-events-none">
        ✦
      </div>

      <div className="relative mx-auto max-w-[480px] z-10">
        <div className="mb-4 flex items-center justify-between gap-2">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/dashboard")}
            className="mobile-back-button"
          >
            Quay lại
          </Button>

          <div className="max-w-[58%] text-right bg-white/70 px-3 py-1.5 rounded-xl backdrop-blur-sm shadow-sm">
            <div className="text-[12px] font-semibold text-[#111438] truncate">
              {wallet?.name}: {formatMoney(wallet?.balance || 0)}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center mb-4 text-center">
          <Title
            level={3}
            style={{
              marginBottom: 4,
              color: "#111438",
              fontWeight: 800,
              fontSize: 24,
            }}
          >
            {isEditMode ? "Sửa giao dịch" : "Thêm giao dịch"}
          </Title>

          <Text type="secondary" className="text-[14px] leading-5">
            {isEditMode
              ? "Cập nhật thông tin giao dịch của bạn"
              : "Ghi lại khoản chi, thu nhập hoặc vay nợ"}
          </Text>
        </div>

        <Card
          className="custom-card border-none shadow-[0_16px_40px_rgba(91,98,255,0.08)] bg-white/95 backdrop-blur-md"
          style={{ borderRadius: 24 }}
          bodyStyle={{ padding: "14px 12px" }}
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
            <Form.Item name="type" className="mb-3">
              <div className="grid grid-cols-3 p-[5px] rounded-[18px] bg-[#F7F8FF] shadow-inner gap-1.5">
                <div
                  onClick={() => handleTypeChange("expense")}
                  className={`mobile-type-tab ${
                    transactionType === "expense"
                      ? "bg-[#5B62FF] text-white shadow-md"
                      : "text-[#5B62FF]"
                  }`}
                >
                  <FaArrowDown />
                  <span>Chi</span>
                </div>

                <div
                  onClick={() => handleTypeChange("income")}
                  className={`mobile-type-tab ${
                    transactionType === "income"
                      ? "bg-[#22C55E] text-white shadow-md"
                      : "text-[#22C55E]"
                  }`}
                >
                  <FaArrowUp />
                  <span>Thu</span>
                </div>

                <div
                  onClick={() => handleTypeChange("debt")}
                  className={`mobile-type-tab ${
                    transactionType === "debt"
                      ? "bg-[#895BFF] text-white shadow-md"
                      : "text-[#895BFF]"
                  }`}
                >
                  <SwapOutlined />
                  <span>Vay nợ</span>
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
                  getPopupContainer={getMobilePopupContainer}
                  onOpenChange={setMobilePopupOpen}
                  dropdownStyle={{
                    maxHeight: 280,
                    overflowY: "auto",
                    WebkitOverflowScrolling: "touch",
                    overscrollBehavior: "contain",
                  }}
                  listHeight={260}
                  virtual={false}
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
                inputMode="decimal" // Cập nhật: Gọi bàn phím số có kèm dấu chấm/phẩy trên mobile
                pattern="[0-9.]*" // Cập nhật: Cho phép cả số và dấu chấm
                onKeyPress={(event) => {
                  // Cập nhật: Chặn nếu phím gõ KHÔNG phải là số hoặc dấu chấm
                  if (!/[0-9.]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                }
                parser={(value) => {
                  // GIỮ NGUYÊN: Dù cho phép gõ dấu ".", ta vẫn phải xóa nó đi khi parse
                  // để "1.000" biến thành số 1000 chuẩn thay vì bị hiểu nhầm là số 1.
                  const numericValue = value?.replace(/\D/g, "");
                  return numericValue ? Number(numericValue) : ("" as any);
                }}
              />
            </Form.Item>

            <div className="relative">
              <div className="mobile-field-icon absolute left-3 top-[31px] z-10">
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
                  className="custom-select-with-icon"
                  getPopupContainer={getMobilePopupContainer}
                  onOpenChange={setMobilePopupOpen}
                  dropdownStyle={{
                    maxHeight: 320,
                    overflowY: "auto",
                    WebkitOverflowScrolling: "touch",
                    overscrollBehavior: "contain",
                  }}
                  listHeight={260}
                  virtual={false}
                  dropdownRender={(menu) => (
                    <div className="mobile-select-dropdown">
                      {menu}

                      <div className="mobile-add-category-box">
                        <Button
                          type="dashed"
                          block
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setMobilePopupOpen(false);
                            setCategoryModalOpen(true);
                          }}
                        >
                          + Thêm nhóm mới
                        </Button>
                      </div>
                    </div>
                  )}
                />
              </Form.Item>
            </div>

            <Form.Item name="note" label="Ghi chú" className="custom-form-item">
              <TextArea
                placeholder="Nhập ghi chú nếu cần"
                className="custom-textarea"
                maxLength={200}
                showCount
                autoSize={{ minRows: 2, maxRows: 4 }}
              />
            </Form.Item>

            <div className="relative">
              <div className="mobile-field-icon absolute left-3 top-[31px] z-10">
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
                  inputReadOnly
                  placement="bottomLeft"
                  getPopupContainer={getMobilePopupContainer}
                  onOpenChange={setMobilePopupOpen}
                  suffixIcon={<RightOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </div>

            <div className="flex items-center justify-center my-4 relative">
              <div className="absolute w-full h-[1px] bg-gray-100 left-0 top-1/2 -translate-y-1/2" />

              <div
                className="bg-white px-4 z-10 text-[#5B62FF] font-semibold cursor-pointer flex items-center gap-2 text-[14px] active:opacity-70"
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
                  <div className="mobile-field-icon absolute left-3 top-[31px] z-10">
                    <TeamOutlined className="text-lg" />
                  </div>

                  <Form.Item
                    name="partner"
                    label="Tiêu với ai"
                    className="custom-form-item"
                  >
                    <Input
                      placeholder="Nhập tên nếu cần"
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
                    placeholder="Mô tả chi tiết hơn nếu cần"
                    maxLength={300}
                    showCount
                    autoSize={{ minRows: 3, maxRows: 5 }}
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
                    className="mt-3 mobile-delete-button"
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
        .transaction-mobile-page {
          min-height: 100dvh;
          padding-bottom: calc(24px + env(safe-area-inset-bottom));
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-x: none;
          scroll-padding-top: 90px;
          scroll-padding-bottom: 260px;
        }

        .transaction-mobile-page .ant-form-item {
          scroll-margin-top: 90px;
          scroll-margin-bottom: 260px;
        }

        .transaction-mobile-page input,
        .transaction-mobile-page textarea {
          scroll-margin-top: 90px;
          scroll-margin-bottom: 260px;
        }

        @supports (height: 100dvh) {
          .transaction-mobile-page {
            min-height: 100dvh;
          }
        }

        .mobile-back-button {
          height: 36px !important;
          border-radius: 999px !important;
          background: rgba(255, 255, 255, 0.7) !important;
          color: #4B5563 !important;
          font-weight: 600 !important;
          padding-inline: 12px !important;
        }

        .mobile-type-tab {
          min-height: 42px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          transition: transform 0.15s ease, background 0.2s ease, color 0.2s ease;
        }

        .mobile-type-tab:active {
          transform: scale(0.97);
        }

        .custom-form-item {
          margin-bottom: 13px !important;
        }

        .custom-form-item .ant-form-item-label {
          padding-bottom: 5px !important;
        }

        .custom-form-item .ant-form-item-label > label {
          font-weight: 700 !important;
          color: #111438 !important;
          font-size: 13px !important;
        }

        .custom-input-number.ant-input-number {
          height: 50px !important;
          border-radius: 15px !important;
          border: 1px solid #E5E7EB !important;
          overflow: hidden;
        }

        .custom-input-number .ant-input-number-input {
          height: 50px !important;
          font-size: 21px !important;
          font-weight: 700 !important;
          color: #895BFF !important;
          padding-left: 15px !important;
        }

        .custom-input-number.ant-input-number-focused {
          border-color: #5B62FF !important;
          box-shadow: 0 0 0 2px rgba(91, 98, 255, 0.1) !important;
        }

        .custom-select .ant-select-selector,
        .custom-select-with-icon .ant-select-selector {
          height: 50px !important;
          border-radius: 15px !important;
          border: 1px solid #E5E7EB !important;
          display: flex !important;
          align-items: center !important;
          font-size: 15px !important;
          box-shadow: none !important;
        }

        .custom-select-with-icon .ant-select-selector {
          padding-left: 52px !important;
        }

        .custom-select.ant-select-focused .ant-select-selector,
        .custom-select-with-icon.ant-select-focused .ant-select-selector {
          border-color: #5B62FF !important;
          box-shadow: 0 0 0 2px rgba(91, 98, 255, 0.1) !important;
        }

        .custom-select .ant-select-selection-item,
        .custom-select-with-icon .ant-select-selection-item {
          display: flex !important;
          align-items: center !important;
          line-height: 1.2 !important;
          font-weight: 600 !important;
        }

        .custom-select .ant-select-selection-placeholder,
        .custom-select-with-icon .ant-select-selection-placeholder {
          color: #9CA3AF !important;
          font-size: 15px !important;
        }

        .custom-datepicker-with-icon {
          height: 50px !important;
          border-radius: 15px !important;
          border: 1px solid #E5E7EB !important;
          padding-left: 52px !important;
          font-size: 15px !important;
          box-shadow: none !important;
        }

        .custom-datepicker-with-icon.ant-picker-focused {
          border-color: #5B62FF !important;
          box-shadow: 0 0 0 2px rgba(91, 98, 255, 0.1) !important;
        }

        .custom-datepicker-with-icon input {
          font-size: 15px !important;
          font-weight: 600 !important;
        }

        .custom-input-with-icon {
          height: 50px !important;
          border-radius: 15px !important;
          border: 1px solid #E5E7EB !important;
          padding-left: 52px !important;
          font-size: 15px !important;
          box-shadow: none !important;
        }

        .custom-input-with-icon:focus,
        .custom-input-with-icon:hover {
          border-color: #5B62FF !important;
          box-shadow: 0 0 0 2px rgba(91, 98, 255, 0.1) !important;
        }

        .custom-textarea {
          border-radius: 15px !important;
          border: 1px solid #E5E7EB !important;
          padding: 12px 14px !important;
          font-size: 15px !important;
          box-shadow: none !important;
        }

        .custom-textarea:focus,
        .custom-textarea:hover {
          border-color: #5B62FF !important;
          box-shadow: 0 0 0 2px rgba(91, 98, 255, 0.1) !important;
        }

        .mobile-field-icon {
          width: 34px;
          height: 34px;
          border-radius: 999px;
          background: #F3F4FF;
          color: #5B62FF;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .money-save-button {
          height: 46px !important;
          border-radius: 16px !important;
          font-size: 17px !important;
          font-weight: 800 !important;
          background: linear-gradient(90deg, #6C5CE7 0%, #3453FF 100%) !important;
          border: none !important;
          box-shadow: 0 8px 20px rgba(91, 98, 255, 0.22) !important;
        }

        .money-save-button:active {
          transform: scale(0.98);
        }

        .mobile-delete-button {
          height: 44px !important;
          border-radius: 16px !important;
          font-weight: 700 !important;
        }

        .animate-fade-in {
          animation: fadeIn 0.22s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Fix chính cho Select mobile */
        .mobile-select-dropdown,
        .ant-select-dropdown {
          overscroll-behavior: contain !important;
          -webkit-overflow-scrolling: touch !important;
          touch-action: pan-y !important;
          border-radius: 18px !important;
          overflow: hidden !important;
          box-shadow: 0 16px 40px rgba(17, 20, 56, 0.14) !important;
        }

        .ant-select-dropdown {
          max-height: 340px !important;
        }

        .ant-select-dropdown .rc-virtual-list,
        .ant-select-dropdown .rc-virtual-list-holder {
          max-height: 260px !important;
          overscroll-behavior: contain !important;
          -webkit-overflow-scrolling: touch !important;
        }

        .ant-select-dropdown .ant-select-item {
          min-height: 46px !important;
          display: flex !important;
          align-items: center !important;
          padding: 8px 12px !important;
          font-size: 15px !important;
        }

        .ant-select-dropdown .ant-select-item-option-selected {
          background: #F3F4FF !important;
          font-weight: 700 !important;
        }

        .ant-select-dropdown .ant-select-item-option-active {
          background: #F7F8FF !important;
        }

        .mobile-add-category-box {
          position: sticky;
          bottom: 0;
          background: #fff;
          border-top: 1px solid #EEF0FF;
          padding: 10px 12px;
          z-index: 2;
        }

        .mobile-add-category-box .ant-btn {
          height: 42px !important;
          border-radius: 14px !important;
          font-weight: 700 !important;
        }

        /* Fix DatePicker mobile */
        .ant-picker-dropdown {
          overscroll-behavior: contain !important;
          -webkit-overflow-scrolling: touch !important;
        }

        .ant-picker-panel-container {
          border-radius: 18px !important;
          overflow: hidden !important;
          box-shadow: 0 16px 40px rgba(17, 20, 56, 0.14) !important;
        }

        .ant-picker-panel {
          width: 100% !important;
        }

        .ant-picker-date-panel {
          width: 100% !important;
        }

        .ant-picker-content {
          width: 100% !important;
        }

        .ant-picker-cell {
          padding: 4px 0 !important;
        }

        .ant-picker-cell-inner {
          min-width: 32px !important;
          height: 32px !important;
          line-height: 32px !important;
        }

        @media (max-width: 640px) {
          .ant-select-dropdown {
            position: fixed !important;
            left: 12px !important;
            right: 12px !important;
            width: auto !important;
          }

          .ant-picker-dropdown {
            position: fixed !important;
            left: 12px !important;
            right: 12px !important;
            width: auto !important;
          }

          .ant-picker-panel-container {
            width: 100% !important;
          }
        }
      `}</style>

      {successLoading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm transition-all duration-300">
          <Spin size="large" />
          <div className="mt-4 text-[15px] font-semibold text-[#5B62FF] animate-pulse">
            Đang hoàn tất...
          </div>
        </div>
      )}

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