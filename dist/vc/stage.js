import { create, globSource } from "ipfs-http-client";
import { IsStatik } from "../utils/checkStatik.js";
import fs from 'fs';
import { FetchConfig } from "../utils/fetchConfig.js";
import { Duplex } from "stream";
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
                for await (const result of client.addAll(globSource(path, { recursive: true,duplex:true}))) {
                    if (fs.statSync(cwd + "/" + result.path).isDirectory()){

                        continue;
                    }
                    console.log(result);
                    snapshot.push(result);
                }
            }
            // console.log(snapshot)
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
            const Content1=[]
            for (const path of paths) {
                for await (const result of client.addAll(globSource(path, { recursive: true }))) {
                    // Check if the path is a directory
                    const path = result.path;
                    if (fs.statSync(cwd + "/" + path).isDirectory())
                        continue;
                    console.log(result);
                    Content1.push(result)
                    // let flag = true;
                    // for (const prev of prevContent) {
                        
                    //     if (prev.path == result.path) {
                    //         prevContent.splice(prevContent.indexOf(prev), 1, result);
                    //         flag = false;
                    //         break;
                    //     }
                    // }
                    // if (flag)
                    //     prevContent.push(result);
                }
            }
            const result = await client.add(JSON.stringify(Content1));
            // console.log(result.path,prevSnapshot)
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