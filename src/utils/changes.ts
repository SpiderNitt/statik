import { IPFSHTTPClient } from "ipfs-http-client/dist/src/types";
import fs from 'fs'
import { multihashToCID } from "./cid.js";
const checkChange = async(currentFiles:string[],prevContent:any[],file:string,client: IPFSHTTPClient,cwd:string) => {
    if(!currentFiles.includes(file)) return false
    const prevFile = prevContent.find((f: any) => f.path === file)
    // console.log(prevFile)
    const cid = multihashToCID(prevFile.cid)
    // console.log(cid,path)
    const asyncitr = client.cat(cid)
    for await (const itr of asyncitr) {
        const data = Buffer.from(itr).toString()
        if (data !== fs.readFileSync(cwd +"/"+ file).toString()) return true;
    }
    return false
}
export async function isOverriding(cwd: string, client: IPFSHTTPClient, prevContent:any[],currentFiles:string[]) {
    let overrides = false;
    // console.log(currentFiles)
    const prevFiles = prevContent.map((file: any) => file.path)
    // console.log(prevFiles)
    const added = currentFiles.filter((file: any) => !prevFiles.includes(file))
    const deleted = prevFiles.filter((file: any) => !currentFiles.includes(file))
    if (deleted.length) overrides = true;
    let changed = []
    for (const file of prevFiles) {
        if (await checkChange(currentFiles,prevContent,file,client,cwd)) changed.push(file)
    }
    if (changed.length) overrides = true;
    // console.log(overrides,added,deleted,changed)
    return {overrides,newFiles:added,deletedFiles:deleted,updated:changed};
}