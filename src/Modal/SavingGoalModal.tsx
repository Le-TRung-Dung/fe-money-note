import { useEffect } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  message,
} from "antd";
import dayjs from "dayjs";

import type { SavingGoal } from "../database/db";
import {
  createSavingGoal,
  deleteSavingGoal,
  updateSavingGoal,
} from "../features/savings/services/savingGoalService";

type SavingGoalModalProps = {
  open: boolean;
  currentUserId: string | null;
  editingGoal?: SavingGoal | null;
  onCancel: () => void;
  onSuccess: () => void;
};

type FormValues = {
  name: string;
  targetAmount: number;
  icon: string;
  description?: string;
  deadline?: dayjs.Dayjs;
};

const iconOptions = [
  "🎯",
  "💻",
  "🏍️",
  "🚗",
  "🏠",
  "✈️",
  "💍",
  "📱",
  "🎓",
  "💰",
  "🛡️",
  "🎁",
];

function SavingGoalModal({
  open,
  currentUserId,
  editingGoal,
  onCancel,
  onSuccess,
}: SavingGoalModalProps) {
  const [form] = Form.useForm<FormValues>();

  const isEditMode = Boolean(editingGoal);

  useEffect(() => {
    if (!open) return;

    if (editingGoal) {
      form.setFieldsValue({
        name: editingGoal.name,
        targetAmount: editingGoal.targetAmount,
        icon: editingGoal.icon || "🎯",
        description: editingGoal.description,
        deadline: editingGoal.deadline ? dayjs(editingGoal.deadline) : undefined,
      });
      return;
    }

    form.setFieldsValue({
      icon: "🎯",
    });
  }, [open, editingGoal, form]);

  const handleSubmit = async () => {
    try {
      if (!currentUserId) {
        message.error("Bạn cần đăng nhập lại");
        return;
      }

      const values = await form.validateFields();

      const payload = {
        userId: currentUserId,
        name: values.name,
        targetAmount: values.targetAmount,
        icon: values.icon,
        color: editingGoal?.color || "#895BFF",
        description: values.description,
        deadline: values.deadline?.format("YYYY-MM-DD"),
      };

      if (editingGoal) {
        await updateSavingGoal(editingGoal.id, payload);
        message.success("Đã cập nhật mục tiêu");
      } else {
        await createSavingGoal(payload);
        message.success("Đã tạo mục tiêu");
      }

      form.resetFields();
      onSuccess();
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Lưu mục tiêu thất bại"
      );
    }
  };

  const handleDelete = async () => {
    try {
      if (!editingGoal) return;

      await deleteSavingGoal(editingGoal.id);

      message.success("Đã xóa mục tiêu");
      form.resetFields();
      onSuccess();
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Xóa mục tiêu thất bại"
      );
    }
  };

  return (
    <Modal
      title={isEditMode ? "Sửa mục tiêu tiết kiệm" : "Tạo mục tiêu tiết kiệm"}
      open={open}
      centered // Căn giữa modal trên màn hình
      className="custom-modal"
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      footer={[
        isEditMode && (
          <Popconfirm
            key="delete"
            title="Xóa mục tiêu"
            description="Bạn có chắc muốn xóa mục tiêu này không?"
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={handleDelete}
          >
            <Button danger>Xóa</Button>
          </Popconfirm>
        ),

        <Button
          key="cancel"
          onClick={() => {
            form.resetFields();
            onCancel();
          }}
        >
          Hủy
        </Button>,

        <Button key="submit" type="primary" onClick={handleSubmit}>
          {isEditMode ? "Lưu thay đổi" : "Tạo mục tiêu"}
        </Button>,
      ]}
    >
      {/* Vùng chứa form giới hạn chiều cao 65% màn hình và tự cuộn */}
      <div className="custom-scrollbar mt-4 max-h-[65dvh] overflow-y-auto pr-3">
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            name="name"
            label="Tên mục tiêu"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập tên mục tiêu",
              },
            ]}
          >
            <Input placeholder="Ví dụ: Mua MacBook, Quỹ dự phòng..." />
          </Form.Item>

          <Form.Item
            name="targetAmount"
            label="Số tiền mục tiêu"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập số tiền mục tiêu",
              },
              {
                validator: (_, value) => {
                  if (!value || value <= 0) {
                    return Promise.reject(
                      new Error("Số tiền mục tiêu phải lớn hơn 0")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              className="w-full"
              min={0}
              placeholder="0"
              controls={false}
              inputMode="decimal"
              pattern="[0-9.]*"
              onKeyPress={(event) => {
                if (!/[0-9.]/.test(event.key)) {
                  event.preventDefault();
                }
              }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
              }
              parser={(value) => {
                const numericValue = value?.replace(/\D/g, "");
                return numericValue ? Number(numericValue) : ("" as any);
              }}
              addonAfter="đ"
            />
          </Form.Item>

          <Form.Item
            name="icon"
            label="Icon"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn icon",
              },
            ]}
          >
            <div className="grid grid-cols-6 gap-2">
              {iconOptions.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => form.setFieldsValue({ icon })}
                  className="h-11 w-11 rounded-2xl border border-[#E5E7EB] bg-white text-xl transition hover:border-[#895BFF] hover:bg-[#F7F8FF] focus:border-[#895BFF] focus:bg-[#F7F8FF]"
                >
                  {icon}
                </button>
              ))}
            </div>
          </Form.Item>

          <Form.Item name="deadline" label="Ngày mong muốn đạt được">
            <DatePicker className="w-full h-[40px]" format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea
              rows={3}
              placeholder="Ví dụ: Cố gắng đạt mục tiêu trước cuối năm..."
              maxLength={300}
              showCount
            />
          </Form.Item>
        </Form>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #E5E7EB;
          border-radius: 4px;
        }
        .custom-modal .ant-modal-content {
          border-radius: 20px;
          padding: 24px 20px;
        }
      `}</style>
    </Modal>
  );
}

export default SavingGoalModal;