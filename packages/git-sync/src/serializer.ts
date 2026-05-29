// ─────────────────────────────────────────────────────────────
// @kabootar/git-sync — Collection Serializer
// Maps Collection → filesystem (one JSON per request)
// ─────────────────────────────────────────────────────────────

import fs from "node:fs";
import path from "node:path";
import type {
    Collection,
    CollectionFolder,
    KabootarRequest,
} from "@kabootar/core";
import { isFolder, isRequest } from "@kabootar/core";

const COLLECTION_META = "_collection.json";

/**
 * Serialize a collection to disk.
 * Layout:
 *   <dir>/
 *     _collection.json        (collection metadata)
 *     request-name.json       (root-level requests)
 *     folder-name/
 *       _folder.json           (folder metadata)
 *       nested-request.json
 */
export async function serializeToFs(
    collection: Collection,
    dir: string
): Promise<void> {
    await fs.promises.mkdir(dir, { recursive: true });

    // Write collection metadata (without items — they're in folder structure)
    const meta = {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        version: collection.version,
        auth: collection.auth,
        variables: collection.variables,
        preRequestScript: collection.preRequestScript,
        testScript: collection.testScript,
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt,
    };

    await fs.promises.writeFile(
        path.join(dir, COLLECTION_META),
        JSON.stringify(meta, null, 2),
        "utf-8"
    );

    // Write items recursively
    await writeItems(collection.items, dir);
}

async function writeItems(
    items: Array<CollectionFolder | KabootarRequest>,
    dir: string
): Promise<void> {
    for (const item of items) {
        if (isRequest(item)) {
            const filename = sanitizeFilename(item.name) + ".json";
            await fs.promises.writeFile(
                path.join(dir, filename),
                JSON.stringify(item, null, 2),
                "utf-8"
            );
        } else if (isFolder(item)) {
            const folderDir = path.join(dir, sanitizeFilename(item.name));
            await fs.promises.mkdir(folderDir, { recursive: true });

            // Write folder metadata
            const folderMeta = {
                id: item.id,
                name: item.name,
                description: item.description,
                auth: item.auth,
                preRequestScript: item.preRequestScript,
                testScript: item.testScript,
            };
            await fs.promises.writeFile(
                path.join(folderDir, "_folder.json"),
                JSON.stringify(folderMeta, null, 2),
                "utf-8"
            );

            // Recurse into children
            await writeItems(item.items, folderDir);
        }
    }
}

/**
 * Deserialize a collection from disk.
 */
export async function deserializeFromFs(dir: string): Promise<Collection> {
    const metaPath = path.join(dir, COLLECTION_META);
    const metaRaw = await fs.promises.readFile(metaPath, "utf-8");
    const meta = JSON.parse(metaRaw);

    const items = await readItems(dir);

    return {
        ...meta,
        items,
    };
}

async function readItems(
    dir: string
): Promise<Array<CollectionFolder | KabootarRequest>> {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    const items: Array<CollectionFolder | KabootarRequest> = [];

    for (const entry of entries) {
        if (entry.name.startsWith("_")) continue; // skip meta files

        if (entry.isDirectory()) {
            // It's a folder
            const folderDir = path.join(dir, entry.name);
            const folderMetaPath = path.join(folderDir, "_folder.json");

            let folderMeta: Record<string, unknown> = { id: entry.name, name: entry.name };
            try {
                const raw = await fs.promises.readFile(folderMetaPath, "utf-8");
                folderMeta = JSON.parse(raw);
            } catch {
                // No meta file — use directory name
            }

            const children = await readItems(folderDir);
            items.push({
                ...folderMeta,
                items: children,
            } as CollectionFolder);
        } else if (entry.isFile() && entry.name.endsWith(".json")) {
            // It's a request
            const raw = await fs.promises.readFile(
                path.join(dir, entry.name),
                "utf-8"
            );
            items.push(JSON.parse(raw) as KabootarRequest);
        }
    }

    return items;
}

/**
 * Sanitize a name for use as a filename.
 */
function sanitizeFilename(name: string): string {
    return name
        .replace(/[<>:"/\\|?*]/g, "-")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase()
        .slice(0, 100);
}
