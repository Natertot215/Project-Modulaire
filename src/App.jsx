import { useEffect, useState } from "react";
import HomeView from "./views/HomeView.jsx";
import PracticeView from "./views/PracticeView.jsx";
import TestView from "./views/TestView.jsx";
import HistoryView from "./views/HistoryView.jsx";
import SessionView from "./views/session/SessionView.jsx";
import * as storage from "./lib/storage.js";

export default function App() {
  const [view, setView] = useState("home");
  const [sessionInit, setSessionInit] = useState(null);
  const [history, setHistory] = useState(() => storage.get("history", []));
  const [savedSession, setSavedSession] = useState(() => storage.get("savedSession", null));

  useEffect(() => { storage.set("history", history); }, [history]);
  useEffect(() => { storage.set("savedSession", savedSession); }, [savedSession]);

  const goHome = () => {
    setSessionInit(null);
    setView("home");
  };

  const startSession = (type, n, skills) => {
    setSessionInit({ type, n, skills });
    setSavedSession(null);
    setView("session");
  };

  const resumeSession = () => {
    setSessionInit({ resume: savedSession });
    setView("session");
  };

  const handleSaveAndExit = (sessionState) => {
    setSavedSession(sessionState);
    setSessionInit(null);
    setView("home");
  };

  const handleSubmitTest = (entry) => {
    setHistory(p => [entry, ...p]);
    setSavedSession(null);
  };

  const deleteSession = (id) => setHistory(p => p.filter(h => h.id !== id));

  if (view === "session" && sessionInit) {
    return (
      <SessionView
        init={sessionInit}
        onHome={goHome}
        onSaveAndExit={handleSaveAndExit}
        onSubmitTest={handleSubmitTest}
      />
    );
  }

  if (view === "practice") {
    return <PracticeView onBack={goHome} onStart={startSession} />;
  }

  if (view === "test") {
    return <TestView onBack={goHome} onStart={startSession} />;
  }

  if (view === "history") {
    return <HistoryView history={history} onDelete={deleteSession} onBack={goHome} />;
  }

  return (
    <HomeView
      savedSession={savedSession}
      onResume={resumeSession}
      onNavigate={(v) => setView(v)}
    />
  );
}
