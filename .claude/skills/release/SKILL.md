---
name: release
description: Create a new release with version bump and changelog
disable-model-invocation: false
---

# Release

Create a new release for the MeSame project with version bump, changelog generation, commit, and tag.

## Steps

### 1. Determine Version Bump

Ask the user for the version bump type: `patch`, `minor`, or `major`. Or accept it as an argument.

### 2. Version Bump

```bash
cd /home/openhoat/work/mesame
npm version <patch|minor|major> --no-git-tag-version
```

This updates the version in `package.json` without creating a git tag yet.

### 3. Generate Changelog

```bash
cd /home/openhoat/work/mesame && npm run changelog
```

### 4. Commit and Tag

```bash
cd /home/openhoat/work/mesame
VERSION=$(node -p "require('./package.json').version")
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore: release v${VERSION}"
git tag "v${VERSION}"
```

### 5. Push (Optional)

If the user confirms, push the commit and tag:

```bash
cd /home/openhoat/work/mesame
git push
git push --tags
```

## Important

- Must be on the `main` branch.
- Ensure all validation passes before releasing.
- Uses `npm version` directly (no custom bump-version script).
- The project root is `/home/openhoat/work/mesame`.
