"use client";

import { BarChart3, ClipboardCheck, IndianRupee, Users, Zap } from "lucide-react";
import ReportMetricCard from "./ReportMetricCard";

export default function ReportSummaryGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <ReportMetricCard label="Attendance" value="94.2%" change="+2.4%" isPositive icon={ClipboardCheck} color="cyan" />
      <ReportMetricCard label="Revenue" value="?12.4L" change="+12%" isPositive icon={IndianRupee} color="emerald" />
      <ReportMetricCard label="Students" value="1,242" change="+42" isPositive icon={Users} color="blue" />
      <ReportMetricCard label="AI Recommendations" value="18" change="-4" isPositive={false} icon={Zap} color="violet" />
      <ReportMetricCard label="Health" value="99%" icon={BarChart3} color="amber" />
    </div>
  );
}
