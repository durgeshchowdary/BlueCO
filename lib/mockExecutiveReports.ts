import type { ExecutiveReportData } from "@/types/reports";

export const MOCK_EXECUTIVE_REPORTS: ExecutiveReportData[] = [
  {
    title: "Attendance Stability",
    value: "96%",
    trend: 4.2,
    category: "Operations",
    description: "Student attendance has stabilized across U-14 batches following the new schedule implementation.",
  },
  {
    title: "Churn Risk Mitigation",
    value: "12%",
    trend: -18.5,
    category: "AI Ops",
    description: "Predictive churn alerts have reduced inactive student rates this month.",
  },
  {
    title: "Collection Efficiency",
    value: "?8.4L",
    trend: 12,
    category: "Billing",
    description: "Automated fee reminders improved payment collection speed by 3.2 days.",
  },
];
