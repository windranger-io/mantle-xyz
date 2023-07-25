// Page components
import { isComingSoon } from "@config/constants";
// import Converter from "@components/converter/Convert";
import ComingSoon from "@components/comingSoon";
import { Typography } from "@mantle/ui";

export default async function Page() {
  if (isComingSoon) {
    return <ComingSoon />;
  }
  // TODO: recover this
  // return <Converter />;
  return (
    <div className="flex flex-col gap-8 justify-center items-center	">
      <Typography variant="h1HeaderXXL">Header (XXL) 100</Typography>
      <Typography variant="h2HeaderXL">Header (XL) 80</Typography>
      <Typography variant="h3Subheader">Subheader 68</Typography>
      <Typography variant="h4PageInfo">Page Info 60</Typography>
      <Typography variant="h5Title">Title 42</Typography>
      <Typography variant="h6TitleSmaller">Title Smaller 32</Typography>
      <Typography variant="h6TitleMini">Title Mini 28</Typography>
      <Typography variant="body24">Body 24</Typography>
      <Typography variant="body22">Body 22</Typography>
      <Typography variant="body20">Body 20</Typography>
      <Typography variant="body20Medium">Body 20 Medium</Typography>
      <Typography variant="body18">Body 18</Typography>
      <Typography variant="smallTitle18">Small Title 18</Typography>
      <Typography variant="buttonLarge">Button 16</Typography>
      <Typography variant="smallWidget16">Small Widget Copy 16</Typography>
      <Typography variant="microBody14">Micro Body 14</Typography>
      <Typography variant="buttonMedium">Button Medium 14</Typography>
      <Typography variant="footerLink">Social 14</Typography>
      <Typography variant="textBtn12">Text-button 12</Typography>
    </div>
  );
}
