import { create,CID } from "ipfs-http-client";
import { IsStatik } from "../utils/checkStatik.js";
import fs from 'fs'
import { FetchConfig } from "../utils/fetchConfig.js";
import Path from 'path'
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
            fs.rmSync(cwd+"/"+basepath,{recursive:true})
            for(const obj of prevContent){
                const path = obj.path 
                // Derive CID 
                const {code,version,hash} = obj.cid
                const bytes = new Uint8Array(Object.values(hash))
                const cid = new CID(version,code,obj.cid,bytes)
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