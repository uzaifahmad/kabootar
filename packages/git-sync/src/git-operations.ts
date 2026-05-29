// ─────────────────────────────────────────────────────────────
// @kabootar/git-sync — Git Operations
// isomorphic-git wrapper for collection versioning
// ─────────────────────────────────────────────────────────────

import fs from "node:fs";
import git from "isomorphic-git";

export interface GitSyncOptions {
    dir: string;
    author?: { name: string; email: string };
}

export interface SyncStatus {
    modified: string[];
    added: string[];
    deleted: string[];
    untracked: string[];
    hasChanges: boolean;
}

/**
 * Initialize a new Git repository for collection storage.
 */
export async function initRepo(dir: string): Promise<void> {
    await fs.promises.mkdir(dir, { recursive: true });
    await git.init({ fs, dir });

    // Create .gitignore
    await fs.promises.writeFile(
        `${dir}/.gitignore`,
        "node_modules/\n.env\n*.log\n",
        "utf-8"
    );
}

/**
 * Get the sync status of a collection directory.
 */
export async function getStatus(dir: string): Promise<SyncStatus> {
    const matrix = await git.statusMatrix({ fs, dir });

    const result: SyncStatus = {
        modified: [],
        added: [],
        deleted: [],
        untracked: [],
        hasChanges: false,
    };

    for (const [filepath, headStatus, workdirStatus, stageStatus] of matrix) {
        if (headStatus === 0 && workdirStatus === 2 && stageStatus === 0) {
            result.untracked.push(filepath as string);
        } else if (headStatus === 0 && workdirStatus === 2 && stageStatus === 2) {
            result.added.push(filepath as string);
        } else if (headStatus === 1 && workdirStatus === 2 && stageStatus === 2) {
            result.modified.push(filepath as string);
        } else if (headStatus === 1 && workdirStatus === 0) {
            result.deleted.push(filepath as string);
        } else if (headStatus === 1 && workdirStatus === 2 && stageStatus === 1) {
            result.modified.push(filepath as string);
        }
    }

    result.hasChanges =
        result.modified.length > 0 ||
        result.added.length > 0 ||
        result.deleted.length > 0 ||
        result.untracked.length > 0;

    return result;
}

/**
 * Stage all changes and commit.
 */
export async function commitAll(
    options: GitSyncOptions & { message: string }
): Promise<string> {
    const { dir, message, author } = options;
    const defaultAuthor = author ?? {
        name: "Kabootar",
        email: "kabootar@local",
    };

    // Stage everything
    const status = await getStatus(dir);

    for (const filepath of [
        ...status.untracked,
        ...status.modified,
        ...status.added,
    ]) {
        await git.add({ fs, dir, filepath });
    }

    for (const filepath of status.deleted) {
        await git.remove({ fs, dir, filepath });
    }

    // Commit
    const sha = await git.commit({
        fs,
        dir,
        message,
        author: defaultAuthor,
    });

    return sha;
}

/**
 * Get the commit log.
 */
export async function getLog(
    dir: string,
    depth = 20
): Promise<
    Array<{ sha: string; message: string; author: string; timestamp: number }>
> {
    try {
        const commits = await git.log({ fs, dir, depth });
        return commits.map((c) => ({
            sha: c.oid,
            message: c.commit.message,
            author: c.commit.author.name,
            timestamp: c.commit.author.timestamp,
        }));
    } catch {
        return []; // No commits yet
    }
}

/**
 * Clone a remote repository.
 */
export async function cloneRepo(
    url: string,
    dir: string,
    options?: { depth?: number; token?: string }
): Promise<void> {
    await fs.promises.mkdir(dir, { recursive: true });

    const cloneOpts: Parameters<typeof git.clone>[0] = {
        fs,
        http: await getHttpClient(),
        dir,
        url,
        singleBranch: true,
        depth: options?.depth ?? 1,
    };

    if (options?.token) {
        cloneOpts.onAuth = () => ({
            username: options.token!,
            password: "x-oauth-token",
        });
    }

    await git.clone(cloneOpts);
}

/**
 * Push to remote.
 */
export async function push(
    dir: string,
    options?: { remote?: string; token?: string }
): Promise<void> {
    const pushOpts: Parameters<typeof git.push>[0] = {
        fs,
        http: await getHttpClient(),
        dir,
        remote: options?.remote ?? "origin",
    };

    if (options?.token) {
        pushOpts.onAuth = () => ({
            username: options.token!,
            password: "x-oauth-token",
        });
    }

    await git.push(pushOpts);
}

/**
 * Pull from remote.
 */
export async function pull(
    dir: string,
    options?: {
        remote?: string;
        token?: string;
        author?: { name: string; email: string };
    }
): Promise<void> {
    const author = options?.author ?? {
        name: "Kabootar",
        email: "kabootar@local",
    };

    await git.pull({
        fs,
        http: await getHttpClient(),
        dir,
        remote: options?.remote ?? "origin",
        author,
        ...(options?.token
            ? { onAuth: () => ({ username: options.token!, password: "x-oauth-token" }) }
            : {}),
    });
}

/**
 * Lazy-load the isomorphic-git http client.
 */
async function getHttpClient() {
    const http = await import("isomorphic-git/http/node/index.cjs");
    return http.default ?? http;
}
