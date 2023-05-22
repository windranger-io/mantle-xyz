// Page components
import Tabs from "@components/Tabs";

import { AdditionalLinks } from "@components/AdditionalLinks";
import { Typography } from "@mantle/ui";
import { Direction } from "@config/constants";

export default async function Page() {
  return (
    <>
      <Typography variant="appPageHeading" className="text-center">
        Testnet Bridge
      </Typography>
      <Tabs selectedTab={Direction.Deposit} />
      <AdditionalLinks />
    </>
  );
}
