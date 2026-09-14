import { readFileSync } from "fs";
import { join } from "path";

import { BreakingChange } from "./breakingChange";
import { ConsumerReference } from "./consumer";
import { ConsumerParser } from "./consumerParser";
import { findConsumers } from "./consumerAnalyzer";
import { findSourceFiles } from "./sourceFileScanner";

export class ConsumerAnalysisService {

    constructor(
        private readonly workspacePath: string,
        private readonly parsers: ConsumerParser[]
    ) {}

    analyze(
        breakingChanges: BreakingChange[]
    ): ConsumerReference[] {

        if (breakingChanges.length === 0) {
            return [];
        }

        const filePaths =
            findSourceFiles(
                this.workspacePath,
                this.parsers
            );

        const sourceFiles =
            new Map<string, string>();

        for (const filePath of filePaths) {

            const sourceCode =
                readFileSync(
                    join(
                        this.workspacePath,
                        filePath
                    ),
                    "utf-8"
                );

            sourceFiles.set(
                filePath,
                sourceCode
            );
        }

        return findConsumers(
            breakingChanges,
            filePaths,
            sourceFiles,
            this.parsers
        );
    }
}