import { create } from "ipfs-http-client";
import { IsStatik } from "../utils/checkStatik.js";
import fs from 'fs'
import { FetchConfig } from "../utils/fetchConfig.js";
import Path from 'path'
import { multihashToCID } from "../utils/cid.js";
import { isOverriding } from "../utils/changes.js";
import { commitContent } from "../utils/fetchContent.js";
import { deleteAllFiles, readAllFiles } from "../utils/dirwalk.js";
export async function List(cwd: string){
    try{
        IsStatik(cwd)
        // List all files
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
            const client = create({url: FetchConfig(cwd).ipfs_node_url})
            console.log("Switching to branch "+branch+"\n"+"Head commit <"+commitId+">")
            const currentFiles = [...readAllFiles(cwd)]

            // Check for unstaged changes
            const oldBranchContent = await commitContent(currentHead,client)
            const {overrides:hasUnstagedChanges,newFiles:addedFiles,updated:unstagedChanges,deletedFiles} = await isOverriding(cwd,client,oldBranchContent,currentFiles)
            if(hasUnstagedChanges){
                if(unstagedChanges.length>0){
                    console.log("\nUnstaged changes:")
                    for(const file of unstagedChanges){
                        console.log(file)
                    }
                }
                if(deletedFiles.length>0){
                    console.log("\nDeleted files:")
                    for(const file of deletedFiles){
                        console.log(file)
                    }
                }
                console.log("\nThere are unstaged changes. You cannot switch branch without commiting it")
                console.log("Abort")
                process.exit(1)
            }
            // Handle the case where not unstaged but overriding
            // Solution: Prevent only if added files and deleted files are overriding
            // Check for overriding changes
            const newBranchContent = await commitContent(commitId,client)
            const {newFiles,updated} = await isOverriding(cwd,client,newBranchContent,addedFiles)
            if(updated.length>0){
                console.log("Overriding changes:")
                for(const file of updated){
                    console.log(file)
                }
                console.log("There are overriding changes. You cannot switch branch without commiting it")
                console.log("Abort")
                process.exit(1)
            }
            
            // Find the basepath and recursively delete all files
            let basepathCount=Infinity;
            let index = 0
            if(newBranchContent.length>0){
                basepathCount = newBranchContent[0].path.split("/").length
            }
            for(let i=1;i<newBranchContent.length;i++){
                if(newBranchContent[i].path.split("/").length<basepathCount){
                    basepathCount = newBranchContent[i].path.split("/").length
                    index = i
                }
            }

            // Conditionally delete files. Exempt new files under basepath
            const basepath = Path.dirname(newBranchContent[index].path)
            deleteAllFiles(cwd+"/"+basepath,newFiles)
            for(const obj of newBranchContent){
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
            return
        }
    }catch(err){
        console.error(err)
    }
}