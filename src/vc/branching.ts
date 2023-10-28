import { create,CID } from "ipfs-http-client";
import { IsStatik } from "../utils/checkStatik.js";
import fs from 'fs'
import { FetchConfig } from "../utils/fetchConfig.js";
import Path from 'path'
import { multihashToCID } from "../utils/cid.js";
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
        if(branch===currentBranch){
            console.log("Already on branch "+branch)
            return
        }
        const currentHead = fs.readFileSync(cwd+"/.statik/heads/"+currentBranch).toString()
        // Check for staged changes
        if(fs.readFileSync(cwd+"/.statik/SNAPSHOT").toString().length){
            console.log("There are staged changes. You cannot switch branch without commiting it")
            return
        }

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
            // Find the basepath and recursively delete all files
            let basepathCount=Infinity;
            let index = 0
            if(prevContent.length>0){
                basepathCount = prevContent[0].path.split("/").length
            }
            for(let i=1;i<prevContent.length;i++){
                if(prevContent[i].path.split("/").length<basepathCount){
                    basepathCount = prevContent[i].path.split("/").length
                    index = i
                }
            }
            const basepath = Path.dirname(prevContent[index].path)
            // 1 -> Identify unstaged changes
            // 2 -> Check if there are overriding changes and prevent jump!!!
            // 3 -> If new files are added, add them to the jumped branch without deleting them
            // 4 -> If files are deleted, delete them from the jumped branch (Consider as overriding changes)
            fs.rmSync(cwd+"/"+basepath,{recursive:true})
            for(const obj of prevContent){
                const path = obj.path 
                // Derive CID from multihash
                const cid = multihashToCID(obj.cid)
                // console.log(cid,path)
                const asyncitr = client.cat(cid)
                for await(const itr of asyncitr){
                    const data = Buffer.from(itr).toString()
                    const dirname = Path.dirname(cwd+"/"+path)
                    if(!fs.existsSync(dirname)){
                        fs.mkdirSync(dirname,{recursive:true})
                    }
                    fs.writeFileSync(path,data)
                }
            }
            fs.writeFileSync(cwd+"/.statik/HEAD",branch);
        }
    }catch(err){
        console.error(err)
    }
}