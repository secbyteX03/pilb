# Security Policy

## Supported Versions

We currently support the following versions of PILB:

| Version | Supported         |
| ------- | ----------------- |
| 1.0.x   | ✅ Active Support |
| < 1.0   | ❌ Not Supported  |

## Reporting a Vulnerability

If you discover a security vulnerability, please send an email to the maintainers. All security vulnerabilities will be promptly addressed.

Please include the following information:

- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

## Security Measures

### Encryption

- All sensitive data is encrypted using AES-256
- Encryption keys are never stored in plain text
- Environment variables are used for secrets

### Authentication

- SEP-10 authentication for Stellar wallet connection
- JWT tokens for session management
- CORS configured to allow only trusted origins

### Network Security

- HTTPS enforced in production
- Helmet.js for security headers
- Rate limiting on API endpoints
- Input validation and sanitization

### Data Protection

- No sensitive user data stored in logs
- Database connection encryption
- Environment-specific configurations

### Dependencies

- Regular security audits of dependencies
- Automatic dependency updates
- Minimal dependency footprint

## Best Practices for Users

1. **Never share your private keys** - PILB never asks for your private keys
2. **Use strong encryption keys** - Ensure your `.env` file has strong, unique keys
3. **Keep software updated** - Regularly update to the latest version
4. **Verify transactions** - Always verify transaction hashes on Stellar
5. **Use separate channels** - Share verification codes through different channels than the payment

## Incident Response

In case of a security incident:

1. We will investigate and identify the root cause
2. We will notify affected users within 24 hours
3. We will provide patches and mitigation steps
4. We will publish a post-mortem after resolution

## Vulnerability Disclosure Timeline

- **Day 0**: Vulnerability reported
- **Day 1-7**: Initial assessment and communication
- **Day 7-30**: Patch development and testing
- **Day 30**: Public disclosure and patch release

---

Thank you for helping keep PILB secure!
