import Failure from "@components/Icons/Failure";
import { T } from "@mantle/ui";
import Link from "next/link";
import CONST from "@mantle/constants";

export default async function Page() {
  return (
    <div className="flex flex-col justify-center items-center space-y-4">
      <Failure />
      <T variant="body18" className="text-center">
        Unfortunately, Mantle LSP is not available in your territory. Please see
        the{" "}
        <Link href={CONST.NAV_LINKS_ABSOLUTE.TERMS_LINK} className="underline">
          Terms of Service
        </Link>{" "}
        for more information.
      </T>
    </div>
  );
}
