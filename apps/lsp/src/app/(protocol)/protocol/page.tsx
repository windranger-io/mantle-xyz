"use client";

import { useState } from "react";
import { cn } from "@mantle/ui/src/utils";
import Loading from "@components/Loading";
import OverviewTab from "./components/Overview";
import ContractsTab from "./components/Contracts";
import RecordsTable from "./components/RecordsTable";
import { useOracleRecords } from "./hooks/useOracleRecords";
import { usePendingOracleRecord } from "./hooks/usePendingRecords";

enum Tab {
  Overview = "Protocol overview",
  Records = "Oracle Records",
  Contracts = "Contracts",
}

const tabs = [Tab.Overview, Tab.Records, Tab.Contracts];

function RecordsTab() {
  const records = useOracleRecords();
  const pendingRecord = usePendingOracleRecord();

  return (
    <div className="flex flex-row">
      {records.isLoading && <Loading />}
      {records.data && (
        <RecordsTable
          pendingRecord={pendingRecord.data}
          records={records.data}
        />
      )}
    </div>
  );
}

const contentByTab = ({ tab }: { tab: Tab }) => {
  switch (tab) {
    case Tab.Overview:
      return <OverviewTab />;
    case Tab.Records:
      return <RecordsTab />;
    case Tab.Contracts:
      return <ContractsTab />;
    default:
      return <p>No page</p>;
  }
};

export default function ProtocolDashboard() {
  const [selectedTab, setSelectedTab] = useState(Tab.Overview);

  return (
    <div className="w-full">
      <div className="sm:hidden">
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          defaultValue={selectedTab}
          onChange={(e) => setSelectedTab(e.target.value as Tab)}
        >
          {tabs.map((tab) => (
            <option key={tab}>{tab}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block pb-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedTab(tab)}
                className={cn(
                  tab === selectedTab
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                  "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
                )}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>
      <div className="flex flex-col w-full space-y-2">
        {contentByTab({ tab: selectedTab })}
      </div>
    </div>
  );
}
