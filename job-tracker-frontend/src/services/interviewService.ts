
import api from "./api";
import type { Interview } from "../types/Interview";

const list = (data: unknown): Interview[] =>
  Array.isArray(data)
    ? data
    : ((data as { content?: Interview[] })?.content ?? []);

export async function getInterviews() {
  const response = await api.get("/interviews");
  return list(response.data);
}

export async function getInterview(id: number) {
  const response = await api.get(`/interviews/${id}`);
  return response.data;
}

export async function createInterview(data: Interview) {
  const payload = {
    applicationId: data.applicationId,
    interviewDateTime: `${data.interviewDate}T${data.interviewTime || "00:00"}:00`,
    interviewerName: data.interviewer,
    interviewType: data.interviewType,
    notes: data.notes
  };

  const response = await api.post("/interviews", payload);
  return response.data;
}

export async function updateInterview(id: number, data: Interview) {
  const payload = {
    applicationId: data.applicationId,
    interviewDateTime: `${data.interviewDate}T${data.interviewTime || "00:00"}:00`,
    interviewerName: data.interviewer,
    interviewType: data.interviewType,
    notes: data.notes
  };

  const response = await api.put(`/interviews/${id}`, payload);
  return response.data;
}

export async function deleteInterview(id: number) {
  await api.delete(`/interviews/${id}`);
}
