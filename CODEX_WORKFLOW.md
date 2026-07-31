# Codex task workflow

Use GitHub issues as the handoff between ChatGPT and Codex.

## Codex automation instruction

Check this repository for open issues whose title begins with `[Codex]`.

For each new issue:

1. Read the issue and inspect the latest `main` branch.
2. Create a separate branch named `codex/issue-<number>-<short-name>`.
3. Implement only the requested change.
4. Preserve save data, permanent level IDs, and expansion IDs.
5. Test the affected gameplay and existing related features.
6. Commit the changes and open a draft pull request that references the issue.
7. Do not merge the pull request automatically.
8. Add a comment to the issue with the pull-request number and testing summary.

Ignore issues that already have a linked open pull request or are labeled `codex-done`.
