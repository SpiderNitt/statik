import { create, globSource } from "ipfs-http-client";
import { IsStatik } from "../utils/checkStatik.js";
import fs from 'fs';
import { FetchConfig } from "../utils/fetchConfig.js";
export async function Add(cwd, paths) {
    try {
        IsStatik(cwd);
        if (!paths.length) {
            console.log("No file path specified!");
            console.log("Hint: statik help");
            return;
        }
        const client = create({ url: FetchConfig(cwd).ipfs_node_url });
        const branch = fs.readFileSync(cwd + "/.statik/HEAD").toString();
        const prevCommit = fs.readFileSync(cwd + "/.statik/heads/" + branch).toString();
        if (!prevCommit.length) {
            let snapshot = [];
            for (const path of paths) {
                for await (const result of client.addAll(globSource(path, { recursive: true }))) {
                    if (fs.statSync(cwd + "/" + result.path).isDirectory())
                        continue;
                    snapshot.push(result);
                }
            }
            console.log(snapshot);
            const result = await client.add(JSON.stringify(snapshot));
            fs.writeFileSync(cwd + "/.statik/SNAPSHOT", result.path);
            console.log("Files staged to IPFS with cid: " + result.path);
        }
        else {
            let asyncitr = client.cat(prevCommit);
            let prevSnapshot = "";
            for await (const itr of asyncitr) {
                const data = Buffer.from(itr).toString();
                prevSnapshot = JSON.parse(data).snapshot;
            }
            let prevContent = [];
            asyncitr = client.cat(prevSnapshot);
            for await (const itr of asyncitr) {
                const data = Buffer.from(itr).toString();
                prevContent = JSON.parse(data);
            }
            // Not optimized
            let newContent = [];
            for (const path of paths) {
                for await (const result of client.addAll(globSource(path, { recursive: true }))) {
                    // Check if the path is a directory
                    const path = result.path;
                    if (fs.statSync(cwd + "/" + path).isDirectory()) {
                        continue;
                    }
                    newContent.push(result);
                }
            }
            let newContentaddedpaths = [];
            newContent.forEach((e) => {
                newContentaddedpaths.push(e.path);
            });
            prevContent.forEach((e) => {
                let flag = false;
                if (fs.existsSync(e.path)) {
                    flag = false;
                }
                else {
                    flag = true;
                }
                if (!newContentaddedpaths.includes(e.path) && !flag) {
                    newContent.push(e);
                }
            });
            const result = await client.add(JSON.stringify(newContent));
            if (result.path == prevSnapshot) {
                console.log("There are no changes to add");
                return;
            }
            fs.writeFileSync(cwd + "/.statik/SNAPSHOT", result.path);
            console.log("Files staged to IPFS with cid: " + result.path);
        }
        process.exit(0);
    }
    catch (e) {
        console.error(e);
        process.exit(1);
    }
}
//# sourceMappingURL=stage.js.map