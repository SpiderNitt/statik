import fs from 'fs';
import path from 'path';
export function* readAllFiles(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    const cwd = process.cwd();
    for (const file of files) {
        if (file.isDirectory()) {
            yield* readAllFiles(path.join(dir, file.name));
        }
        else {
            yield path.relative(cwd, path.join(dir, file.name));
        }
    }
}
export function deleteAllFiles(dir, exempt) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    const cwd = process.cwd();
    for (const file of files) {
        if (file.isDirectory()) {
            deleteAllFiles(path.join(dir, file.name), exempt);
        }
        if (!exempt.includes(path.relative(cwd, path.join(dir, file.name)))) {
            if (file.isFile()) {
                fs.unlinkSync(path.join(dir, file.name));
            }
            else if (file.isDirectory() && !fs.readdirSync(path.join(dir, file.name)).length) {
                fs.rmdirSync(path.join(dir, file.name));
            }
        }
    }
    return;
}
//# sourceMappingURL=dirwalk.js.map