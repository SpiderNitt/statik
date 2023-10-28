import { IPFSHTTPClient } from "ipfs-http-client/dist/src/types";
import fs from 'fs'
export async function findChanges(cwd:string,client: IPFSHTTPClient,commit:string){
    const currentFiles = fs.readdirSync(cwd)
    console.log(currentFiles)
    let asyncitr = client.cat(commit)
    let prevSnapshot = "";
    for await(const itr of asyncitr){
        const data = Buffer.from(itr).toString()
        prevSnapshot = JSON.parse(data).snapshot
    }
    let prevContent = [];
    asyncitr = client.cat(prevSnapshot)
    for await(const itr of asyncitr){
        const data = Buffer.from(itr).toString()
        prevContent = JSON.parse(data)
    }
    const prevFiles = prevContent.map((file:any)=>file.path)
    const added = currentFiles.filter((file:any)=>!prevFiles.includes(file))
    const deleted = prevFiles.filter((file:any)=>!currentFiles.includes(file))
    // Compare file hashes
    // Get prev file content
    // const changed = currentFiles.filter((file:any)=>prevFiles.includes(file))
    
}