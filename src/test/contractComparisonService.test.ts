import * as assert from "assert";
import { execFileSync } from "child_process";
import {
    mkdtempSync,
    writeFileSync
} from "fs";
import { rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import { ContractComparisonService } from "../core/contractComparisonService";
import { JavaScriptParser } from "../languages/javascript/javascriptParser";

suite("Contract Comparison Service", () => {

    test("detects removed endpoint between revisions", async () => {

        const repositoryPath = mkdtempSync(
            join(
                tmpdir(),
                "api-contract-guardian-"
            )
        );

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

        try {

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

            writeFileSync(
                join(repositoryPath, "server.ts"),
                `
                    app.get("/users/:id", (req, res) => {
                        res.json({
                            id: 1
                        });
                    });

                    app.get("/users", (req, res) => {
                        res.json({
                            users: []
                        });
                    });
                `
            );

            runGit(["add", "server.ts"]);
            runGit(["commit", "-m", "initial API"]);

            const oldRevision = runGit([
                "rev-parse",
                "HEAD"
            ]);

            writeFileSync(
                join(repositoryPath, "server.ts"),
                `
                    app.get("/users", (req, res) => {
                        res.json({
                            users: []
                        });
                    });
                `
            );

            runGit(["add", "server.ts"]);
            runGit([
                "commit",
                "-m",
                "remove endpoint"
            ]);

            const newRevision = runGit([
                "rev-parse",
                "HEAD"
            ]);

            const service =
                new ContractComparisonService(
                    repositoryPath,
                    [
                        new JavaScriptParser()
                    ]
                );

            const result = service.compare(
                oldRevision,
                newRevision
            );

            assert.deepStrictEqual(
                result.breakingChanges,
                [
                    {
                        type: "REMOVED_ENDPOINT",
                        method: "GET",
                        path: "/users/:id"
                    }
                ]
            );

        } finally {

            await rm(
                repositoryPath,
                {
                    recursive: true,
                    force: true,
                    maxRetries: 10,
                    retryDelay: 200
                }
            );
        }
    });
});