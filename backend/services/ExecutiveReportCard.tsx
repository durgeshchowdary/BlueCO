'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface ExecutiveReportCardProps {
  title: string;
  value: string;
  trend: number;
  description: string;
  category: string;
}

export default function ExecutiveReportCard({ title, value, trend, description, category }: ExecutiveReportCardProps) {
  const isPositive = trend >= 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm transition hover:border-blue-200 hover:shadow-xl"
    >
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-slate-100 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600">
          {category}
        </span>
        <Activity size={18} className="text-slate-300 group-hover:text-blue-400" />
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</h3>
        <div className="mt-2 flex items-baseline gap-3">
          <span className="text-4xl font-black text-slate-900 tracking-tight">{value}</span>
          <div className={`flex items-center gap-1 text-sm font-black ${isPositive ? 'text-emerald-600' : 'text-amber-600'}`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(trend)}%
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm font-medium leading-relaxed text-slate-500">
        {description}
      </p>

      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-600 to-cyan-400 opacity-0 transition group-hover:opacity-100" />
    </motion.div>
  );
}