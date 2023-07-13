import { MantleLetterMark, T } from "@mantle/ui";

function LegalDisclaimer() {
  return (
    <div className="pb-8 md:pb-20 px-4 md:px-9 grid">
      <div className="col-start-1 row-start-1">
        <MantleLetterMark />
      </div>
      <div className="col-start-1 row-start-1 text-center flex flex-col justify-between w-full sm:w-2/3 md:w-1/2 m-auto h-full pb-5">
        <T variant="legalDisclaimer">
          Neither the MNT Bonus nor any information provided in connection
          therewith constitutes an offer or sale of securities in or into the
          United States, or to or for the account or benefit of U.S. persons, or
          in other excluded jurisdictions where it is unlawful to do so.{" "}
        </T>
        <T variant="legalDisclaimer">
          By participating in the MNT Bonus, you hereby acknowledge that any MNT
          tokens you receive will be subject to transfer restrictions under
          applicable laws and expressly agree that you, at any time within one
          year from the receipt of MNT tokens, will not reoffer, resell or
          transfer any MNT tokens within the United States or to, or for the
          account or benefit of, any U.S. persons, except pursuant to an
          exemption from, or in a transaction not subject to, the registration
          requirements of the U.S. Securities Act of 1933, as amended.
        </T>
      </div>
    </div>
  );
}

export default LegalDisclaimer;
