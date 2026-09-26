# Changelog

All notable changes to API Contract Guardian are documented here.

## [1.0.0] - 2026-09-26

### Added

- Express API route detection for JavaScript and TypeScript.
- API response contract extraction from `res.json()`.
- Detection of removed API endpoints.
- Detection of removed response fields.
- Detection of response field type changes.
- Git-aware comparison of added, modified, and deleted files.
- Git revision comparison through the VS Code command palette.
- VS Code Problems-panel diagnostics for breaking changes.
- Static JavaScript/TypeScript consumer analysis.
- Potential consumer warnings for statically detectable response-field usage.
- Cross-platform source-file scanning.
- Automated unit, integration, and end-to-end tests.
- GitHub Actions CI.

### Limitations

- Consumer analysis is intentionally conservative.
- Dynamic API URLs are not fully analyzed.
- Runtime-generated routes are not analyzed.
- Arbitrary HTTP clients and complex cross-file data flow are not fully supported.