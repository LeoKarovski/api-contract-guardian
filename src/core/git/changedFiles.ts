import {execFileSync} from "child_process";

export function getChangedFiles(
    oldRevision: string,
    newRevision: string
): string[] {

    const output = execFileSync(
        "git",
        ["diff", "--name-only", oldRevision, newRevision],
        {
            encoding: "utf-8"
        }
    );

    return output
        .split(/\r?\n/)
        .map(file => file.trim())
        .filter(Boolean);
}