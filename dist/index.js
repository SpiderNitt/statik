"use strict";
const { Command } = require("commander");
const figlet = require("figlet");
const program = new Command();
program
    .version("1.0.0")
    .description("An IPFS based version control system with static file hosting features")
    .parse(process.argv);
const options = program.opts();
console.log(options);
console.log(figlet.textSync("Statik"));
//# sourceMappingURL=index.js.map