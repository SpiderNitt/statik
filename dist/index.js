#!/usr/bin/node
import { Command } from "commander";
import figlet from "figlet";
import { Init } from "./vc/init.js";
import { Add } from "./vc/stage.js";
import { Commit } from "./vc/commit.js";
import { Log } from "./vc/history.js";
import { Jump, List } from "./vc/branching.js";
const program = new Command();
program
    .name("statik")
    .version("1.1.2-alpha")
    .description(figlet.textSync("Statik") + "\nAn IPFS based version control system with static file hosting features");
program.command("init <ipfs_node_url>").description("Initialize a new Statik repository");
program.command("add [file_path]").description("Add a file to the Statik repository");
program.command("commit <message>").description("Commit changes to the Statik repository");
program.command("log").description("View the commit history of the current branch");
program.command("branch").description("List all branches in the Statik repository");
program.command("jump <branch>").description("Switch between branches");
program.parse(process.argv);
if (program.args.length < 1) {
    program.outputHelp();
    process.exit(0);
}
const cwd = process.cwd();
switch (program.args[0]) {
    case "init":
        const ipfs_node_url = program.args[1];
        Init(cwd, ipfs_node_url);
        break;
    case "add":
        Add(cwd, program.args.slice(1));
        break;
    case "commit":
        Commit(cwd, program.args[1]);
        break;
    case "log":
        Log(cwd);
        break;
    case "branch":
        List(cwd);
        break;
    case "jump":
        Jump(cwd, program.args[1]);
        break;
    default:
        program.outputHelp();
        process.exit(0);
}
//# sourceMappingURL=index.js.map