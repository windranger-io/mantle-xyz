import { CHAINS } from "@config/constants";

// a link to the networks block explorer
export default function TxLink({
  chainId,
  txHash,
}: {
  chainId: number;
  txHash: string | boolean;
}) {
  return (
    (txHash && (
      <a
        className="link text-[#0A8FF6] flex flex-row space-x-2 items-center justify-center"
        href={`${CHAINS[chainId].blockExplorerUrls}tx/${txHash}`}
        target="_blank"
        rel="noreferrer"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15.1875 7.03125V2.8125H10.9688"
            stroke="#0A8FF6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.125 7.875L15.1875 2.8125"
            stroke="#0A8FF6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12.9375 10.125V14.625C12.9375 14.7742 12.8782 14.9173 12.7727 15.0227C12.6673 15.1282 12.5242 15.1875 12.375 15.1875H3.375C3.22582 15.1875 3.08274 15.1282 2.97725 15.0227C2.87176 14.9173 2.8125 14.7742 2.8125 14.625V5.625C2.8125 5.47582 2.87176 5.33274 2.97725 5.22725C3.08274 5.12176 3.22582 5.0625 3.375 5.0625H7.875"
            stroke="#0A8FF6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <span>{CHAINS[chainId].chainName} Explorer</span>
      </a>
    )) || <span />
  );
}
