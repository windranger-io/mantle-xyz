import { MAX_MINT } from "@config/constants";

// Validate the given input can be passed to the mint call on the bit contract
export const validate = (address: string, amount: string | number) => {
  const stats = {
    eAddress: false,
    eAmount: false,
  };
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
    stats.eAddress = true;
  }
  if (+amount < 0.0001 || +amount > MAX_MINT) {
    stats.eAmount = true;
  }
  return stats;
};
