import fs from "fs";
export function FetchConfig(cwd:string){
    if(fs.existsSync(process.cwd()+"/.statik/CONFIG")){
        let config = JSON.parse(fs.readFileSync(process.cwd()+"/.statik/CONFIG").toString())
        return config
    }else{
        console.error("statik config not found in "+cwd+"/.statik")
        process.exit(1)
    }
}