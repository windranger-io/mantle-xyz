import { useContext } from "react";
import StateContext from "@providers/stateContext";

import { Direction } from "@config/constants";

import { Typography } from "@mantle/ui";
import { MdClear } from "react-icons/md";

import TxLink from "@components/CTAPageTxLink";

export default function CTAPageLoading({
  l1TxHash,
  l2TxHash,
  closeModal,
}: {
  l1TxHash: string | boolean;
  l2TxHash: string | boolean;
  closeModal: () => void;
}) {
  const { ctaChainId: chainId } = useContext(StateContext);

  const direction = chainId === 5 ? Direction.Deposit : Direction.Withdraw;

  return (
    <>
      <span className="flex justify-between align-middle">
        <Typography variant="modalHeadingSm" className="text-center w-full">
          {direction === Direction.Deposit ? "Deposit" : "Withdrawal"} is on
          it’s way to {direction === Direction.Deposit ? "Mantle" : "Goerli"}
        </Typography>
        <Typography variant="modalHeading" className="text-white w-auto pt-1">
          <MdClear onClick={closeModal} className="cursor-pointer" />
        </Typography>
      </span>
      <div className="flex items-center justify-center py-4">
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16.4642 28.0514L4.33359 21.8752C3.38473 23.7395 2.57663 25.694 1.93359 27.6849L14.8865 31.8732C15.3098 30.5638 15.8404 29.2788 16.4652 28.0524L16.4642 28.0514Z"
            fill="white"
          />
          <path
            d="M26.7696 17.1675L33.4885 28.7442C34.4698 28.1751 35.5199 27.7376 36.6126 27.4439L33.1351 14.5174C34.0202 14.2794 34.9194 14.0829 35.8237 13.9402L33.687 0.495117C31.6202 0.823218 29.5665 1.31841 27.5817 1.96549L31.7366 14.6996C30.4151 15.131 29.128 15.6667 27.8885 16.3007L21.7812 4.37967C19.924 5.33156 18.1276 6.43738 16.4395 7.66979L24.4648 18.6652C25.204 18.1265 25.9767 17.6272 26.7685 17.1665L26.7696 17.1675Z"
            fill="white"
          />
          <path
            d="M62.8226 26.757L51.25 33.4821C51.8201 34.4623 52.2576 35.5135 52.5523 36.6041L65.4778 33.1206C65.7158 34.0056 65.9123 34.9039 66.056 35.8072L79.4991 33.6664C79.1699 31.6006 78.6737 29.5459 78.0246 27.5601L65.2925 31.7231C64.8601 30.4016 64.3244 29.1155 63.6895 27.876L75.6064 21.7606C74.6545 19.9054 73.5467 18.109 72.3143 16.4219L61.3219 24.4522C61.8616 25.1915 62.3609 25.9631 62.8216 26.756L62.8226 26.757Z"
            fill="white"
          />
          <path
            d="M58.1041 4.3242C56.2378 3.37636 54.2834 2.56927 52.2945 1.92725L48.1133 14.8822C49.4216 15.3044 50.7077 15.8351 51.9361 16.4589L58.1041 4.32319V4.3242Z"
            fill="white"
          />
          <path
            d="M53.2705 16.9293L46.4746 28.7237C47.4589 29.2908 48.3663 29.9855 49.1733 30.7895L68.2336 11.6645C66.7551 10.1911 65.149 8.82297 63.4599 7.59766L55.5986 18.4392C54.8493 17.8964 54.0736 17.3911 53.2716 16.9283L53.2705 16.9293Z"
            fill="white"
          />
          <path
            d="M16.9369 26.7145L28.7282 33.5175C29.2953 32.5342 29.992 31.6259 30.7971 30.8178L11.6802 11.7505C10.2058 13.229 8.83664 14.834 7.61133 16.5221L18.4488 24.3884C17.906 25.1368 17.3997 25.9125 16.9369 26.7145Z"
            fill="white"
          />
          <path
            d="M44.1267 13.7104L46.1834 0.475949C44.151 0.16 42.071 0 40.0001 0H39.9688V27.0015H40.0001C41.1384 27.0015 42.2644 27.1473 43.348 27.4349L46.8396 14.2774C45.9465 14.0405 45.0411 13.8531 44.1267 13.7104Z"
            fill="white"
          />
          <path
            d="M27.4359 36.645L14.2805 33.1443C14.0425 34.0375 13.8542 34.9428 13.7114 35.8572L0.478986 33.7944C0.161012 35.8339 0 37.922 0 39.999H27.0015C27.0015 38.8587 27.1483 37.7296 27.4369 36.645H27.4359Z"
            fill="white"
          />
          <path
            d="M63.5362 51.9485L75.6668 58.1247C76.6156 56.2604 77.4237 54.3059 78.0668 52.3151L65.1139 48.1267C64.6906 49.4361 64.16 50.7211 63.5352 51.9475L63.5362 51.9485Z"
            fill="white"
          />
          <path
            d="M53.2297 62.8318L46.5108 51.2551C45.5295 51.8242 44.4794 52.2617 43.3867 52.5554L46.8642 65.4819C45.9781 65.7199 45.0799 65.9164 44.1756 66.0591L46.3113 79.5032C48.3781 79.1751 50.4318 78.6799 52.4166 78.0328L48.2616 65.2986C49.5842 64.8673 50.8702 64.3316 52.1097 63.6976L58.2171 75.6186C60.0743 74.6667 61.8707 73.5609 63.5588 72.3285L55.5335 61.3331C54.7943 61.8718 54.0216 62.3711 53.2297 62.8318Z"
            fill="white"
          />
          <path
            d="M17.1764 53.2426L28.7501 46.5175C28.1799 45.5373 27.7425 44.4861 27.4478 43.3955L14.5223 46.879C14.2843 45.994 14.0878 45.0958 13.944 44.1925L0.5 46.3332C0.829113 48.399 1.32531 50.4537 1.97443 52.4395L14.7066 48.2765C15.139 49.598 15.6747 50.8841 16.3096 52.1236L4.39265 58.239C5.34455 60.0942 6.45239 61.8907 7.6848 63.5777L18.6772 55.5474C18.1374 54.8081 17.6382 54.0365 17.1774 53.2436L17.1764 53.2426Z"
            fill="white"
          />
          <path
            d="M21.8945 75.6759C23.7609 76.6238 25.7153 77.4309 27.7041 78.0729L31.8854 65.118C30.577 64.6957 29.291 64.1651 28.0626 63.5413L21.8945 75.6769V75.6759Z"
            fill="white"
          />
          <path
            d="M26.7267 63.0704L33.5226 51.276C32.5383 50.7089 31.631 50.0143 30.8239 49.2102L11.7637 68.3352C13.2422 69.8086 14.8482 71.1767 16.5373 72.4021L24.3986 61.5606C25.148 62.1033 25.9236 62.6087 26.7257 63.0714L26.7267 63.0704Z"
            fill="white"
          />
          <path
            d="M63.0614 53.285L51.27 46.4819C50.7029 47.4652 50.0062 48.3736 49.2012 49.1817L68.3171 68.25C69.7915 66.7715 71.1606 65.1665 72.3859 63.4784L61.5485 55.612C62.0913 54.8637 62.5976 54.088 63.0604 53.286L63.0614 53.285Z"
            fill="white"
          />
          <path
            d="M36.6537 52.563L33.1621 65.7204C34.0553 65.9574 34.9606 66.1447 35.875 66.2875L33.8193 79.5219C35.8517 79.8379 37.9317 79.9979 40.0026 79.9979H40.034V52.9964H40.0026C38.8644 52.9964 37.7383 52.8506 36.6548 52.563H36.6537Z"
            fill="white"
          />
          <path
            d="M52.9979 40.001C52.9979 41.1412 52.8511 42.2693 52.5625 43.3549L65.7179 46.8556C65.9559 45.9625 66.1442 45.0572 66.287 44.1427L79.5204 46.2065C79.8384 44.167 79.9994 42.0789 79.9994 40.002H52.9979V40.001Z"
            fill="white"
          />
        </svg>
      </div>
      <div className="flex flex-col gap-4">
        <TxLink chainId={chainId} txHash={l1TxHash} />
        <TxLink chainId={chainId === 5 ? 5001 : 5} txHash={l2TxHash} />
      </div>
    </>
  );
}
