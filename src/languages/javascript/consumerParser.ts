import ts from "typescript";
import {
    ConsumerParser
} from "../../core/consumerParser";
import {
    ConsumerReference
} from "../../core/consumer";

interface BreakingChange {
    method: string;
    path: string;
    field?: string;
}

interface ApiRequest {
    variableName: string;
    method: string;
    path: string;
    line: number;
}

export class JavaScriptConsumerParser
    implements ConsumerParser {

    supports(filePath: string): boolean {
        return (
            filePath.endsWith(".js") ||
            filePath.endsWith(".jsx") ||
            filePath.endsWith(".ts") ||
            filePath.endsWith(".tsx")
        );
    }

    findConsumers(
        sourceCode: string,
        filePath: string,
        breakingChanges: BreakingChange[]
    ): ConsumerReference[] {

        const sourceFile = ts.createSourceFile(
            filePath,
            sourceCode,
            ts.ScriptTarget.Latest,
            true
        );

        const requests: ApiRequest[] = [];
        const consumers: ConsumerReference[] = [];

        function visit(node: ts.Node) {

            if (ts.isVariableDeclaration(node)) {

                const initializer =
                    node.initializer;

                if (
                    initializer &&
                    ts.isCallExpression(initializer) &&
                    ts.isIdentifier(initializer.expression) &&
                    initializer.expression.text === "fetch"
                ) {

                    const pathArgument =
                        initializer.arguments[0];

                    if (
                        pathArgument &&
                        ts.isStringLiteral(pathArgument) &&
                        node.name &&
                        ts.isIdentifier(node.name)
                    ) {

                        const line =
                            sourceFile.getLineAndCharacterOfPosition(
                                node.getStart(sourceFile)
                            ).line + 1;

                        requests.push({
                            variableName: node.name.text,
                            method: "GET",
                            path: pathArgument.text,
                            line
                        });
                    }
                }
            }

            if (ts.isPropertyAccessExpression(node)) {

                const propertyName =
                    node.name.text;

                if (!propertyName) {
                    return;
                }

                const object =
                    node.expression;

                if (!ts.isIdentifier(object)) {
                    return;
                }

                const variableName =
                    object.text;

                const request =
                    requests.find(
                        candidate =>
                            candidate.variableName ===
                            variableName
                    );

                if (!request) {
                    return;
                }

                for (const change of breakingChanges) {

                    if (
                        change.method !== request.method ||
                        change.path !== request.path ||
                        !change.field ||
                        propertyName !== change.field
                    ) {
                        continue;
                    }

                    const line =
                        sourceFile.getLineAndCharacterOfPosition(
                            node.getStart(sourceFile)
                        ).line + 1;

                    consumers.push({
                        file: filePath,
                        line,
                        field: propertyName,
                        method: request.method,
                        path: request.path
                    });
                }
            }

            ts.forEachChild(node, visit);
        }

        visit(sourceFile);

        return consumers;
    }
}