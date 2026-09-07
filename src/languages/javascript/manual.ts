import { detectRoutes } from "./routeDetector";
import { extractResponseContract } from "./responseExtractor";

const sourceCode = `
    app.get("/users/:id", (req, res) => {
        res.json({
            id: 1,
            name: "Komal",
            email: "komal@example.com",
            active: true
        });
    });
`;

const routes = detectRoutes(sourceCode, "server.ts");

console.log("Routes:");
console.log(routes);

console.log("\nResponse Contract:");

const response = extractResponseContract(routes[0]);

console.log(response);