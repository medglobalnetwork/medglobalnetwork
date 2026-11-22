---
trigger: always_on
description: Always prioritize and use the graphify knowledge graph at graphify-out/ for all codebase exploration, architecture lookups, dependency checks, and navigation to maximize speed and eliminate slow multi-file greps.
---

## graphify Knowledge Graph Priority (Fast-Path)

This project has an active graphify knowledge graph at `graphify-out/` with 15,600+ indexed AST nodes and 31,000+ relationships.

### Mandatory Rules for Maximum Speed:
1. **Always Consult Graph First**: Before doing slow recursive file greps or reading multiple files across directories, run `graphify query "<term>"` or `graphify explain "<component/symbol>"`. It returns exact locations, callers, dependencies, and file paths in < 1 second.
2. **Relationship Tracing**: Use `graphify path "<Source>" "<Target>"` to immediately trace how two components, endpoints, or database tables connect.
3. **Markdown Sections**: Use `graphify section "<heading>"` to read documentation/spec sections directly without opening large markdown files.
4. **Auto-Sync**: After editing code in a session, run `graphify update .` to keep AST nodes fresh without any LLM API cost.
