import fs from 'fs';
import { multihashToCID } from "./cid.js";
const checkChange = async (currentFiles, prevContent, file, client, cwd) => {
    if (!currentFiles.includes(file))
        return false;
    const prevFile = prevContent.find((f) => f.path === file);
    // console.log(prevFile)
    const cid = multihashToCID(prevFile.cid);
    // console.log(cid,path)
    const asyncitr = client.cat(cid);
    for await (const itr of asyncitr) {
        const data = Buffer.from(itr).toString();
        if (data !== fs.readFileSync(cwd + "/" + file).toString())
            return true;
    }
    return false;
};
export async function isOverriding(cwd, client, prevContent, currentFiles) {
    let overrides = false;
    // console.log(currentFiles)
    const prevFiles = prevContent.map((file) => file.path);
    // console.log(prevFiles)
    const added = currentFiles.filter((file) => !prevFiles.includes(file));
    const deleted = prevFiles.filter((file) => !currentFiles.includes(file));
    if (deleted.length)
        overrides = true;
    let changed = [];
    for (const file of prevFiles) {
        if (await checkChange(currentFiles, prevContent, file, client, cwd))
            changed.push(file);
    }
    if (changed.length)
        overrides = true;
    // console.log(overrides,added,deleted,changed)
    return { overrides, newFiles: added, deletedFiles: deleted, updated: changed };
}
//# sourceMappingURL=changes.js.map