import {
  PageWrapper,
  PageBackroundImage,
  Typography,
  Links,
  MantleLogoIcon,
  MantleLogo,
  LocaleSwitcher,
} from "@mantle/ui";
import Link from "next/link";
import Image from "next/image";
import Marquee from "react-fast-marquee";
import CONST from "@mantle/constants";

import { useLocale } from "next-intl";

import { FaDiscord, FaTelegramPlane, FaTwitter } from "react-icons/fa";

import BACKGROUND from "../../../public/background.png";

/**
 *
 * @todo Updated with real components and content when ready
 */
export default function Page() {
  const locale = useLocale();
  return (
    <PageWrapper
      className="flex-stretch"
      siteBackroundImage={
        <PageBackroundImage
          imgSrc={BACKGROUND}
          altDesc="NFT Background Image"
        />
      }
      header={
        <nav className="mx-auto max-w-7xl w-full grid grid-cols-2 md:gap-10 lg:gap-20  p-4 lg:px-8">
          <Link
            href={CONST.WEBSITE}
            rel="noreferrer noopener"
            target="_blank"
            className="-m-1.5 p-1.5"
          >
            <span className="sr-only">Mantle</span>
            <MantleLogo className="hidden md:flex" />
            <MantleLogoIcon className="md:hidden" width="40px" />
          </Link>
          <Link
            className="text-type-primary hover:text-type-secondary text-sm transition ease-in-out duration-300 cursor-pointer mt-3 text-[16px] hidden md:flex"
            href={CONST.WEBSITE}
            target="_blank"
          >
            Mantle.xyz
          </Link>
          <LocaleSwitcher locales={CONST.LOCALES} locale={locale} />
        </nav>
      }
    >
      <div className="grid grid-col-1 md:grid-cols-2 md:gap-10 lg:gap-20 mx-auto max-w-7xl w-full p-4 lg:px-8">
        <div>
          <video autoPlay loop muted playsInline poster="/animation.png">
            <source src="/animation.webm" type="video/webm" />
            <source src="/animation.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="text-center md:text-left">
          <Typography
            variant="appPageHeading"
            className="mb-4 text-[32px] md:text-[48px]"
          >
            Mantle: Unveiled
          </Typography>
          <div className="space-y-5 mb-10 lg:mb-20 w-full md:w-2/3">
            <Typography variant="body">
              A new place to call our home. An ecosystem inside a planet’s crust
              filled with never ending rainforest, rich minerals and gemstones,
              and adventure around every corner.
            </Typography>
            <Typography variant="body">
              Get everything together. A new journey awaits.
            </Typography>
            <Typography variant="body">
              The gateway to Mantle will open soon.
            </Typography>
            <Typography variant="body">More details to come.</Typography>
          </div>
          <div className="flex flex-col gap-6 mb-10">
            <div className="text-[#65B3AE] text-[26px]">
              Join the Community:
            </div>
            <div className="flex gap-5 justify-center md:justify-start">
              <Links href={CONST.SOCIAL_LINKS.TWITTER_LINK} target="_blank">
                <FaTwitter className="text-type-primary hover:text-type-secondary text-4xl transition ease-in-out duration-300 cursor-pointer" />
              </Links>
              <Links href={CONST.SOCIAL_LINKS.TELEGRAM_LINK} target="_blank">
                <FaTelegramPlane className="text-type-primary hover:text-type-secondary text-4xl transition ease-in-out duration-300 cursor-pointer" />
              </Links>
              <Links href={CONST.SOCIAL_LINKS.DISCORD_LINK} target="_blank">
                <FaDiscord className="text-type-primary hover:text-type-secondary text-4xl transition ease-in-out duration-300 cursor-pointer" />
              </Links>
            </div>
          </div>
        </div>
      </div>
      <Marquee
        speed={20}
        gradient={false}
        // eslint-disable-next-line react/jsx-boolean-value
        autoFill={true}
      >
        <Image src="/mantle.png" alt="My Image" width={956} height={120} />
      </Marquee>
    </PageWrapper>
  );
}
