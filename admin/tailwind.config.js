/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1890ff',
          dark: '#096dd9',
        },
      },
    },
  },
  plugins: [],
  // 确保 Tailwind 的样式不会覆盖 Ant Design 的样式
  corePlugins: {
    preflight: false,
  },
} 