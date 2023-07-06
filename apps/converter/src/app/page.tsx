// Page components
import { isComingSoon } from "@config/constants";
import Converter from "@components/converter/Convert";
import ComingSoon from "@components/comingSoon";

export default async function Page() {
  if (isComingSoon) {
    return <ComingSoon />;
  }
  return <Converter />;
}
