import { create } from "ipfs-http-client";
import { IsStatik } from "../utils/checkStatik.js";
import fs from 'fs';
import { FetchConfig } from "../utils/fetchConfig.js";
import path from "path";
import { Switch } from "./Switch.js";
function deleteFolderRecursive(folderPath) {
    if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach((file) => {
            const curPath = path.join(folderPath, file);
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            }
            else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(folderPath);
    }
}
function deleteFoldersAndFilesExceptStatikAndPaths(cwd, pathsToKeep) {
    const statikPath = path.join(cwd, '.statik');
    if (!fs.existsSync(statikPath)) {
        return;
    }
    const filesAndFolders = fs.readdirSync(cwd);
    for (const fileOrFolder of filesAndFolders) {
        const filePath = path.join(cwd, fileOrFolder);
        if (fileOrFolder === '.statik' || pathsToKeep.includes(filePath)) {
            continue;
        }
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            deleteFolderRecursive(filePath);
        }
        else {
            fs.unlinkSync(filePath);
        }
    }
}
export async function hardreset(CID) {
    let cwd = process.cwd();
    let client = create({ url: FetchConfig(cwd).ipfs_node_url });
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