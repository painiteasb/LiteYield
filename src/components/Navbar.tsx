import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Wallet,
  ChevronDown,
  LogOut
} from 'lucide-react';

import { shortenAddress } from '../lib/utils';

interface NavbarProps {
  account: string | null;
  connect: () => void;
  disconnect: () => void;
  isConnecting: boolean;
}

export function Navbar({
  account,
  connect,
  disconnect,
  isConnecting
}: NavbarProps) {

  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center bg-space-black/80 backdrop-blur-md border-b border-white/5">

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gold-liquid rounded-lg flex items-center justify-center font-bold text-space-black">
          L
        </div>

        <span className="text-xl font-bold text-white">
          Lite<span className="text-gold-liquid">Yield</span>
        </span>
      </div>

      <div className="relative">

        {account ? (

          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-4 py-2 glass-card border-gold-liquid/20"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />

            <span className="text-sm text-text-muted">
              {shortenAddress(account)}
            </span>

            <ChevronDown size={16} />
          </button>

        ) : (

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={connect}
            disabled={isConnecting}
            className="px-6 py-2 bg-gold-liquid hover:bg-gold-dark text-space-black font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Wallet size={18} />

            {isConnecting
              ? 'Connecting...'
              : 'Connect Wallet'}
          </motion.button>

        )}

        {open && account && (

          <div className="absolute right-0 mt-3 w-48 glass-card border border-white/10 rounded-xl overflow-hidden">

            <button
              onClick={() => {
                disconnect();
                setOpen(false);
              }}
              className="w-full px-4 py-3 flex items-center gap-2 text-sm text-red-400 hover:bg-white/5 transition-all"
            >
              <LogOut size={16} />
              Disconnect
            </button>

          </div>

        )}

      </div>
    </nav>
  );
}