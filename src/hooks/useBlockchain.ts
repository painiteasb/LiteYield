import { useState, useEffect, useCallback } from 'react';
import {
  BrowserProvider,
  JsonRpcSigner,
  Contract,
  formatEther,
  parseEther
} from 'ethers';

import VAULT_ABI from '../contracts/LiteVault.json';
import ERC20_ABI from '../contracts/ERC20.json';

import {
  VAULT_ADDRESS,
  UNDERLYING_ADDRESS,
  YLTC_ADDRESS
} from '../contracts/addresses';

export function useBlockchain() {

  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const [vaultData, setVaultData] = useState({
    tvl: '0',
    sharePrice: '1',
    apyA: '5',
    apyB: '10',
    userBalanceLTC: '0',
    userShares: '0',
    ltcAllowance: '0',
    underlyingBalance: '0'
  });

  // ================= CONNECT =================

  const connect = useCallback(async () => {

    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask');
      return;
    }

    try {

      setIsConnecting(true);

      const _provider = new BrowserProvider(window.ethereum);

      await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      const _signer = await _provider.getSigner();

      const _account = await _signer.getAddress();

      const _network = await _provider.getNetwork();

      setProvider(_provider);
      setSigner(_signer);
      setAccount(_account);
      setChainId(_network.chainId.toString());

      // save connection
      localStorage.setItem('liteyield_connected', 'true');

    } catch (error) {

      console.error('Connection error:', error);

    } finally {

      setIsConnecting(false);

    }

  }, []);

  // ================= AUTO RECONNECT =================

  useEffect(() => {

    const reconnect = async () => {

      const wasConnected =
        localStorage.getItem('liteyield_connected');

      if (!wasConnected) return;

      if (typeof window.ethereum === 'undefined') return;

      try {

        const _provider = new BrowserProvider(window.ethereum);

        const accounts = await window.ethereum.request({
          method: 'eth_accounts'
        });

        if (!accounts || accounts.length === 0) return;

        const _signer = await _provider.getSigner();

        const _account = await _signer.getAddress();

        const _network = await _provider.getNetwork();

        setProvider(_provider);
        setSigner(_signer);
        setAccount(_account);
        setChainId(_network.chainId.toString());

      } catch (err) {

        console.error('Reconnect failed:', err);

      }
    };

    reconnect();

  }, []);

  // ================= DISCONNECT =================

  const disconnect = () => {

  setProvider(null);
  setSigner(null);
  setAccount(null);
  setChainId(null);

  // ✅ clear displayed wallet data immediately
  setVaultData({
    tvl: '0',
    sharePrice: '1',
    apyA: '5',
    apyB: '10',
    userBalanceLTC: '0',
    userShares: '0',
    ltcAllowance: '0',
    underlyingBalance: '0'
  });

  localStorage.removeItem('liteyield-connected');
};

  // ================= REFRESH =================

  const refreshData = useCallback(async () => {

    if (
      !provider ||
      !account ||
      VAULT_ADDRESS ===
        "0x0000000000000000000000000000000000000000"
    ) return;

    try {

      const vault = new Contract(
        VAULT_ADDRESS,
        VAULT_ABI,
        provider
      );

      const ltc = new Contract(
        UNDERLYING_ADDRESS,
        ERC20_ABI,
        provider
      );

      const yLtc = new Contract(
        YLTC_ADDRESS,
        ERC20_ABI,
        provider
      );

      const [
        tvl,
        sharePrice,
        apys,
        userPos,
        userShares,
        allowance,
        ltcBal
      ] = await Promise.all([
        vault.totalAssets(),
        vault.sharePrice(),
        vault.getStrategyAPYs(),
        vault.getUserPosition(account),
        yLtc.balanceOf(account),
        ltc.allowance(account, VAULT_ADDRESS),
        ltc.balanceOf(account)
      ]);

      setVaultData({
        tvl: formatEther(tvl),
        sharePrice: formatEther(sharePrice),
        apyA: (Number(apys.apyA) / 100).toString(),
        apyB: (Number(apys.apyB) / 100).toString(),
        userBalanceLTC: formatEther(userPos),
        userShares: formatEther(userShares),
        ltcAllowance: formatEther(allowance),
        underlyingBalance: formatEther(ltcBal)
      });

    } catch (error) {

      console.error('Data refresh error:', error);

    }

  }, [provider, account]);

  useEffect(() => {

    if (account) {

      refreshData();

      const interval = setInterval(
        refreshData,
        10000
      );

      return () => clearInterval(interval);

    }

  }, [account, refreshData]);

  // ================= APPROVE =================

  const approveLTC = async (amount: string) => {

    if (!signer) return;

    try {

      const ltc = new Contract(
        UNDERLYING_ADDRESS,
        ERC20_ABI,
        signer
      );

      const tx = await ltc.approve(
        VAULT_ADDRESS,
        parseEther(amount)
      );

      await tx.wait();

      await refreshData();

    } catch (err) {

      console.error("Approve failed:", err);

    }
  };

  // ================= DEPOSIT =================

  const deposit = async (
    amount: string,
    minShares: string = '0'
  ) => {

    if (!signer) return;

    try {

      const vault = new Contract(
        VAULT_ADDRESS,
        VAULT_ABI,
        signer
      );

      const tx = await vault.deposit(
        parseEther(amount),
        parseEther(minShares)
      );

      await tx.wait();

      await refreshData();

    } catch (err) {

      console.error("Deposit failed:", err);

    }
  };

  // ================= WITHDRAW =================

  const withdraw = async (shares: string) => {

    if (!signer) return;

    try {

      const vault = new Contract(
        VAULT_ADDRESS,
        VAULT_ABI,
        signer
      );

      const tx = await vault.withdraw(
        parseEther(shares)
      );

      await tx.wait();

      await refreshData();

    } catch (err) {

      console.error("Withdraw failed:", err);

    }
  };

  // ================= FAUCET =================

  const getTestLTC = async () => {

    if (!signer) return;

    try {

      const faucetAbi = [
        "function faucet()"
      ];

      const ltc = new Contract(
        UNDERLYING_ADDRESS,
        faucetAbi,
        signer
      );

      const tx = await ltc.faucet();

      await tx.wait();

      await refreshData();

      alert("✅ You received 0.3 mLTC");

    } catch (err: any) {

      console.error("Faucet failed:", err);

      if (err?.reason) {
        alert(err.reason);
      } else {
        alert("Faucet failed (cooldown or network)");
      }
    }
  };

  // ================= RETURN =================

  return {
    account,
    chainId,
    isConnecting,
    connect,
    disconnect,
    vaultData,
    approveLTC,
    deposit,
    withdraw,
    getTestLTC,
    refreshData
  };
}