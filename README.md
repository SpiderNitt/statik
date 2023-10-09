# Statik

```
 / ___|| |_ __ _| |_(_) | __
 \___ \| __/ _` | __| | |/ /
  ___) | || (_| | |_| |   < 
 |____/ \__\__,_|\__|_|_|\_\
 ```
An IPFS-based version control system with static file hosting features. Basic functions like repo initiation, staging, committing, and logging have been implemented. (**Under development**)
### Description 
Statik is a version control tool built on the InterPlanetary File System (IPFS). This project leverages content addressing through the linked hash data storage format within IPFS. Furthermore, data remains immutable and decentralized. In IPFS, data is divided into chunks and distributed across multiple peers. Consequently, traditional version control tools, like Git repositories, cannot be stored directly, as they expect a single blob. Statik is a viable alternative to centralized repository hosting services such as GitHub.

Statik is a Command Line Interface (CLI) tool developed using TypeScript and is readily available through the Node Package Manager (npm). So far, essential functions like initializing a repository, staging changes, committing, and viewing the commit history have been implemented. Other vital features, including branching, merging, commit authorship, and more, are actively in development. Additionally, DNSLink will be employed to create mutable pointers to commit Content Identifiers (CIDs). Therefore, Statik could be an alternative to static file hosting services, such as GitHub Pages.

It's important to note that sensitive information should not be included in the staging process, given that IPFS operates as a transparent and immutable protocol. Another potential drawback is the command execution speed, as Statik must constantly interact with IPFS nodes.

### Requirements
- Node v18.17.1
- npm v9.6.7

### Installation
- Run yourself,
```bash
$ git clone https://github.com/SANTHOSH17-DOT/statik
$ npm i
$ npm start
```
- or from Node Package Manager,
```bash
$ npm install -g statik
```

### Usage
```bash
$ statik help
```
**Options:**
```
  -V, --version         output the version number

  -h, --help            display help for command
```
**Commands:**
```
  init <ipfs_node_url>  Initialize a new Statik repository

  add [file_path]       Add a file to the Statik repository

  commit <message>      Commit changes to the Statik repository

  log                   View the commit history of the Statik repository

  help [command]        display help for command
```
