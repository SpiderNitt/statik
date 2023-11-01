import { CID } from "ipfs-http-client";
export function multihashToCID(cid:any){
    const {code,version,hash} = cid
    const bytes = new Uint8Array(Object.values(hash))
    return new CID(version,code,cid,bytes)
}