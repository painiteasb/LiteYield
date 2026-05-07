import { motion } from 'motion/react';
import { TrendingUp, PieChart, ShieldCheck } from 'lucide-react';

interface StrategyViewProps {
  apyA: string;
  apyB: string;
  bufferBps: string;
}

export function StrategyView({ apyA, apyB, bufferBps }: StrategyViewProps) {
  const bufferPercent = Number(bufferBps) / 100;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 mb-2">
        <PieChart size={20} className="text-gold-liquid" />
        <h2 className="text-lg font-bold text-white uppercase tracking-wider">Allocation Logic</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StrategyCard 
          name="Liquidity Buffer" 
          info="Instant Withdrawals" 
          allocation={`${bufferPercent}%`} 
          apy="0%" 
          color="bg-blue-500" 
          icon={ShieldCheck}
        />
        <StrategyCard 
          name="Strategy A" 
          info="Steady Growth" 
          allocation={`${((100 - bufferPercent) * 0.7).toFixed(1)}%`} 
          apy={`${apyA}%`} 
          color="bg-gold-liquid" 
          icon={TrendingUp}
        />
        <StrategyCard 
          name="Strategy B" 
          info="Maximum Yield" 
          allocation={`${((100 - bufferPercent) * 0.3).toFixed(1)}%`} 
          apy={`${apyB}%`} 
          color="bg-gold-dark" 
          icon={TrendingUp}
        />
      </div>

      <div className="glass-card p-6 mt-4 border-gold-liquid/10 bg-gradient-to-br from-space-card to-space-black">
        <p className="text-sm text-text-muted leading-relaxed">
          LiteYield uses a <span className="text-white font-medium">shared-based vault model</span>. 
          Yield from Strategy A and B is harvested and compounded 
          linearly, increasing the value of yLTC shares relative to LTC over time. 
          Rebalancing ensures the liquidity buffer never falls below 15% under optimal conditions.
        </p>
      </div>
    </div>
  );
}

function StrategyCard({ name, info, allocation, apy, color, icon: Icon }: any) {
  return (
    <div className="glass-card p-5 flex flex-col gap-4 relative overflow-hidden group">
      <div className={cn("absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-20 transition-all group-hover:opacity-40", color)} />
      
      <div className="flex justify-between items-start z-10">
        <div>
          <h3 className="font-bold text-white mb-1">{name}</h3>
          <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">{info}</p>
        </div>
        <Icon size={18} className="text-text-muted" />
      </div>

      <div className="z-10 flex gap-4 items-end">
        <div className="flex flex-col">
          <span className="text-xs text-text-muted font-medium mb-1">Allocation</span>
          <span className="text-xl font-bold text-white">{allocation}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-text-muted font-medium mb-1">APY</span>
          <span className="text-xl font-bold text-gold-liquid">{apy}</span>
        </div>
      </div>
    </div>
  );
}

import { cn } from '../lib/utils';
