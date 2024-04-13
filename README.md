# Statik: Decentralized Version Control on IPFS
```
  ____  _        _   _ _    
 / ___|| |_ __ _| |_(_) | __
 \___ \| __/ _` | __| | |/ /
  ___) | || (_| | |_| |   < 
 |____/ \__\__,_|\__|_|_|\_\

 ```

An IPFS-based version control system with static file hosting features. Basic functions like repo initiation, staging, committing, branching, and logging have been implemented. (**Under active development**)


## Why Statik?
Traditional version control tools, such as Git repositories, operate under the assumption of a single, centralized blob storage. In the world of IPFS, data is partitioned into chunks and distributed across a network of peers, resulting in an inherently decentralized and immutable data structure. Statik fills the void by enabling version control in this decentralized paradigm, making it a robust alternative to centralized repository hosting services like GitHub.

## Features
Statik is built as a Command Line Interface (CLI) tool using TypeScript, ensuring easy accessibility via the Node Package Manager (npm). Key functionalities have already been implemented, including repository initialization, staging changes, committing, and browsing commit history. We're actively working on adding essential features like branching, merging, commit authorship, and more. Moreover, we plan to utilize DNSLink to establish mutable pointers to commit Content Identifiers (CIDs), potentially turning Statik into an attractive alternative for static file hosting, like GitHub Pages.

## Data Security
It's crucial to be mindful of what you stage with Statik. Since IPFS operates as a transparent and immutable protocol, sensitive information should not be included in the staging process. It's a trade-off for the benefits of decentralization and immutability.

## Performance Consideration
Given Statik's continuous interaction with IPFS nodes, command execution speed may vary. We're actively optimizing performance to provide the best possible experience.

## Why should you contribute to this project?
- Learning Opportunities: Contribute to a project that combines IPFS and version control, gaining knowledge in both domains.
- Open Source Spirit: Delve deep into the open source spirit, fostering transparency and allowing contributors to showcase their skills to a broader audience.
- Impact: Make meaningful contributions that have the potential to revolutionise how version control is approached in a decentralised world.
- New Technology: Work with the latest advancements in decentralised technologies and version control systems.

## Target Audience
- Developers
- Open-source Enthusiasts
- People having an interest in decentralisation

## Goals
- Decentralised version control system: Build a project that has version control features in a decentralised manner utilising IPFS
- Multiuser support: Have multiple users author commits and have flexibility to branch out, merge branches etc.
- Mutable pointers: Have a feature to host static content (similar to Github pages) and assign human readable URLs to them using IPNS (InterPlanetary Name System) and DNS linking. 
- Scalability testing: Ensuring that Statik remains performant and reliable as the size of repositories and user interactions increases.

## Demo
![demo](assets/demo.gif)

### Requirements
- Node v18.17.1
- npm v9.6.7

### Installation
- Run yourself,
```bash
$ git clone https://github.com/SpiderNitt/statik
$ npm i
$ npm start
```
- or from Node Package Manager,
```bash
$ npm install -g statikvc
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

  branch                List all branches in the Statik repository
  
  jump <branch>         Switch between branches
  
  help [command]        display help for command
```
