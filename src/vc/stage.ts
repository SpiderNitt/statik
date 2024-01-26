import { create, globSource } from "ipfs-http-client";
import { IsStatik } from "../utils/checkStatik.js";
import fs from 'fs';
import { FetchConfig } from "../utils/fetchConfig.js";
import Path from 'path';

export async function Add(cwd: string, paths: string[]) {
    try {
        IsStatik(cwd);

        if (!paths.length) {
            console.log("No file path specified!");
            console.log("Hint: statik help");
            return;
        }

        // Assume the IPFS client is created only once for efficiency
        const client = create({ url: FetchConfig(cwd).ipfs_node_url });

        // Create an array to store the files to be committed
        let stagedFiles = [];

        for (const path of paths) {
            for await (const result of client.addAll(globSource(path, { recursive: true }))) {
                if (fs.statSync(cwd + "/" + path).isDirectory()) continue;
                stagedFiles.push(result);
            }
        }

        // Check if there are any files to stage
        if (stagedFiles.length === 0) {
            console.log("There are no changes to add");
            return;
        }

        // Save the staged files in a temporary location (e.g., .statik/staging/)
        const stagingPath = cwd + "/.statik/staging/";
        const stagingCID = await client.add(stagedFiles, { pin: false });
        
        // Create or update the SNAPSHOT file with the CID of the staged files
        fs.writeFileSync(cwd + "/.statik/SNAPSHOT", stagingCID.path);

        console.log("Files staged for commit. CID: " + stagingCID.path);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
