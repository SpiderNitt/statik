import fs from 'fs'
export async function List(cwd: string){
    try{
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
    
}