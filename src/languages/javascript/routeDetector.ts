import ts from "typescript";
import { ApiContract, HttpMethod } from "../../core/apiContract";
import { JavaScriptRoute } from "./javascriptRoute";

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
): JavaScriptRoute[] {

    const sourceFile = ts.createSourceFile(
        filePath,
        sourceCode,
        ts.ScriptTarget.Latest,
        true
    );

    const routes: JavaScriptRoute[] = [];

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

                    const pathArgument = node.arguments[0];
                    const handlerArgument = node.arguments[1];

                    if (
                        pathArgument &&
                        ts.isStringLiteral(pathArgument) && handlerArgument &&(
                            ts.isArrowFunction(handlerArgument) || ts.isFunctionExpression(handlerArgument)
                        )
                    ) {

                        const { line } =
                            sourceFile.getLineAndCharacterOfPosition(
                                node.getStart(sourceFile)
                            );

                        routes.push({
                            contract:{
                            method: method as HttpMethod,
                            path: pathArgument.text,
                            file: filePath,
                            line: line + 1
                            },
                            handler: handlerArgument
                        });
                    }
                }
            }
        }
    }

    ts.forEachChild(node, visit);
}

    visit(sourceFile);

    return routes;
}