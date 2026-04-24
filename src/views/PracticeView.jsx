import { useState } from "react";
import Shell from "../components/primitives/Shell.jsx";
import Pill from "../components/primitives/Pill.jsx";
import Btn from "../components/primitives/Btn.jsx";
import Label from "../components/primitives/Label.jsx";
import { C } from "../styles/theme.js";
import { TAXONOMY, allSkills } from "../data/taxonomy.js";

export default function PracticeView({ onStart }) {
  const [skills, setSkills] = useState([]);
  const [pCount, setPCount] = useState(10);

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

  const renderColumn = (sec) => {
    const t = TAXONOMY[sec];
    const all = allSkills(sec);
    const allSel = all.every(s => skills.includes(s));
    return (
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: C.tx }}>{t.label}</span>
          <button onClick={() => toggleSection(sec)} style={{
            background: allSel ? C.selDim : "transparent", border: `1px solid ${allSel ? C.tx2 : C.bdr}`,
            borderRadius: 5, padding: "5px 11px", fontSize: 12, fontWeight: 600,
            color: allSel ? C.sel : C.tx3, cursor: "pointer", transition: "all .12s",
          }}>{allSel ? "Deselect All" : "Select All"}</button>
        </div>
        {Object.entries(t.subtypes).map(([sub, subSkills]) => {
          const catAll = subSkills.every(s => skills.includes(s));
          const catCount = subSkills.filter(s => skills.includes(s)).length;
          return (
            <div key={sub} style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <button onClick={() => toggleCategory(sec, sub)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 13, fontWeight: 600, color: catAll ? C.tx : C.tx2, transition: "color .12s" }}>{sub}</button>
                <span style={{ fontSize: 11, color: C.tx3 }}>{catCount}/{subSkills.length}</span>
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
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 6px" }}>Practice</h1>
        <p style={{ color: C.tx3, fontSize: 14, margin: "0 0 36px" }}>Select skills from either or both sections.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 32 }}>
          {renderColumn("math")}
          {renderColumn("rw")}
        </div>
        <div style={{ borderTop: `1px solid ${C.bdr}`, paddingTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Label>Questions</Label>
            <div style={{ display: "flex", gap: 6, marginTop: -8 }}>
              {[10, 15, 20, 25, 30].map(n => <Pill key={n} active={pCount === n} onClick={() => setPCount(n)}>{n}</Pill>)}
            </div>
          </div>
          <Btn onClick={() => onStart("practice", pCount, skills)} disabled={skills.length === 0}>
            Start Practice ({skills.length} skill{skills.length !== 1 ? "s" : ""})
          </Btn>
        </div>
      </div>
    </Shell>
  );
}
