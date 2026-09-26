# API Contract Guardian

Detect potentially breaking API contract changes before they reach
consumers.

API Contract Guardian is a VS Code extension that compares API contracts
across Git revisions and reports breaking changes directly in the VS
Code Problems panel.

## What it detects

### Removed endpoints

``` text
GET /users/:id
```

If an endpoint existed in the previous revision and is removed, Guardian
reports:

``` text
API endpoint removed: GET /users/:id
```

### Removed response fields

For example:

``` json
{
  "id": 1,
  "email": "komal@example.com"
}
```

becoming:

``` json
{
  "id": 1
}
```

produces:

``` text
Response field removed: email
```

### Response field type changes

For example:

``` text
id: number
```

becoming:

``` text
id: string
```

is reported as a potentially breaking response-contract change.

### Potentially affected consumers

Guardian can identify statically detectable JavaScript/TypeScript
consumers of changed response fields.

For example:

``` javascript
const user = fetch("/users");

user
  .then(response => response.json())
  .then(data => console.log(data.email));
```

If `email` is removed from the `/users` response, Guardian can report a
warning at the consumer location.

> Consumer analysis is intentionally conservative. Dynamic URLs,
> unsupported HTTP clients, and complex data-flow patterns may not be
> detected.

## Git-aware comparison

Guardian understands Git file changes including:

-   Added files
-   Modified files
-   Deleted files

This allows API contracts to be compared even when API source files are
added or removed between revisions.

## How it works

``` text
Git revision
     ↓
Changed files
     ↓
Language parser
     ↓
API contracts
     ↓
Contract comparison
     ↓
Breaking changes
     ↓
Consumer analysis
     ↓
VS Code diagnostics
```

The core comparison engine is kept separate from the VS Code-specific
layer.

## Current language support

### API detection

-   JavaScript
-   TypeScript

### Consumer analysis

-   JavaScript
-   JSX
-   TypeScript
-   TSX

The parser architecture is language-independent so additional languages
can be added later.

## Usage

Open a Git repository containing your API project in VS Code.

Run:

``` text
Ctrl + Shift + P
```

then:

``` text
API Contract Guardian: Scan
```

Guardian asks for the Git revision to compare against.

For example:

``` text
HEAD~1
```

The current `HEAD` is used as the comparison target.

Results are displayed in the VS Code **Problems** panel.

## Example

Suppose the previous revision contains:

``` javascript
app.get("/users", (req, res) => {
    res.json({
        id: 1,
        email: "komal@example.com"
    });
});
```

and the current revision contains:

``` javascript
app.get("/users", (req, res) => {
    res.json({
        id: 1
    });
});
```

Guardian reports:

``` text
❌ Response field removed: email
```

If a consumer uses:

``` javascript
console.log(data.email);
```

Guardian can additionally report:

``` text
⚠️ Potentially affected consumer:
response field "email" is used for GET /users
```

## Development

Clone the repository and install dependencies:

``` bash
npm install
```

Run type checking:

``` bash
npm run check-types
```

Run linting:

``` bash
npm run lint
```

Run the test suite:

``` bash
npm test
```

Build the extension:

``` bash
npm run compile
```

## Testing

The project includes unit, integration, and end-to-end tests covering:

-   Express route detection
-   Response extraction
-   JavaScript/TypeScript parsing
-   Git revision loading
-   Added/modified/deleted Git files
-   API contract comparison
-   Consumer analysis
-   VS Code diagnostics
-   Cross-platform source-file handling

## Architecture

``` text
src/
├── core/
│   ├── API contract models
│   ├── Git integration
│   ├── contract loading
│   ├── contract comparison
│   └── consumer analysis
│
├── languages/
│   └── javascript/
│       ├── route detection
│       ├── response extraction
│       ├── API parser
│       └── consumer parser
│
├── vscode/
│   └── diagnostics
│
└── test/
    └── unit + integration + E2E tests
```

## Limitations

API Contract Guardian currently focuses on statically detectable API
contracts.

It does not attempt to fully understand:

-   Dynamic API URLs
-   Runtime-generated routes
-   Arbitrary HTTP clients
-   Complex cross-file data flow
-   Runtime API behavior
-   Every possible JavaScript/TypeScript coding pattern

A consumer warning should therefore be treated as a potential impact
signal rather than proof of a runtime failure.

## Contributing

Contributions are welcome.
