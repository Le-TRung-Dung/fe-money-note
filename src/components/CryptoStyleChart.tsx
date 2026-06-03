import React, { useRef, useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Đăng ký các module cần thiết của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

interface CryptoStyleChartProps {
  dataPoints: number[];
  labels: string[];
}

const CryptoStyleChart: React.FC<CryptoStyleChartProps> = ({ dataPoints, labels }) => {
  const chartRef = useRef<ChartJS<"line">>(null);
  const [gradient, setGradient] = useState<CanvasGradient | null>(null);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    // Lấy context 2D của Canvas để vẽ Gradient
    const ctx = chart.ctx;
    const chartArea = chart.chartArea;
    if (!chartArea) return;

    // Tạo hiệu ứng gradient từ trắng mờ dần xuống trong suốt
    const newGradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    newGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)'); // Đỉnh dốc sáng
    newGradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)'); // Đáy dốc chìm vào nền

    setGradient(newGradient);
  }, []);

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Số dư',
        data: dataPoints,
        fill: true,
        backgroundColor: gradient || 'rgba(255, 255, 255, 0.1)', // Dùng gradient vừa tạo
        borderColor: '#ffffff', // Đường viền màu trắng
        borderWidth: 2,
        tension: 0.4, // Tạo độ cong mượt (Bezier curve) giống crypto
        pointRadius: 0, // Ẩn các điểm chấm tròn cho mượt
        pointHoverRadius: 6, // Khi hover chuột vào mới hiện chấm tròn
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#7B61FF',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Ẩn chú thích
      },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#7B61FF',
        bodyColor: '#7B61FF',
        displayColors: false,
        padding: 10,
        callbacks: {
          label: function(context: any) {
            // Format số tiền trong tooltip (VD: 22,520,000 đ)
            return new Intl.NumberFormat('vi-VN').format(context.raw) + ' đ';
          }
        }
      },
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false }, // Ẩn lưới dọc
        ticks: { color: 'rgba(255, 255, 255, 0.7)', font: { size: 10 } },
      },
      y: {
        display: false, // Ẩn hoàn toàn trục Y (để giống design)
        min: Math.min(...dataPoints) * 0.9, // Căn lề dưới
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  return (
    <div className="w-full h-32 relative z-10 mt-6">
      <Line ref={chartRef} options={options} data={data} />
    </div>
  );
};

export default CryptoStyleChart;