"use client";

import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { parseEther, formatEther } from "ethers/lib/utils.js";
import { truncateAddress } from "@mantle/utils";
import { Button, SimpleCard, Typography } from "@mantle/ui";
import { XIcon } from "@mantle/ui/src/base/Icons";

import {
  faucetEligibility,
  faucetRegister,
  faucetRequestMNT,
  EligibilityResult,
} from "@utils/faucetRpc";
import { useTwitterSession } from "@hooks/useTwitterSession";
import {
  SUPPORTED_CHAIN_IDS,
  CHAINS,
  MantleSepoliaChainId,
  type SupportedChainId,
} from "@config/constants";

import { CardHeading } from "./CardHeadings";
import ConnectWallet from "./ConnectWallet";

function MintTokens() {
  const { address: wagmiAddress } = useAccount();
  const {
    isLoading: sessionLoading,
    isAuthenticated,
    login: signIn,
  } = useTwitterSession(wagmiAddress);

  const [selectedChainId, setSelectedChainId] = useState<SupportedChainId>(
    MantleSepoliaChainId as SupportedChainId
  );
  const [amount, setAmount] = useState<string>("1");
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [claiming, setClaiming] = useState(false);
  const [eligibility, setEligibility] = useState<EligibilityResult>();
  const [checking, setChecking] = useState(false);
  const [registering, setRegistering] = useState(false);

  const address = wagmiAddress;

  // 1) Wallet connects → faucet_eligibility (read-only, no registration)
  useEffect(() => {
    if (!wagmiAddress) {
      setEligibility(undefined);
      setError(undefined);
      setSuccess(undefined);
      return;
    }

    setChecking(true);
    setError(undefined);
    setEligibility(undefined);

    faucetEligibility(wagmiAddress)
      .then((result) => setEligibility(result))
      .catch((err: any) =>
        setError(err.message || "Failed to check eligibility")
      )
      .finally(() => setChecking(false));
  }, [wagmiAddress]);

  // 2) After Twitter auth succeeds for unregistered user → faucet_register → refresh
  const eligibilityRegistered = eligibility?.registered;
  const hasEligibility = !!eligibility;
  useEffect(() => {
    if (!address || !hasEligibility) return;
    if (eligibilityRegistered) return;
    if (!isAuthenticated || sessionLoading) return;

    setRegistering(true);
    setError(undefined);

    faucetRegister(address)
      .then(() => faucetEligibility(address))
      .then((result) => setEligibility(result))
      .catch((err: any) => setError(err.message || "Registration failed"))
      .finally(() => setRegistering(false));
  }, [
    address,
    hasEligibility,
    eligibilityRegistered,
    isAuthenticated,
    sessionLoading,
  ]);

  const refreshEligibility = async () => {
    if (!address) return;
    setChecking(true);
    setError(undefined);
    try {
      const result = await faucetEligibility(address);
      setEligibility(result);
    } catch (err: any) {
      setError(err.message || "Failed to check eligibility");
    } finally {
      setChecking(false);
    }
  };

  // Reset claim state when chain changes (eligibility is chain-agnostic, keep it)
  const handleChainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newChainId = Number(e.target.value) as SupportedChainId;
    setSelectedChainId(newChainId);
    setAmount("1");
    setError(undefined);
    setSuccess(undefined);
  };

  // Needs auth: connected + loaded + not registered + not authenticated
  const needsAuth =
    !!address &&
    !!eligibility &&
    !eligibility.registered &&
    !isAuthenticated &&
    !sessionLoading;

  // Derived
  const remainingMNT = eligibility?.remaining
    ? formatEther(eligibility.remaining)
    : "0";
  const dailyLimitMNT = eligibility?.dailyLimit
    ? formatEther(eligibility.dailyLimit)
    : "0";
  const dailyClaimedMNT = eligibility?.dailyClaimed
    ? formatEther(eligibility.dailyClaimed)
    : "0";

  const amountWei = (() => {
    try {
      return parseEther(amount || "0");
    } catch {
      return null;
    }
  })();
  const exceedsRemaining =
    amountWei && eligibility?.remaining && amountWei.gt(eligibility.remaining);
  const invalidAmount = !amountWei || amountWei.lte(0);

  const handleClaim = async () => {
    if (!address || !amountWei || invalidAmount) return;
    setClaiming(true);
    setError(undefined);
    setSuccess(undefined);
    try {
      await faucetRequestMNT(address, amountWei.toString(), selectedChainId);
      setSuccess(
        `Success! Sent ${amount} MNT to ${truncateAddress(
          address as `0x${string}`
        )}`
      );
      setAmount("");
      await refreshEligibility();
    } catch (err: any) {
      setError(err.message || "Failed to claim MNT");
    } finally {
      setClaiming(false);
    }
  };

  // --- Chain selector component ---
  const chainSelector = (
    <div className="grid gap-2">
      <p className="text-sm">Network</p>
      <select
        value={selectedChainId}
        onChange={handleChainChange}
        className="bg-black w-full rounded-input px-3 py-2 text-white border border-stroke-secondary focus:outline-none focus:border-white cursor-pointer"
        disabled={claiming}
      >
        {SUPPORTED_CHAIN_IDS.map((id) => (
          <option key={id} value={id}>
            {CHAINS[id].chainName}
          </option>
        ))}
      </select>
    </div>
  );

  // --- RENDER ---

  // Not connected
  if (!address) {
    return (
      <SimpleCard className="max-w-lg w-full grid gap-4">
        <CardHeading numDisplay="1" header="Connect your wallet" />
        <Typography variant="body" className="text-center mb-4">
          Connect your wallet to claim testnet MNT from the faucet.
        </Typography>
        <div className="wallet-full">
          <ConnectWallet />
        </div>
      </SimpleCard>
    );
  }

  // Loading
  if (checking || registering) {
    return (
      <SimpleCard className="max-w-lg w-full grid gap-4">
        <div className="text-sm text-center py-4">
          {registering ? "Registering..." : "Reading user state..."}
        </div>
      </SimpleCard>
    );
  }

  // API error (no eligibility data)
  if (!eligibility && error) {
    return (
      <SimpleCard className="max-w-lg w-full grid gap-4">
        <div className="bg-slate-900 p-4 rounded-md">
          <div className="text-status-error text-sm">{error}</div>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="full"
          onClick={refreshEligibility}
        >
          Retry
        </Button>
      </SimpleCard>
    );
  }

  // Not registered + not authenticated → Twitter auth
  if (needsAuth) {
    return (
      <SimpleCard className="max-w-lg w-full grid gap-4">
        <CardHeading numDisplay="1" header="Authenticate" />
        <Typography variant="body" className="text-center mb-4">
          Authenticate with your X account to use the faucet.
        </Typography>
        <Button variant="secondary" size="full" type="button" onClick={signIn}>
          <div className="flex justify-center gap-2 items-center">
            <XIcon className="text-[26px]" />
            Authenticate
          </div>
        </Button>
      </SimpleCard>
    );
  }

  // Registered + eligible → mint form
  if (eligibility?.registered) {
    return (
      <SimpleCard className="max-w-lg w-full grid gap-4">
        <CardHeading numDisplay="1" header="Claim testnet MNT" />

        <div className="grid gap-1 text-sm">
          <p>Daily limit: {dailyLimitMNT} MNT</p>
          <p>Claimed today: {dailyClaimedMNT} MNT</p>
          <p>Remaining: {remainingMNT} MNT</p>
        </div>

        {success && (
          <div className="text-center whitespace-pre-wrap text-status-success">
            {success}
          </div>
        )}

        {chainSelector}

        <div className="grid gap-2">
          <p className="text-sm">Amount (MNT)</p>
          <input
            type="number"
            required
            id="amount"
            value={amount}
            min="0"
            step="0.1"
            className="bg-black w-full rounded-input [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0"
            disabled={claiming}
            onChange={(e) => {
              setAmount(e.target.value);
              setError(undefined);
            }}
          />
        </div>

        {!invalidAmount && !exceedsRemaining && eligibility.eligible && (
          <p className="text-sm">You will receive {amount} MNT</p>
        )}

        <Button
          type="button"
          aria-label="Claim"
          variant="primary"
          size="full"
          disabled={
            claiming ||
            invalidAmount ||
            !!exceedsRemaining ||
            !eligibility.eligible
          }
          onClick={handleClaim}
        >
          {claiming ? "Claiming..." : "Claim MNT"}
        </Button>

        {(error || exceedsRemaining || !eligibility.eligible) && (
          <div className="bg-slate-900 p-4 rounded-md">
            <div className="text-status-error text-sm [word-break:break-word]">
              {error ||
                (exceedsRemaining
                  ? `Amount exceeds your remaining daily limit (${remainingMNT} MNT)`
                  : "Daily limit reached. Please try again tomorrow.")}
            </div>
          </div>
        )}
      </SimpleCard>
    );
  }

  return null;
}

export default MintTokens;
