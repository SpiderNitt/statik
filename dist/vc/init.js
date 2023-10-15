import fs from "fs";
export async function Init(cwd, ipfs_node_url) {
    try {
        let reinitialize = false;
        if (fs.existsSync(cwd + "/.statik")) {
            reinitialize = true;
            fs.rmSync(cwd + "/.statik", { recursive: true });
        }
        fs.mkdirSync(cwd + "/.statik");
        fs.mkdirSync(cwd + "/.statik/refs/heads", { recursive: true });
        fs.writeFileSync(cwd + "/.statik/HEAD", "");
        fs.writeFileSync(cwd + "/.statik/SNAPSHOT", "");
        fs.writeFileSync(cwd + "/.statik/CONFIG", JSON.stringify({
            ipfs_node_url: ipfs_node_url
        }));
        if (reinitialize) {
            console.error("Reinitialized Statik repository in " + cwd + "/.statik");
        }
        else {
            console.log("Initialized Statik repository in " + cwd + "/.statik");
        }
        process.exit(0);
    }
    catch (e) {
        console.error(e);
        process.exit(1);
    }
}
//# sourceMappingURL=init.js.map