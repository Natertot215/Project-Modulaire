import { useState, useEffect } from "react";

const TAXONOMY = {
  rw: {
    label: "Reading & Writing",
    subtypes: {
      "Information and Ideas": ["Central Ideas and Details", "Inferences", "Command of Evidence"],
      "Craft and Structure": ["Words in Context", "Text Structure and Purpose", "Cross-Text Connections"],
      "Expression of Ideas": ["Rhetorical Synthesis", "Transitions"],
      "Standard English Conventions": ["Boundaries", "Form, Structure, and Sense"],
    },
  },
  math: {
    label: "Math",
    subtypes: {
      Algebra: ["Linear equations in one variable", "Linear functions", "Linear equations in two variables", "Systems of two linear equations in two variables", "Linear inequalities in one or two variables"],
      "Advanced Math": ["Nonlinear functions", "Nonlinear equations in one variable and systems of equations in two variables", "Equivalent expressions"],
      "Problem-Solving and Data Analysis": ["Ratios, rates, proportional relationships, and units", "Percentages", "One-variable data: Distributions and measures of center and spread", "Two-variable data: Models and scatterplots", "Probability and conditional probability", "Inference from sample statistics and margin of error", "Evaluating statistical claims: Observational studies and experiments"],
      "Geometry and Trigonometry": ["Area and volume", "Lines, angles, and triangles", "Right triangles and trigonometry", "Circles"],
    },
  },
};
const allSkills = (sec) => Object.values(TAXONOMY[sec].subtypes).flat();
const RW_SKILLS = allSkills("rw");
const MATH_SKILLS = allSkills("math");
const isRWSkill = (s) => RW_SKILLS.includes(s);

const C = {
  bg: "#191919", sf: "#222222", sf2: "#2a2a2a", sf3: "#333333",
  bdr: "#333333", bdr2: "#444444",
  tx: "#e8e8e8", tx2: "#a0a0a0", tx3: "#666666",
  sel: "#ffffff", selDim: "rgba(255,255,255,0.08)",
  ok: "#7ec89a", okDim: "rgba(126,200,154,0.12)",
  bad: "#d98a8a", badDim: "rgba(217,138,138,0.12)",
  warn: "#d4b876", warnDim: "rgba(212,184,118,0.12)",
};
const ff = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const PAD = 40;

const buildModules = (type, total) => {
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

const assignSkills = (skills, count) => {
  const rw = skills.filter(s => isRWSkill(s));
  const math = skills.filter(s => !isRWSkill(s));
  if (rw.length + math.length === 0) return Array(count).fill(null);
  const rwCount = rw.length > 0 && math.length > 0 ? Math.round((rw.length / (rw.length + math.length)) * count) : (rw.length > 0 ? count : 0);
  const assigned = [];
  for (let i = 0; i < rwCount; i++) assigned.push(rw[i % rw.length]);
  for (let i = 0; i < count - rwCount; i++) assigned.push(math[i % math.length]);
  return assigned;
};

const getGridCols = (n) => {
  if (n <= 5) return n;
  for (let c = 10; c >= 5; c--) { if (n % c === 0) return c; }
  return Math.min(10, Math.ceil(Math.sqrt(n)));
};

const Pill = ({ active, children, onClick }) => (
  <button onClick={onClick} style={{
    padding: "5px 12px", borderRadius: 6, fontSize: 12, fontFamily: ff, fontWeight: active ? 600 : 400,
    border: `1px solid ${active ? C.tx2 : C.bdr}`, cursor: "pointer",
    background: active ? C.selDim : "transparent", color: active ? C.sel : C.tx2,
    transition: "all .12s", lineHeight: 1.4, textAlign: "left",
  }}>{children}</button>
);

const Btn = ({ children, onClick, disabled, small, danger }) => (
  <button onClick={onClick} disabled={disabled} style={{
    padding: small ? "8px 20px" : "11px 28px", borderRadius: 8,
    fontSize: small ? 13 : 14, fontFamily: ff, fontWeight: 600, letterSpacing: ".01em",
    border: danger ? "none" : `1px solid ${C.bdr}`,
    cursor: disabled ? "default" : "pointer",
    background: danger ? C.badDim : "transparent",
    color: danger ? C.bad : C.tx2,
    opacity: disabled ? 0.4 : 1, transition: "all .12s",
  }}>{children}</button>
);

const Label = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 600, color: C.tx3, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>{children}</div>
);

function Shell({ children, wide }) {
  return <div style={{ minHeight: "100vh", background: C.bg, fontFamily: ff, color: C.tx, padding: wide ? `44px ${PAD}px` : "44px 20px" }}>{children}</div>;
}

function Back({ onClick, label }) {
  return <button onClick={onClick} style={{ background: "none", border: "none", color: C.tx3, fontFamily: ff, fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 20 }}>← {label || "Back"}</button>;
}

