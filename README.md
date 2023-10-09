# Statik
An IPFS based version control system with static file hosting features. Basic functions like repo initiation, staging, commiting, and logging have been implemeted. (**Under development**)

```
 / ___|| |_ __ _| |_(_) | __
 \___ \| __/ _` | __| | |/ /
  ___) | || (_| | |_| |   < 
 |____/ \__\__,_|\__|_|_|\_\
 ```

### Requirements
- Node v18.17.1
- npm v9.6.7

### Installation
- Run yourself,
```bash
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