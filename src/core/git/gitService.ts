import { execFileSync } from "child_process";

export class GitService {
    constructor(
        private readonly workingDirectory: string = process.cwd()
    ) {}
    getFileAtRevision(
        filePath: string,
        revision: string
    ): string {

        return execFileSync(
            "git",
            ["show", `${revision}:${filePath}`],
            {
                cwd: this.workingDirectory,
                encoding: "utf-8"
            }
        );
    }
}