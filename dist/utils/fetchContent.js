export async function commitContent(commitId, client) {
    let asyncitr = client.cat(commitId);
    let prevSnapshot = "";
    for await (const itr of asyncitr) {
        const data = Buffer.from(itr).toString();
        prevSnapshot = JSON.parse(data).snapshot;
    }
    let prevContent = [];
    asyncitr = client.cat(prevSnapshot);
    for await (const itr of asyncitr) {
        const data = Buffer.from(itr).toString();
        prevContent = JSON.parse(data);
    }
    return prevContent;
}
//# sourceMappingURL=fetchContent.js.map