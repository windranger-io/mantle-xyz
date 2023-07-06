import { MantleLogoIcon } from "@mantle/ui";
import CONST from "@mantle/constants";

function Footer() {
  return (
    <div className="flex justify-center items-center py-8">
      <div>
        <a
          href={CONST.WEBSITE}
          rel="noreferrer noopener"
          target="_blank"
          className="inline-block"
        >
          <div className="flex flex-row align-center gap-4">
            <MantleLogoIcon height={40} width={40} />
            <div className="flex items-center">
              Mantle {new Date().getFullYear()}&nbsp;&#169;
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}

export default Footer;
