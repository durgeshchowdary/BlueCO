import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  accent?: string;
}

export default function StatCard({ title, value, accent = 'accent' }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card-glass p-6"
    >
      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{title}</p>
      <h3 className="mt-4 text-4xl font-semibold text-accent">{value}</h3>
    </motion.div>
  );
}
