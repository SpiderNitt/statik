import { create } from "ipfs-http-client";
import { IsStatik } from "../utils/checkStatik.js";
import fs from 'fs';
import { FetchConfig } from "../utils/fetchConfig.js";
export async function Commit(cwd, message) {
    IsStatik(cwd);
    const snapshot = fs.readFileSync(cwd + "/.statik/SNAPSHOT").toString();
    if (!snapshot.length) {
        console.error("No changes to commit");
        process.exit(1);
    }
    const client = create({ url: FetchConfig(cwd).ipfs_node_url });
    const prevCommit = fs.readFileSync(cwd + "/.statik/HEAD").toString();
    const commit = {
        prevCommit: prevCommit,
        snapshot: snapshot,
        message: message,
        timestamp: Date.now()
    };
    const result = await client.add(JSON.stringify(commit));
    fs.writeFileSync(cwd + "/.statik/HEAD", result.path);
    fs.writeFileSync(cwd + "/.statik/SNAPSHOT", "");
    console.log("Committed to IPFS with hash: " + result.path);
    process.exit(0);
}
//# sourceMappingURL=commit.js.map