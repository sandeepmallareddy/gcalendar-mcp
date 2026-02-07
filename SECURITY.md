# Security Policy

## Supported Versions

The following versions of gcalendar-mcp are currently supported with security updates:

| Version | Supported |
|---------|--------|
| Latest (main branch) | Yes |
| Previous releases | Until next major version |

## Reporting a Vulnerability

We take the security of gcalendar-mcp seriously. If you believe you have found a security vulnerability, please report it to us responsibly.

### How to Report

1. **Do NOT** open a public issue on GitHub
2. Email your report to: **sandeepmallareddy.com@gmail.com**
3. Include as much detail as possible:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any ideas for fix (if you have them)

### What to Expect

After you submit your report:

1. **Acknowledgment**: We'll acknowledge your report within 24-48 hours
2. **Assessment**: We'll assess the vulnerability and its severity
3. **Update**: We'll keep you informed of our progress
4. **Resolution**: Once fixed, we'll notify you and credit you (unless you prefer to remain anonymous)

## Security Best Practices

### For Users

1. **Keep credentials secure**: Never commit Google OAuth credentials to the repository
2. **Use environment variables**: Store sensitive data in `.env` files (already gitignored)
3. **Token storage**: Tokens are stored in `~/.config/gcalendar-mcp/` - ensure this directory has proper permissions:
   ```bash
   chmod 700 ~/.config/gcalendar-mcp
   chmod 600 ~/.config/gcalendar-mcp/tokens.json
   ```

### For Developers

1. **No hardcoded secrets**: Never hardcode credentials, API keys, or tokens
2. **Use the SDK securely**: Follow Google's OAuth 2.0 best practices
3. **Validate inputs**: All MCP tool inputs are validated with Zod

## Scope

This security policy applies to:
- The gcalendar-mcp server code
- Build and deployment scripts
- CI/CD workflows

This policy does NOT apply to:
- Google Calendar API itself (report to Google)
- Claude Code client (report to Anthropic)
- Third-party dependencies (report to respective maintainers)

## Acknowledgments

We appreciate the security community's help in keeping gcalendar-mcp secure. Thank you for your responsible disclosure!
