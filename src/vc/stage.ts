import { create, globSource } from "ipfs-http-client";
import { IsStatik } from "../utils/checkStatik.js";
import fs from 'fs'
import { FetchConfig } from "../utils/fetchConfig.js";
// If order of elements changes, the hash changes
// Fix the logic (Sort maybe?)
// Accept file path '.'
export async function Add(cwd:string,paths:string[]){
    IsStatik(cwd)
    const client = create({url: FetchConfig(cwd).ipfs_node_url})
    const prevCommit = fs.readFileSync(cwd+"/.statik/HEAD").toString()
    if(!prevCommit.length){
        let snapshot=[];
        for (const path of paths){
            for await (const result of client.addAll(globSource(path,{recursive:true}))) {
                snapshot.push(result)
            }
        }
        // console.log(snapshot)
        const result = await client.add(JSON.stringify(snapshot))
        fs.writeFileSync(cwd+"/.statik/SNAPSHOT",result.path)
        console.log(
            "Files staged to IPFS with cid: "+result.path
        )
    }else{
        let asyncitr = client.cat(prevCommit)
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
        // Not optimized
        for (const path of paths){
            for await (const result of client.addAll(globSource(path,{recursive:true}))) {
                for(const prev of prevContent){
                    if(prev.path==result.path){
                        prevContent.splice(prevContent.indexOf(prev),1)
                        break;
                    }
                }
                prevContent.push(result)
            }
        }
        const result = await client.add(JSON.stringify(prevContent))
        fs.writeFileSync(cwd+"/.statik/SNAPSHOT",result.path)
        console.log(
            "Files staged to IPFS with cid: "+result.path
        )
    }
    process.exit(0)
}