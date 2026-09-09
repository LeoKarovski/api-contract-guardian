import { execFileSync } from "child_process";

export class GitService {

    getFileAtRevision(
        filePath: string,
        revision: string
    ): string {

        return execFileSync(
            "git",
            ["show", `${revision}:${filePath}`],
            {
                encoding: "utf-8"
            }
        );
    }
}