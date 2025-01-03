"use client";

import { useContext, useEffect, useState } from "react";

import { Tab } from "@headlessui/react";
import { SimpleCard, Typography } from "@mantle/ui";
import { clsx } from "clsx";

import Account from "@components/account/Account";
import StateContext from "@providers/stateContext";

import { MdClear } from "react-icons/md";

import {
  L1_CHAIN_ID,
  L2_CHAIN_ID,
  MANTLE_BRIDGE_URL,
  Views,
} from "@config/constants";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Migration from "./Migration";
import MigrationV2 from "./MigrationV2";

export default function Tabs() {
  const { view, setView, setSafeChains } = useContext(StateContext);

  const [categories] = useState({
    Deposit: [],
    Withdraw: [],
    Migrate: [<Migration />],
    MigrateV2: [<MigrationV2 />],
  });

  const router = useRouter();
  const pathName = usePathname();

  // on first load
  useEffect(
    () => {
      // this will disable the incorrect network check (but still display if not L1 or L2 chainId)
      setSafeChains([L1_CHAIN_ID, L2_CHAIN_ID]);
      // align the selected tab
      if (pathName?.indexOf("/account") === 0 && view !== Views.Account) {
        setView(Views.Account);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // pull current selection from the pathName
  const [selectedIndex, setSelectedIndex] = useState<number>(
    pathName?.indexOf("/account/migratev2") === 0 ? 3 : 2
  );

  // split on capital letter
  const SplitCamelCase = (s: string) => {
    return s.replace(/([a-z])([A-Z])/g, "$1 $2");
  };

  return (
    (view === Views.Account && (
      <SimpleCard className="max-w-5xl w-full grid gap-8 relative px-8 mt-6">
        <span className="flex justify-between align-middle">
          <Typography
            variant="transactionTableHeading"
            className="text-left w-full"
          >
            Account
          </Typography>
          <Typography variant="modalHeading" className="text-white w-auto pt-1">
            <Link className="text-white" href="/" shallow>
              <MdClear className="cursor-pointer" />
            </Link>
          </Typography>
        </span>
        <Account />
        <Tab.Group
          selectedIndex={selectedIndex}
          onChange={(val) => {
            setSelectedIndex(val);
            // redirect to bridge app if the user chooses the deposit / withdraw app
            if (val === 0 || val === 1) {
              window.open(
                `${MANTLE_BRIDGE_URL[L1_CHAIN_ID]}/history${
                  val === 0 ? "" : "?tab=withdrawals"
                }`,
                "_self"
              );
              return;
            }
            router.push(`/account/migrate${val === 3 ? "v2" : ""}`);
          }}
        >
          <Tab.List className="flex space-x-2 rounded-[10px] bg-white/[0.05] p-1 select-none md:w-1/2 md:mx-auto">
            {Object.keys(categories).map((category, index) => (
              <span key={`cat-${category || index}`} className="w-full">
                <Tab
                  className={({ selected }) =>
                    clsx(
                      "w-full rounded-lg py-2.5 text-sm font-medium transition-all px-2.5",
                      "ring-white ring-opacity-0 ring-offset-0 ring-offset-white focus:outline-none focus:ring-2",
                      selected
                        ? "text-type-inversed bg-white shadow"
                        : "text-white hover:bg-white/[0.12] hover:text-white"
                    )
                  }
                >
                  {SplitCamelCase(category)}
                </Tab>
              </span>
            ))}
          </Tab.List>
          <Tab.Panels className="mt-2" defaultValue="Migrate">
            {Object.keys(categories).map((category, index) => (
              <span key={`tab-${category || index}`}>
                <Tab.Panel
                  key={`tabPanel-${category || index}`}
                  className={clsx("")}
                  style={{ color: "#fff" }}
                >
                  {categories[category as keyof typeof categories][0]}
                </Tab.Panel>
              </span>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </SimpleCard>
    )) || <span />
  );
}
