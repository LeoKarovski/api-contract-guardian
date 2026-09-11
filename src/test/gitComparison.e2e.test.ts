import * as assert from "assert";
import { execFileSync } from "child_process";
import {
    mkdtempSync,
    writeFileSync
} from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { rm } from "fs/promises";
import { compareApiContracts } from "../core/apiComparator";
import { ContractLoader } from "../core/contract/contractLoader";
import { GitService } from "../core/git/gitService";
import { getChangedFiles } from "../core/git/changedFiles";
import { JavaScriptParser } from "../languages/javascript/javascriptParser";

suite("Git Comparison E2E",() => {

    test("detects a removed endpoint between Git revisions", async function () {
        this.timeout(10000);
        const repositoryPath = mkdtempSync(
            join(
                tmpdir(),
                "api-contract-guardian-"
            )
        );

        try {

            const runGit = (args: string[]) => {
                return execFileSync(
                    "git",
                    args,
                    {
                        cwd: repositoryPath,
                        encoding: "utf-8"
                    }
                ).trim();
            };

            runGit(["init"]);
            runGit([
                "config",
                "user.email",
                "test@example.com"
            ]);
            runGit([
                "config",
                "user.name",
                "API Contract Guardian Test"
            ]);

            const oldSource = `
                app.get("/users/:id", (req, res) => {
                    res.json({
                        id: 1,
                        name: "Komal"
                    });
                });

                app.get("/users", (req, res) => {
                    res.json({
                        users: []
                    });
                });
            `;

            writeFileSync(
                join(repositoryPath, "server.ts"),
                oldSource
            );

            runGit(["add", "server.ts"]);
            runGit([
                "commit",
                "-m",
                "initial API"
            ]);

            const oldRevision = runGit([
                "rev-parse",
                "HEAD"
            ]);

            const newSource = `
                app.get("/users", (req, res) => {
                    res.json({
                        users: []
                    });
                });
            `;

            writeFileSync(
                join(repositoryPath, "server.ts"),
                newSource
            );

            runGit(["add", "server.ts"]);
            runGit([
                "commit",
                "-m",
                "remove user endpoint"
            ]);

            const newRevision = runGit([
                "rev-parse",
                "HEAD"
            ]);

            const changedFiles = getChangedFiles(
                oldRevision,
                newRevision,
                repositoryPath
            );

            assert.deepStrictEqual(
    changedFiles,
    [
        {
            path: "server.ts",
            type: "MODIFIED"
        }
    ]
);

            const loader = new ContractLoader(
                new GitService(repositoryPath),
                [
                    new JavaScriptParser()
                ]
            );

            const oldContracts =
    loader.loadFromRevision(
        changedFiles.map(
            change => change.path
        ),
        oldRevision
    );

const newContracts =
    loader.loadFromFiles(
        changedFiles.map(
            change => change.path
        ),
        repositoryPath
    );

            const breakingChanges =
                compareApiContracts(
                    oldContracts,
                    newContracts
                );

            assert.deepStrictEqual(
                breakingChanges,
                [
                    {
                        type: "REMOVED_ENDPOINT",
                        method: "GET",
                        path: "/users/:id"
                    }
                ]
            );

            assert.notStrictEqual(
                oldRevision,
                newRevision
            );

        } 
        finally {
    await rm(
        repositoryPath,
        {
            recursive: true,
            force: true,
            maxRetries: 3,
            retryDelay: 100
        }
    );
}
    });
});