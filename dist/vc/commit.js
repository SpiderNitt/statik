import { create } from "ipfs-http-client";
import { IsStatik } from "../utils/checkStatik.js";
import fs from 'fs';
import { FetchConfig } from "../utils/fetchConfig.js";
export async function Commit(cwd, message) {
    try {
        IsStatik(cwd);
        const snapshot = fs.readFileSync(cwd + "/.statik/SNAPSHOT").toString();
        if (!snapshot.length) {
            console.error("No changes to commit");
            process.exit(1);
        }
        const client = create({ url: FetchConfig(cwd).ipfs_node_url });
        const branch = fs.readFileSync(cwd + "/.statik/HEAD").toString();
        const prevCommit = fs.readFileSync(cwd + "/.statik/heads/" + branch).toString();
        const commit = {
            prevCommit: prevCommit,
            snapshot: snapshot,
            message: message,
            timestamp: Date.now()
        };
        const result = await client.add(JSON.stringify(commit));
        fs.writeFileSync(cwd + "/.statik/heads/" + branch, result.path);
        fs.writeFileSync(cwd + "/.statik/SNAPSHOT", "");
        console.log("Committed to IPFS with hash: " + result.path);
        process.exit(0);
    }
    catch (e) {
        console.error(e);
        process.exit(1);
    }
}
//# sourceMappingURL=commit.js.map