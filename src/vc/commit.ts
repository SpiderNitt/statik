import { create, globSource } from "ipfs-http-client";
import { IsStatik } from "../utils/checkStatik.js";
import fs from 'fs'
import { FetchConfig } from "../utils/fetchConfig.js";

export async function Commit(cwd: string, message: string) {
    try {
        IsStatik(cwd);

        // Read the staged changes CID from SNAPSHOT
        const snapshot = fs.readFileSync(cwd + "/.statik/SNAPSHOT").toString();

        if (!snapshot.length) {
            console.error("No changes to commit");
            process.exit(1);
        }

        // Create an IPFS client
        const client = create({ url: FetchConfig(cwd).ipfs_node_url });

        // Read the current branch
        const branch = fs.readFileSync(cwd + "/.statik/HEAD").toString();

        // Read the previous commit CID from the current branch
        const prevCommit = fs.readFileSync(cwd + "/.statik/heads/" + branch).toString();

        // Create the commit object
        const commit = {
            prevCommit: prevCommit,
            snapshot: snapshot,
            message: message,
            timestamp: Date.now()
        };

        // Add the commit object to IPFS
        const result = await client.add(JSON.stringify(commit));

        // Update the HEAD of the current branch to the new commit CID
        fs.writeFileSync(cwd + "/.statik/heads/" + branch, result.path);

        // Clear the SNAPSHOT file
        fs.writeFileSync(cwd + "/.statik/SNAPSHOT", "");

        console.log("Committed to IPFS with hash: " + result.path);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

