// Page components
import Converter from "@components/converter/Convert";

import { Typography } from "@mantle/ui";

export default async function Page() {
  return (
    <>
      <Typography variant="appPageHeading" className="text-center">
        Converter
      </Typography>
      <Converter />
    </>
  );
}
