// Type the handlers
import { Handlers } from "supagraph";

// Import the handlers
import { ApprovalHandler } from "./approvals";
import { TokensMigratedHandler } from "./migrator";
import {
  TokensMigratedV2Handler,
  TokenMigrationApprovedV2Handler,
} from "./migratorv2";

// Construct the handlers to register each contract against its handlers
export const handlers: Handlers = {
  // construct as a named groups
  token: {
    // eventName -> handler()
    Approval: ApprovalHandler,
  },
  migrator: {
    // eventName -> handler()
    TokensMigrated: TokensMigratedHandler,
  },
  migratorV2: {
    // eventName -> handler()
    TokensMigrated: TokensMigratedV2Handler,
    TokenMigrationApproved: TokenMigrationApprovedV2Handler,
  },
};
