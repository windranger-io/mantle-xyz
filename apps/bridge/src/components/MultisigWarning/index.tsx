"use client";

import { Typography } from "@mantle/ui";
import { ConvertCard } from "../ConvertCard";

export function MultisigWarning() {
  return (
    <ConvertCard className="rounded-xl mt-8 md:mt-0 p-4 mb-8">
      <div className="text-type-secondary">
        <div className="flex items-center gap-2 mb-4">
          <Typography className="text-[#E22F3D]">WARNING </Typography>
          <svg
            width="16"
            height="14"
            viewBox="0 0 16 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0.820814 13.791C0.514814 13.791 0.282148 13.6593 0.122814 13.396C-0.0371855 13.132 -0.0408521 12.868 0.111815 12.604L7.19481 0.396C7.36148 0.132 7.59081 0 7.88281 0C8.17481 0 8.40415 0.132 8.57081 0.396L15.6538 12.604C15.8065 12.868 15.8028 13.132 15.6428 13.396C15.4835 13.6593 15.2508 13.791 14.9448 13.791H0.820814ZM7.90381 5.229C7.72315 5.229 7.56681 5.295 7.43481 5.427C7.30281 5.559 7.23681 5.71533 7.23681 5.896V8.646C7.23681 8.81267 7.30281 8.96533 7.43481 9.104C7.56681 9.24267 7.72315 9.312 7.90381 9.312C8.08448 9.312 8.24081 9.24267 8.37281 9.104C8.50481 8.96533 8.57081 8.81267 8.57081 8.646V5.896C8.57081 5.71533 8.50481 5.559 8.37281 5.427C8.24081 5.295 8.08448 5.229 7.90381 5.229ZM7.90381 11.541C8.09781 11.541 8.26448 11.4717 8.40381 11.333C8.54248 11.1943 8.61181 11.0277 8.61181 10.833C8.61181 10.6383 8.54248 10.4717 8.40381 10.333C8.26448 10.1943 8.09781 10.125 7.90381 10.125C7.70915 10.125 7.54248 10.1943 7.40381 10.333C7.26448 10.4717 7.19481 10.6383 7.19481 10.833C7.19481 11.0277 7.26448 11.1943 7.40381 11.333C7.54248 11.4717 7.70915 11.541 7.90381 11.541ZM1.73681 12.458H14.0288L7.88281 1.875L1.73681 12.458Z"
              fill="#E22F3D"
            />
          </svg>
        </div>
        <Typography>
          Multisig addresses might differ between L1 and L2. Avoid using Gnosis
          Safe multisig wallets to bridge tokens. If you do, please double-check
          the address on the receiving chain.
        </Typography>
      </div>
    </ConvertCard>
  );
}
