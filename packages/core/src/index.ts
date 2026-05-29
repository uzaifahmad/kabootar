// ─────────────────────────────────────────────────────────────
// @kabootar/core — Public API
// ─────────────────────────────────────────────────────────────

export * from "./types.js";
export { EnvironmentManager } from "./environment.js";
export type { VariableScope } from "./environment.js";
export { resolveAuth, mergeAuth } from "./auth.js";
export type { AuthResult } from "./auth.js";
export { executeRequest, createRequest } from "./request-engine.js";
export type { RequestEngineOptions } from "./request-engine.js";
export {
    createCollection,
    createFolder,
    findItemById,
    findParent,
    addItem,
    removeItem,
    countRequests,
    getAllRequests,
    validateCollection,
    exportCollection,
    importCollection,
} from "./collection.js";
