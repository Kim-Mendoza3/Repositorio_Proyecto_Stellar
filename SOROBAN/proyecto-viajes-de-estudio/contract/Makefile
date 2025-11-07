.PHONY: build test clean deploy

# Build the contract in release mode
build:
	cargo build --target wasm32-unknown-unknown --release
	@echo "✅ Contract built successfully!"
	@ls -lh target/wasm32-unknown-unknown/release/*.wasm

# Run tests
test:
	cargo test

# Clean build artifacts
clean:
	cargo clean

# Build optimized contract
build-optimized: build
	soroban contract optimize \
		--wasm target/wasm32-unknown-unknown/release/passkey_account.wasm
	@echo "✅ Contract optimized!"

# Install the contract on testnet
deploy-testnet: build-optimized
	@echo "🚀 Deploying to Stellar Testnet..."
	soroban contract deploy \
		--wasm target/wasm32-unknown-unknown/release/passkey_account.wasm \
		--source alice \
		--network testnet

# Install the contract on local network
deploy-local: build
	@echo "🚀 Deploying to local network..."
	soroban contract deploy \
		--wasm target/wasm32-unknown-unknown/release/passkey_account.wasm \
		--source alice \
		--network local

# Install dependencies
install:
	rustup target add wasm32-unknown-unknown

# Format code
fmt:
	cargo fmt

# Check code without building
check:
	cargo check

# Run clippy
clippy:
	cargo clippy -- -D warnings

# Full CI check
ci: fmt clippy test build

# Help
help:
	@echo "Available commands:"
	@echo "  make build           - Build the contract"
	@echo "  make test            - Run tests"
	@echo "  make clean           - Clean build artifacts"
	@echo "  make build-optimized - Build and optimize contract"
	@echo "  make deploy-testnet  - Deploy to Stellar Testnet"
	@echo "  make deploy-local    - Deploy to local network"
	@echo "  make install         - Install required targets"
	@echo "  make fmt             - Format code"
	@echo "  make clippy          - Run clippy linter"
	@echo "  make ci              - Run full CI pipeline"
