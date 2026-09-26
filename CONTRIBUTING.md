# Contributing to API Contract Guardian

Thank you for considering contributing to API Contract Guardian.

## Development setup

Clone the repository and install dependencies:

```bash
npm install
```

## Running checks

Before submitting a change, run:

```bash
npm run check-types
npm run lint
npm test
npm run compile
```

All checks should pass.

## Making changes

Keep changes focused and avoid unrelated refactoring.

For new functionality:

1. Add or update tests.
2. Implement the smallest clear change.
3. Run the complete test suite.
4. Run type checking and linting.
5. Update documentation when behavior changes.

## Architecture

API Contract Guardian separates the core analysis engine from the VS Code integration.

Changes to the core should avoid introducing VS Code-specific dependencies unless they are required by the feature.

Language-specific functionality should use the existing parser abstractions where applicable.

## Pull requests

Please include:

- What changed
- Why the change was needed
- Tests added or updated
- Any known limitations

Keep pull requests focused on one feature or fix when possible.

## Reporting bugs

When reporting a bug, include:

- Operating system
- Node.js version
- VS Code version
- Extension version
- Steps to reproduce
- Relevant error output

Please remove sensitive information before sharing logs or source code.
