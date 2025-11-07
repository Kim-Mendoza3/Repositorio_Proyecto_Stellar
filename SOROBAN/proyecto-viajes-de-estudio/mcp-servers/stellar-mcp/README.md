# Stellar MCP Server

Model Context Protocol (MCP) server for Stellar/Soroban smart contract operations.

## Features

This MCP server provides tools to interact with Stellar blockchain and deploy Soroban smart contracts:

### Available Tools

1. **build_contract** - Build and optimize a Soroban smart contract
   - Compiles Rust contract to WASM
   - Optimizes WASM file for deployment
   - Supports cargo features

2. **deploy_contract** - Deploy a contract to Stellar testnet/mainnet
   - Deploys optimized WASM to blockchain
   - Returns contract ID
   - Supports both testnet and mainnet

3. **invoke_contract** - Call methods on deployed contracts
   - Execute contract functions
   - Pass arguments dynamically
   - Get return values

4. **get_balance** - Query XLM balance of any address
   - Check account balance
   - Works on testnet and mainnet

5. **create_wallet** - Generate new Stellar wallets
   - Creates new keypair
   - Automatically funds on testnet
   - Stores identity locally

## Installation

```bash
npm install
npm run build
```

## Usage

The server is configured in `.vscode/settings.json` and can be used through GitHub Copilot:

### Example 1: Build and Deploy Contract

```
@stellar build_contract with contractPath=/home/.../contract and features=loan
@stellar deploy_contract with wasmPath=/home/.../contract.optimized.wasm and source=pool-admin
```

### Example 2: Initialize Contract

```
@stellar invoke_contract with contractId=CA... source=pool-admin method=initialize args={"admin":"GD...","token_address":"CA...","pool_address":"GA...","min_credit_score":"700"}
```

### Example 3: Create Wallet

```
@stellar create_wallet with identity=my-new-wallet
```

## Configuration

The server is registered in `.vscode/settings.json`:

```json
{
  "mcpServers": {
    "stellar": {
      "command": "node",
      "args": ["path/to/dist/index.js"]
    }
  }
}
```

## Requirements

- Node.js 18+
- Stellar CLI installed globally
- Configured Stellar identities (wallets)

## Development

```bash
npm run watch  # Watch mode for development
npm run build  # Production build
```

## Network Configuration

- **Testnet**: https://soroban-testnet.stellar.org
- **Mainnet**: https://soroban-mainnet.stellar.org

Default network is `testnet`. Use `network: "mainnet"` for production deployments.

## Error Handling

All tools return structured JSON responses:

**Success:**
```json
{
  "success": true,
  "result": "...",
  ...
}
```

**Error:**
```json
{
  "error": "Error message",
  "stderr": "Command output"
}
```

## Security Notes

- Never commit private keys
- Use testnet for development
- Verify contract code before mainnet deployment
- Test thoroughly before mainnet deployment

## License

MIT
