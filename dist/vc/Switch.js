import { create } from "ipfs-http-client";
import { IsStatik } from "../utils/checkStatik.js";
import fs from 'fs';
import { FetchConfig } from "../utils/fetchConfig.js";
import path from "path";
import Path from 'path';
import { multihashToCID } from "../utils/cid.js";
import { commitContent } from "../utils/fetchContent.js";
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
export async function List(cwd) {
    try {
        IsStatik(cwd);
        // List all files
        const currentBranch = fs.readFileSync(cwd + "/.statik/HEAD").toString();
        const files = fs.readdirSync(cwd + "/.statik/heads");
        for (const file of files) {
            if (file === currentBranch) {
                console.log("-> " + file + " <-");
            }
            else {
                console.log(file);
            }
        }
    }
    catch (err) {
        console.error(err);
    }
}
export async function Switch(cwd, CID) {
    try {
        IsStatik(cwd);
        const currentBranch = fs.readFileSync(cwd + "/.statik/HEAD").toString();
        const currentHead = fs.readFileSync(cwd + "/.statik/heads/" + currentBranch).toString();
        // Check for staged changes
        if (fs.readFileSync(cwd + "/.statik/SNAPSHOT").toString().length) {
            console.log("There are staged changes. You cannot switch to other commit without commiting it");
            return;
        }
        else {
            const commitId = CID;
            const client = create({ url: FetchConfig(cwd).ipfs_node_url });
            // Check for unstaged changes
            const headContent = await commitContent(currentHead, client);
            // Handle the case where not unstaged but overriding
            // Solution: Prevent only if added files and deleted files are overriding
            // Check for overriding changes
            let newcommitContent;
            if (CID == "head") {
                newcommitContent = headContent;
            }
            else {
                newcommitContent = await commitContent(commitId, client);
            }
            // Conditionally delete files. Exempt new files under basepath
            let basepathnew;
            let dir;
            basepathnew = newcommitContent[0].path.split("/");
            let isfile;
            if (newcommitContent[0].path.split("/").length == 1) {
                dir = basepathnew[0];
                isfile = "1";
            }
            else {
                dir = basepathnew[0] + "/";
                isfile = "0";
            }
            const directoryPath = cwd + "/" + dir;
            let newBranchaddedpaths = [];
            newcommitContent.forEach((e) => {
                newBranchaddedpaths.push(e.path);
            });
            deleteFoldersAndFilesExceptStatikAndPaths(cwd, newBranchaddedpaths);
            let data;
            let flag = false;
            for (const obj of newcommitContent) {
                const path1 = obj.path;
                // Derive CID from multihash
                const cid = multihashToCID(obj.cid);
                const asyncitr = client.cat(cid);
                const dirname = Path.dirname(cwd + "/" + path1);
                fs.mkdirSync(dirname, { recursive: true });
                for await (const itr of asyncitr) {
                    data = Buffer.from(itr).toString();
                    if (data) {
                        fs.writeFileSync(path1, data);
                    }
                    else {
                    }
                    flag = true;
                }
                if (!flag) {
                    try {
                        const directoryPath = path.join(cwd, path.dirname(path1));
                        const fileName = path.basename(path1);
                        // Create the directory
                        fs.mkdirSync(directoryPath, { recursive: true });
                        // Create the empty file
                        fs.writeFileSync(path.join(directoryPath, fileName), '');
                    }
                    catch (err) {
                        console.error(`Error creating empty file: ${err}`);
                    }
                }
                flag = false;
            }
            return;
        }
    }
    catch (err) {
        console.error(err);
    }
}
//# sourceMappingURL=Switch.js.map