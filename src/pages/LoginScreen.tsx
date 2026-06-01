import React from 'react';
import { Form, Input, Button, Checkbox, ConfigProvider, Divider } from 'antd';
import { 
  LockOutlined, 
  MailOutlined, 
  GoogleOutlined, 
  AppleOutlined,
  CreditCardOutlined
} from '@ant-design/icons';

const LoginPage: React.FC = () => {
  const onFinish = (values: any) => {
    console.log('Success:', values);
  };

  return (
    // ConfigProvider giúp đổi màu mặc định của Antd (xanh dương) sang màu Xanh lá của NoteMoney
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#059669', // Xanh Emerald tương đồng với ảnh
          borderRadius: 12,
          fontFamily: 'Inter, sans-serif',
        },
        components: {
          Button: {
            controlHeightLG: 48, // Nút to hơn, dễ bấm hơn
            borderRadiusLG: 24, // Bo góc tròn kiểu pill-shape giống ảnh
          },
          Input: {
            controlHeightLG: 48,
          }
        }
      }}
    >
      <div className="min-h-screen w-full flex bg-white font-sans">
        
        {/* --- CỘT TRÁI: FORM ĐĂNG NHẬP --- */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 md:p-24 relative z-10">
          <div className="w-full max-w-md">
            
            {/* Logo */}
            <div className="flex items-center gap-2 mb-10">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 text-xl">
                <CreditCardOutlined />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                NoteMoney
              </h1>
            </div>

            {/* Header Text */}
            <div className="mb-10">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
                Chào mừng trở lại! 👋
              </h2>
              <p className="text-slate-500 text-base">
                Đăng nhập để tiếp tục ghi chép chi tiêu và làm chủ hành trình tự do tài chính của bạn.
              </p>
            </div>

            {/* Antd Form */}
            <Form
              name="login"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="email"
                rules={[{ required: true, message: 'Vui lòng nhập Email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}
              >
                <Input 
                  prefix={<MailOutlined className="text-slate-400 mr-2" />} 
                  placeholder="Nhập email của bạn" 
                  className="bg-slate-50 border-slate-200 hover:border-emerald-400 focus:border-emerald-500"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
              >
                <Input.Password 
                  prefix={<LockOutlined className="text-slate-400 mr-2" />} 
                  placeholder="Nhập mật khẩu" 
                  className="bg-slate-50 border-slate-200 hover:border-emerald-400 focus:border-emerald-500"
                />
              </Form.Item>

              <div className="flex items-center justify-between mb-6">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox className="text-slate-600">Ghi nhớ tôi</Checkbox>
                </Form.Item>
                <a className="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline transition-all" href="#forgot">
                  Quên mật khẩu?
                </a>
              </div>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  className="w-full font-semibold text-base shadow-md shadow-emerald-200 hover:shadow-lg hover:shadow-emerald-300 transition-all"
                >
                  Đăng nhập ngay
                </Button>
              </Form.Item>
            </Form>

            <Divider className="text-slate-400 border-slate-200 my-6">Hoặc đăng nhập với</Divider>

            {/* Social Logins */}
            <div className="flex gap-4">
              <Button 
                className="w-1/2 flex items-center justify-center font-medium text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                icon={<GoogleOutlined className="text-red-500" />}
              >
                Google
              </Button>
              <Button 
                className="w-1/2 flex items-center justify-center font-medium text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                icon={<AppleOutlined className="text-slate-900" />}
              >
                Apple
              </Button>
            </div>

            <div className="mt-8 text-center text-slate-600">
              Chưa có tài khoản?{' '}
              <a href="#register" className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline">
                Đăng ký miễn phí
              </a>
            </div>
          </div>
        </div>

        {/* --- CỘT PHẢI: VISUAL/INSPIRATION (Ẩn trên Mobile) --- */}
        <div className="hidden lg:flex w-1/2 bg-emerald-600 relative overflow-hidden items-center justify-center">
          {/* Background Gradients & Blobs */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-800 opacity-90"></div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

          {/* Glassmorphism Card */}
          <div className="relative z-20 bg-white/10 backdrop-blur-lg border border-white/20 p-12 rounded-3xl shadow-2xl max-w-lg mx-8 text-white">
            <div className="mb-8 inline-block px-4 py-1.5 bg-white/20 rounded-full text-sm font-semibold tracking-wide border border-white/30 backdrop-blur-md">
              ✨ Ứng dụng quản lý tài chính #1
            </div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Làm chủ chi tiêu,<br />
              <span className="text-emerald-200">Chạm đỉnh tự do tài chính.</span>
            </h2>
            <p className="text-lg text-emerald-50 opacity-90 leading-relaxed mb-8">
              NoteMoney giúp bạn ghi chép mọi khoản thu chi chỉ trong 3 giây. Trực quan hóa dữ liệu bằng biểu đồ thông minh, hỗ trợ bạn lập ngân sách và đạt được các mục tiêu tài chính mơ ước.
            </p>
            
            {/* Mockup UI Mini */}
            <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium">Tổng số dư</span>
                <span className="text-xl font-bold">245.500.000 ₫</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white/10 p-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-xs">🍔</div>
                    <span className="text-sm">Ăn uống hôm nay</span>
                  </div>
                  <span className="text-sm font-semibold text-red-300">-50.000 ₫</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default LoginPage;