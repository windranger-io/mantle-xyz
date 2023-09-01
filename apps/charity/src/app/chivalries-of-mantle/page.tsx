import { Typography } from "@mantle/ui";
import Form from "@components/Form";

// Page components
export default async function Page() {
  return (
    <div className="grow max-w-2xl flex flex-col justify-between items-center px-2">
      {/* desktop title */}
      <Typography variant="h1HeaderXXL" className="hidden sm:block text-center">
        Chivalries of Mantle
      </Typography>
      {/* mobile title */}
      <Typography variant="h5Title" className="sm:hidden block text-center">
        Chivalries of Mantle
      </Typography>
      <Form />
      <div>
        <Typography variant="h6TitleMini" className="text-center">
          Mint one of the{" "}
          <span className="text-[#F26A1D]">100 limited-edition</span>{" "}
          &quot;Chivalries of Mantle&quot; on Ethereum and support a social
          impact initiative dedicated to fostering growth among web3 developers.
          All sales proceeds go to charity, and NFT holders have priority access
          to invite-only Mantle Events.
        </Typography>
        <Typography variant="body24" className="text-center mt-8">
          Together, we&apos;re forging pathways to opportunity and innovation.
        </Typography>
      </div>
    </div>
  );
}
