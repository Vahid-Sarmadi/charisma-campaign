/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/views/**/*.ejs", // all EJS files in views subdirectories
    "./src/views/*.ejs", // EJS files directly under views
    "./src/public/js/*.js", // any JS that might contain Tailwind classes
  ],
  theme: {
    extend: {
      fontFamily: {
        yekanBakh: ["Yekan Bakh", "sans-serif"],
        yekanBakhFat: ["Yekan Bakh Fat", "sans-serif"],
      },
    },
  },
  plugins: [],
};
