// Page components
import Tabs from "@components/bridge/Tabs";

import { AdditionalLinks } from "@components/bridge/utils/AdditionalLinks";
import { Typography } from "@mantle/ui";
import { Direction, L1_CHAIN_ID } from "@config/constants";
import KindReminder from "@components/bridge/utils/KindReminder";

export default async function Page() {
  return (
    <>
      <Typography variant="appPageHeading" className="text-center">
        {L1_CHAIN_ID === 1 ? "Mainnet" : "Testnet"} Bridge
      </Typography>
      <Tabs selectedTab={Direction.Withdraw} />
      <KindReminder direction={Direction.Withdraw} />
      {L1_CHAIN_ID !== 1 && <AdditionalLinks />}
    </>
  );
}
