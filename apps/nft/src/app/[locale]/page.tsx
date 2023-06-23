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

import { useLocale, useTranslations } from "next-intl";

import { FaDiscord, FaTelegramPlane, FaTwitter } from "react-icons/fa";

import { MotionBox } from "@src/components/Motion";
import BACKGROUND from "../../../public/assets/background.png";

/**
 *
 *
 */
export default function Page() {
  const locale = useLocale();
  const t = useTranslations("default");

  return (
    <PageWrapper
      className="gap-0 lg:gap-10 min-h-[100vh]"
      siteBackroundImage={
        <PageBackroundImage
          className="hidden lg:flex"
          imgSrc={BACKGROUND}
          altDesc="NFT Background Image"
        />
      }
      header={
        <MotionBox y={20} delay={0.1}>
          <nav className="mx-auto  w-full flex justify-between md:gap-10 lg:gap-20  p-4 lg:px-8 items-center">
            <Link
              href={CONST.WEBSITE}
              rel="noreferrer noopener"
              target="_blank"
              className="-m-1.5 p-1.5"
            >
              <span className="sr-only">Mantle</span>
              <MantleLogo className="hidden sm:flex" />
              <MantleLogoIcon className="sm:hidden" width="40px" />
            </Link>

            <span className="text-[#fff]">
              {" "}
              <LocaleSwitcher locales={CONST.LOCALES} locale={locale} />
            </span>
          </nav>
        </MotionBox>
      }
    >
      <div className="grid grid-col-1 lg:grid-cols-2 gap-20 lg:gap-10 2xl:gap-20  mx-auto max-w-7xl w-full p-4 lg:px-8 flex-grow-2">
        <div className="w-1/2 lg:w-full m-auto">
          <MotionBox y={20} delay={0.2}>
            <video
              autoPlay
              loop
              muted
              playsInline
              poster="/assets/animation.png"
            >
              <source src="/assets/animation.webm" type="video/webm" />
              <source src="/assets/animation.mp4" type="video/mp4" />
            </video>
          </MotionBox>
        </div>
        <div className="text-center lg:text-left">
          <MotionBox y={20} delay={0.3}>
            <Typography
              variant="appPageHeading"
              className="mb-4 text-[32px] md:text-[68px] leading-tight"
            >
              {t("teaser-heading")}
            </Typography>
          </MotionBox>
          <div className=" mb-10 lg:mb-20 w-full sm:w-2/3  lg:w-full mx-auto lg:ml-0">
            <MotionBox y={30} delay={0.4}>
              <Typography
                variant="body"
                className="text-[14px] md:text-[18px] mb-5"
              >
                {t("teaser-body-p-1")}
              </Typography>
              <Typography
                variant="body"
                className="text-[14px] md:text-[18px] mb-5"
              >
                {t("teaser-body-p-2")}
              </Typography>
              <Typography
                variant="body"
                className="text-[14px] md:text-[18px] mb-5"
              >
                {t("teaser-body-p-3")}
              </Typography>
              <Typography
                variant="body"
                className="text-[14px] md:text-[18px] mb-5"
              >
                {t("teaser-body-p-4")}
              </Typography>
            </MotionBox>
          </div>

          <div className="flex flex-col gap-6 mb-10">
            <MotionBox y={20} delay={0.5}>
              <div className="text-[#65B3AE] text-[26px]">
                {t("teaser-cta")}
              </div>
            </MotionBox>

            <div className="flex gap-5 justify-center lg:justify-start">
              <MotionBox y={40} delay={0.6}>
                <Links href={CONST.SOCIAL_LINKS.TWITTER_LINK} target="_blank">
                  <FaTwitter className="text-type-primary hover:text-type-secondary text-4xl transition ease-in-out duration-300 cursor-pointer" />
                </Links>
              </MotionBox>
              <MotionBox y={40} delay={0.7}>
                <Links href={CONST.SOCIAL_LINKS.TELEGRAM_LINK} target="_blank">
                  <FaTelegramPlane className="text-type-primary hover:text-type-secondary text-4xl transition ease-in-out duration-300 cursor-pointer" />
                </Links>
              </MotionBox>
              <MotionBox y={40} delay={0.8}>
                <Links href={CONST.SOCIAL_LINKS.DISCORD_LINK} target="_blank">
                  <FaDiscord className="text-type-primary hover:text-type-secondary text-4xl transition ease-in-out duration-300 cursor-pointer" />
                </Links>
              </MotionBox>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-[-29px] mt-20px">
        <MotionBox delay={0.4}>
          <Marquee
            speed={20}
            gradient={false}
            // eslint-disable-next-line react/jsx-boolean-value
            autoFill={true}
          >
            <Image
              src="/assets/mantle.png"
              alt="Mantle"
              width={956}
              height={120}
            />
          </Marquee>
        </MotionBox>
      </div>
    </PageWrapper>
  );
}
