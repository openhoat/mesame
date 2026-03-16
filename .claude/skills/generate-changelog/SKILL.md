---
name: generate-changelog
description: Regenerate the CHANGELOG.md file
disable-model-invocation: false
---

# Generate Changelog

Regenerate the CHANGELOG.md file for the MeSame project.

## Command

```bash
cd /home/openhoat/work/mesame && npm run changelog
```

This regenerates `CHANGELOG.md` based on the git commit history using conventional commits.

## Post-Generation

After generating, review the output:
1. Verify the changelog entries are correct.
2. Check that the formatting is consistent.
3. The file is at `/home/openhoat/work/mesame/CHANGELOG.md`.

## Important

- Run from the main project root: `/home/openhoat/work/mesame`.
- This should typically be run on the `main` branch after merges.
