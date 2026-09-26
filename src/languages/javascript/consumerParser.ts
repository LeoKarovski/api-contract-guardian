import ts from "typescript";

import { ConsumerParser } from "../../core/consumerParser";
import { ConsumerReference } from "../../core/consumer";

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

        const requests = new Map<string, ApiRequest>();
        const consumers: ConsumerReference[] = [];
        const seen = new Set<string>();

        const addConsumer = (
            fieldNode: ts.PropertyAccessExpression,
            request: ApiRequest,
            change: BreakingChange
        ): void => {

            if (
                change.method !== request.method ||
                change.path !== request.path ||
                !change.field ||
                fieldNode.name.text !== change.field
            ) {
                return;
            }

            const line =
                sourceFile.getLineAndCharacterOfPosition(
                    fieldNode.getStart(sourceFile)
                ).line + 1;

            const key =
                `${filePath}:${line}:${change.field}`;

            if (seen.has(key)) {
                return;
            }

            seen.add(key);

            consumers.push({
                file: filePath,
                line,
                field: fieldNode.name.text,
                method: request.method,
                path: request.path
            });
        };

        const getFetchRequest = (
            node: ts.Expression
        ): ApiRequest | undefined => {

            // fetch("/users")
            if (
                ts.isCallExpression(node) &&
                ts.isIdentifier(node.expression) &&
                node.expression.text === "fetch"
            ) {

                const argument = node.arguments[0];

                if (
                    argument &&
                    ts.isStringLiteral(argument)
                ) {
                    return {
                        variableName: "",
                        method: "GET",
                        path: argument.text,
                        line:
                            sourceFile
                                .getLineAndCharacterOfPosition(
                                    node.getStart(sourceFile)
                                )
                                .line + 1
                    };
                }
            }

            // const user = ...
            if (ts.isIdentifier(node)) {
                return requests.get(node.text);
            }

            // user.then(...).then(...)
            if (
                ts.isCallExpression(node) &&
                ts.isPropertyAccessExpression(
                    node.expression
                ) &&
                node.expression.name.text === "then"
            ) {
                return getFetchRequest(
                    node.expression.expression
                );
            }

            return undefined;
        };

        const inspectCallback = (
            callbackBody: ts.Node,
            parameterName: string,
            request: ApiRequest
        ): void => {

            function visitCallback(node: ts.Node): void {

                if (
                    ts.isPropertyAccessExpression(node) &&
                    ts.isIdentifier(node.expression) &&
                    node.expression.text === parameterName
                ) {
                    for (const change of breakingChanges) {
                        addConsumer(
                            node,
                            request,
                            change
                        );
                    }
                }

                ts.forEachChild(
                    node,
                    visitCallback
                );
            }

            visitCallback(callbackBody);
        };

        function visit(node: ts.Node): void {

            /*
             * const user = fetch("/users")
             */
            if (ts.isVariableDeclaration(node)) {

                const initializer =
                    node.initializer;

                if (
                    initializer &&
                    ts.isIdentifier(node.name)
                ) {

                    const request =
                        getFetchRequest(
                            initializer
                        );

                    if (request) {

                        requests.set(
                            node.name.text,
                            {
                                ...request,
                                variableName:
                                    node.name.text
                            }
                        );
                    }
                }
            }

            /*
             * console.log(user.email)
             */
            if (
                ts.isPropertyAccessExpression(node) &&
                ts.isIdentifier(node.expression)
            ) {

                const request =
                    requests.get(
                        node.expression.text
                    );

                if (request) {

                    for (const change of breakingChanges) {
                        addConsumer(
                            node,
                            request,
                            change
                        );
                    }
                }
            }

            /*
             * user.then(...)
             *
             * Also handles:
             *
             * user
             *   .then(response => response.json())
             *   .then(data => console.log(data.email))
             */
            if (
                ts.isCallExpression(node) &&
                ts.isPropertyAccessExpression(
                    node.expression
                ) &&
                node.expression.name.text === "then"
            ) {

                const baseExpression =
                    node.expression.expression;

                const request =
                    getFetchRequest(
                        baseExpression
                    );

                if (request) {

                    const callback =
                        node.arguments.find(
                            argument =>
                                ts.isArrowFunction(argument) ||
                                ts.isFunctionExpression(argument)
                        );

                    if (
                        callback &&
                        callback.parameters.length > 0
                    ) {

                        const parameter =
                            callback.parameters[0].name;

                        if (ts.isIdentifier(parameter)) {

                            inspectCallback(
                                callback.body,
                                parameter.text,
                                request
                            );
                        }
                    }
                }
            }

            ts.forEachChild(
                node,
                visit
            );
        }

        visit(sourceFile);

        return consumers;
    }
}