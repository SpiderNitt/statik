import fs from "fs"
export function IsStatik(cwd: string){
    if(!fs.existsSync(cwd+"/.statik")){
        console.error("fatal: .statik folder missing!!!")
        process.exit(1)
    }
}