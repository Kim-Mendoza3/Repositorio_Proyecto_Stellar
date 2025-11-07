use soroban_sdk::{contracterror, contracttype, Address};

/// Record of a loan disbursement
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct LoanRecord {
    pub recipient: Address,
    pub amount: i128,
    pub credit_score: u32,
    pub timestamp: u64,
    pub transaction_hash: u64, // Simplified - in production use actual hash
}

/// Result of a loan transfer operation
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TransferResult {
    pub success: bool,
    pub amount: i128,
    pub recipient: Address,
    pub timestamp: u64,
}

/// Configuration for the loan contract
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct LoanConfig {
    pub admin: Address,
    pub token_address: Address,
    pub pool_address: Address,
    pub min_credit_score: u32,
    pub initialized: bool,
}

/// Error types for the loan contract
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum LoanError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    InsufficientCreditScore = 3,
    InsufficientPoolFunds = 4,
    DuplicateLoan = 5,
    Unauthorized = 6,
    InvalidAmount = 7,
}

/// Storage keys for the contract
pub enum StorageKey {
    Config,
    LoanHistory(Address),
    PoolBalance,
    LastLoanTimestamp(Address),
}
