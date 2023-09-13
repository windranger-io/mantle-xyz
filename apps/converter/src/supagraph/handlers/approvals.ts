// We use BigNumber to handle all numeric operations
import { BigNumber } from "ethers";
import { getAddress } from "ethers/lib/utils";

// Track approvals on BIT for the migratorV2 contract (each user can have one pending migration and MANY historical migrations (use ID to manage))
import { TransactionReceipt, Block } from "@ethersproject/providers";
import { AccountEntity, ApprovalEvent, MigationEntity } from "@supagraph/types";
import { Store, withDefault } from "supagraph";

// Get the migratorV2 address - only approvals for this address to spend are valid events
const MIGRATOR_V2 = getAddress(
  withDefault(
    process.env.L1_CONVERTER_V2_CONTRACT_ADDRESS,
    "0x1142141e5bdf32fbf9129cc8c03932014e23164c"
  )
);

// Check the approval events...
export const ApprovalHandler = async (
  args: ApprovalEvent,
  { tx, block }: { tx: TransactionReceipt; block: Block }
) => {
  // register a new PENDING migrationV2 entity
  if (getAddress(args.spender) === MIGRATOR_V2) {
    // load the entity for this account and migration (migration based on txHash)
    const account = await Store.get<AccountEntity>("Account", args.owner);
    const migration = await Store.get<MigationEntity>(
      "PendingMigrationV2",
      args.owner
    );

    // calculate gas usage
    const gasUsed = BigNumber.from(tx.gasUsed);
    const gasPrice = BigNumber.from(tx.effectiveGasPrice);
    const gasCostInWei = gasUsed.mul(gasPrice);

    // update/set the accounts details
    account.set("blockNumber", tx.blockNumber);
    account.set("transactionHash", tx.transactionHash);

    // add a migration for each event (recording all relevant details from the args, tx and block)
    migration.set("account", args.owner);
    migration.set("amountApproved", args.value);
    migration.set("blockNumber", tx.blockNumber);
    migration.set("blockTimestamp", block.timestamp);
    migration.set("transactionHash", tx.transactionHash);

    // record gas-cost for future refund
    migration.set("gasCost", gasCostInWei);

    // set the status to pending
    migration.set("status", "PENDING");

    // save changes
    await migration.save();
    await account.save();
  }
};
