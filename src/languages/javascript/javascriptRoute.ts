import ts from "typescript";
import { ApiContract } from "../../core/apiContract";

export interface JavaScriptRoute {
    contract: ApiContract;
    handler: ts.ArrowFunction | ts.FunctionExpression;
}