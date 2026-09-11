import * as assert from "assert";
import { ApiContract } from "../core/apiContract";
import { BreakingChange } from "../core/breakingChange";
import { createDiagnostics } from "../vscode/diagnostics";

suite("Diagnostics", () => {

    test("creates diagnostic for removed endpoint", () => {

        const contracts: ApiContract[] = [
            {
                method: "GET",
                path: "/users/:id",
                file: "server.ts",
                line: 10
            }
        ];

        const changes: BreakingChange[] = [
            {
                type: "REMOVED_ENDPOINT",
                method: "GET",
                path: "/users/:id"
            }
        ];

        const result = createDiagnostics(
            changes,
            contracts
        );

        const diagnostics =
            result.get("server.ts");

        assert.ok(diagnostics);
        assert.strictEqual(
            diagnostics.length,
            1
        );

        assert.strictEqual(
            diagnostics[0].message,
            "API endpoint removed: GET /users/:id"
        );

        assert.strictEqual(
            diagnostics[0].severity,
            0
        );
    });

    test("creates diagnostic for removed response field", () => {

        const contracts: ApiContract[] = [
            {
                method: "GET",
                path: "/users",
                file: "server.ts",
                line: 5,
                response: {
                    fields: [
                        {
                            name: "id",
                            type: "number"
                        }
                    ]
                }
            }
        ];

        const changes: BreakingChange[] = [
            {
                type: "REMOVED_RESPONSE_FIELD",
                method: "GET",
                path: "/users",
                field: "email",
                oldType: "string"
            }
        ];

        const result = createDiagnostics(
            changes,
            contracts
        );

        const diagnostics =
            result.get("server.ts");

        assert.ok(diagnostics);
        assert.strictEqual(
            diagnostics[0].message,
            "Response field removed: email"
        );
    });

    test("ignores changes without a matching contract", () => {

        const changes: BreakingChange[] = [
            {
                type: "REMOVED_ENDPOINT",
                method: "GET",
                path: "/missing"
            }
        ];

        const result = createDiagnostics(
            changes,
            []
        );

        assert.strictEqual(
            result.size,
            0
        );
    });

});