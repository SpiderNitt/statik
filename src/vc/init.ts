import fs from "fs";
export async function Init(cwd: string,ipfs_node_url:string){
    try{
        let reinitialize = false;
        if(fs.existsSync(cwd+"/.statik")){
            reinitialize = true;
            fs.rmdirSync(cwd+"/.statik", {recursive: true})
        }
        fs.mkdirSync(cwd+"/.statik/heads",{recursive: true})
    
        fs.writeFileSync(cwd+"/.statik/heads/main", "")
        fs.writeFileSync(cwd+"/.statik/HEAD", "main")
        fs.writeFileSync(cwd+"/.statik/SNAPSHOT", "")
        fs.writeFileSync(cwd+"/.statik/CONFIG", JSON.stringify({
            ipfs_node_url: ipfs_node_url
        }))
    
        if(reinitialize){
            console.error("Reinitialized Statik repository in "+cwd+"/.statik")
        }else{
            console.log("Initialized Statik repository in "+cwd+"/.statik")
        }
        process.exit(0)
    }catch(e){
        console.error(e)
        process.exit(1)
    }
}