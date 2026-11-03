export type IssueStatus = "Open" | "In Progress" | "Resolved";

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  createdAt: string;
}