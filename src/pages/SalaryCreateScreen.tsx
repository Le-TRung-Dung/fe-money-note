import { useEffect, useMemo, useState } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Skeleton,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";

import { STORAGE_KEYS } from "../shared/constants/storageKeys";
import { formatMoney } from "../shared/utils/formatMoney";
import type { SalaryRecordType } from "../database/db";
import {
  createSalaryRecord,
  deleteSalaryRecord,
  getSalaryRecordById,
  updateSalaryRecord,
} from "../features/salary/services/salaryService";
import {
  SALARY_TYPE_OPTIONS,
  getSalaryTypeColor,
  getSalaryTypeIcon,
  getSalaryTypeLabel,
} from "../features/salary/types";

type SalaryFormValues = {
  type: SalaryRecordType;
  amount: number;
  month: dayjs.Dayjs;
  receivedDate: dayjs.Dayjs;
  company?: string;
  note?: string;
  description?: string;
};

function SalaryCreateScreen() {
  const navigate = useNavigate();
  const params = useParams();
  const [form] = Form.useForm<SalaryFormValues>();

  const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
  const salaryId = params.id;
  const isEditMode = Boolean(salaryId);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditMode);

  const selectedType = Form.useWatch("type", form);

  const selectedTypeMeta = useMemo(() => {
    return (
      SALARY_TYPE_OPTIONS.find((item) => item.value === selectedType) ||
      SALARY_TYPE_OPTIONS[0]
    );
  }, [selectedType]);

  useEffect(() => {
    initPage();
  }, [salaryId]);

  const initPage = async () => {
    try {
      if (!currentUserId) {
        message.error("Bạn cần đăng nhập lại");
        navigate("/login");
        return;
      }

      if (!salaryId) {
        form.setFieldsValue({
          type: "salary",
          amount: undefined,
          month: dayjs(),
          receivedDate: dayjs(),
          company: "",
          note: "",
          description: "",
        });

        setPageLoading(false);
        return;
      }

      setPageLoading(true);

      const record = await getSalaryRecordById(salaryId);

      if (!record) {
        message.error("Không tìm thấy bản ghi lương");
        navigate("/salary");
        return;
      }

      form.setFieldsValue({
        type: record.type,
        amount: record.amount,
        month: dayjs(`${record.month}-01`),
        receivedDate: dayjs(record.receivedDate),
        company: record.company || "",
        note: record.note || "",
        description: record.description || "",
      });
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Không thể tải dữ liệu lương",
      );
    } finally {
      setPageLoading(false);
    }
  };

  const onFinish = async (values: SalaryFormValues) => {
    try {
      if (!currentUserId) {
        message.error("Bạn cần đăng nhập lại");
        navigate("/login");
        return;
      }

      setLoading(true);

      const payload = {
        userId: currentUserId,
        type: values.type,
        amount: Number(values.amount || 0),
        month: values.month.format("YYYY-MM"),
        receivedDate: values.receivedDate.format("YYYY-MM-DD"),
        company: values.company,
        note: values.note,
        description: values.description,
      };

      if (isEditMode && salaryId) {
        await updateSalaryRecord(salaryId, payload);
        message.success("Đã cập nhật khoản lương");
      } else {
        await createSalaryRecord(payload);
        message.success("Đã thêm khoản lương");
      }

      navigate("/salary");
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Không thể lưu khoản lương",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!salaryId) return;

    Modal.confirm({
      title: "Xóa khoản lương",
      content:
        "Bạn có chắc muốn xóa khoản này không? Thao tác này sẽ xóa khỏi local, sau đó cần đồng bộ lại cloud.",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      centered: true,
      onOk: async () => {
        try {
          await deleteSalaryRecord(salaryId);
          message.success("Đã xóa khoản lương");
          navigate("/salary");
        } catch (error) {
          message.error(
            error instanceof Error ? error.message : "Không thể xóa khoản lương",
          );
        }
      },
    });
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#F7F9FF] p-5">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

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
              {isEditMode ? "Sửa khoản lương" : "Thêm khoản lương"}
            </h1>
            <div className="mt-1 text-xs font-medium text-gray-400">
              Lương, thưởng và hoàn thuế
            </div>
          </div>

          {isEditMode ? (
            <button
              onClick={handleDelete}
              className="flex h-10 w-10 items-center justify-center rounded-full border-none bg-white text-red-500 shadow-sm"
            >
              <DeleteOutlined />
            </button>
          ) : (
            <div className="h-10 w-10" />
          )}
        </div>

        <div
          className="mb-5 rounded-[30px] p-5 text-white shadow-[0_16px_40px_rgba(34,197,94,0.22)]"
          style={{
            background: `linear-gradient(135deg, ${selectedTypeMeta.color}, #895BFF)`,
          }}
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-2xl backdrop-blur-md">
              {selectedTypeMeta.icon}
            </div>

            <div>
              <div className="text-sm font-semibold opacity-85">
                Loại khoản thu nhập
              </div>
              <div className="text-xl font-black">
                {getSalaryTypeLabel(selectedType || "salary")}
              </div>
            </div>
          </div>

          <div className="text-[13px] font-medium opacity-85">
            Dữ liệu này được tách riêng khỏi ví chi tiêu và ví tiết kiệm.
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            onFinish={onFinish}
          >
            <Form.Item
              label="Loại khoản"
              name="type"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn loại khoản",
                },
              ]}
            >
              <Select
                size="large"
                className="salary-select"
                options={SALARY_TYPE_OPTIONS.map((item) => ({
                  label: (
                    <div className="flex items-center gap-2">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                  ),
                  value: item.value,
                }))}
              />
            </Form.Item>

            <Form.Item
              label="Số tiền"
              name="amount"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập số tiền",
                },
              ]}
            >
              <InputNumber
                size="large"
                min={0}
                className="w-full rounded-2xl"
                placeholder="Nhập số tiền"
                formatter={(value) =>
                  value
                    ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                    : ""
                }
                parser={(value) =>
                  Number((value || "").replace(/\./g, "")) as any
                }
              />
            </Form.Item>

            <div className="grid grid-cols-2 gap-3">
              <Form.Item
                label="Tháng lương"
                name="month"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn tháng",
                  },
                ]}
              >
                <DatePicker
                  picker="month"
                  format="MM/YYYY"
                  size="large"
                  className="w-full rounded-2xl"
                />
              </Form.Item>

              <Form.Item
                label="Ngày nhận"
                name="receivedDate"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ngày nhận",
                  },
                ]}
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  size="large"
                  className="w-full rounded-2xl"
                />
              </Form.Item>
            </div>

            <Form.Item label="Công ty / nguồn nhận" name="company">
              <Input
                size="large"
                placeholder="Ví dụ: Công ty ABC"
                className="h-12 rounded-2xl"
              />
            </Form.Item>

            <Form.Item label="Ghi chú" name="note">
              <Input
                size="large"
                placeholder="Ví dụ: Lương tháng 6"
                className="h-12 rounded-2xl"
              />
            </Form.Item>

            <Form.Item label="Mô tả chi tiết" name="description">
              <Input.TextArea
                rows={4}
                placeholder="Nhập mô tả thêm nếu cần"
                className="rounded-2xl"
              />
            </Form.Item>

            <div className="mb-4 rounded-2xl bg-[#F7F8FF] p-4 text-[13px] font-medium leading-5 text-gray-500">
              Sau khi thêm hoặc sửa khoản lương, dữ liệu sẽ lưu vào máy trước.
              Bạn có thể đồng bộ lên cloud ở màn Tài khoản.
            </div>

            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              icon={<SaveOutlined />}
              className="h-12 rounded-[18px] border-none bg-[#22C55E] text-[15px] font-black shadow-[0_8px_22px_rgba(34,197,94,0.28)]"
            >
              {isEditMode ? "Lưu thay đổi" : "Thêm khoản lương"}
            </Button>
          </Form>
        </div>
      </div>

      <style>{`
        .salary-select .ant-select-selector {
          height: 48px !important;
          border-radius: 16px !important;
          display: flex;
          align-items: center;
        }

        .ant-picker {
          height: 48px;
        }

        .ant-input-number {
          height: 48px;
        }

        .ant-input-number-input {
          height: 46px !important;
        }
      `}</style>
    </div>
  );
}

export default SalaryCreateScreen;