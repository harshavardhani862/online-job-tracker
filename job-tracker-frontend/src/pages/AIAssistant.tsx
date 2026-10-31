import { useState } from "react";
import api from "../services/api";

type Mode = "interview" | "career";
type FormState = {
  targetRole: string;
  skills: string;
  background: string;
  additionalDetails: string;
  interviewType: string;
  experienceLevel: string;
};

const initialForm: FormState = {
  targetRole: "",
  skills: "",
  background: "",
  additionalDetails: "",
  interviewType: "Technical + HR",
  experienceLevel: "Fresher",
};

export default function AIAssistant() {
  const [mode, setMode] = useState<Mode>("interview");
  const [form, setForm] = useState<FormState>(initialForm);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: keyof FormState, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const generate = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult("");
    try {
      const endpoint = mode === "interview"
        ? "/ai/interview-preparation"
        : "/ai/career-recommendations";
      const response = await api.post<{ result: string }>(endpoint, form);
      setResult(response.data.result);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || "Unable to generate the AI response. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const changeMode = (next: Mode) => {
    setMode(next);
    setResult("");
    setError("");
  };

  return (
    <section className="ai-page">
      <header className="ai-hero">
        <div>
          <span className="ai-eyebrow">YOUR PERSONAL CAREER COPILOT</span>
          <h1>AI Career Assistant</h1>
          <p>Prepare confidently for interviews and discover career paths that match your skills.</p>
        </div>
        <div className="ai-hero-symbol" aria-hidden="true">✦</div>
      </header>

      <div className="ai-mode-tabs" role="tablist" aria-label="AI tools">
        <button type="button" role="tab" aria-selected={mode === "interview"} className={mode === "interview" ? "selected" : ""} onClick={() => changeMode("interview")}>
          <span>◎</span> Interview Preparation
        </button>
        <button type="button" role="tab" aria-selected={mode === "career"} className={mode === "career" ? "selected" : ""} onClick={() => changeMode("career")}>
          <span>↗</span> Career Recommendations
        </button>
      </div>

      <div className="ai-workspace">
        <form className="ai-form-card" onSubmit={generate}>
          <div className="ai-card-heading">
            <div>
              <span className="ai-step-label">PERSONALIZE YOUR RESULTS</span>
              <h2>{mode === "interview" ? "Build your interview plan" : "Find your career direction"}</h2>
            </div>
            <span className="ai-sparkle">✧</span>
          </div>

          <label className="ai-field">
            {mode === "interview" ? "Target job role *" : "Preferred role or career goal *"}
            <input value={form.targetRole} onChange={(e) => update("targetRole", e.target.value)} placeholder="e.g. Java Developer, Data Analyst, AI Engineer" maxLength={160} required />
          </label>

          <label className="ai-field">
            Skills you have
            <textarea value={form.skills} onChange={(e) => update("skills", e.target.value)} placeholder="e.g. Python, Java, SQL, React, machine learning" rows={3} maxLength={3000} />
          </label>

          <label className="ai-field">
            Education and background
            <textarea value={form.background} onChange={(e) => update("background", e.target.value)} placeholder="e.g. M.Tech CSE student, B.Tech CSE, academic projects, internship experience" rows={3} maxLength={3000} />
          </label>

          {mode === "interview" ? (
            <div className="ai-field-row">
              <label className="ai-field">
                Interview type
                <select value={form.interviewType} onChange={(e) => update("interviewType", e.target.value)}>
                  <option>Technical + HR</option><option>Technical</option><option>HR / Behavioral</option><option>Managerial</option><option>Campus placement</option>
                </select>
              </label>
              <label className="ai-field">
                Experience level
                <select value={form.experienceLevel} onChange={(e) => update("experienceLevel", e.target.value)}>
                  <option>Fresher</option><option>Internship</option><option>0-2 years</option><option>2-5 years</option><option>5+ years</option>
                </select>
              </label>
            </div>
          ) : null}

          <label className="ai-field">
            {mode === "interview" ? "Job description or topics (optional)" : "Interests, preferred location or work preferences (optional)"}
            <textarea value={form.additionalDetails} onChange={(e) => update("additionalDetails", e.target.value)} placeholder={mode === "interview" ? "Paste the job description or list topics you expect" : "e.g. Interested in AI, prefer Hyderabad / remote, enjoy problem solving"} rows={3} maxLength={1200} />
          </label>

          {error && <div className="ai-error" role="alert">{error}</div>}
          <button className="ai-generate-button" type="submit" disabled={loading || !form.targetRole.trim()}>
            {loading ? <><span className="ai-spinner" /> Generating with AI...</> : <>✦ {mode === "interview" ? "Generate interview preparation" : "Get career recommendations"}</>}
          </button>
          <p className="ai-privacy-note">Your information is sent securely to the backend AI service for this request. Avoid entering passwords or sensitive personal information.</p>
        </form>

        <section className="ai-result-card" aria-live="polite">
          <div className="ai-card-heading">
            <div><span className="ai-step-label">AI-GENERATED GUIDANCE</span><h2>Your results</h2></div>
            <span className="ai-result-icon">✧</span>
          </div>
          {!result && !loading && (
            <div className="ai-empty-result">
              <div className="ai-empty-icon">✦</div>
              <h3>Your next step starts here</h3>
              <p>{mode === "interview" ? "Fill in your target role and generate tailored interview questions, answer tips and a practice schedule." : "Share your skills and interests to receive suitable roles, skill-gap analysis and a practical learning roadmap."}</p>
            </div>
          )}
          {loading && <div className="ai-loading-state"><span className="ai-spinner" /><p>Analyzing your details and preparing useful guidance...</p></div>}
          {result && <><div className="ai-result-content">{result}</div><button type="button" className="ai-copy-button" onClick={() => navigator.clipboard?.writeText(result)}>Copy results</button></>}
        </section>
      </div>
      <p className="ai-disclaimer">AI suggestions are for learning and career-planning support. Review the recommendations and verify role requirements before making decisions.</p>
    </section>
  );
}
