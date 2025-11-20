use soroban_sdk::{contracterror, contracttype, Address, Symbol};

/// Travel package definition
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TravelPackage {
    pub package_id: u32,
    pub destination: Symbol,
    pub price: i128,                   // Amount to be disbursed in stroops
    pub duration_days: u32,
    pub max_students: u32,
    pub enrolled_students: u32,
    pub min_credit_score: u32,
    pub active: bool,
    pub created_at: u64,
}

/// Travel booking record
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TravelBooking {
    pub booking_id: u32,
    pub student: Address,
    pub package_id: u32,
    pub destination: Symbol,
    pub amount_disbursed: i128,        // Actual amount released from pool
    pub credit_score: u32,
    pub booking_date: u64,
    pub departure_date: u64,
    pub status: Symbol,                // "CONFIRMED", "CANCELLED", "COMPLETED"
}

/// Transaction record for audit trail
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TransactionRecord {
    pub transaction_id: u32,
    pub student: Address,
    pub package_id: u32,
    pub amount: i128,
    pub timestamp: u64,
    pub status: Symbol,
}

/// Error types for the travel package contract
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum TravelPackageError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    InsufficientCreditScore = 3,
    InsufficientPoolFunds = 4,
    DuplicateBooking = 5,
    Unauthorized = 6,
    InvalidAmount = 7,
    PackageNotFound = 8,
    PackageNotActive = 9,
    PackageFull = 10,
    NoPackagesAvailable = 11,
    NoBookingsFound = 12,
    BookingNotFound = 13,
    InvalidPrice = 14,
    InvalidDuration = 15,
}
