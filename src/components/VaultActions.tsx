import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Info,
  Wallet
} from 'lucide-react';

import { cn } from '../lib/utils';

import {
  UNDERLYING_ADDRESS,
  YLTC_ADDRESS
} from '../contracts/addresses';

interface VaultActionsProps {
  vaultData: any;
  onDeposit: (amount: string) => Promise<void>;
  onWithdraw: (shares: string) => Promise<void>;
  onApprove: (amount: string) => Promise<void>;
  getTestLTC: () => Promise<void>;
  isWalletConnected: boolean;
}

export function VaultActions({
  vaultData,
  onDeposit,
  onWithdraw,
  onApprove,
  getTestLTC,
  isWalletConnected
}: VaultActionsProps) {

  const [activeTab, setActiveTab] =
    useState<'deposit' | 'withdraw'>('deposit');

  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // ================= ACTION =================

  const handleAction = async () => {
    if (!amount || isNaN(Number(amount))) return;

    setLoading(true);

    try {

      if (activeTab === 'deposit') {

        if (Number(vaultData.ltcAllowance) < Number(amount)) {
          await onApprove(amount);
        }

        await onDeposit(amount);

      } else {

        await onWithdraw(amount);

      }

      setAmount('');

    } catch (error) {

      console.error('Action failed:', error);

    } finally {

      setLoading(false);

    }
  };

  // ================= FAUCET =================

  const handleFaucet = async () => {

    setLoading(true);

    try {

      await getTestLTC();

    } finally {

      setLoading(false);

    }
  };

  // ================= ADD TOKENS =================

  const addMLTCToWallet = async () => {

    if (!window.ethereum) return;

    try {

      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: UNDERLYING_ADDRESS,
            symbol: 'mLTC',
            decimals: 18
          }
        }
      });

    } catch (err) {

      console.error(err);

    }
  };

  const addYLTCToWallet = async () => {

    if (!window.ethereum) return;

    try {

      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: YLTC_ADDRESS,
            symbol: 'yLTC',
            decimals: 18
          }
        }
      });

    } catch (err) {

      console.error(err);

    }
  };

  // ================= CHECK APPROVAL =================

  const isApproved =
    activeTab === 'withdraw' ||
    Number(vaultData.ltcAllowance) >= Number(amount);

  // ================= UI =================

  return (

    <div className="glass-card overflow-hidden">

      {/* TABS */}

      <div className="flex border-b border-white/5">

        <button
          onClick={() => setActiveTab('deposit')}
          className={cn(
            "flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all",
            activeTab === 'deposit'
              ? "bg-gold-liquid/10 text-gold-liquid"
              : "text-text-muted hover:text-white"
          )}
        >
          Deposit
        </button>

        <button
          onClick={() => setActiveTab('withdraw')}
          className={cn(
            "flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all",
            activeTab === 'withdraw'
              ? "bg-gold-liquid/10 text-gold-liquid"
              : "text-text-muted hover:text-white"
          )}
        >
          Withdraw
        </button>

      </div>

      {/* CONTENT */}

      <div className="p-8 flex flex-col gap-6">

        {/* FAUCET */}

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleFaucet}
          disabled={!isWalletConnected || loading}
          className={cn(
            "w-full py-3 rounded-xl font-bold uppercase tracking-widest transition-all",
            isWalletConnected && !loading
              ? "bg-white/10 hover:bg-white/20 text-white"
              : "bg-white/5 text-white/20"
          )}
        >
          {loading ? 'Processing...' : 'Get Test LTC'}
        </motion.button>

        {/* ADD TOKENS */}

        <div className="grid grid-cols-2 gap-3">

          <button
            onClick={addMLTCToWallet}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm font-semibold text-white"
          >
            <Wallet size={16} />
            Add mLTC
          </button>

          <button
            onClick={addYLTCToWallet}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm font-semibold text-white"
          >
            <Wallet size={16} />
            Add yLTC
          </button>

        </div>

        {/* INPUT */}

        <div className="flex flex-col gap-2">

          <div className="flex justify-between text-xs font-medium text-text-muted">

            <span>
              Input {activeTab === 'deposit' ? 'LTC' : 'yLTC'}
            </span>

            <span>
              Balance:
              {' '}
              {activeTab === 'deposit'
                ? vaultData.underlyingBalance
                : vaultData.userShares}
            </span>

          </div>

          <div className="relative">

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-space-black/50 border border-white/5 rounded-xl px-4 py-4 text-2xl font-mono text-white focus:outline-none focus:border-gold-liquid/50 transition-all"
            />

            <button
              onClick={() =>
                setAmount(
                  activeTab === 'deposit'
                    ? vaultData.underlyingBalance
                    : vaultData.userShares
                )
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gold-liquid hover:text-gold-dark uppercase"
            >
              Max
            </button>

          </div>

        </div>

        {/* RECEIVE */}

        <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-3">

          <div className="flex justify-between text-sm">

            <span className="text-text-muted">
              You will receive
            </span>

            <span className="text-white font-mono font-bold">

              {amount
                ? activeTab === 'deposit'
                  ? (
                      Number(amount) /
                      Number(vaultData.sharePrice)
                    ).toFixed(6)
                  : (
                      Number(amount) *
                      Number(vaultData.sharePrice)
                    ).toFixed(6)
                : '0.00'}

              {' '}

              {activeTab === 'deposit'
                ? 'yLTC'
                : 'LTC'}

            </span>

          </div>

        </div>

        {/* ACTION BUTTON */}

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleAction}
          disabled={!isWalletConnected || !amount || loading}
          className={cn(
            "w-full py-4 rounded-xl font-bold uppercase tracking-widest text-space-black transition-all flex items-center justify-center gap-2",
            isWalletConnected && amount && !loading
              ? "bg-gold-liquid hover:bg-gold-dark shadow-lg shadow-gold-liquid/20"
              : "bg-white/10 text-white/20"
          )}
        >

          {loading ? (

            <div className="w-5 h-5 border-2 border-space-black/30 border-t-space-black rounded-full animate-spin" />

          ) : (

            <>

              {activeTab === 'deposit'
                ? <ArrowDownCircle size={20} />
                : <ArrowUpCircle size={20} />}

              {!isWalletConnected
                ? 'Connect Wallet'
                : isApproved
                ? activeTab === 'deposit'
                  ? 'Deposit'
                  : 'Withdraw'
                : 'Approve LTC'}

            </>

          )}

        </motion.button>

        {/* INFO */}

        <div className="flex items-start gap-2 text-xs text-text-muted">

          <Info size={14} />

          <p>
            {activeTab === 'deposit'
              ? 'Deposits are allocated to strategies automatically.'
              : 'Withdrawals pull from buffer → Strategy A → Strategy B.'}
          </p>

        </div>

      </div>
    </div>
  );
}