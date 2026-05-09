module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: '#07101e',
        card: '#0d1724',
        accent: '#42f5c3',
        accentSoft: '#83ffe8',
        glow: '#0ef2c8',
      },
      boxShadow: {
        glow: '0 0 40px rgba(66, 245, 195, 0.14)',
      },
    },
  },
  plugins: [],
};
