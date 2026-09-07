import * as assert from "assert";
import { detectRoutes } from "../languages/javascript/routeDetector";
import ts from "typescript";

suite("Route Detector", () => {

    test("detects Express routes", () => {

        const sourceCode = `
            app.get("/users", (req, res) => {
                res.json({ id: 1 });
            });

            app.post("/users", (req, res) => {
                res.json({ success: true });
            });

            app.put("/users/:id", (req, res) => {
                res.json({ id: 1 });
            });

            app.patch("/users/:id", (req, res) => {
                res.json({ id: 1 });
            });

            app.delete("/users/:id", (req, res) => {
                res.sendStatus(204);
            });

            router.get("/products", (req, res) => {
                res.json([]);
            });

            router.post("/products", (req, res) => {
                res.json({});
            });
        `;

        const result = detectRoutes(sourceCode, "server.ts");

        assert.strictEqual(result.length, 7);

        assert.strictEqual(result[0].contract.method, "GET");
        assert.strictEqual(result[0].contract.path, "/users");

        assert.strictEqual(result[1].contract.method, "POST");
        assert.strictEqual(result[1].contract.path, "/users");

        assert.strictEqual(result[2].contract.method, "PUT");
        assert.strictEqual(result[2].contract.path, "/users/:id");

        assert.strictEqual(result[3].contract.method, "PATCH");
        assert.strictEqual(result[3].contract.path, "/users/:id");

        assert.strictEqual(result[4].contract.method, "DELETE");
        assert.strictEqual(result[4].contract.path, "/users/:id");

        assert.strictEqual(result[5].contract.method, "GET");
        assert.strictEqual(result[5].contract.path, "/products");

        assert.strictEqual(result[6].contract.method, "POST");
        assert.strictEqual(result[6].contract.path, "/products");
    });


    test("ignores non Express objects", () => {

        const sourceCode = `
            foo.get("/not-an-api", (req, res) => {
                res.json({});
            });
        `;

        const result = detectRoutes(sourceCode, "server.ts");

        assert.strictEqual(result.length, 0);
    });


    test("ignores app.use()", () => {

        const sourceCode = `
            app.use("/api", router);
        `;

        const result = detectRoutes(sourceCode, "server.ts");

        assert.strictEqual(result.length, 0);
    });


    test("ignores routes without string paths", () => {

        const sourceCode = `
            const routePath = "/users";

            app.get(routePath, (req, res) => {
                res.json({});
            });
        `;

        const result = detectRoutes(sourceCode, "server.ts");

        assert.strictEqual(result.length, 0);
    });


    test("captures the route handler", () => {

        const sourceCode = `
            app.get("/users", (req, res) => {
                res.json({
                    id: 1
                });
            });
        `;

        const result = detectRoutes(sourceCode, "server.ts");

        assert.strictEqual(result.length, 1);
        assert.ok(result[0].handler);
        assert.ok(ts.isArrowFunction(result[0].handler));
    });

});