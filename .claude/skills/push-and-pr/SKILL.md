---
name: push-and-pr
description: Push branch and create a pull request
disable-model-invocation: false
---

# Push and Create PR

Push the current branch to the remote and create a pull request using GitHub CLI.

## Steps

### 1. Push Branch

```bash
git push -u origin "$(git rev-parse --abbrev-ref HEAD)"
```

### 2. Create Pull Request

```bash
gh pr create --title "<title>" --body "$(cat <<'EOF'
## Summary
- Description of changes

## Test plan
- [ ] Validation passes (`npm run validate`)
- [ ] Tests pass (`npm run test`)
EOF
)"
```

## Guidelines

- Infer the PR title from the branch name and recent commit messages.
- Write a clear summary of the changes in the PR body.
- Include a test plan checklist.
- If the branch is already pushed and up-to-date, skip the push step.

## Important

- The main project is at `/home/openhoat/work/mesame`.
- Feature worktrees are at `/home/openhoat/work/mesame-<name>`.
- Use `gh` CLI for PR creation - ensure it is available.
