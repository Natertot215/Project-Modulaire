/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--sat-bg)",
        sf: "var(--sat-sf)",
        sf2: "var(--sat-sf2)",
        sf3: "var(--sat-sf3)",
        bdr: "var(--sat-bdr)",
        bdr2: "var(--sat-bdr2)",
        tx: "var(--sat-tx)",
        tx2: "var(--sat-tx2)",
        tx3: "var(--sat-tx3)",
        sel: "var(--sat-sel)",
        "sel-dim": "var(--sat-sel-dim)",
        ok: "var(--sat-ok)",
        "ok-dim": "var(--sat-ok-dim)",
        bad: "var(--sat-bad)",
        "bad-dim": "var(--sat-bad-dim)",
        warn: "var(--sat-warn)",
        "warn-dim": "var(--sat-warn-dim)",
      },
      fontFamily: {
        sans: "var(--sat-font)",
      },
      spacing: {
        pad: "var(--sat-pad)",
      },
      backgroundColor: {
        overlay: "var(--sat-overlay)",
      },
    },
  },
  plugins: [],
};
