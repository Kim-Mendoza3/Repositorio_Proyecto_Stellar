#!/bin/bash

# Loan Contract Initialization Script
# This script initializes the deployed loan contract

set -e

CONTRACT_ID="CBMIDXPFU23GUHKLVQMM3IV5IBXK2R2UTUTJMMY76ETV4BJPCTWODBXH"
NETWORK="testnet"

echo "🔧 Initializing Loan Contract..."
echo "Contract ID: $CONTRACT_ID"
echo ""

# Get addresses
ADMIN_ADDRESS=$(stellar keys address pool-admin)
TOKEN_ADDRESS="CA7N7ME5RCXHM3YOCM3YTM5FTKRIPVAJAEZWKLUJNINDQZQV73GNCHAA"
POOL_ADDRESS=$(stellar keys address pool-funds)

echo "Admin Address: $ADMIN_ADDRESS"
echo "Token Address: $TOKEN_ADDRESS"
echo "Pool Address: $POOL_ADDRESS"
echo ""

# Initialize contract
echo "📝 Calling initialize()..."
stellar contract invoke \
  --id "$CONTRACT_ID" \
  --network "$NETWORK" \
  --source pool-admin \
  -- initialize \
  --admin "$ADMIN_ADDRESS" \
  --token_address "$TOKEN_ADDRESS" \
  --pool_address "$POOL_ADDRESS" \
  --min_credit_score 700

echo ""
echo "✅ Contract initialized!"
echo ""

# Deposit initial funds to pool (simulated - 5000 USDC = 50000000000 stroops with 7 decimals)
echo "💰 Depositing initial funds to pool..."
stellar contract invoke \
  --id "$CONTRACT_ID" \
  --network "$NETWORK" \
  --source pool-admin \
  -- deposit_to_pool \
  --admin "$ADMIN_ADDRESS" \
  --amount 50000000000

echo ""
echo "✅ Pool funded with 5000 USDC!"
echo ""

# Get pool balance
echo "📊 Checking pool balance..."
BALANCE=$(stellar contract invoke \
  --id "$CONTRACT_ID" \
  --network "$NETWORK" \
  --source pool-admin \
  -- get_pool_balance)

echo "Current Pool Balance: $BALANCE stroops"
echo ""
echo "🎉 Contract is ready to use!"
echo ""
echo "Contract ID: $CONTRACT_ID"
echo "Network: $NETWORK"
echo "Explorer: https://stellar.expert/explorer/testnet/contract/$CONTRACT_ID"
