// ─────────────────────────────────────────────────────────────
// @kabootar/git-sync — Public API
// ─────────────────────────────────────────────────────────────

export { serializeToFs, deserializeFromFs } from "./serializer.js";
export {
    initRepo,
    getStatus,
    commitAll,
    getLog,
    cloneRepo,
    push,
    pull,
} from "./git-operations.js";
export type { GitSyncOptions, SyncStatus } from "./git-operations.js";
