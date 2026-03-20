# 🚀 Quick Start Guide

## Prerequisites

Make sure you have installed:
- Rust 1.75+ with wasm32 target
- Node.js 18+
- Stellar CLI (soroban-cli)

## Installation

### 1. Install Rust and Stellar CLI

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add wasm32 target
rustup target add wasm32-unknown-unknown

# Install Stellar CLI
cargo install --locked soroban-cli
```

### 2. Clone and Setup

```bash
cd /home/josealfredo/soroban-passkey-demo

# Install contract dependencies
cd contract
cargo build

# Install frontend dependencies
cd ../frontend
npm install
```

## Development

### Option 1: Frontend Only (Mock Mode)

```bash
cd frontend
npm run dev
# Open http://localhost:3000
```

### Option 2: Full Stack (with Contract)

#### Terminal 1: Build Contract

```bash
cd contract
make build
```

#### Terminal 2: Deploy to Testnet

```bash
cd scripts
./deploy-testnet.sh
# Copy the CONTRACT_ID to frontend/.env.local
```

#### Terminal 3: Run Frontend

```bash
cd frontend
cp .env.example .env.local
# Edit .env.local and add your CONTRACT_ID
npm run dev:https
# Open https://localhost:3000
```

## Testing

### Test Contract

```bash
cd contract
cargo test
```

### Test Frontend

```bash
cd frontend
npm run type-check
npm run lint
```

## Browser Requirements

For passkeys to work, you need:
- **Modern browser**: Chrome 67+, Safari 14+, Edge 18+, Firefox 60+
- **HTTPS**: Use `npm run dev:https` for local development
- **Platform authenticator**: Face ID, Touch ID, Windows Hello, or hardware key

## Troubleshooting

### "WebAuthn not supported"
- Ensure you're using HTTPS (or localhost)
- Check browser version
- Enable platform authenticator in browser settings

### "Operation not allowed"
- User cancelled the operation
- Authenticator not available
- Security settings blocking

### Contract deployment fails
- Check Stellar CLI installation: `soroban --version`
- Ensure account is funded: Visit friendbot
- Verify network configuration

## Project Structure

```
soroban-passkey-demo/
├── contract/              # Rust smart contract
│   ├── src/lib.rs        # Main contract code
│   ├── Cargo.toml        # Rust dependencies
│   └── Makefile          # Build commands
├── frontend/             # Next.js application
│   ├── src/
│   │   ├── app/         # Pages
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom hooks
│   │   └── lib/         # Utilities
│   └── package.json
└── scripts/             # Deployment scripts
```

## Next Steps

1. ✅ Create a passkey
2. ✅ Test authentication
3. 📝 Deploy contract to testnet
4. 🔗 Connect frontend to contract
5. 🎨 Customize UI
6. 🚀 Deploy to production

## Resources

- [Soroban Documentation](https://soroban.stellar.org)
- [WebAuthn Guide](https://webauthn.guide)
- [Stellar SDK Docs](https://stellar.github.io/js-stellar-sdk/)
- [Next.js Documentation](https://nextjs.org/docs)

## Support

Issues? Check:
- GitHub Issues
- Stellar Discord
- Soroban Documentation

---

Made with ❤️ for the Stellar community
