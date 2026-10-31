import { useCallback, useEffect, useState } from "react";
import InterviewCard from "../components/InterviewCard";
import { createInterview, deleteInterview, getInterviews } from "../services/interviewService";
import { getApplications } from "../services/applicationService";
import type { Interview } from "../types/Interview";
import type { JobApplication } from "../types/Application";

const emptyForm: Interview = {
  applicationId: 0, interviewDate: "", interviewTime: "", interviewType: "Technical",
  interviewer: "", meetingLink: "", notes: ""
};

function appId(app: JobApplication): number {
  return Number(app.id ?? app.applicationId ?? 0);
}

export default function Interviews() {
  const [items, setItems] = useState<Interview[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [form, setForm] = useState<Interview>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [interviews, apps] = await Promise.all([getInterviews(), getApplications()]);
      setItems(interviews);
      setApplications(apps.filter(a => appId(a) > 0));
      setForm(current => ({
        ...current,
        applicationId: current.applicationId || (apps.find(a => appId(a) > 0) ? appId(apps.find(a => appId(a) > 0)!) : 0)
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load interviews. Check that the backend is running and sign in again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.applicationId) { setError("Please add an application before scheduling an interview."); return; }
    setSaving(true);
    setError("");
    try {
      await createInterview(form);
      setForm({ ...emptyForm, applicationId: form.applicationId });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to create interview.");
    } finally { setSaving(false); }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this interview?")) return;
    try { await deleteInterview(id); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to delete interview."); }
  };

  return (
    <div>
      <div className="page-header"><div><h1>Interviews</h1><p className="muted">Schedule and track interviews linked to your applications.</p></div><button className="button secondary" type="button" onClick={() => void load()} disabled={loading}>{loading ? "Refreshing…" : "Refresh"}</button></div>
      {error && <div className="error card" role="alert">{error}</div>}
      <form className="form card" onSubmit={submit}>
        <h3>Schedule Interview Manually</h3>
        <label>Job application
          <select value={form.applicationId || ""} onChange={e => setForm({...form, applicationId: Number(e.target.value)})} required>
            <option value="" disabled>Select a company and role</option>
            {applications.map(a => <option key={appId(a)} value={appId(a)}>{a.companyName} — {a.jobTitle}</option>)}
          </select>
        </label>
        {applications.length === 0 && <p className="muted">Add an application first; interviews must be linked to an application.</p>}
        <label>Date<input type="date" value={form.interviewDate} onChange={e => setForm({...form, interviewDate: e.target.value})} required /></label>
        <label>Time<input type="time" value={form.interviewTime} onChange={e => setForm({...form, interviewTime: e.target.value})} required /></label>
        <label>Interview type<select value={form.interviewType} onChange={e => setForm({...form, interviewType: e.target.value})}><option>Technical</option><option>HR</option><option>Managerial</option><option>Assessment</option><option>Other</option></select></label>
        <label>Interviewer<input value={form.interviewer} onChange={e => setForm({...form, interviewer: e.target.value})} /></label>
        <label>Meeting link<input type="url" value={form.meetingLink ?? ""} onChange={e => setForm({...form, meetingLink: e.target.value})} placeholder="https://..." /></label>
        <label>Notes<textarea rows={3} value={form.notes ?? ""} onChange={e => setForm({...form, notes: e.target.value})} /></label>
        <button className="button" type="submit" disabled={saving || loading || applications.length === 0}>{saving ? "Saving…" : "Save Interview"}</button>
      </form>
      <section className="section-block"><h2>Scheduled interviews</h2>
        {loading ? <p>Loading interviews…</p> : items.length === 0 ? <div className="empty card">No interviews scheduled yet.</div> :
          <div className="grid">{items.map((item, i) => <InterviewCard key={item.id ?? item.interviewId ?? i} interview={item} onDelete={remove} />)}</div>}
      </section>
    </div>
  );
}
