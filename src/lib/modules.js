export const buildModules = (type, total) => {
  if (type === "practice") return [{ label: "Practice", sec: "mixed", count: total, start: 0 }];
  if (total === 98) return [
    { label: "Reading & Writing Module 1", sec: "rw", count: 27, start: 0 },
    { label: "Reading & Writing Module 2", sec: "rw", count: 27, start: 27 },
    { label: "Math Module 1", sec: "math", count: 22, start: 54 },
    { label: "Math Module 2", sec: "math", count: 22, start: 76 },
  ];
  return [
    { label: "Reading & Writing Module 1", sec: "rw", count: 27, start: 0 },
    { label: "Math Module 1", sec: "math", count: 22, start: 27 },
  ];
};
