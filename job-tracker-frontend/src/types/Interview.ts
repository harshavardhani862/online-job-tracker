export interface Interview {
  id?: number;
  interviewId?: number;
  applicationId: number;
  companyName?: string;
  jobTitle?: string;
  status?: string;
  interviewDate: string;
  interviewTime?: string;
  interviewType?: string;
  interviewer?: string;
  meetingLink?: string;
  notes?: string;
}
