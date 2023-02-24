import { useNetwork } from 'wagmi';

const useSafeNetwork = () => {
  const {
    chain,
    ...rest
  } = useNetwork();

  if (chain === undefined) {
    throw new Error('Something went wrong!');
  }

  // TODO: improve UX
  if (chain.unsupported) {
    throw new Error('Unsupported chain!');
  }

  return {
    chain,
    ...rest
  };
};

export default useSafeNetwork;
