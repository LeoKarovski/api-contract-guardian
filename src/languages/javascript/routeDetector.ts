import ts from "typescript";
import { ApiContract, HttpMethod } from "../../core/apiContract";

const HTTP_METHODS: HttpMethod[] = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE"
];

export function detectRoutes(
    sourceCode: string,
    filePath: string
): ApiContract[] {

    const sourceFile = ts.createSourceFile(
        filePath,
        sourceCode,
        ts.ScriptTarget.Latest,
        true
    );

    const contracts: ApiContract[] = [];

    function visit(node: ts.Node) {

    if (ts.isCallExpression(node)) {

        const expression = node.expression;

        if (ts.isPropertyAccessExpression(expression)) {

            const object = expression.expression;

            const isExpressObject =
                ts.isIdentifier(object) &&
                (object.text === "app" || object.text === "router");

            if (isExpressObject) {

                const method = expression.name.text.toUpperCase();

                if (HTTP_METHODS.includes(method as HttpMethod)) {

                    const firstArgument = node.arguments[0];

                    if (
                        firstArgument &&
                        ts.isStringLiteral(firstArgument)
                    ) {

                        const { line } =
                            sourceFile.getLineAndCharacterOfPosition(
                                node.getStart(sourceFile)
                            );

                        contracts.push({
                            method: method as HttpMethod,
                            path: firstArgument.text,
                            file: filePath,
                            line: line + 1
                        });
                    }
                }
            }
        }
    }

    ts.forEachChild(node, visit);
}

    visit(sourceFile);

    return contracts;
}