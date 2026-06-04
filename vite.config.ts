import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",

      manifest: {
        name: "Note Money",
        short_name: "NoteMoney",
        description: "Ứng dụng quản lý chi tiêu cá nhân",

        // Vì bạn deploy ở GitHub Pages dưới /fe-money-note/
        start_url: "/fe-money-note/",
        scope: "/fe-money-note/",

        // Quan trọng: mở như app, ẩn thanh địa chỉ trình duyệt
        display: "standalone",

        theme_color: "#895BFF",
        background_color: "#F7F9FF",

        icons: [
          {
            src: "/fe-money-note/icons/logo.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/fe-money-note/icons/logo.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/fe-money-note/icons/logo.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],

  base: "/fe-money-note/",
});