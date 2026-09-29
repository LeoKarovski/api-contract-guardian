import {
    readdirSync,
    statSync
} from "fs";
import {
    relative,
    join
} from "path";

import { ConsumerParser } from "./consumerParser";

const IGNORED_DIRECTORIES = new Set([
    ".git",
    "node_modules",
    ".vscode",
    ".vscode-test",
    ".next",
    "build",
    "coverage",
    "dist",
    "out"
]);

export function findSourceFiles(
    rootDirectory: string,
    parsers: ConsumerParser[]
): string[] {

    const files: string[] = [];

    function visit(directory: string): void {

        for (const entry of readdirSync(directory)) {

            if (IGNORED_DIRECTORIES.has(entry)) {
                continue;
            }

            const fullPath = join(
                directory,
                entry
            );

            const stat = statSync(fullPath);

            if (stat.isDirectory()) {
                visit(fullPath);
                continue;
            }

            const relativePath =
                relative(
                    rootDirectory,
                    fullPath
                ).replace(/\\/g, "/");

            const supported =
                parsers.some(
                    parser =>
                        parser.supports(relativePath)
                );

            if (supported) {
                files.push(relativePath);
            }
        }
    }

    visit(rootDirectory);

    return files;
}
