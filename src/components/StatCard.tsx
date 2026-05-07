import { motion } from 'motion/react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon?: any;
  loading?: boolean;
}

export function StatCard({ label, value, subValue, icon: Icon, loading }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 flex flex-col gap-4 gold-glow"
    >
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium text-text-muted">{label}</span>
        {Icon && <Icon className="text-gold-liquid/40" size={20} />}
      </div>
      
      <div className="flex flex-col gap-1">
        {loading ? (
          <div className="h-8 w-32 bg-white/5 animate-pulse rounded" />
        ) : (
          <span className="text-3xl font-bold text-white gold-text-glow font-mono">
            {value}
          </span>
        )}
        {subValue && (
          <span className="text-xs text-text-muted font-medium uppercase tracking-wider">
            {subValue}
          </span>
        )}
      </div>
    </motion.div>
  );
}
