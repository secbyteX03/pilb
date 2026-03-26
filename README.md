# Pilb - Anonymous M-Pesa Payments via Stellar

**Send Money, Keep Your Identity**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stellar](https://img.shields.io/badge/Stellar-Network-blue.svg)](https://stellar.org)
[![M-Pesa](https://img.shields.io/badge/M--Pesa-Integration-green.svg)](https://safaricom.co.ke)

## 💡 How It Works

1. You enter amount + recipient phone
2. App generates unique code & hash
3. Payment sent to Stellar with code hash in memo
4. Backend watches Stellar for confirmation
5. Once confirmed, M-Pesa automatically sends cash
6. Recipient gets money with zero sender details

## 🔐 Security

- Sender details encrypted (AES-256)
- Code hash only on blockchain
- Verification code shared separately
- All transactions immutable on Stellar

## 📖 Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🤝 Contributing

Contributions welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📄 License

MIT License - see [LICENSE](./LICENSE)

---

Made for Kenya's financial inclusion
