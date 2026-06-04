import { useEffect, useState } from "react";
import { Modal } from "antd";
import { useLocation } from "react-router-dom";
import vi from '../assets/vi.png'
import logo from '../assets/logo.png'
import heo from '../assets/conlon.png'

import { STORAGE_KEYS } from "../shared/constants/storageKeys";
import { FaChartColumn } from "react-icons/fa6";
import { BsPiggyBank } from "react-icons/bs";
import { MdDataSaverOff } from "react-icons/md";

const onboardingSteps = [
  {
    title: "Khám phá Money Note",
    description: "Tiết kiệm hôm sau\nTương lai ngày mai",
    buttonText: "Tiếp theo",
    content: (
      <div className="relative flex w-full flex-col items-center">
        {/* ĐIỀN LINK ẢNH VÍ TIỀN 3D VÀO src DƯỚI ĐÂY */}
        <div className="flex justify-center">
          <img 
            src={vi} 
            alt="Ví tiền 3D" 
            className="h-32 w-auto object-contain drop-shadow-md" 
          />
        </div>

        <div className="w-full space-y-3 rounded-2xl bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-50">
          {[
            { icon: <FaChartColumn />, text: "Theo dõi thu chi" },
            { icon: <BsPiggyBank />, text: "Tiết kiệm thông minh" },
            { icon: <MdDataSaverOff />, text: "Báo cáo trực quan" },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F3FF] text-sm">
                  {item.icon}
                </div>
                <span className="text-[13px] font-semibold text-gray-800">
                  {item.text}
                </span>
              </div>
              <svg className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: "Ghi giao dịch nhanh",
    description: "Thêm khoản chi, thu nhập và vay nợ\nchỉ trong vài chạm.",
    buttonText: "Tiếp theo",
    content: (
      <div className="mt-6 w-full rounded-2xl bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-50">
        <div className="mb-4 flex gap-2 rounded-xl bg-gray-50 p-1">
          <div className="flex-1 rounded-lg bg-[#7161EF] py-2 text-center text-[12px] font-semibold text-white shadow-sm">
            Khoản chi
          </div>
          <div className="flex-1 py-2 text-center text-[12px] font-semibold text-gray-500">
            Khoản thu
          </div>
          <div className="flex-1 py-2 text-center text-[12px] font-semibold text-gray-500">
            Vay nợ
          </div>
        </div>

        <div className="mb-1 text-[11px] font-medium text-gray-500">Số tiền</div>
        <div className="mb-4 flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
          <span className="text-lg font-bold text-gray-900">150.000 đ</span>
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>

        <div className="flex gap-2">
          <div className="flex flex-1 items-center justify-between rounded-xl border border-gray-100 bg-white px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">🏷️</span>
              <span className="text-[13px] font-medium text-gray-700">Ăn uống</span>
            </div>
            <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
          <div className="flex flex-1 items-center justify-between rounded-xl border border-gray-100 bg-white px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">📅</span>
              <span className="text-[13px] font-medium text-gray-700">Hôm nay</span>
            </div>
            <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Tiết kiệm hiệu quả",
    description: "Đặt mục tiêu và theo dõi tiến độ\ntiết kiệm mỗi ngày.",
    buttonText: "Tiếp theo",
    content: (
      <div className="mt-6 w-full rounded-2xl bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-50">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-gray-800">Mục tiêu du lịch Đà Lạt</span>
          <span className="text-gray-400">•••</span>
        </div>
        <div className="mb-2 text-xl font-bold text-[#7161EF]">25.600.000 đ</div>
        
        <div className="flex items-end justify-between mb-3">
          <div className="text-[11px] font-medium text-gray-500">64% • Còn 14.400.000 đ</div>
          
          {/* ĐIỀN LINK ẢNH HEO ĐẤT 3D VÀO src DƯỚI ĐÂY */}
          <div className="flex h-14 items-center justify-center">
            <img 
              src={heo} 
              alt="Heo đất 3D" 
              className="h-full w-auto object-contain drop-shadow-md" 
            />
          </div>
        </div>

        <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="h-full w-[64%] bg-[#7161EF] rounded-full"></div>
        </div>
      </div>
    ),
  },
  {
    title: "Báo cáo dễ hiểu",
    description: "Xem nhanh tình hình tài chính\nđể chi tiêu hợp lý hơn.",
    buttonText: "Bắt đầu ngay",
    content: (
      <div className="mt-6 w-full rounded-2xl bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-50">
        <div className="mb-4 flex items-center gap-1 text-[12px] font-semibold text-gray-700">
          Tổng quan tháng 5
          <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="relative h-24 w-24 rounded-full border-[12px] border-blue-400 border-r-pink-400 border-b-green-400 border-l-[#7161EF]">
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-full m-1">
              <span className="text-[8px] text-gray-500">Tổng chi</span>
              <span className="text-[10px] font-bold text-gray-800">12.450.000 đ</span>
            </div>
          </div>
          
          <div className="flex-1 space-y-2">
            {[
              { color: "bg-[#7161EF]", name: "Ăn uống", val: "4.200.000 đ", pct: "34%" },
              { color: "bg-blue-400", name: "Đi lại", val: "2.800.000 đ", pct: "22%" },
              { color: "bg-pink-400", name: "Mua sắm", val: "3.150.000 đ", pct: "25%" },
              { color: "bg-green-400", name: "Khác", val: "2.300.000 đ", pct: "19%" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5 w-16">
                  <span className={`h-2 w-2 rounded-full ${item.color}`}></span>
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-800">{item.val}</span>
                <span className="text-gray-400 w-6 text-right">{item.pct}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: "↓", iconColor: "text-green-500", bg: "bg-green-50", label: "Tổng thu", val: "18.750.000 đ", valColor: "text-green-600" },
            { icon: "↑", iconColor: "text-red-500", bg: "bg-red-50", label: "Tổng chi", val: "12.450.000 đ", valColor: "text-red-500" },
            { icon: "💳", iconColor: "text-[#7161EF]", bg: "bg-[#F5F3FF]", label: "Số dư", val: "6.300.000 đ", valColor: "text-[#7161EF]" },
          ].map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center rounded-xl bg-gray-50 py-2">
              <div className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full ${stat.bg} text-[12px] font-bold ${stat.iconColor}`}>
                {stat.icon}
              </div>
              <div className="text-[9px] text-gray-500">{stat.label}</div>
              <div className={`text-[10px] font-bold ${stat.valColor}`}>{stat.val}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

function getOnboardingKey(userId: string) {
  return `money_note_onboarding_seen_${userId}`;
}

function OnboardingModal() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (!currentUserId) return;

    const onboardingKey = getOnboardingKey(currentUserId);
    const hasSeenOnboarding = localStorage.getItem(onboardingKey);

    if (!hasSeenOnboarding) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const step = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (currentUserId) {
      localStorage.setItem(getOnboardingKey(currentUserId), "true");
    }
    setOpen(false);
    setTimeout(() => setCurrentStep(0), 300);
  };

  return (
    <Modal
      open={open}
      footer={null}
      closable={false}
      centered
      width={380}
      zIndex={9999}
      styles={{
        body: { padding: 0 },
        content: {
          padding: 0,
          borderRadius: "32px",
          overflow: "hidden",
          backgroundColor: "#FAFAFF"
        }
      }}
    >
      <div className="relative flex flex-col h-[740px] max-h-[90vh] ">
        <div className="flex-1 flex flex-col">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7161EF] shadow-lg shadow-indigo-200">
              <img src={logo} />
            </div>
          </div>

          <div className="text-center mb-2">
            <p className="whitespace-pre-line text-[14px] leading-[1.6] text-gray-500 font-medium">
              {step.description}
            </p>
          </div>

          <div className="flex-1 flex justify-center">
            {step.content}
          </div>
        </div>

        <div className="mt-auto flex flex-col items-center">
          <div className="mb-6 flex justify-center gap-2 mt-2">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep ? "w-2 bg-[#7161EF]" : "w-2 bg-gray-200"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-full rounded-[18px] bg-[#7161EF] py-2 text-[15px] font-bold text-white transition-all hover:bg-[#6252df] active:scale-[0.98]"
          >
            {step.buttonText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default OnboardingModal;