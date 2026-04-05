# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Cross-border payment support (Uganda, Tanzania, Nigeria, Ghana, South Africa, India, US, UK, EU)
- Payment links functionality - generate shareable payment links
- Scheduled payments - set up recurring or future payments
- Invoice management system - create, manage, and send invoices
- Escrow system - secure transactions with buyer/seller protection
- In-store QR code payments for merchants
- Exchange rate service for currency conversion
- Enhanced dashboard with transaction statistics and history
- Dark theme with black/white/gold color scheme
- Country code auto-detection in Send page
- Docs page with API documentation

### Changed

- Updated README.md with comprehensive documentation
- Improved payment verification page with better styling
- Enhanced security measures with Helmet.js
- Better error handling and logging

## [1.0.0] - 2026-04-04

### Added

- Initial release of StellarPay (formerly PILB)
- Anonymous M-Pesa payments via Stellar blockchain
- Frontend built with React 18, Vite, and Tailwind CSS
- Backend built with Node.js, Express, and TypeScript
- Stellar blockchain integration for payment verification
- M-Pesa B2C integration for payouts (Daraja API)
- AES-256 encryption for sensitive data
- SEP-10 authentication for Stellar wallet connection

### Features

- Send money anonymously using verification codes
- Real-time payment status tracking
- Dashboard for transaction history
- Secure verification system
- Multiple currency support (KES, USD, EUR, GBP)

### Documentation

- API documentation
- Architecture overview
- Deployment guide
- Contributing guidelines
- Security policy
- Code of conduct

---

_Major updates include: Cross-border payments, Payment links, Invoices, Escrow, and Scheduled payments_
