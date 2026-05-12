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
      whileHover={{ y: -4, scale: 1.01 }}
      className="card-glass group relative overflow-hidden p-6"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_42%)] opacity-0 transition group-hover:opacity-100" />
      <p className="relative text-sm uppercase tracking-[0.3em] text-slate-400">{title}</p>
      <h3 className="relative mt-4 text-4xl font-black text-cyan-100">{value}</h3>
    </motion.div>
  );
}
