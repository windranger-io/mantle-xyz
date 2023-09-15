// We use BigNumber to handle all numeric operations
import { BigNumber } from "ethers";

// Use Store to interact with entity storage
import { Store } from "supagraph";

// Each event is supplied the block and tx along with the typed args
import {
  TransactionReceipt,
  TransactionResponse,
} from "@ethersproject/providers";

// - These types will be generated based on the event signatures exported by the defined contracts in config (coming soon TM);
import type {
  AccountEntity,
  MigationEntity,
  TokenMigrationApprovedEvent,
  TokensMigratedEvent,
} from "../types";

// Generic handler to consume TokensMigrated events (event TokensMigrated(address indexed to, uint256 amountSwapped))
export const TokensMigratedV2Handler = async (
  args: TokensMigratedEvent,
  { tx }: { tx: TransactionReceipt & TransactionResponse }
) => {
  // load the entity for this account and migration (pending migration based on user)
  const account = await Store.get<AccountEntity>("Account", args.to);
  const migration = await Store.get<MigationEntity>(
    "PendingMigrationV2",
    args.to
  );

  // add the migration to users migratedMnt total
  const newBalance = BigNumber.from(account.migratedMnt || "0").add(
    args.amountSwapped
  );
  // keep count of how many migrations the user has made (so we can paginate Migrations)
  const newCount = BigNumber.from(account.migrationCountV2 || "0").add("1");

  // update/set the accounts details
  account.set("migratedMnt", newBalance);
  account.set("migrationCountV2", newCount);
  account.set("blockNumber", tx.blockNumber);
  account.set("transactionHash", tx.transactionHash);

  // add a migration for each event (recording all relevant details from the args, tx and block)
  migration.set("account", args.to);
  migration.set(
    "amountApproved",
    // if an approver approves themselves via the MigratorV2 contract, the Approval event on the BIT contract will be for 0
    BigNumber.from(migration.amountApproved || "0").eq("0")
      ? args.amountSwapped
      : migration.amountApproved
  );
  migration.set("amountSwapped", args.amountSwapped);

  // set the status to complete
  migration.set("status", "COMPLETE");

  // store the pending entity (keep this around for easy most recent tx lookup/to simpifly the procedure)
  const newMigration = await migration.save();

  // store the same entity against its txHash instead of pending into the MigrationV2 collection (migration based on txHash)
  await Store.set(
    // ref to the entity table
    "MigrationV2",
    // set against hash
    tx.transactionHash || tx.hash,
    // pull the full object details
    {
      ...newMigration.valueOf(),
      // copy the correct id into the new entity
      id: tx.transactionHash || tx.hash,
    }
  );

  // save all changes on account
  await account.save();
};

// Generic handler to consume TokensMigrated events (event TokensMigrationApproved(address indexed approver, address indexed user, uint256 amount))
export const TokenMigrationApprovedV2Handler = async (
  args: TokenMigrationApprovedEvent,
  { tx }: { tx: TransactionReceipt & TransactionResponse }
) => {
  // load the entity for this account and migration (pending migration based on user)
  const migration = await Store.get<MigationEntity>(
    "PendingMigrationV2",
    args.user
  );

  // reset the entity
  if (
    migration.status === "COMPLETE" &&
    tx.transactionHash !== migration.transactionHash
  ) {
    migration.entries = [
      migration.entries.find((entry) => entry.key === "id")!,
    ];
  }

  // record gas-cost for future refund
  migration.set("approvedBy", args.approver);
  migration.set("approvalTx", tx.transactionHash || tx.hash);

  // set the status to pending
  migration.set("status", "PENDING");

  // save all changes
  await migration.save();
};