function BluebookGrid({ mod, answers, flags, qIdx, onClickQ, forceCols }) {
  const cols = forceCols || getGridCols(mod.count);
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 44px)`, gap: 8, justifyContent: "center" }}>
      {Array.from({ length: mod.count }, (_, i) => {
        const gi = mod.start + i;
        const ans = answers[gi] != null;
        const fl = flags[gi];
        const cur = gi === qIdx;
        let bg = C.sf2, co = C.tx2, bd = C.bdr;
        if (!ans) { bg = "transparent"; co = C.tx3; }
        if (fl) { bg = C.warnDim; co = C.warn; bd = C.warn; }
        if (cur) { bg = C.sf3; co = C.tx; bd = C.tx2; }
        return (
          <button key={i} onClick={() => onClickQ(gi)} style={{
            width: 44, height: 44, borderRadius: 6, fontSize: 14, fontWeight: 600,
            border: !ans && !fl && !cur ? `2px dashed ${C.bdr2}` : `2px solid ${bd}`,
            background: bg, color: co, cursor: "pointer", fontFamily: ff,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}

function ModuleDropdown({ modules, currentMod, onSelect }) {
  const [open, setOpen] = useState(false);
  if (modules.length <= 1) return null;
  const cur = modules[currentMod];
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{
        background: C.sf2, border: `1px solid ${C.bdr}`, borderRadius: 6,
        color: C.tx2, fontFamily: ff, fontSize: 12, cursor: "pointer", padding: "5px 12px",
        display: "flex", alignItems: "center", gap: 6,
      }}>
        {cur.label.replace("Reading & Writing", "R&W")}
        <span style={{ fontSize: 10, color: C.tx3 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, marginTop: 4, zIndex: 50,
          background: C.sf, border: `1px solid ${C.bdr}`, borderRadius: 8,
          overflow: "hidden", minWidth: 200, boxShadow: "0 8px 24px rgba(0,0,0,.4)",
        }}>
          {modules.map((m, mi) => (
              <button key={mi} onClick={() => { onSelect(mi); setOpen(false); }} style={{
              display: "block", width: "100%", padding: "10px 16px", textAlign: "left",
              background: mi === currentMod ? C.sf2 : "transparent",
              border: "none", borderBottom: mi < modules.length - 1 ? `1px solid ${C.bdr}` : "none",
              color: mi === currentMod ? C.tx : C.tx2,
              fontFamily: ff, fontSize: 12, fontWeight: mi === currentMod ? 600 : 400,
              cursor: "pointer",
            }}>{m.label.replace("Reading & Writing", "R&W")}</button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("home");
  const [skills, setSkills] = useState([]);
  const [pCount, setPCount] = useState(10);
  const [sessionType, setSessionType] = useState(null);
  const [modules, setModules] = useState([]);
  const [currentMod, setCurrentMod] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [questionSkills, setQuestionSkills] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flags, setFlags] = useState({});
  const [crossouts, setCrossouts] = useState({});
  const [highlighting, setHighlighting] = useState(false);
  const [correctMap, setCorrectMap] = useState({});
  const [phase, setPhase] = useState("questions");
  const [confirmHome, setConfirmHome] = useState(false);
  const [savedSession, setSavedSession] = useState(null);
  const [viewingSession, setViewingSession] = useState(null);
  const [reviewFromHistory, setReviewFromHistory] = useState(null);

  const [wide, setWide] = useState(typeof window !== "undefined" ? window.innerWidth >= 1000 : true);
  useEffect(() => {
    const onResize = () => setWide(window.innerWidth >= 1000);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [history, setHistory] = useState([
    { id: 1, date: "Mar 24", type: "Test — Half Length", skills: [], correct: 38, total: 49, attempted: 49, breakdown: Array.from({length:49},(_,i)=>i<38), flagged: {2:true, 17:true, 18:true}, reviewData: null },
    { id: 2, date: "Mar 20", type: "Test — Full Length", skills: [], correct: 82, total: 98, attempted: 98, breakdown: Array.from({length:98},(_,i)=>i<82), flagged: {5:true, 44:true}, reviewData: null },
  ]);

  const deleteSession = (id) => setHistory(p => p.filter(h => h.id !== id));
  const toggleSkill = (s) => setSkills(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const toggleCategory = (sec, sub) => {
    const cat = TAXONOMY[sec].subtypes[sub];
    if (cat.every(s => skills.includes(s))) setSkills(p => p.filter(x => !cat.includes(x)));
    else setSkills(p => [...new Set([...p, ...cat])]);
  };
  const toggleSection = (sec) => {
    const all = allSkills(sec);
    if (all.every(s => skills.includes(s))) setSkills(p => p.filter(x => !all.includes(x)));
    else setSkills(p => [...new Set([...p, ...all])]);
  };

  const startSession = (type, n, selectedSkills) => {
    const mods = buildModules(type, n);
    const qs = Array.from({ length: n }, (_, i) => ({ id: i }));
    const cm = {}; qs.forEach((_, i) => { cm[i] = Math.floor(Math.random() * 4); });
    let qSkills = [];
    if (type === "practice" && selectedSkills) {
      qSkills = assignSkills(selectedSkills, n);
    } else {
      qs.forEach((_, i) => {
        const m = mods.find(m => i >= m.start && i < m.start + m.count);
        qSkills.push(m?.sec === "rw" ? RW_SKILLS[i % RW_SKILLS.length] : MATH_SKILLS[i % MATH_SKILLS.length]);
      });
    }
    setModules(mods); setQuestions(qs); setCorrectMap(cm); setQuestionSkills(qSkills);
    setCurrentMod(0); setQIdx(0);
    setAnswers({}); setFlags({}); setCrossouts({}); setHighlighting(false);
    setPhase("questions"); setConfirmHome(false);
    setSessionType(type); setView("session");
  };

  const restartModule = (mi) => {
    const m = modules[mi];
    const na = { ...answers }, nf = { ...flags }, nc = { ...crossouts };
    for (let i = m.start; i < m.start + m.count; i++) {
      delete na[i]; delete nf[i];
      [0,1,2,3].forEach(c => delete nc[`${i}-${c}`]);
    }
    setAnswers(na); setFlags(nf); setCrossouts(nc);
    setCurrentMod(mi); setQIdx(m.start); setPhase("questions");
  };

  const saveAndExit = () => {
    setSavedSession({ sessionType, modules, questions, questionSkills, correctMap, currentMod, qIdx, answers, flags, crossouts, skills: [...skills] });
    setConfirmHome(false); setView("home");
  };

  const resumeSession = () => {
    const s = savedSession;
    setSessionType(s.sessionType); setModules(s.modules); setQuestions(s.questions);
    setQuestionSkills(s.questionSkills); setCorrectMap(s.correctMap);
    setCurrentMod(s.currentMod); setQIdx(s.qIdx);
    setAnswers(s.answers); setFlags(s.flags); setCrossouts(s.crossouts);
    setSkills(s.skills); setPhase("questions"); setView("session");
    setSavedSession(null);
  };

  const goHome = () => { setView("home"); setConfirmHome(false); setPhase("questions"); setSavedSession(null); };

  const answeredCount = Object.values(answers).filter(v => v != null).length;
  const mod = modules[currentMod] || { start: 0, count: 0, label: "" };
  const modLocalIdx = qIdx - mod.start;
  const isLastMod = currentMod === modules.length - 1;

  const scoreSession = () => questions.map((_, i) => ({
    answered: answers[i] != null, correct: answers[i] != null && answers[i] === correctMap[i],
    picked: answers[i], correctChoice: correctMap[i],
    skill: questionSkills[i] || "Unknown", isRW: isRWSkill(questionSkills[i] || ""),
  }));

  const handleSubmit = () => {
    const results = scoreSession();
    const correct = results.filter(r => r.correct).length;
    const attempted = results.filter(r => r.answered).length;
    if (sessionType === "test") {
      const entry = {
        id: Date.now(), date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        type: `Test — ${questions.length === 98 ? "Full" : "Half"} Length`,
        skills: [], correct, total: questions.length, attempted,
        breakdown: results.map(r => r.correct),
        flagged: Object.entries(flags).filter(([,v]) => v).reduce((o,[k,v]) => ({...o,[k]:v}), {}),
        reviewData: results,
      };
      setHistory(p => {
        const updated = [entry, ...p];
        return updated.map((h, i) => i >= 10 ? { ...h, reviewData: null } : h);
      });
    }
    setSavedSession(null); setPhase("results");
  };

  // HOME
  if (view === "home") return (
    <Shell>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 4px", letterSpacing: "-.02em" }}>SAT Prep</h1>
        <p style={{ color: C.tx3, fontSize: 13, margin: "0 0 36px" }}>Practice, test, and track your progress.</p>
        {savedSession && (
          <button onClick={resumeSession} style={{
            width: "100%", background: C.sf, border: `1px solid ${C.tx2}`, borderRadius: 10,
            padding: "18px 24px", cursor: "pointer", textAlign: "left", fontFamily: ff, marginBottom: 24,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.tx, marginBottom: 4 }}>Resume Session</div>
              <div style={{ fontSize: 12, color: C.tx3 }}>
                {savedSession.sessionType === "test" ? "Test" : "Practice"} — {Object.values(savedSession.answers).filter(v => v != null).length}/{savedSession.questions.length} answered
              </div>
            </div>
            <span style={{ color: C.tx2, fontSize: 18 }}>→</span>
          </button>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "Practice", desc: "Select topics and skills, choose question count", v: "practice" },
            { label: "Test", desc: "Full-length or half-length modules", v: "test" },
            { label: "History", desc: "Past sessions and scores", v: "history" },
          ].map(({ label, desc, v }) => (
            <button key={v} onClick={() => { setView(v); setSkills([]); setViewingSession(null); setReviewFromHistory(null); }} style={{
              background: C.sf, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "20px 24px",
              cursor: "pointer", textAlign: "left", fontFamily: ff,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: C.tx, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 13, color: C.tx3 }}>{desc}</div>
              </div>
              <span style={{ color: C.tx3, fontSize: 18 }}>→</span>
            </button>
          ))}
        </div>
      </div>
    </Shell>
  );

  // PRACTICE
  if (view === "practice") {
    const hasSkills = skills.length > 0;
    const renderColumn = (sec) => {
      const t = TAXONOMY[sec]; const all = allSkills(sec);
      const allSel = all.every(s => skills.includes(s));
      return (
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: C.tx }}>{t.label}</span>
            <button onClick={() => toggleSection(sec)} style={{
              background: allSel ? C.selDim : "transparent", border: `1px solid ${allSel ? C.tx2 : C.bdr}`,
              borderRadius: 5, padding: "4px 10px", fontSize: 11, fontWeight: 600,
              color: allSel ? C.sel : C.tx3, cursor: "pointer", fontFamily: ff,
            }}>{allSel ? "Deselect All" : "Select All"}</button>
          </div>
          {Object.entries(t.subtypes).map(([sub, subSkills]) => {
            const catAll = subSkills.every(s => skills.includes(s));
            const catCount = subSkills.filter(s => skills.includes(s)).length;
            return (
              <div key={sub} style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <button onClick={() => toggleCategory(sec, sub)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: ff, padding: 0, fontSize: 12, fontWeight: 600, color: catAll ? C.tx : C.tx2 }}>{sub}</button>
                  <span style={{ fontSize: 10, color: C.tx3 }}>{catCount}/{subSkills.length}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {subSkills.map(s => <Pill key={s} active={skills.includes(s)} onClick={() => toggleSkill(s)}>{s}</Pill>)}
                </div>
              </div>
            );
          })}
        </div>
      );
    };
    return (
      <Shell wide>
        <div style={{ margin: "0 auto" }}>
          <Back onClick={() => setView("home")} />
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>Practice</h1>
          <p style={{ color: C.tx3, fontSize: 13, margin: "0 0 32px" }}>Select skills from either or both sections.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 32 }}>
            {renderColumn("math")}
            {renderColumn("rw")}
          </div>
          {hasSkills && (
            <div style={{ borderTop: `1px solid ${C.bdr}`, paddingTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Label>Questions</Label>
                <div style={{ display: "flex", gap: 6, marginTop: -8 }}>
                  {[10, 15, 20, 25, 30].map(n => <Pill key={n} active={pCount === n} onClick={() => setPCount(n)}>{n}</Pill>)}
                </div>
              </div>
              <Btn onClick={() => startSession("practice", pCount, skills)}>Start Practice ({skills.length} skill{skills.length !== 1 ? "s" : ""})</Btn>
            </div>
          )}
        </div>
      </Shell>
    );
  }

  // TEST
  if (view === "test") return (
    <Shell>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <Back onClick={() => setView("home")} />
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>Test</h1>
        <p style={{ color: C.tx3, fontSize: 13, margin: "0 0 36px" }}>Simulate a full or half-length SAT.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { label: "Full Length", desc: "2 R&W modules (54) + 2 Math modules (44) — 98 questions", n: 98 },
            { label: "Half Length", desc: "1 R&W module (27) + 1 Math module (22) — 49 questions", n: 49 },
          ].map(({ label, desc, n }) => (
            <button key={n} onClick={() => startSession("test", n)} style={{
              background: C.sf, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "20px 24px",
              cursor: "pointer", textAlign: "left", fontFamily: ff,
            }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.tx, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 12, color: C.tx3 }}>{desc}</div>
            </button>
          ))}
        </div>
      </div>
    </Shell>
  );

  // HISTORY
  if (view === "history") {
    if (reviewFromHistory) {
      const s = reviewFromHistory.session;
      const rd = s.reviewData || [];
      const ri = reviewFromHistory.idx;
      const r = rd[ri] || {};
      const choices = ["A", "B", "C", "D"];
      return (
        <div style={{ minHeight: "100vh", background: C.bg, fontFamily: ff, color: C.tx, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: `20px ${PAD}px 8px`, display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", flexShrink: 0 }}>
            <Back onClick={() => setReviewFromHistory(null)} label="Session" />
            <span style={{ fontSize: 13, fontWeight: 600, textAlign: "center" }}>
              Review: {ri + 1} <span style={{ color: C.tx3, fontWeight: 400 }}>/ {rd.length}</span>
            </span>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <span style={{ padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, fontFamily: ff, background: r.correct ? C.okDim : r.answered ? C.badDim : C.sf2, color: r.correct ? C.ok : r.answered ? C.bad : C.tx3 }}>
                {r.correct ? "✓ Correct" : r.answered ? "✗ Wrong" : "Skipped"}
              </span>
            </div>
          </div>
          <div style={{ padding: `0 ${PAD}px 16px`, display: "grid", gridTemplateColumns: `repeat(${rd.length}, 1fr)`, gap: 3, flexShrink: 0 }}>
            {rd.map((rr, i) => {
              const cur = i === ri;
              let bd = C.bdr, co = C.tx3;
              if (rr.correct) { bd = C.ok; co = C.ok; }
              else if (rr.answered) { bd = C.bad; co = C.bad; }
              if (cur) { co = C.tx; }
              return (
                <button key={i} onClick={() => setReviewFromHistory({ session: s, idx: i })} style={{
                  height: 36, borderRadius: 5, fontSize: 11, fontWeight: 600,
                  border: `1.5px solid ${cur ? C.tx2 : bd}`, background: cur ? C.sf3 : "transparent", color: co,
                  cursor: "pointer", fontFamily: ff,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{i + 1}</button>
              );
            })}
          </div>
          <div style={{ flex: 1, padding: `0 ${PAD}px 28px`, width: "100%", boxSizing: "border-box" }}>
            <div style={{ fontSize: 11, color: C.tx2, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 }}>{r.skill || "Skill"}</div>
            <div style={{ padding: "16px 20px", background: C.sf, borderRadius: 8, border: `1px solid ${C.bdr}`, marginBottom: 16 }}>
              <span style={{ color: C.tx3, fontSize: 13 }}>Question text placeholder</span>
            </div>
            {r.isRW && (
              <div style={{ background: C.sf, border: `1px solid ${C.bdr}`, borderRadius: 8, padding: 24, marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: C.tx3, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 12, fontWeight: 600 }}>Passage</div>
                <div style={{ minHeight: 80, border: `1px dashed ${C.bdr2}`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: C.tx3, fontSize: 13, padding: 16 }}>Passage content</div>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {choices.map((letter, ci) => {
                const wasYours = r.picked === ci;
                const isCorrect = r.correctChoice === ci;
                let bdr = C.bdr, bg = "transparent", col = C.tx2, label = "";
                if (isCorrect) { bdr = C.ok; bg = C.okDim; col = C.ok; label = " ✓"; }
                if (wasYours && !isCorrect) { bdr = C.bad; bg = C.badDim; col = C.bad; label = " ✗"; }
                return (
                  <div key={ci} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 8, border: `1.5px solid ${bdr}`, background: bg }}>
                    <span style={{ width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: col, border: `1px solid ${isCorrect || wasYours ? "transparent" : C.bdr2}`, background: isCorrect ? C.okDim : wasYours ? C.badDim : C.sf, flexShrink: 0 }}>{letter}</span>
                    <span style={{ fontSize: 14, color: col, flex: 1 }}>Answer placeholder{label}</span>
                    {wasYours && !isCorrect && <span style={{ fontSize: 11, color: col, fontWeight: 600 }}>Your answer</span>}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 16, padding: "14px 18px", background: C.sf, borderRadius: 8, border: `1px solid ${C.bdr}` }}>
              <div style={{ fontSize: 11, color: C.tx3, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8, fontWeight: 600 }}>Explanation</div>
              <p style={{ color: C.tx2, fontSize: 13, lineHeight: 1.6, margin: 0 }}>Explanation placeholder.</p>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
              <Btn small disabled={ri === 0} onClick={() => setReviewFromHistory({ session: s, idx: ri - 1 })}>← Prev</Btn>
              {ri < rd.length - 1 ? <Btn small onClick={() => setReviewFromHistory({ session: s, idx: ri + 1 })}>Next →</Btn> : <Btn small onClick={() => setReviewFromHistory(null)}>Done</Btn>}
            </div>
          </div>
        </div>
      );
    }
    if (viewingSession) {
      const s = viewingSession;
      const pct = s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : 0;
      const hasReview = s.reviewData && s.reviewData.length > 0;
      return (
        <Shell wide>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <Back onClick={() => setViewingSession(null)} label="History" />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>{s.type}</h1>
                <p style={{ color: C.tx3, fontSize: 13, margin: 0 }}>{s.date} · {s.attempted} attempted</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: C.tx }}>{pct}%</div>
                <div style={{ fontSize: 12, color: C.tx3 }}>{s.correct}/{s.attempted}</div>
              </div>
            </div>
            <div style={{ background: C.sf, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: 20, marginTop: 24 }}>
              <Label>Breakdown</Label>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${getGridCols(s.total)}, 1fr)`, gap: 5 }}>
                {s.breakdown.map((correct, i) => {
                  const fl = s.flagged && s.flagged[i];
                  let bd = C.bdr, co = C.tx3;
                  if (fl) { bd = C.warn; co = C.warn; }
                  else if (correct) { bd = C.ok; co = C.ok; }
                  else { bd = C.bad; co = C.bad; }
                  return (
                  <div key={i} style={{ padding: "7px 0", borderRadius: 5, textAlign: "center", fontSize: 10, fontWeight: 600, background: "transparent", color: co, border: `1.5px solid ${bd}` }}>{i + 1}</div>
                  );
                })}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              {hasReview && <Btn small onClick={() => setReviewFromHistory({ session: s, idx: 0 })}>Review Questions</Btn>}
              <Btn danger small onClick={() => { deleteSession(s.id); setViewingSession(null); }}>Delete</Btn>
            </div>
          </div>
        </Shell>
      );
    }
    return (
      <Shell>
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <Back onClick={() => setView("home")} />
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>History</h1>
          <p style={{ color: C.tx3, fontSize: 13, margin: "0 0 36px" }}>Past sessions and scores.</p>
          {history.length === 0 && <p style={{ color: C.tx3, fontSize: 14 }}>No sessions yet.</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {history.map((h) => {
              const pct = h.attempted > 0 ? Math.round((h.correct / h.attempted) * 100) : 0;
              return (
                <div key={h.id} style={{ display: "flex", alignItems: "center", background: C.sf, border: `1px solid ${C.bdr}`, borderRadius: 8, overflow: "hidden" }}>
                  <button onClick={() => setViewingSession(h)} style={{ flex: 1, display: "grid", gridTemplateColumns: "72px 1fr 64px", padding: "14px 16px", alignItems: "center", background: "transparent", border: "none", cursor: "pointer", fontFamily: ff, textAlign: "left" }}>
                    <span style={{ color: C.tx3, fontSize: 13 }}>{h.date}</span>
                    <span style={{ color: C.tx2, fontSize: 13 }}>{h.type}</span>
                    <span style={{ textAlign: "right", fontWeight: 600, fontSize: 14, color: C.tx }}>{h.correct}/{h.attempted}</span>
                  </button>
                  <button onClick={() => deleteSession(h.id)} title="Delete" style={{ width: 44, alignSelf: "stretch", background: "transparent", border: "none", borderLeft: `1px solid ${C.bdr}`, cursor: "pointer", color: C.tx3, fontSize: 14, fontFamily: ff, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                </div>
              );
            })}
          </div>
        </div>
      </Shell>
    );
  }

  // SESSION: QUESTIONS
  if (view === "session" && phase === "questions") {
    const qSkill = questionSkills[qIdx] || "";
    const isRW = isRWSkill(qSkill) || (sessionType === "test" && mod.sec === "rw");
    const choices = ["A", "B", "C", "D"];
    const showSkill = sessionType === "practice";

    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: ff, color: C.tx, display: "flex", flexDirection: "column" }}>
        {confirmHome && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: C.sf, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: 28, maxWidth: 400, width: "90%", textAlign: "center" }}>
              <p style={{ fontSize: 15, fontWeight: 600, margin: "0 0 6px" }}>Leave session?</p>
              <p style={{ fontSize: 13, color: C.tx3, margin: "0 0 24px" }}>{answeredCount} question{answeredCount !== 1 ? "s" : ""} attempted.</p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <Btn small onClick={() => setConfirmHome(false)}>Cancel</Btn>
                <Btn small onClick={saveAndExit}>Save & Exit</Btn>
                <Btn small danger onClick={goHome}>Discard</Btn>
              </div>
            </div>
          </div>
        )}

        <div style={{ padding: `20px ${PAD}px 8px`, display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => setConfirmHome(true)} title="Home" style={{ background: C.sf2, border: `1px solid ${C.bdr}`, borderRadius: 6, color: C.tx3, fontFamily: ff, fontSize: 12, cursor: "pointer", padding: "5px 10px", width: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>⌂</button>
            {showSkill && <span style={{ background: C.sf2, border: `1px solid ${C.bdr}`, borderRadius: 6, padding: "5px 12px", fontFamily: ff, fontSize: 12, color: C.tx2, cursor: "default" }}>{qSkill || "Skill"}</span>}
            <button onClick={() => setPhase("break")} style={{ background: C.sf2, border: `1px solid ${C.bdr}`, borderRadius: 6, color: C.tx2, fontFamily: ff, fontSize: 12, cursor: "pointer", padding: "5px 12px" }}>Summary</button>
            <ModuleDropdown modules={modules} currentMod={currentMod} onSelect={(mi) => { setCurrentMod(mi); setQIdx(modules[mi].start); }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, textAlign: "center" }}>
            {modLocalIdx + 1} <span style={{ color: C.tx3, fontWeight: 400 }}>/ {mod.count}</span>
          </span>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button onClick={() => setHighlighting(h => !h)} style={{
              background: highlighting ? C.selDim : C.sf2, border: `1px solid ${highlighting ? C.tx2 : C.bdr}`,
              borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontFamily: ff,
              fontSize: 12, color: highlighting ? C.sel : C.tx3, minWidth: 36, textAlign: "center",
            }} title="Highlight">✎</button>
            <button onClick={() => setFlags(p => ({ ...p, [qIdx]: !p[qIdx] }))} style={{
              background: flags[qIdx] ? C.warnDim : C.sf2, border: `1px solid ${flags[qIdx] ? C.warn : C.bdr}`,
              borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontFamily: ff,
              fontSize: 12, color: flags[qIdx] ? C.warn : C.tx3, minWidth: 80, textAlign: "center",
            }}>{flags[qIdx] ? "⚑ Flagged" : "⚐ Flag"}</button>
          </div>
        </div>

        <div style={{ padding: `0 ${PAD}px 16px`, display: "grid", gridTemplateColumns: `repeat(${mod.count}, 1fr)`, gap: 3, flexShrink: 0 }}>
          {Array.from({ length: mod.count }, (_, i) => {
            const gi = mod.start + i;
            const cur = gi === qIdx, ans = answers[gi] != null, fl = flags[gi];
            let bg = "transparent", bd = C.bdr, co = C.tx3;
            if (cur) { bg = C.sf3; bd = C.tx2; co = C.tx; }
            else if (fl) { bg = C.warnDim; bd = C.warn; co = C.warn; }
            else if (ans) { bg = C.sf2; co = C.tx2; }
            return (
              <button key={i} onClick={() => setQIdx(gi)} style={{
                height: 36, borderRadius: 5, fontSize: 11, fontWeight: 600,
                border: `1px solid ${bd}`, background: bg, color: co,
                cursor: "pointer", fontFamily: ff,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{i + 1}</button>
            );
          })}
        </div>

        <div style={{ flex: 1, padding: `0 ${PAD}px 28px`, width: "100%", boxSizing: "border-box" }}>
          <style>{`.hl-passage ::selection { background: rgba(212,184,118,0.35); } .hl-passage mark { background: rgba(212,184,118,0.3); color: ${C.tx}; border-radius: 2px; }`}</style>
          <div style={{ display: wide ? "grid" : "block", gridTemplateColumns: wide ? "1fr 380px" : undefined, gap: wide ? 24 : undefined }}>
            <div>
              <div style={{ padding: "16px 20px", background: C.sf, borderRadius: 8, border: `1px solid ${C.bdr}`, marginBottom: 16 }}>
                <span style={{ color: C.tx3, fontSize: 13 }}>Question text will appear here</span>
              </div>
              {isRW && (
                <div className={highlighting ? "hl-passage" : ""} style={{ background: C.sf, border: `1px solid ${highlighting ? C.warn : C.bdr}`, borderRadius: 8, padding: 24, marginBottom: wide ? 0 : 16, transition: "border-color .15s", cursor: highlighting ? "text" : "default" }}
                  onMouseUp={() => {
                    if (!highlighting) return;
                    const sel = window.getSelection();
                    if (!sel || sel.isCollapsed || !sel.rangeCount) return;
                    const range = sel.getRangeAt(0);
                    const mark = document.createElement("mark");
                    try { range.surroundContents(mark); } catch(e) {}
                    sel.removeAllRanges();
                  }}>
                  <div style={{ fontSize: 11, color: C.tx3, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 12, fontWeight: 600 }}>Passage {highlighting && <span style={{ color: C.warn, fontWeight: 400 }}>— highlighting on</span>}</div>
                  <div style={{ minHeight: 100, color: C.tx2, fontSize: 14, lineHeight: 1.7, padding: 4, userSelect: highlighting ? "text" : "auto" }}>Generated passage content. Select text while the highlight tool is active to mark important sections for reference.</div>
                </div>
              )}
            </div>
            <div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {choices.map((letter, ci) => {
                  const sel = answers[qIdx] === ci;
                  const crossed = crossouts[`${qIdx}-${ci}`];
                  return (
                    <button key={ci} onClick={() => { if (!crossed) setAnswers(p => ({ ...p, [qIdx]: p[qIdx] === ci ? null : ci })); }} style={{
                      display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                      borderRadius: 8, border: `1px solid ${sel ? C.tx2 : C.bdr}`,
                      background: sel ? C.selDim : "transparent",
                      cursor: crossed ? "default" : "pointer", fontFamily: ff, textAlign: "left",
                      textDecoration: crossed ? "line-through" : "none",
                      opacity: crossed && !sel ? 0.35 : 1, transition: "all .1s",
                    }}>
                      <span style={{ width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: sel ? C.sel : C.tx3, border: `1px solid ${sel ? "transparent" : C.bdr2}`, background: sel ? C.selDim : C.sf, flexShrink: 0 }}>{letter}</span>
                      <span style={{ fontSize: 14, color: sel ? C.sel : C.tx2, flex: 1 }}>Answer placeholder</span>
                      <span onClick={(e) => { e.stopPropagation(); setCrossouts(p => ({ ...p, [`${qIdx}-${ci}`]: !p[`${qIdx}-${ci}`] })); }} title="Cross out" style={{
                        width: 24, height: 24, borderRadius: 4, fontSize: 11, fontWeight: 700,
                        border: `1px solid ${crossed ? C.tx3 : C.bdr2}`, background: crossed ? C.sf2 : "transparent",
                        color: crossed ? C.tx2 : C.tx3, cursor: "pointer", fontFamily: ff,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>✕</span>
                    </button>
                  );
                })}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                <Btn small disabled={qIdx <= mod.start} onClick={() => setQIdx(qIdx - 1)}>← Prev</Btn>
                {modLocalIdx < mod.count - 1 ? <Btn small onClick={() => setQIdx(qIdx + 1)}>Next →</Btn> : <Btn small onClick={() => setPhase("break")}>Module Summary</Btn>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SESSION: BREAK
  if (view === "session" && phase === "break") {
    const modAnswered = Array.from({ length: mod.count }, (_, i) => answers[mod.start + i] != null).filter(Boolean).length;
    const modFlagged = Array.from({ length: mod.count }, (_, i) => flags[mod.start + i]).filter(Boolean).length;
    const gridW = 9 * 52;
    return (
      <Shell wide>
        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>{mod.label}</h2>
          <p style={{ color: C.tx3, fontSize: 13, margin: "0 0 28px" }}>Questions</p>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
            <BluebookGrid mod={mod} answers={answers} flags={flags} qIdx={qIdx} onClickQ={(gi) => { setQIdx(gi); setPhase("questions"); }} forceCols={9} />
          </div>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 32, fontSize: 13 }}>
            <span style={{ color: C.tx2 }}>{modAnswered} answered</span>
            {mod.count - modAnswered > 0 && <span style={{ color: C.tx3 }}>{mod.count - modAnswered} unanswered</span>}
            {modFlagged > 0 && <span style={{ color: C.tx3 }}>{modFlagged} flagged</span>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: gridW, margin: "0 auto" }}>
            <button onClick={() => setPhase("questions")} style={{
              padding: "12px 0", borderRadius: 8, fontSize: 14, fontFamily: ff, fontWeight: 600,
              border: `1px solid ${C.bdr}`, background: "transparent", color: C.tx2, cursor: "pointer",
            }}>Back to Questions</button>
            {isLastMod || sessionType === "practice" ? (
              <button onClick={handleSubmit} style={{
                padding: "12px 0", borderRadius: 8, fontSize: 14, fontFamily: ff, fontWeight: 600,
                border: `1px solid ${C.bdr}`, background: "transparent", color: C.tx2, cursor: "pointer",
              }}>{sessionType === "practice" ? "Submit Practice" : "Submit Test"}</button>
            ) : (
              <button onClick={() => { const next = currentMod + 1; setCurrentMod(next); setQIdx(modules[next].start); setPhase("questions"); }} style={{
                padding: "12px 0", borderRadius: 8, fontSize: 14, fontFamily: ff, fontWeight: 600,
                border: `1px solid ${C.bdr}`, background: "transparent", color: C.tx2, cursor: "pointer",
              }}>Proceed to Next Module</button>
            )}
          </div>
          <button onClick={() => restartModule(currentMod)} style={{
            background: "none", border: "none", color: C.tx3, fontFamily: ff,
            fontSize: 13, cursor: "pointer", padding: 0, marginTop: 20,
          }}>Restart Module</button>
        </div>
      </Shell>
    );
  }

  // SESSION: RESULTS
  if (view === "session" && phase === "results") {
    const results = scoreSession();
    const correct = results.filter(r => r.correct).length;
    const attempted = results.filter(r => r.answered).length;
    const total = questions.length;
    const pct = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    return (
      <Shell wide>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            width: 110, height: 110, borderRadius: "50%", margin: "0 auto 20px",
            border: `3px solid ${C.tx2}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: C.sf,
          }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: C.tx }}>{pct}%</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>{sessionType === "test" ? "Test" : "Practice"} Complete</h1>
          <p style={{ color: C.tx2, fontSize: 14, margin: "0 0 8px" }}>{correct} correct out of {attempted} attempted ({total} total)</p>
          <div style={{ background: C.sf, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: 20, textAlign: "left", margin: "28px 0" }}>
            <Label>Breakdown</Label>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${getGridCols(total)}, 1fr)`, gap: 5 }}>
              {results.map((r, i) => {
                const fl = flags[i];
                let bd = C.bdr, co = C.tx3;
                if (fl) { bd = C.warn; co = C.warn; }
                else if (r.correct) { bd = C.ok; co = C.ok; }
                else if (r.answered) { bd = C.bad; co = C.bad; }
                return (
                <div key={i} style={{
                  padding: "7px 0", borderRadius: 5, textAlign: "center", fontSize: 10, fontWeight: 600,
                  background: "transparent", color: co, border: `1.5px solid ${bd}`,
                }}>{i + 1}</div>
                );
              })}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Btn onClick={goHome}>Home</Btn>
            <Btn onClick={() => { setQIdx(0); setCurrentMod(0); setPhase("review"); }}>Review Questions</Btn>
          </div>
        </div>
      </Shell>
    );
  }

  // SESSION: REVIEW
  if (view === "session" && phase === "review") {
    const results = scoreSession();
    const r = results[qIdx] || {};
    const choices = ["A", "B", "C", "D"];
    const qSkill = questionSkills[qIdx] || "";
    const isRW = isRWSkill(qSkill) || (sessionType === "test" && mod.sec === "rw");

    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: ff, color: C.tx, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: `20px ${PAD}px 8px`, display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={goHome} style={{ background: C.sf2, border: `1px solid ${C.bdr}`, borderRadius: 6, color: C.tx3, fontFamily: ff, fontSize: 12, cursor: "pointer", padding: "5px 10px", width: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>⌂</button>
            <ModuleDropdown modules={modules} currentMod={currentMod} onSelect={(mi) => { setCurrentMod(mi); setQIdx(modules[mi].start); }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, textAlign: "center" }}>
            Review: {modLocalIdx + 1} <span style={{ color: C.tx3, fontWeight: 400 }}>/ {mod.count}</span>
          </span>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <span style={{ padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, fontFamily: ff, background: r.correct ? C.okDim : r.answered ? C.badDim : C.sf2, color: r.correct ? C.ok : r.answered ? C.bad : C.tx3 }}>
              {r.correct ? "✓ Correct" : r.answered ? "✗ Wrong" : "Skipped"}
            </span>
          </div>
        </div>

        <div style={{ padding: `0 ${PAD}px 16px`, display: "grid", gridTemplateColumns: `repeat(${mod.count}, 1fr)`, gap: 3, flexShrink: 0 }}>
          {Array.from({ length: mod.count }, (_, i) => {
            const gi = mod.start + i;
            const cur = gi === qIdx;
            const rr = results[gi] || {};
            const fl = flags[gi];
            let bd = C.bdr, co = C.tx3;
            if (fl) { bd = C.warn; co = C.warn; }
            else if (rr.correct) { bd = C.ok; co = C.ok; }
            else if (rr.answered) { bd = C.bad; co = C.bad; }
            if (cur) { co = C.tx; }
            return (
              <button key={i} onClick={() => setQIdx(gi)} style={{
                height: 36, borderRadius: 5, fontSize: 11, fontWeight: 600,
                border: `1.5px solid ${cur ? C.tx2 : bd}`, background: cur ? C.sf3 : "transparent", color: co,
                cursor: "pointer", fontFamily: ff,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{i + 1}</button>
            );
          })}
        </div>

        <div style={{ flex: 1, padding: `0 ${PAD}px 28px`, width: "100%", boxSizing: "border-box" }}>
          <div style={{ fontSize: 11, color: C.tx2, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 }}>{qSkill || "Skill"}</div>
          <div style={{ display: wide ? "grid" : "block", gridTemplateColumns: wide ? "1fr 380px" : undefined, gap: wide ? 24 : undefined }}>
            <div>
              <div style={{ padding: "16px 20px", background: C.sf, borderRadius: 8, border: `1px solid ${C.bdr}`, marginBottom: 16 }}>
                <span style={{ color: C.tx3, fontSize: 13 }}>Question text placeholder</span>
              </div>
              {isRW && (
                <div style={{ background: C.sf, border: `1px solid ${C.bdr}`, borderRadius: 8, padding: 24, marginBottom: wide ? 0 : 16 }}>
                  <div style={{ fontSize: 11, color: C.tx3, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 12, fontWeight: 600 }}>Passage</div>
                  <div style={{ minHeight: 80, border: `1px dashed ${C.bdr2}`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: C.tx3, fontSize: 13, padding: 16 }}>Passage content</div>
                </div>
              )}
            </div>
            <div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {choices.map((letter, ci) => {
                  const wasYours = r.picked === ci;
                  const isCorrect = r.correctChoice === ci;
                  const wasCrossed = crossouts[`${qIdx}-${ci}`];
                  let bdr = C.bdr, bg = "transparent", col = C.tx2, label = "";
                  if (isCorrect) { bdr = C.ok; bg = C.okDim; col = C.ok; label = " ✓"; }
                  if (wasYours && !isCorrect) { bdr = C.bad; bg = C.badDim; col = C.bad; label = " ✗"; }
                  return (
                    <div key={ci} style={{
                      display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                      borderRadius: 8, border: `1.5px solid ${bdr}`, background: bg,
                      textDecoration: wasCrossed && !isCorrect && !wasYours ? "line-through" : "none",
                      opacity: wasCrossed && !isCorrect && !wasYours ? 0.4 : 1,
                    }}>
                      <span style={{ width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: col, border: `1px solid ${isCorrect || wasYours ? "transparent" : C.bdr2}`, background: isCorrect ? C.okDim : wasYours ? C.badDim : C.sf, flexShrink: 0 }}>{letter}</span>
                      <span style={{ fontSize: 14, color: col, flex: 1 }}>Answer placeholder{label}</span>
                      {wasYours && !isCorrect && <span style={{ fontSize: 11, color: col, fontWeight: 600 }}>Your answer</span>}
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 16, padding: "14px 18px", background: C.sf, borderRadius: 8, border: `1px solid ${C.bdr}` }}>
                <div style={{ fontSize: 11, color: C.tx3, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8, fontWeight: 600 }}>Explanation</div>
                <p style={{ color: C.tx2, fontSize: 13, lineHeight: 1.6, margin: 0 }}>Explanation placeholder — AI-generated reasoning will appear here.</p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                <Btn small disabled={qIdx <= mod.start} onClick={() => setQIdx(qIdx - 1)}>← Prev</Btn>
                {modLocalIdx < mod.count - 1 ? (
                  <Btn small onClick={() => setQIdx(qIdx + 1)}>Next →</Btn>
                ) : isLastMod ? (
                  <Btn small onClick={goHome}>Done</Btn>
                ) : (
                  <Btn small onClick={() => { const next = currentMod + 1; setCurrentMod(next); }}>
                    Next Module →
                  </Btn>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}