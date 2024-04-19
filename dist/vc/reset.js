import { create } from "ipfs-http-client";
import { IsStatik } from "../utils/checkStatik.js";
import fs from 'fs';
import { FetchConfig } from "../utils/fetchConfig.js";
import { Switch } from "./Switch.js";
export async function hardreset(CID) {
    let cwd = process.cwd();
    IsStatik(cwd);
    const currentBranch = fs.readFileSync(cwd + "/.statik/HEAD").toString();
    fs.writeFileSync(cwd + "/.statik/heads/" + currentBranch, CID);
    Switch(cwd, CID);
}
export async function softreset(CID) {
    let cwd = process.cwd();
    let client = create({ url: FetchConfig(cwd).ipfs_node_url });
    let currentBranch = fs.readFileSync(cwd + "/.statik/HEAD").toString();
    const commitId = fs.readFileSync(cwd + "/.statik/heads/" + currentBranch).toString();
    let prevSnapshot = "";
    let asyncitr = client.cat(commitId);
    for await (const itr of asyncitr) {
        const data = Buffer.from(itr).toString();
        prevSnapshot = JSON.parse(data).snapshot;
    }
    fs.writeFileSync(cwd + "/.statik/heads/" + currentBranch, CID);
    fs.writeFileSync(cwd + "/.statik/SNAPSHOT", prevSnapshot);
}
//# sourceMappingURL=reset.js.map