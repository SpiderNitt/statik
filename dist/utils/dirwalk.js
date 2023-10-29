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
//# sourceMappingURL=dirwalk.js.map