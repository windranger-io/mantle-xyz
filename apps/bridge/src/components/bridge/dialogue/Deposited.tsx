import { useContext, useEffect } from "react";
import { MdClear } from "react-icons/md";

import { Typography } from "@mantle/ui";
import { useNetwork, useQuery } from "wagmi";

import StateContext from "@providers/stateContext";
import { CTAPages, L1_CHAIN_ID, L2_CHAIN_ID } from "@config/constants";
import TxLink from "@components/bridge/utils/TxLink";
import AddNetworkBtn from "@components/bridge/dialogue/AddNetworkBtn";
import { gql, useApolloClient } from "@apollo/client";
import { useToast } from "@hooks/useToast";
import { useSwitchToNetwork } from "@hooks/web3/write/useSwitchToNetwork";

export default function Deposited({
  tx1Hash,
  tx2Hash,
}: {
  tx1Hash: string | boolean;
  tx2Hash: string | boolean;
}) {
  const { ctaChainId, setCTAPage, client, tx1 } = useContext(StateContext);
  const { createToast } = useToast();
  const { addNetwork } = useSwitchToNetwork();
  const { chain: givenChain } = useNetwork();

  // get the apolloClient
  const gqclient = useApolloClient();

  // Construct query to pull successful l1ToL2Messages gasDrop invocations for the given l1Tx
  const GasDropsFor = gql`
    query GasDropsFor($l1Tx: String!) {
      l1ToL2Messages(where: { l1Tx: $l1Tx }) {
        gasDropped
      }
    }
  `;

  // Query to check if the gasDrop has been sent from the bridge supagraph to the controller
  const { data: gasDrops } = useQuery(
    [
      "GAS_DROPS_CHECK",
      {
        tx1,
        address: client?.address,
      },
    ],
    async () => {
      // fetch the appendStateBatch event from supagraph that matches this transactionIndex
      const { data } = await gqclient.query({
        query: GasDropsFor,
        variables: {
          l1Tx: `${tx1}`,
        },
        // disable apollo cache to force new fetch call every invoke
        fetchPolicy: "no-cache",
        // use next cache to store the responses for 30s
        context: {
          fetchOptions: {
            next: { revalidate: 30 },
          },
        },
      });

      return data?.l1ToL2Messages || [];
    }
  );

  // display gas-drop success toast if the user qualified (this should only be shown once, subsequents will have more drops)
  useEffect(() => {
    // qualifying users should only have one gas-drop entry
    if (client.address && gasDrops[0].gasDropped === true) {
      // pull the claim from the controller (this confirms the gas-drop was reconginsed by the controller and successfully enqueued)
      fetch(`/controller?address=${client.address}`, {
        next: {
          revalidate: 30,
        },
      }).then(async (res) => {
        const resJson = await res.json();
        // only show the toast when the data is present this means the users claim has been successfully enqueued on the controller
        if (!resJson?.error && resJson?.data) {
          createToast({
            type: "success",
            borderLeft: "bg-green-600",
            content: (
              <div className="flex flex-col">
                <Typography variant="body" className="break-words">
                  <b>MNT bonus sent!</b>
                </Typography>
                <Typography variant="body" className="break-words">
                  Your MNT bonus is sent to your wallet
                </Typography>
              </div>
            ),
            id: `gas-drop-success-${client?.address}`,
            buttonText: "Add Mantle Network",
            onButtonClick: () => {
              if (givenChain?.id !== L2_CHAIN_ID) {
                addNetwork(L2_CHAIN_ID);
              }
              return true;
            },
          });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client.address, gasDrops]);

  const openWhatsNext = () => {
    setCTAPage(CTAPages.Deposited);
  };

  return (
    <>
      <span className="flex justify-between align-middle">
        <Typography variant="modalHeading" className="text-center w-full">
          Deposit complete
        </Typography>
        <Typography variant="modalHeading" className="text-white w-auto pt-1">
          <MdClear onClick={openWhatsNext} className="cursor-pointer" />
        </Typography>
      </span>
      <div className="flex items-center justify-center">
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <mask
            id="mask0_2300_7133"
            style={{ maskType: "alpha" }}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="80"
            height="80"
          >
            <rect width="80" height="80" fill="#D9D9D9" />
          </mask>
          <g mask="url(#mask0_2300_7133)">
            <path
              d="M35.1257 47.6249L26.9959 39.4535C26.4991 38.9844 25.9034 38.7499 25.209 38.7499C24.5145 38.7499 23.9034 39.0138 23.3757 39.5416C22.8757 40.0416 22.6257 40.6388 22.6257 41.3333C22.6257 42.0277 22.8708 42.6061 23.361 43.0686L33.459 53.2499C33.9211 53.7499 34.4754 53.9999 35.1219 53.9999C35.7683 53.9999 36.339 53.7499 36.834 53.2499L56.584 33.4999C57.1118 32.9721 57.3757 32.361 57.3757 31.6666C57.3757 30.9721 57.1118 30.3471 56.584 29.7916C56.0284 29.3194 55.3895 29.0971 54.6673 29.1249C53.9451 29.1527 53.3515 29.399 52.8867 29.8639L35.1257 47.6249ZM40.006 72.9166C35.5076 72.9166 31.254 72.0482 27.2452 70.3113C23.2364 68.5745 19.742 66.2134 16.7622 63.228C13.7823 60.2426 11.4243 56.7493 9.68815 52.748C7.95204 48.7467 7.08398 44.4991 7.08398 40.0053C7.08398 35.4513 7.9524 31.1699 9.68923 27.1612C11.4261 23.1523 13.7872 19.6649 16.7726 16.6989C19.758 13.7329 23.2513 11.3888 27.2526 9.66659C31.2538 7.94436 35.5014 7.08325 39.9953 7.08325C44.5493 7.08325 48.8308 7.94803 52.8399 9.67759C56.8491 11.4071 60.3365 13.7543 63.3022 16.7193C66.2678 19.6841 68.6118 23.1672 70.334 27.1685C72.0562 31.1698 72.9173 35.4451 72.9173 39.9946C72.9173 44.4929 72.0559 48.7465 70.3329 52.7553C68.61 56.7642 66.2627 60.2585 63.2912 63.2384C60.3197 66.2183 56.8333 68.5763 52.8321 70.3124C48.8308 72.0485 44.5554 72.9166 40.006 72.9166ZM39.9979 68.1249C47.8053 68.1249 54.4451 65.3758 59.9173 59.8777C65.3895 54.3795 68.1257 47.7545 68.1257 40.0027C68.1257 32.1953 65.3905 25.5555 59.9201 20.0833C54.4497 14.611 47.8108 11.8749 40.0034 11.8749C32.2516 11.8749 25.6257 14.6101 20.1257 20.0805C14.6257 25.5509 11.8757 32.1898 11.8757 39.9972C11.8757 47.749 14.6247 54.3749 20.1229 59.8749C25.6211 65.3749 32.2461 68.1249 39.9979 68.1249Z"
              fill="#3EB66A"
            />
          </g>
        </svg>
      </div>
      <div className="text-center text-lg">
        <div className="mb-4">
          Your funds are now available in the scalable world of Mantle
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <TxLink
          chainId={ctaChainId === L1_CHAIN_ID ? L1_CHAIN_ID : L2_CHAIN_ID}
          txHash={ctaChainId === L1_CHAIN_ID ? tx1Hash : tx2Hash}
        />
        <TxLink
          chainId={ctaChainId === L1_CHAIN_ID ? L2_CHAIN_ID : L1_CHAIN_ID}
          txHash={ctaChainId === L1_CHAIN_ID ? tx2Hash : tx1Hash}
        />
      </div>
      <div>
        <AddNetworkBtn />
      </div>
    </>
  );
}
