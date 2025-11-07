#!/bin/bash

# Deploy Passkey Account Contract to Stellar Testnet
# This script builds and deploys the contract

set -e

echo "🚀 Deploying Passkey Account Contract to Stellar Testnet"
echo "========================================================="

# Check if soroban CLI is installed
if ! command -v soroban &> /dev/null; then
    echo "❌ soroban CLI not found. Please install it first:"
    echo "   cargo install --locked soroban-cli"
    exit 1
fi

# Build the contract
echo ""
echo "📦 Building contract..."
cd ../contract
make build-optimized

# Check if alice identity exists
if ! soroban keys show alice &> /dev/null; then
    echo ""
    echo "🔑 Creating 'alice' identity for deployment..."
    soroban keys generate alice --network testnet
fi

# Get alice's address
ALICE_ADDRESS=$(soroban keys address alice)
echo ""
echo "👤 Deploying with account: $ALICE_ADDRESS"

# Fund the account if needed (testnet only)
echo ""
echo "💰 Funding account from friendbot..."
curl -s "https://friendbot.stellar.org?addr=$ALICE_ADDRESS" > /dev/null || echo "Note: Account may already be funded"

# Deploy the contract
echo ""
echo "🚀 Deploying contract..."
CONTRACT_ID=$(soroban contract deploy \
    --wasm target/wasm32-unknown-unknown/release/passkey_account.wasm \
    --source alice \
    --network testnet)

echo ""
echo "✅ Contract deployed successfully!"
echo "📝 Contract ID: $CONTRACT_ID"
echo ""
echo "Next steps:"
echo "1. Copy the contract ID to your frontend .env file:"
echo "   NEXT_PUBLIC_CONTRACT_ID=$CONTRACT_ID"
echo ""
echo "2. Start the frontend:"
echo "   cd ../frontend"
echo "   npm install"
echo "   npm run dev:https"
echo ""
echo "🎉 Done!"
