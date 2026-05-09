import {
  SlimFooter,
  PageWrapper,
  PageBackroundImage,
  PageContainer,
  Typography,
} from "@mantle/ui";
import ClaimMNT from "@components/ClaimMNT";
import { AdditionalLinks } from "@components/AdditionalLinks";
import CONST from "@mantle/constants";
import Nav from "@components/Nav";
import faucetBG from "../../public/faucet-bg.png";

export default async function Page() {
  return (
    <PageWrapper
      siteBackroundImage={
        <PageBackroundImage
          imgSrc={faucetBG}
          altDesc="Faucet Background Image"
        />
      }
      header={<Nav />}
      className="min-h-screen justify-between"
    >
      <PageContainer className="gap-8">
        <Typography variant="appPageHeading" className="text-center">
          Testnet Faucet
        </Typography>

        <ClaimMNT />
        <AdditionalLinks />
      </PageContainer>
      <SlimFooter url={CONST.WEBSITE} />
    </PageWrapper>
  );
}
