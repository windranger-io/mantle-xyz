import { useContext, useEffect, useMemo } from "react";
import Image from "next/image";
import { parseUnits } from "ethers/lib/utils.js";

import {
  CHAINS,
  L1_BITDAO_TOKEN,
  L1_BITDAO_TOKEN_ADDRESS,
  L1_MANTLE_TOKEN,
  L1_CHAIN_ID,
} from "@config/constants";
import { Button, Typography } from "@mantle/ui";
import TxLink from "@components/converter/utils/TxLink";
import { useAddToken } from "@hooks/web3/write/useAddToken";
import { useToast } from "@hooks/useToast";
import StateContext from "@providers/stateContext";
import CheckedCircle from "../../../../public/assets/check_circle.svg";

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
  const { chainId, isLoadingBalances, balances } = useContext(StateContext);

  useEffect(() => {
    if (typeof txHash === "string") {
      createToast({
        type: "success",
        borderLeft: "bg-green-600",
        content: (
          <div className="flex flex-col">
            <Typography variant="body">
              <b>Success Conversion completed</b>
            </Typography>
            <Typography variant="body">{from} BIT converted to MNT</Typography>
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
            <Typography variant="body">
              <b>You still have remaining BIT tokens</b>
            </Typography>
            <Typography variant="body">
              Would you like to convert the rest now?
            </Typography>
          </div>
        ),
        id: `${txHash}-remaining-balance`,
        buttonText: "Convert",
        onButtonClick: () => {
          closeModal();

          return true;
        },
      });
    }
  }, [isLoadingBalances, txHash, BITBalance, hasBitBalanceRemaining]);

  return (
    <>
      <Typography variant="modalHeading" className="text-center w-full mt-4">
        Conversion completed
      </Typography>
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
          <svg
            width="27"
            height="26"
            viewBox="0 0 27 26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M23.2531 2.97583L14.7988 9.18981L16.3622 5.52364L23.2531 2.97583Z"
              fill="#E2761B"
            />
            <path
              d="M3.73591 2.97583L12.1222 9.24867L10.6353 5.52364L3.73591 2.97583ZM20.2111 17.3798L17.9594 20.7937L22.7771 22.1055L24.1621 17.4555L20.2111 17.3798ZM2.84375 17.4555L4.22022 22.1055L9.03787 20.7937L6.78623 17.3798L2.84375 17.4555Z"
              fill="#E4761B"
            />
            <path
              d="M8.76631 11.6115L7.42383 13.6212L12.2075 13.8314L12.0376 8.74416L8.76631 11.6115ZM18.2232 11.6115L14.9094 8.6853L14.799 13.8314L19.5742 13.6212L18.2232 11.6115ZM9.03821 20.7937L11.9101 19.4063L9.42906 17.4891L9.03821 20.7937ZM15.0794 19.4063L17.9598 20.7937L17.5604 17.4891L15.0794 19.4063Z"
              fill="#E4761B"
            />
            <path
              d="M17.9606 20.7937L15.0802 19.4062L15.3097 21.2646L15.2842 22.0466L17.9606 20.7937ZM9.03906 20.7937L11.7155 22.0466L11.6985 21.2646L11.911 19.4062L9.03906 20.7937Z"
              fill="#D7C1B3"
            />
            <path
              d="M11.7574 16.2614L9.36133 15.5635L11.0522 14.7983L11.7574 16.2614ZM15.2326 16.2614L15.9378 14.7983L17.6371 15.5635L15.2326 16.2614Z"
              fill="#233447"
            />
            <path
              d="M9.03874 20.7937L9.44659 17.3798L6.78711 17.4554L9.03874 20.7937ZM17.5525 17.3798L17.9603 20.7937L20.2119 17.4554L17.5525 17.3798ZM19.5747 13.6211L14.7995 13.8313L15.2414 16.2614L15.9466 14.7983L17.6459 15.5635L19.5747 13.6211ZM9.36162 15.5635L11.061 14.7983L11.7577 16.2614L12.208 13.8313L7.42436 13.6211L9.36162 15.5635Z"
              fill="#CD6116"
            />
            <path
              d="M7.42383 13.6211L9.42906 17.4891L9.36108 15.5635L7.42383 13.6211ZM17.6454 15.5635L17.5604 17.4891L19.5742 13.6211L17.6454 15.5635ZM12.2075 13.8313L11.7572 16.2614L12.3179 19.1287L12.4454 15.3533L12.2075 13.8313ZM14.799 13.8313L14.5696 15.3449L14.6715 19.1287L15.2408 16.2614L14.799 13.8313Z"
              fill="#E4751F"
            />
            <path
              d="M15.2411 16.2615L14.6718 19.1289L15.0796 19.4063L17.5607 17.4892L17.6456 15.5636L15.2411 16.2615ZM9.36133 15.5636L9.4293 17.4892L11.9103 19.4063L12.3182 19.1289L11.7574 16.2615L9.36133 15.5636Z"
              fill="#F6851B"
            />
            <path
              d="M15.2842 22.0466L15.3097 21.2646L15.0972 21.0796H11.894L11.6985 21.2646L11.7155 22.0466L9.03906 20.7937L9.9737 21.5505L11.8685 22.8538H15.1227L17.026 21.5505L17.9606 20.7937L15.2842 22.0466Z"
              fill="#C0AD9E"
            />
            <path
              d="M15.079 19.4063L14.6711 19.1288H12.3175L11.9097 19.4063L11.6973 21.2646L11.8927 21.0796H15.096L15.3084 21.2646L15.079 19.4063Z"
              fill="#161616"
            />
            <path
              d="M23.6105 9.59342L24.3327 6.1627L23.2536 2.97583L15.0797 8.97959L18.2235 11.6115L22.6673 12.898L23.6529 11.7628L23.2281 11.4601L23.9078 10.8463L23.381 10.4427L24.0608 9.92977L23.6105 9.59342ZM2.66602 6.1627L3.38824 9.59342L2.92941 9.92977L3.60915 10.4427L3.09085 10.8463L3.77059 11.4601L3.34575 11.7628L4.32288 12.898L8.76667 11.6115L11.9105 8.97959L3.7366 2.97583L2.66602 6.1627Z"
              fill="#763D16"
            />
            <path
              d="M22.6666 12.898L18.2228 11.6115L19.5738 13.6212L17.5601 17.4892L20.2111 17.4555H24.1621L22.6666 12.898ZM8.76597 11.6115L4.32218 12.898L2.84375 17.4555H6.78623L9.42872 17.4892L7.42349 13.6212L8.76597 11.6115ZM14.7987 13.8314L15.079 8.97963L16.3705 5.52368H10.6353L11.9098 8.97963L12.2071 13.8314L12.3091 15.3618L12.3176 19.1288H14.6712L14.6882 15.3618L14.7987 13.8314Z"
              fill="#F6851B"
            />
          </svg>
          Add MNT to Wallet
        </Button>
      </div>
    </>
  );
}
