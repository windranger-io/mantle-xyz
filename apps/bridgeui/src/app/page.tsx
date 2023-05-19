// Page components
import Tabs from "@components/Tabs";
import TxTabs from "@components/transactions/Tabs";

import { AdditionalLinks } from "@components/AdditionalLinks";
import { Typography } from "@mantle/ui";

export default async function Page() {
  return (
    <>
      <Typography variant="appPageHeading" className="text-center">
        Testnet Bridge
      </Typography>
      <Tabs />
      <TxTabs />
      <AdditionalLinks />
    </>
  );
}
