import { T } from "@mantle/ui";

const Page = async () => {
  return (
    <div className="flex items-center flex-col justify-center mt-10">
      <T variant="h5Title">Mantle V2 Upgrade</T>
      <T variant="body20" className="mt-10">
        The network is upgrading, please wait...{" "}
        <a
          href="https://www.mantle.xyz/blog/announcements/mantle-goerli-testnet-upgrade"
          target="__blank"
          rel="noreferrer"
          className="underline mt-4"
        >
          Learn more
        </a>
      </T>
    </div>
  );
};

export default Page;
