# Security Policy

## Reporting Security Issues

If you discover a security vulnerability in MeSame, please report it responsibly:

**Email**: openhoat@gmail.com

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will respond within 48 hours and work with you to address the issue.

## Security Principles

MeSame is designed with security and privacy in mind:

### Local-First Analysis
- **Document analysis runs entirely on your machine** — zero cloud exposure
- Your writing samples never leave your computer during style extraction
- No external API calls for document parsing or linguistic analysis

### Network Security
- **CORS restricted to localhost** — API only accepts requests from local origin
- Default binding to `127.0.0.1` — no external network access
- HTTPS support via reverse proxy (nginx, Caddy)

### Data Protection
- **No data retention** — only stores your style profile locally (SQLite)
- **API keys secured** — stored in environment files or Electron secure storage
- **No telemetry** — no tracking, analytics, or usage data collection

### API Proxy Security
- **OpenAI-compatible proxy** — acts as intermediary between client and LLM
- **Style injection only** — no modification of user data beyond adding style context
- **Transparent forwarding** — preserves original request/response structure

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Security Best Practices

When deploying MeSame:

1. **API Keys**: Store API keys in `.env` files (never commit to Git)
2. **Network**: Keep the proxy bound to localhost unless using reverse proxy
3. **Updates**: Keep dependencies up to date with `npm audit`
4. **HTTPS**: Use a reverse proxy (nginx) for production HTTPS deployments
5. **Backups**: Regularly backup your SQLite database and `.env` configuration

## Known Limitations

- **No rate limiting** (planned) — proxy currently lacks DoS protection
- **No request validation** (planned) — incoming requests not validated with schema
- **Logging** — debug logs may contain sensitive data (use `MESAME_LOG_LEVEL=info` in production)

## Vulnerability Disclosure Timeline

1. **Report received** — Acknowledgment within 48 hours
2. **Investigation** — Assessment within 1 week
3. **Fix development** — Patch created and tested
4. **Coordinated disclosure** — Public disclosure after fix is released
5. **Credit** — Reporter credited in release notes (unless anonymity requested)

## Contact

For security concerns, contact: openhoat@gmail.com
