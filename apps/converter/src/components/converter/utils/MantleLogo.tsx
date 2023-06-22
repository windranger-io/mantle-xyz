import Image from "next/image";

import MantleSVG from "../../../../public/mantle.svg";

export function MantleLogo() {
  return (
    <Image priority src={MantleSVG} alt="Mantle logo" height={40} width={40} />
  );
}
