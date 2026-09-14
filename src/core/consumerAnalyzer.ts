import { ConsumerReference } from "./consumer";
import { ConsumerParser } from "./consumerParser";
import { BreakingChange } from "./breakingChange";

export function findConsumers(
    breakingChanges: BreakingChange[],
    filePaths: string[],
    sourceFiles: Map<string, string>,
    parsers: ConsumerParser[]
): ConsumerReference[] {

    const consumers: ConsumerReference[] = [];

    for (const filePath of filePaths) {

        const parser = parsers.find(
            candidate => candidate.supports(filePath)
        );

        if (!parser) {
            continue;
        }

        const sourceCode = sourceFiles.get(filePath);

        if (sourceCode === undefined) {
            continue;
        }

        consumers.push(
            ...parser.findConsumers(
                sourceCode,
                filePath,
                breakingChanges
            )
        );
    }

    return consumers;
}