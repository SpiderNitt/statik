#!/usr/bin/node
import { Command } from "commander";
import figlet from "figlet";
import { Init } from "./vc/init.js";
import { Add } from "./vc/stage.js";
import { create } from "ipfs-http-client";
import { Commit } from "./vc/commit.js";
import { Log } from "./vc/history.js";

console.log(figlet.textSync("Statik"));

const program = new Command();
program
  .name("statik")
  .version("1.0.0")
  .description("An IPFS based version control system with static file hosting features")
program.command("init <ipfs_node_url>").description("Initialize a new Statik repository")
program.command("add [file_path]").description("Add a file to the Statik repository")
program.command("commit <message>").description("Commit changes to the Statik repository")
program.command("log").description("View the commit history of the Statik repository")
program.parse(process.argv);

if(program.args.length<1) {
  program.outputHelp()
  process.exit(0)
}


const cwd = process.cwd();
switch (program.args[0]) {
  case "init":
    const ipfs_node_url = program.args[1]
    await Init(cwd,ipfs_node_url);
    break;
  case "add":
    await Add(cwd, program.args.slice(1));
    break;
  case "commit":
    await Commit(cwd, program.args[1]);
    break;
  case "log":
    await Log(cwd);
    break;
  default:
    program.outputHelp();
    process.exit(0)
}
