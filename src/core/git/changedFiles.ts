import {execFileSync} from "child_process";

export function getChangedFiles(
    oldRevision: string,
    newRevision: string,
    workingDirectory: string = process.cwd()
): string[] {

    const output = execFileSync(
        "git",
        ["diff", "--name-only", oldRevision, newRevision],
        {
            cwd: workingDirectory,
            encoding: "utf-8"
        }
    );

    return output
        .split(/\r?\n/)
        .map(file => file.trim())
        .filter(Boolean);
}