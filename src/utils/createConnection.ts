import {create} from 'ipfs-http-client'

export async function createConnection(ipfs_node_url:string){
    const ipfs = create({url:ipfs_node_url})
    return ipfs
}
