import { useContext, useEffect, useMemo } from "react";
import Image from "next/image";
import { parseUnits } from "ethers/lib/utils.js";

import {
  CHAINS,
  L1_BITDAO_TOKEN,
  L1_BITDAO_TOKEN_ADDRESS,
  L1_MANTLE_TOKEN,
  L1_CHAIN_ID,
  CTAPages,
} from "@config/constants";
import { Button, Typography } from "@mantle/ui";
import TxLink from "@components/converter/utils/TxLink";
import { useAddToken } from "@hooks/web3/write/useAddToken";
import { useToast } from "@hooks/useToast";
import StateContext from "@providers/stateContext";
import CheckedCircle from "public/converted/check_circle.svg";
import MetamaskSvg from "public/converted/metamask.svg";
import { MdClear } from "react-icons/md";

export default function Deposited({
  txHash,
  from,
  closeModal,
}: {
  txHash: string | boolean;
  from: string;
  closeModal: () => void;
}) {
  const { addToken } = useAddToken();
  const { createToast } = useToast();
  const { chainId, isLoadingBalances, balances, setCTAPage } =
    useContext(StateContext);

  useEffect(() => {
    if (typeof txHash === "string") {
      createToast({
        type: "success",
        borderLeft: "bg-green-600",
        content: (
          <div className="flex flex-col">
            <Typography variant="body" className="break-words">
              <b>Migration completed</b>
            </Typography>
            <Typography variant="body" className="break-words">
              {from} BIT migrated to MNT
            </Typography>
          </div>
        ),
        id: txHash,
        buttonText: "Etherscan",
        onButtonClick: () => {
          window.open(
            `${CHAINS[chainId].blockExplorerUrls}tx/${txHash}`,
            "_blank"
          );

          return true;
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txHash]);

  // get the balance/allowanace details
  const BITBalance = useMemo(() => {
    return balances?.[L1_BITDAO_TOKEN_ADDRESS] || "0";
  }, [balances]);

  const hasBitBalanceRemaining = parseUnits(
    balances[L1_BITDAO_TOKEN.address] || "-1",
    L1_BITDAO_TOKEN.decimals
  ).gte(parseUnits("0", L1_BITDAO_TOKEN.decimals));

  useEffect(() => {
    if (
      !isLoadingBalances &&
      typeof txHash === "string" &&
      hasBitBalanceRemaining
    ) {
      createToast({
        type: "success",
        borderLeft: "bg-yellow-500",
        content: (
          <div className="flex flex-col">
            <Typography variant="body" className="break-words">
              <b>You still have remaining BIT tokens</b>
            </Typography>
            <Typography variant="body" className="break-words">
              Would you like to migrate the rest now?
            </Typography>
          </div>
        ),
        id: `${txHash}-remaining-balance`,
        buttonText: "Migrate",
        onButtonClick: () => {
          closeModal();

          return true;
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingBalances, txHash, BITBalance, hasBitBalanceRemaining]);

  const openWhatsNext = () => {
    setCTAPage(CTAPages.WhatsNext);
  };

  return (
    <>
      <span className="flex justify-between align-middle">
        <Typography variant="modalHeading" className="text-center w-full mt-4">
          Migration completed
        </Typography>
        <Typography variant="modalHeading" className="text-white w-auto pt-1">
          <MdClear onClick={openWhatsNext} className="cursor-pointer" />
        </Typography>
      </span>

      <span className="w-full flex justify-center">
        <Image src={CheckedCircle} alt="Checked" height={80} width={80} />
      </span>
      <Typography variant="modalHeadingSm" className="text-center w-full mt-4">
        You can now use your Mantle tokens
      </Typography>
      <div className="flex flex-col gap-4">
        <TxLink chainId={L1_CHAIN_ID} txHash={txHash} />
      </div>
      <div>
        <Button
          type="button"
          size="full"
          className="h-14 flex flex-row gap-4 text-center items-center justify-center my-4"
          variant="secondary"
          onClick={() => addToken(L1_MANTLE_TOKEN)}
        >
          <Image src={MetamaskSvg} alt="metamask" height={26} width={26} />
          Add MNT to Wallet
        </Button>
      </div>
    </>
  );
}
