import { BigNumber } from "ethers";
import { useQuery } from "wagmi";

export type FeeData = {
  data: {
    gasPrice: BigNumber;
  };
};

function useFeeData(provider: {
  network: {
    name: string;
  };
  getGasPrice: () => Promise<BigNumber>;
}) {
  // fetch the gas estimate for the selected operation on in the selected direction
  const { data: feeData, refetch: refetchFeeData } = useQuery<FeeData>(
    ["FEE_DATA", { network: provider?.network.name }],
    async () => {
      return {
        data: {
          gasPrice: await provider.getGasPrice(),
        },
      };
    },
    {
      initialData: {
        data: {
          gasPrice: BigNumber.from("0"),
        },
      },
      // cache for 5 mins
      cacheTime: 300000,
      // refetch every 60s or when refetched
      staleTime: 60000,
      refetchInterval: 60000,
      // background refetch stale data
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
      refetchIntervalInBackground: true,
    }
  );

  return {
    feeData,
    refetchFeeData,
  } as {
    feeData: FeeData;
    refetchFeeData: () => void;
  };
}

export default useFeeData;
