import React, { useEffect, useState } from "react";
import { Modal, Form, Input, message } from "antd";
import { categoryIconOptions } from "../shared/constants/storageKeys";
import { createCategoryForTransaction } from "../features/transactions/services/transactionService";
import type { TransactionType, Category } from "../database/db";

interface CategoryCreateModalProps {
  open: boolean;
  onCancel: () => void;
  transactionType: TransactionType;
  currentUserId: string | null;
  onSuccess: (newCategory: Category) => void;
}

const CategoryCreateModal: React.FC<CategoryCreateModalProps> = ({
  open,
  onCancel,
  transactionType,
  currentUserId,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        icon:
          transactionType === "expense"
            ? "🍜"
            : transactionType === "income"
            ? "💼"
            : "💰",
      });
    } else {
      form.resetFields();
    }
  }, [open, transactionType, form]);

  const handleCreateCategory = async () => {
    try {
      if (!currentUserId) {
        message.error("Bạn cần đăng nhập lại");
        return;
      }

      const values = await form.validateFields();
      setLoading(true);

      const newCategory = await createCategoryForTransaction({
        userId: currentUserId,
        name: values.name,
        icon: values.icon,
        type: transactionType,
      });

      message.success("Đã thêm nhóm mới");
      onSuccess(newCategory);
      onCancel();
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Thêm nhóm thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        transactionType === "expense"
          ? "Thêm nhóm chi tiêu"
          : transactionType === "income"
          ? "Thêm nhóm thu nhập"
          : "Thêm nhóm vay nợ"
      }
      open={open}
      onCancel={onCancel}
      onOk={handleCreateCategory}
      confirmLoading={loading}
      okText="Thêm nhóm"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item
          name="name"
          label="Tên nhóm"
          rules={[{ required: true, message: "Vui lòng nhập tên nhóm" }]}
        >
          <Input placeholder="Ví dụ: Cà phê, Ăn vặt, Tiền học..." />
        </Form.Item>

        <Form.Item
          name="icon"
          label="Icon"
          rules={[{ required: true, message: "Vui lòng chọn icon" }]}
        >
          <div className="grid grid-cols-10 gap-2 max-sm:grid-cols-5">
            {categoryIconOptions.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => form.setFieldsValue({ icon })}
                className="category-icon-button"
                // Bạn có thể thêm css class `category-icon-button` vào file CSS tổng nếu chưa có
              >
                {icon}
              </button>
            ))}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CategoryCreateModal;