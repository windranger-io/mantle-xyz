"use client";

import { clsx } from "clsx";

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@hooks/useToast";

import StateContext from "@providers/stateContext";

import { Tab } from "@headlessui/react";
import { Button, SimpleCard } from "@mantle/ui";

import { Direction, L1_CHAIN_ID, L2_CHAIN_ID, Views } from "@config/constants";

import Deposit from "@components/bridge/Deposit";
import WithdrawV2 from "@components/bridge/WithdrawV2";
import Dialogue from "@components/bridge/dialogue";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Faq } from "@components/Faq";
import { MultisigWarning } from "@components/MultisigWarning";
import { useIsWalletMultisig } from "@hooks/useIsWalletMultisig";

export default function Tabs({ selectedTab }: { selectedTab: Direction }) {
  const { updateToast } = useToast();
  // unpack the context
  const {
    client,
    view,
    chainId,
    selectedToken,
    destinationToken,
    isCTAPageOpen,
    hasClaims,
    hasClosedClaims,
    tokenList,
    setChainId,
    setSafeChains,
    setIsCTAPageOpen,
    setHasClosedClaims,
    setSelectedTokenAmount,
  } = useContext(StateContext);

  const router = useRouter();
  const pathName = usePathname();

  const [tab, setTab] = useState(
    pathName?.indexOf("/withdraw") !== -1
      ? Direction.Withdraw
      : Direction.Deposit
  );

  const isWalletMultisig = useIsWalletMultisig(client.chainId, client.address);

  // on first load
  useEffect(
    () => {
      // this will deisable the incorrect network check (but still display if not L1 or L2 chainId)
      setSafeChains([chainId]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pathName]
  );

  useEffect(
    () => {
      if (selectedTab === Direction.Withdraw) {
        setChainId(L2_CHAIN_ID);
        setTab(Direction.Withdraw);
      } else {
        setChainId(L1_CHAIN_ID);
        setTab(Direction.Deposit);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedTab]
  );

  // memoise the selected Token instance
  const selected = useMemo(
    () =>
      tokenList?.tokens.find(
        (v) =>
          selectedToken[
            chainId === L1_CHAIN_ID ? Direction.Deposit : Direction.Withdraw
          ] === v.name && v.chainId === chainId
      ) ||
      tokenList?.tokens[chainId === L1_CHAIN_ID ? 0 : 1] ||
      {},
    [chainId, selectedToken, tokenList]
  );

  // fetch the full destination token from name
  const destination = useMemo(
    () =>
      tokenList?.tokens.find(
        (v) =>
          destinationToken[
            chainId === L1_CHAIN_ID ? Direction.Deposit : Direction.Withdraw
          ] === v.name &&
          v.chainId === (chainId === L1_CHAIN_ID ? L2_CHAIN_ID : L1_CHAIN_ID)
      ) ||
      tokenList?.tokens[chainId === L1_CHAIN_ID ? 1 : 0] ||
      {},

    [chainId, destinationToken, tokenList]
  );

  const categories = useRef({
    Deposit: [
      <Deposit
        setIsOpen={setIsCTAPageOpen}
        selected={selected}
        destination={destination}
      />,
    ],
    Withdraw: [
      <WithdrawV2
        setIsOpen={setIsCTAPageOpen}
        selected={selected}
        destination={destination}
      />,
    ],
  });

  useEffect(() => {
    categories.current = {
      Deposit: [
        <Deposit
          setIsOpen={setIsCTAPageOpen}
          selected={selected}
          destination={destination}
        />,
      ],
      Withdraw: [
        <WithdrawV2
          setIsOpen={setIsCTAPageOpen}
          selected={selected}
          destination={destination}
        />,
      ],
    };
  }, [chainId, selected, destination, setIsCTAPageOpen]);

  useEffect(() => {
    if (hasClaims && !hasClosedClaims) {
      updateToast({
        borderLeft: "bg-green-600",
        content: (
          <div className="flex flex-row items-center gap-2">
            <span>Withdrawal ready to claim</span>
            <svg
              width="96"
              height="38"
              viewBox="0 0 96 38"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.9393 16.4154L9.30008 14.5625C9.01542 15.1218 8.77299 15.7081 8.58008 16.3054L12.466 17.5619C12.5929 17.1691 12.7521 16.7836 12.9396 16.4157L12.9393 16.4154Z"
                fill="white"
              />
              <path
                d="M16.0307 13.1502L18.0464 16.6232C18.3408 16.4524 18.6558 16.3212 18.9836 16.2331L17.9404 12.3551C18.2059 12.2837 18.4756 12.2248 18.7469 12.182L18.1059 8.14844C17.4859 8.24687 16.8698 8.39542 16.2743 8.58955L17.5208 12.4098C17.1244 12.5392 16.7382 12.6999 16.3664 12.8901L14.5342 9.3138C13.977 9.59937 13.4381 9.93112 12.9316 10.3008L15.3392 13.5995C15.561 13.4379 15.7928 13.2881 16.0304 13.1499L16.0307 13.1502Z"
                fill="white"
              />
              <path
                d="M26.8478 16.0273L23.376 18.0448C23.547 18.3389 23.6783 18.6542 23.7667 18.9814L27.6443 17.9364C27.7157 18.2019 27.7747 18.4714 27.8178 18.7423L31.8507 18.1001C31.752 17.4804 31.6031 16.864 31.4084 16.2682L27.5887 17.5171C27.459 17.1207 27.2983 16.7349 27.1078 16.363L30.6829 14.5284C30.3973 13.9718 30.065 13.4329 29.6953 12.9268L26.3975 15.3359C26.5595 15.5576 26.7092 15.7891 26.8475 16.027L26.8478 16.0273Z"
                fill="white"
              />
              <path
                d="M25.4318 9.29721C24.8719 9.01286 24.2856 8.77073 23.689 8.57812L22.4346 12.4646C22.8271 12.5913 23.2129 12.7505 23.5814 12.9376L25.4318 9.29691V9.29721Z"
                fill="white"
              />
              <path
                d="M23.9812 13.0788L21.9424 16.6171C22.2377 16.7872 22.5099 16.9956 22.752 17.2369L28.4701 11.4993C28.0265 11.0573 27.5447 10.6469 27.038 10.2793L24.6796 13.5317C24.4548 13.3689 24.2221 13.2173 23.9815 13.0785L23.9812 13.0788Z"
                fill="white"
              />
              <path
                d="M13.0809 16.0146L16.6183 18.0555C16.7884 17.7605 16.9974 17.488 17.239 17.2456L11.5039 11.5254C11.0615 11.9689 10.6508 12.4505 10.2832 12.9569L13.5344 15.3168C13.3716 15.5413 13.2197 15.774 13.0809 16.0146Z"
                fill="white"
              />
              <path
                d="M21.2376 12.1131L21.8546 8.14278C21.2449 8.048 20.6209 8 19.9997 8H19.9902V16.1005H19.9997C20.3411 16.1005 20.6789 16.1442 21.004 16.2305L22.0515 12.2832C21.7836 12.2121 21.512 12.1559 21.2376 12.1131Z"
                fill="white"
              />
              <path
                d="M16.2308 18.9936L12.2842 17.9434C12.2128 18.2113 12.1563 18.4829 12.1134 18.7572L8.1437 18.1384C8.0483 18.7502 8 19.3767 8 19.9998H16.1005C16.1005 19.6577 16.1445 19.319 16.2311 18.9936H16.2308Z"
                fill="white"
              />
              <path
                d="M27.0608 23.584L30.7 25.4369C30.9847 24.8776 31.2271 24.2913 31.42 23.694L27.5342 22.4375C27.4072 22.8303 27.248 23.2158 27.0605 23.5837L27.0608 23.584Z"
                fill="white"
              />
              <path
                d="M23.9695 26.849L21.9538 23.376C21.6594 23.5467 21.3444 23.6779 21.0166 23.7661L22.0598 27.644C21.794 27.7154 21.5246 27.7744 21.2533 27.8172L21.894 31.8504C22.514 31.752 23.1301 31.6034 23.7256 31.4093L22.4791 27.589C22.8758 27.4596 23.2617 27.2989 23.6335 27.1087L25.4657 30.685C26.0229 30.3995 26.5618 30.0677 27.0682 29.698L24.6607 26.3994C24.4389 26.561 24.2071 26.7108 23.9695 26.849Z"
                fill="white"
              />
              <path
                d="M13.1524 23.9727L16.6245 21.9552C16.4534 21.6611 16.3222 21.3457 16.2338 21.0186L12.3561 22.0636C12.2847 21.7981 12.2258 21.5286 12.1826 21.2576L8.14941 21.8999C8.24815 22.5196 8.39701 23.136 8.59174 23.7318L12.4114 22.4829C12.5411 22.8793 12.7018 23.2651 12.8923 23.637L9.31721 25.4716C9.60278 26.0282 9.93514 26.5671 10.3049 27.0732L13.6026 24.6641C13.4407 24.4423 13.2909 24.2109 13.1527 23.973L13.1524 23.9727Z"
                fill="white"
              />
              <path
                d="M14.5684 30.7029C15.1283 30.9873 15.7146 31.2294 16.3112 31.422L17.5656 27.5355C17.1731 27.4088 16.7873 27.2496 16.4188 27.0625L14.5684 30.7032V30.7029Z"
                fill="white"
              />
              <path
                d="M16.0182 26.9208L18.057 23.3824C17.7617 23.2123 17.4895 23.0039 17.2474 22.7627L11.5293 28.5002C11.9728 28.9422 12.4547 29.3527 12.9614 29.7203L15.3198 26.4678C15.5446 26.6306 15.7773 26.7822 16.0179 26.9211L16.0182 26.9208Z"
                fill="white"
              />
              <path
                d="M26.9188 23.9852L23.3814 21.9443C23.2113 22.2393 23.0023 22.5118 22.7607 22.7543L28.4955 28.4748C28.9379 28.0312 29.3486 27.5497 29.7162 27.0433L26.4649 24.6834C26.6278 24.4589 26.7797 24.2262 26.9185 23.9855L26.9188 23.9852Z"
                fill="white"
              />
              <path
                d="M18.9957 23.7695L17.9482 27.7168C18.2162 27.7879 18.4878 27.8441 18.7621 27.8869L18.1454 31.8572C18.7551 31.952 19.3791 32 20.0004 32H20.0098V23.8996H20.0004C19.6589 23.8996 19.3211 23.8558 18.996 23.7695H18.9957Z"
                fill="white"
              />
              <path
                d="M23.8992 20C23.8992 20.3421 23.8551 20.6805 23.7686 21.0062L27.7152 22.0564C27.7866 21.7885 27.8431 21.5169 27.8859 21.2425L31.856 21.8617C31.9513 21.2498 31.9996 20.6234 31.9996 20.0003H23.8992V20Z"
                fill="white"
              />
              <mask
                id="mask0_194_695"
                style={{ maskType: "alpha" }}
                maskUnits="userSpaceOnUse"
                x="42"
                y="14"
                width="12"
                height="12"
              >
                <rect
                  x="54"
                  y="14"
                  width="12"
                  height="12"
                  transform="rotate(90 54 14)"
                  fill="#D9D9D9"
                />
              </mask>
              <g mask="url(#mask0_194_695)">
                <path
                  d="M44.6745 19.7L50.1747 19.7L47.5749 17.1002L47.9997 16.6748L51.3369 20L47.9997 23.3372L47.5749 22.8998L50.1747 20.3L44.6745 20.3L44.6745 19.7Z"
                  fill="white"
                />
              </g>
              <rect x="64" y="8" width="24" height="24" rx="12" fill="white" />
              <g clipPath="url(#clip0_194_695)">
                <path
                  d="M75.9991 11L75.8818 11.3873V22.6256L75.9991 22.7393L81.3659 19.6557L75.9991 11Z"
                  fill="#343434"
                />
                <path
                  d="M75.9987 11L70.6318 19.6557L75.9987 22.7393V17.2846V11Z"
                  fill="#8C8C8C"
                />
                <path
                  d="M75.9987 23.7275L75.9326 23.8058V27.8091L75.9987 27.9966L81.3687 20.6455L75.9987 23.7275Z"
                  fill="#3C3C3B"
                />
                <path
                  d="M75.9987 27.9957V23.7265L70.6318 20.6445L75.9987 27.9957Z"
                  fill="#8C8C8C"
                />
                <path
                  d="M75.999 22.7398L81.3658 19.6563L75.999 17.2852V22.7398Z"
                  fill="#141414"
                />
                <path
                  d="M70.6318 19.6553L75.9986 22.7389V17.2842L70.6318 19.6553Z"
                  fill="#393939"
                />
              </g>
              <defs>
                <clipPath id="clip0_194_695">
                  <rect
                    width="10.7368"
                    height="17"
                    fill="white"
                    transform="translate(70.6318 11)"
                  />
                </clipPath>
              </defs>
            </svg>
          </div>
        ),
        type: "success",
        id: `claims-available`,
        // eslint-disable-next-line react/no-unstable-nested-components
        buttonText: function ButtonText() {
          return (
            <Link
              href="/account/withdraw"
              onClick={(e) => {
                setHasClosedClaims(true);
                e.stopPropagation();
              }}
              scroll
              shallow
            >
              <Button variant="primary">Go to account</Button>
            </Link>
          );
        },
      });
    }
  }, [hasClaims, hasClosedClaims, updateToast, setHasClosedClaims]);

  const displayFAQ = L1_CHAIN_ID === 1;

  return (
    (view === Views.Default &&
      ((isCTAPageOpen && (
        <Dialogue
          direction={
            chainId === L1_CHAIN_ID ? Direction.Deposit : Direction.Withdraw
          }
          selected={selected}
          destination={destination}
          isOpen={isCTAPageOpen}
          setIsOpen={setIsCTAPageOpen}
        />
      )) || (
        //  md:flex-row
        <div className="relative w-full lg:min-w-[484px] lg:w-[484px] flex flex-col lg:block lg:mx-auto ">
          <SimpleCard className="max-w-lg w-full grid gap-4 relative">
            <Tab.Group
              selectedIndex={tab === Direction.Deposit ? 0 : 1}
              onChange={(t) => {
                if (t === 0) {
                  // setChainId(L1_CHAIN_ID);
                  // setSafeChains([L1_CHAIN_ID]);
                  // setTab(Direction.Deposit);
                  setSelectedTokenAmount("");
                  router.push("/deposit");
                } else {
                  // setChainId(L2_CHAIN_ID);
                  // setSafeChains([L2_CHAIN_ID]);
                  // setTab(Direction.Withdraw);
                  setSelectedTokenAmount("");
                  router.push("/withdraw");
                }
              }}
            >
              <Tab.List className="flex space-x-2 rounded-[10px] bg-white/[0.05] p-1 select-none ">
                {Object.keys(categories.current).map((category, index) => (
                  <span key={`cat-${category || index}`} className="w-full">
                    <Tab
                      className={({ selected: isSelected }) =>
                        clsx(
                          "w-full rounded-lg py-2.5 text-sm font-medium transition-all px-2.5",
                          "ring-white ring-opacity-0 ring-offset-0 ring-offset-white focus:outline-none focus:ring-2",
                          isSelected
                            ? "text-type-inversed bg-white shadow"
                            : "text-white hover:bg-white/[0.12] hover:text-white"
                        )
                      }
                    >
                      {category}
                    </Tab>
                  </span>
                ))}
              </Tab.List>
              <Tab.Panels className="mt-2" defaultValue="Withdraw">
                {Object.keys(categories.current).map((category, index) => (
                  <span key={`tab-${category || index}`}>
                    <Tab.Panel
                      key={`tabPanel-${category || index}`}
                      className={clsx("")}
                      style={{ color: "#fff" }}
                    >
                      {
                        categories.current[
                          category as keyof typeof categories.current
                        ][0]
                      }
                    </Tab.Panel>
                  </span>
                ))}
              </Tab.Panels>
            </Tab.Group>
          </SimpleCard>
          {(isWalletMultisig || displayFAQ) && (
            // <div className="flex flex-col w-full md:w-[80%] lg:w-auto lg:min-w-[250px] lg:max-w-[250px] xl:w-[320px] xl:max-w-[320px] lg:absolute lg:top-0 lg:right-[-55%] xl:right-[-80%]">
            <div className="flex flex-col w-full lg:w-auto mt-16">
              {isWalletMultisig && <MultisigWarning />}
              {displayFAQ && <Faq />}
            </div>
          )}
        </div>
      ))) || <span />
  );
}
