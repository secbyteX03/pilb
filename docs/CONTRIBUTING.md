# Contributing to StellarPay

Thank you for your interest in contributing to StellarPay! This document outlines the guidelines for contributing to this project.

## Code of Conduct

By participating in this project, you are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## How Can I Contribute?

### Reporting Bugs

Before submitting a bug report:

- Check the existing issues to see if the bug has already been reported
- Use a clear and descriptive title
- Include steps to reproduce the bug
- Include relevant environment details (OS, Node.js version, etc.)

### Suggesting Features

- Use a clear and descriptive title for the feature request
- Provide a detailed description of the proposed feature
- Explain why this feature would be beneficial
- Include any mockups or examples if applicable

### Pull Requests

## Development Process

1. Fork the repository
2. Create a feature branch from `main`: `git checkout -b feature/my-new-feature`
3. Make your changes
4. Run the tests: `npm test`
5. Commit your changes with clear commit messages
6. Push to your fork: `git push origin feature/my-new-feature`
7. Submit a Pull Request

## Style Guides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests after the first line

### TypeScript Style

- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Prefer `const` over `let`
- Use meaningful variable and function names
- Add TypeScript types for all functions and variables

### Documentation

- Update README.md for any user-facing changes
- Update docs/ for any API or architecture changes
- Add JSDoc comments for public functions
- Include code examples where helpful

## Project Structure

```
stellarpilb/
├── backend/           # Node.js/Express backend
│   ├── src/
│   │   ├── config/    # Configuration files
│   │   ├── controllers/ # HTTP controllers
│   │   ├── middleware/  # Express middleware
│   │   ├── models/     # MongoDB models
│   │   ├── routes/    # API routes
│   │   ├── services/  # Business logic
│   │   │   ├── auth/        # SEP-10 authentication
│   │   │   ├── encryption/  # AES encryption
│   │   │   ├── escrow/     # Escrow service
│   │   │   ├── exchange/   # Exchange rates
│   │   │   ├── invoicing/   # Invoice service
│   │   │   ├── mpesa/      # M-Pesa integration
│   │   │   ├── paymentGateway/ # Payment processing
│   │   │   ├── stellar/    # Stellar blockchain
│   │   │   └── verification/   # Verification service
│   │   ├── types/     # TypeScript types
│   │   └── utils/     # Utilities
│   └── tests/         # Unit tests
├── frontend/          # React/Vite frontend
│   ├── src/
│   │   ├── api/       # API clients
│   │   ├── components/ # React components
│   │   ├── hooks/     # Custom hooks
│   │   ├── pages/     # Page components
│   │   ├── services/  # Services
│   │   ├── types/     # TypeScript types
│   │   └── utils/     # Utilities
│   └── public/        # Static assets
└── docs/              # Documentation
```

## Running the Project Locally

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB (local or Atlas)
- Docker (optional)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Running Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### Docker Setup

```bash
docker-compose up --build
```

## Recognition

Contributors will be recognized in the README.md file.

## Questions?

If you have any questions, please open an issue with the "question" label.

---

**Related Documentation:**

- [Architecture Overview](./ARCHITECTURE.md) - System design
- [API Reference](./API.md) - Endpoint documentation
- [Deployment Guide](./DEPLOYMENT.md) - Setup instructions
- [Security Policy](./SECURITY.md) - Security guidelines
