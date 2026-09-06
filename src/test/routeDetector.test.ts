import * as assert from "assert";
import { detectRoutes } from "../languages/javascript/routeDetector";

suite("Route Detector", () => {

    test("detects Express routes", () => {

        const sourceCode = `
            app.get("/users", handler);
            app.post("/users", handler);
            app.put("/users/:id", handler);
            app.patch("/users/:id", handler);
            app.delete("/users/:id", handler);

            router.get("/products", handler);
            router.post("/products", handler);
        `;

        const result = detectRoutes(sourceCode, "server.ts");

        assert.deepStrictEqual(result, [
            { method: "GET", path: "/users", file: "server.ts", line: 2 },
            { method: "POST", path: "/users", file: "server.ts", line: 3 },
            { method: "PUT", path: "/users/:id", file: "server.ts", line: 4 },
            { method: "PATCH", path: "/users/:id", file: "server.ts", line: 5 },
            { method: "DELETE", path: "/users/:id", file: "server.ts", line: 6 },
            { method: "GET", path: "/products", file: "server.ts", line: 8 },
            { method: "POST", path: "/products", file: "server.ts", line: 9 }
        ]);
    });


    test("ignores non Express objects", () => {

        const sourceCode = `
            foo.get("/not-an-api", handler);
            foo.post("/not-an-api", handler);
        `;

        const result = detectRoutes(sourceCode, "server.ts");

        assert.deepStrictEqual(result, []);
    });


    test("ignores app.use()", () => {

        const sourceCode = `
            app.use("/api", router);
        `;

        const result = detectRoutes(sourceCode, "server.ts");

        assert.deepStrictEqual(result, []);
    });


    test("ignores routes without string paths", () => {

        const sourceCode = `
            app.get(routePath, handler);
        `;

        const result = detectRoutes(sourceCode, "server.ts");

        assert.deepStrictEqual(result, []);
    });

});