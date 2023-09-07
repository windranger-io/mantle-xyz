import List from "@components/converter/List";

export default async function ListPending() {
  // const [bitContract, setBitContract] = useState();
  // useEffect(() => {
  //   // read halted from contract
  //   const getHaltedStatus = async () => {
  //     const contract = new Contract(
  //       L1_BITDAO_TOKEN_ADDRESS,
  //       TOKEN_ABI,
  //       provider
  //     );
  //     setBitContract(contract);
  //     await GetPastEvents();
  //   };
  //   getHaltedStatus();
  // }, [provider]);

  // async function GetLatestBlockNUmber() {
  //   const currentBlock = await provider.getBlock("latest");
  //   return currentBlock.number;
  // }
  // async function GetPastEvents() {
  //   var event = await bitContract.getPastEvents(
  //     "Approve", // Feel free to change this to 'Transfer' to see only the transfer events
  //     {
  //       // We fetch the latest block number and subtract 100 to ensure that
  //       // we get the events from the last 100 blocks.
  //       fromBlock: (await GetLatestBlockNUmber()) - 100,
  //       toBlock: "latest",
  //     }
  //   );

  //   console.log("Total events: ", event.length);
  //   console.log(event[event.length - 1]);
  // }

  return (
    <div>
      <List />
    </div>
  );
}
