import { create } from "ipfs-http-client";
import { IsStatik } from "../utils/checkStatik.js";
import fs from 'fs'
import { FetchConfig } from "../utils/fetchConfig.js";
export async function List(cwd: string){
    try{
        IsStatik(cwd)
        // List all files
        console.log(cwd)
        const currentBranch = fs.readFileSync(cwd+"/.statik/HEAD").toString()
        const files = fs.readdirSync(cwd+"/.statik/heads")
        for(const file of files){
            if(file===currentBranch){
                console.log("-> "+file+" <-")
            }else{
                console.log(file)
            }
        }
    }catch(err){
        console.error(err)
    }
}

export async function Jump(cwd: string,branch: string){
    try{
        IsStatik(cwd)
        const currentBranch = fs.readFileSync(cwd+"/.statik/HEAD").toString()
        const currentHead = fs.readFileSync(cwd+"/.statik/heads/"+currentBranch).toString()
        if(!fs.existsSync(cwd+"/.statik/heads/"+branch)){
            console.log("Branching out to "+branch+"...")
            fs.writeFileSync(cwd+"/.statik/heads/"+branch,currentHead)
            fs.writeFileSync(cwd+"/.statik/HEAD",branch);
        }else{
            const commitId = fs.readFileSync(cwd+"/.statik/heads/"+branch).toString()
            console.log("Switching to branch "+branch+"\n"+"Head commit <"+commitId+">")
            const client = create({url: FetchConfig(cwd).ipfs_node_url})
            let asyncitr = client.cat(commitId)
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
            // Fetch file content from the prev commit
            for(const obj of prevContent){
                console.log(obj)
                const path = obj.path 
                // Derive CID !!!
                const cid = obj.cid
                const asyncitr = client.cat(cid)
                let content = []
                for await(const itr of asyncitr){
                    const data = Buffer.from(itr).toString()
                    content = JSON.parse(data)
                }
                console.log(path)
                console.log(content)
            }
        }
    }catch(err){
        console.error(err)
    }
}