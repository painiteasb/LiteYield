import { useState, useEffect } from 'react';
import {
  BarChart3,
  Coins,
  Layers,
  Zap,
  Info,
  Moon,
  Sun,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

import { Navbar } from './components/Navbar';
import { StatCard } from './components/StatCard';
import { VaultActions } from './components/VaultActions';
import { StrategyView } from './components/StrategyView';

import { useBlockchain } from './hooks/useBlockchain';
import { VAULT_ADDRESS } from './contracts/addresses';

export default function App() {

  const {
    account,
    connect,
    disconnect,
    isConnecting,
    vaultData,
    approveLTC,
    deposit,
    withdraw,
    getTestLTC
  } = useBlockchain();

  // ================= THEME =================

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('liteyield-theme');
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem(
      'liteyield-theme',
      JSON.stringify(darkMode)
    );
  }, [darkMode]);

  // ================= SIMULATED UI YIELD =================

  const [simulatedYield, setSimulatedYield] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedYield(prev => prev + 0.00000001);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const totalUserValue =
    Number(vaultData.userBalanceLTC) + simulatedYield;

  const isConfigured =
    VAULT_ADDRESS !==
    "0x0000000000000000000000000000000000000000";

  // ================= COLORS =================

  const bgClass = darkMode
    ? "bg-space-black text-white"
    : "bg-[#f8fafc] text-black";

  const subText = darkMode
    ? "text-gray-400"
    : "text-gray-600";

  return (
    <div className={`min-h-screen pb-20 transition-all duration-300 ${bgClass}`}>

      <Navbar
        account={account}
        connect={connect}
        disconnect={disconnect}
        isConnecting={isConnecting}
        darkMode={darkMode}
      />

      <main className="max-w-7xl mx-auto px-6 pt-32 flex flex-col gap-10">

        {/* THEME BUTTON */}
        <div className="flex justify-end">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-liquid text-black font-bold hover:scale-[1.02] transition-all"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        {/* CONFIG WARNING */}
        {!isConfigured && (
          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-center gap-3">
            <Info size={20} className="text-blue-400" />

            <p className="text-sm font-medium text-blue-400">
              Smart contracts not detected. Please deploy and update addresses.ts
            </p>
          </div>
        )}

        {/* HERO */}
        <section className="flex flex-col gap-4">

          <div className="flex items-center gap-2 text-gold-liquid text-xs font-bold uppercase tracking-widest">
            <Zap size={14} />
            Powered by LitVM
          </div>

          <h1 className="text-4xl md:text-5xl font-bold max-w-3xl leading-tight">
            Institutional Yield Infrastructure for Litecoin
          </h1>

          <p className={`max-w-2xl text-lg ${subText}`}>
            LiteYield transforms idle Litecoin liquidity into programmable
            yield strategies powered by LitVM smart contracts.
          </p>

        </section>

        {/* STATS */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          <StatCard
            label="TVL"
            value={`${Number(vaultData.tvl).toLocaleString()} LTC`}
            subValue="Vault Assets"
            icon={BarChart3}
          />

          <StatCard
            label="Share Price"
            value={`${Number(vaultData.sharePrice).toFixed(6)} LTC`}
            subValue="yLTC Value"
            icon={Coins}
          />

          <StatCard
            label="APY"
            value={`${vaultData.apyB}%`}
            subValue="Target Yield"
            icon={Zap}
          />

          <StatCard
            label="Buffer"
            value="15%"
            subValue="Liquidity Reserve"
            icon={Layers}
          />

        </section>

        {/* MAIN */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* LEFT */}
          <div className="lg:col-span-8 flex flex-col gap-12">

            <StrategyView
              apyA={vaultData.apyA}
              apyB={vaultData.apyB}
              bufferBps="1500"
            />

            {/* POSITION */}
            <div className="flex flex-col gap-6">

              <h2 className="text-lg font-bold">
                Your Position
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="glass-card p-8">

                  <span className={`text-xs ${subText}`}>
                    Current Value
                  </span>

                  <div className="text-3xl font-bold mt-2">
                    {totalUserValue.toFixed(6)} LTC
                  </div>

                  <div className="flex items-center gap-2 mt-4 text-green-500 text-sm">
                    <TrendingUp size={16} />
                    Yield Accruing
                  </div>

                </div>

                <div className="glass-card p-8">

                  <span className={`text-xs ${subText}`}>
                    Vault Shares
                  </span>

                  <div className="text-3xl font-bold mt-2">
                    {Number(vaultData.userShares).toFixed(4)} yLTC
                  </div>

                  <div className="flex items-center gap-2 mt-4 text-gold-liquid text-sm">
                    <ShieldCheck size={16} />
                    Yield Bearing Asset
                  </div>

                </div>

              </div>
            </div>

            {/* STRATEGY EXPLANATION */}
            <div className="glass-card p-8 flex flex-col gap-5">

              <h2 className="text-xl font-bold">
                How LiteYield Works
              </h2>

              <p className={subText}>
                When users deposit mLTC into the vault,
                they receive yLTC shares representing
                ownership of the vault.
              </p>

              <p className={subText}>
                As strategies generate yield,
                the value of each yLTC share increases over time.
                This means users earn more LTC when withdrawing later.
              </p>

              <div className="grid md:grid-cols-3 gap-4 mt-2">

                <div className="p-4 rounded-2xl border border-white/10">
                  <div className="text-gold-liquid font-bold mb-2">
                    Deposit
                  </div>

                  <p className={`text-sm ${subText}`}>
                    Users deposit mLTC into the vault.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-white/10">
                  <div className="text-gold-liquid font-bold mb-2">
                    Earn
                  </div>

                  <p className={`text-sm ${subText}`}>
                    Vault strategies continuously grow assets.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-white/10">
                  <div className="text-gold-liquid font-bold mb-2">
                    Withdraw
                  </div>

                  <p className={`text-sm ${subText}`}>
                    Users redeem yLTC for increased LTC value.
                  </p>
                </div>

              </div>

            </div>

          </div>

          {/* RIGHT */}
          <div className="lg:col-span-4">

            <div className="sticky top-28">

              <VaultActions
                vaultData={vaultData}
                onDeposit={deposit}
                onWithdraw={withdraw}
                onApprove={approveLTC}
                getTestLTC={getTestLTC}
                isWalletConnected={!!account}
              />

            </div>

          </div>

        </section>

        {/* FOOTER */}
        <footer className="mt-20 border-t border-white/10 pt-8">

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">

            <div className={`text-sm ${subText}`}>
              LiteYield Protocol © 2026
            </div>

            <div className="flex gap-6 text-sm">

              <a
                href="https://x.com/painite_asb?s=21"
                target="_blank"
                className="hover:text-gold-liquid transition"
              >
                Builder X
              </a>

              <a
                href="https://x.com/litecoinvm?s=21"
                target="_blank"
                className="hover:text-gold-liquid transition"
              >
                LitVM X
              </a>

            </div>

          </div>

        </footer>

      </main>
    </div>
  );
}