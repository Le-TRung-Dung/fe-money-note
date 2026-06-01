import React from "react";
import { Button, Card, Typography, Space } from "antd";
import {
  WalletOutlined,
  PieChartOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  ArrowRightOutlined,
  AppleFilled,
  AndroidFilled,
  CheckCircleFilled,
} from "@ant-design/icons";
import Iphone from "../assets/iphonelanding.png";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Header / Navbar */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-2xl font-bold text-emerald-600">
            <span> 💳 NoteMoney</span>
          </div>
          <nav className="hidden md:flex gap-8 font-medium text-slate-600">
            <a href="#features" className="hover:text-emerald-600 transition">
              Tính năng
            </a>
            <a
              href="#how-it-works"
              className="hover:text-emerald-600 transition"
            >
              Cách hoạt động
            </a>
            <a
              href="#testimonials"
              className="hover:text-emerald-600 transition"
            >
              Đánh giá
            </a>
          </nav>
          <Button
            onClick={() => navigate("/login")}
            type="primary"
            size="large"
            className="bg-emerald-600 hover:bg-emerald-500 rounded-full font-semibold"
          >
            Đăng nhập ngay
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-emerald-50 via-white to-teal-50 min-h-[90vh] flex items-center">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm">
              ✨ Ứng dụng quản lý tài chính #1
            </div>
            <Title
              level={1}
              className="!text-5xl !font-extrabold !text-slate-900 !leading-tight"
            >
              Làm chủ chi tiêu, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-400">
                Chạm đỉnh tự do tài chính
              </span>
            </Title>
            <Paragraph className="!text-lg !text-slate-600 !leading-relaxed max-w-lg">
              NoteMoney giúp bạn ghi chép mọi khoản thu chi chỉ trong 3 giây.
              Trực quan hóa dữ liệu bằng biểu đồ thông minh, hỗ trợ bạn lập ngân
              sách và đạt được các mục tiêu tài chính mơ ước.
            </Paragraph>
            <Space size="middle">
              <Button
                type="primary"
                size="large"
                icon={<AppleFilled />}
                className="bg-slate-900 hover:bg-slate-800 h-14 px-8 rounded-2xl text-lg font-medium"
              >
                App Store
              </Button>
              <Button
                size="large"
                icon={<AndroidFilled />}
                className="h-14 px-8 rounded-2xl text-lg font-medium border-slate-300 hover:border-emerald-600 hover:text-emerald-600"
              >
                Google Play
              </Button>
            </Space>
            <div className="flex items-center gap-2 text-sm text-slate-500 pt-4">
              <CheckCircleFilled className="text-emerald-500" /> Miễn phí sử
              dụng
              <span className="mx-2">|</span>
              <CheckCircleFilled className="text-emerald-500" /> Không quảng cáo
            </div>
          </div>

          {/* Hero Image / Mockup */}
          <div className="relative flex justify-center items-center">
            {/* Hiệu ứng ánh sáng nền (Glow) */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-300 to-teal-500 rounded-full blur-[80px] opacity-40 animate-pulse"></div>

            {/* Ảnh điện thoại hiển thị trực tiếp */}
            <img
              src={Iphone}
              alt="Giao diện NoteMoney"
              className="relative z-10 w-full max-w-[340px] h-auto object-contain drop-shadow-2xl hover:-translate-y-3 transition-transform duration-500 ease-out"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <Title level={2} className="!text-3xl !font-bold !mb-4">
            Mọi thứ bạn cần để quản lý tiền bạc
          </Title>
          <Paragraph className="!text-slate-500 !text-lg max-w-2xl mx-auto mb-16">
            Được thiết kế tối giản nhưng mạnh mẽ, NoteMoney loại bỏ những rườm
            rà để bạn tập trung vào điều quan trọng nhất: Sự tăng trưởng tài
            sản.
          </Paragraph>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            <Card
              hoverable
              className="border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl group"
            >
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
                <WalletOutlined className="text-2xl text-emerald-600 group-hover:text-white" />
              </div>
              <Title level={4}>Ghi chép siêu tốc</Title>
              <Paragraph className="text-slate-500">
                Thêm giao dịch mới chỉ với 2 lần chạm. Phân loại chi tiêu tự
                động với sự trợ giúp của AI.
              </Paragraph>
            </Card>

            <Card
              hoverable
              className="border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl group"
            >
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                <PieChartOutlined className="text-2xl text-blue-600 group-hover:text-white" />
              </div>
              <Title level={4}>Báo cáo trực quan</Title>
              <Paragraph className="text-slate-500">
                Nhìn thấu thói quen tiêu dùng thông qua các biểu đồ sinh động
                theo tuần, tháng và năm.
              </Paragraph>
            </Card>

            <Card
              hoverable
              className="border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl group"
            >
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors">
                <RocketOutlined className="text-2xl text-purple-600 group-hover:text-white" />
              </div>
              <Title level={4}>Mục tiêu tự do tài chính</Title>
              <Paragraph className="text-slate-500">
                Lập kế hoạch tiết kiệm, theo dõi tiến độ quỹ khẩn cấp và tiến
                gần hơn tới vạch đích FIRE.
              </Paragraph>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 px-6 bg-slate-900 text-white text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <SafetyCertificateOutlined className="text-6xl text-emerald-400" />
          <Title level={2} className="!text-white !text-4xl !font-bold">
            Bảo mật cấp độ ngân hàng
          </Title>
          <Paragraph className="!text-slate-400 !text-lg">
            Dữ liệu của bạn được mã hóa an toàn và đồng bộ hóa trên nhiều thiết
            bị. Chúng tôi không bao giờ bán dữ liệu của bạn cho bên thứ ba.
          </Paragraph>
          <Button
            type="primary"
            size="large"
            className="bg-emerald-500 hover:bg-emerald-400 border-none h-14 px-10 rounded-full text-lg font-semibold mt-4"
          >
            Bắt đầu miễn phí ngay hôm nay <ArrowRightOutlined />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12 px-6 text-center text-slate-500">
        <div className="flex justify-center items-center gap-2 text-xl font-bold text-slate-800 mb-4">
          <WalletOutlined className="text-emerald-600" />
          <span>NoteMoney</span>
        </div>
        <p>© 2026 NoteMoney. Đạt tự do tài chính một cách dễ dàng.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
