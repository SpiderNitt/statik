import { create, globSource } from "ipfs-http-client";
import { IsStatik } from "../utils/checkStatik.js";
import fs from 'fs'
import { FetchConfig } from "../utils/fetchConfig.js";

export async function Log(cwd: string){
    IsStatik(cwd)
    const client = create({url: FetchConfig(cwd).ipfs_node_url})
    let head = fs.readFileSync(cwd+"/.statik/HEAD").toString()
    let asyncitr = client.cat(head)
    console.log("Commit history: ")
    while(head.length){
        for await(const itr of asyncitr){
            const data = Buffer.from(itr).toString()
            console.log("<"+head+">"+" "+JSON.parse(data).message)
            head = JSON.parse(data).prevCommit
            asyncitr = client.cat(head)
        }
    }
    process.exit(0)
}