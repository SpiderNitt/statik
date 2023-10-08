import { createHelia } from "helia";
import { Command } from "commander";
import figlet from "figlet";
const program = new Command();
program
    .version("1.0.0")
    .description("An IPFS based version control system with static file hosting features")
    .parse(process.argv);
const options = program.opts();
const node = await createHelia();
console.info('PeerId:', node.libp2p.peerId.toString());
console.log(figlet.textSync("Statik"));
//# sourceMappingURL=index.js.map