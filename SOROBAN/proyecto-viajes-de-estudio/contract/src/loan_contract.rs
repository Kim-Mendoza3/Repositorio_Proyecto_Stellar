use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol, Vec};

// Import types directly in this module
use crate::loan_types::{LoanConfig, LoanError, LoanRecord, TransferResult};

// Storage keys
const CONFIG_KEY: Symbol = symbol_short!("CONFIG");
const POOL_BAL: Symbol = symbol_short!("POOL_BAL");

#[contract]
pub struct LoanContract;

#[contractimpl]
impl LoanContract {
    /// Initialize the loan contract with admin, token, and pool addresses
    /// 
    /// # Arguments
    /// * `admin` - Address of the contract administrator
    /// * `token_address` - Address of the USDC token contract
    /// * `pool_address` - Address holding the loan pool funds
    /// * `min_credit_score` - Minimum credit score required (default: 700)
    /// 
    /// # Returns
    /// Result indicating success or error
    pub fn initialize(
        env: Env,
        admin: Address,
        token_address: Address,
        pool_address: Address,
        min_credit_score: u32,
    ) -> Result<(), LoanError> {
        // Check if already initialized
        if env.storage().instance().has(&CONFIG_KEY) {
            return Err(LoanError::AlreadyInitialized);
        }

        // Validate minimum credit score (should be between 500-850)
        if min_credit_score < 500 || min_credit_score > 850 {
            return Err(LoanError::InvalidAmount);
        }

        // Create and store configuration
        let config = LoanConfig {
            admin: admin.clone(),
            token_address: token_address.clone(),
            pool_address: pool_address.clone(),
            min_credit_score,
            initialized: true,
        };

        env.storage().instance().set(&CONFIG_KEY, &config);
        
        // Initialize pool balance to 0
        env.storage().instance().set(&POOL_BAL, &0i128);

        Ok(())
    }

    /// Transfer a loan to a recipient based on their credit score
    /// 
    /// # Arguments
    /// * `recipient` - Address to receive the loan
    /// * `amount` - Amount in stroops (with 7 decimals)
    /// * `credit_score` - Credit score of the recipient (500-850)
    /// 
    /// # Returns
    /// TransferResult with details of the disbursement
    /// 
    /// # Errors
    /// * InsufficientCreditScore - if score < min_credit_score
    /// * InsufficientPoolFunds - if pool doesn't have enough balance
    /// * DuplicateLoan - if user already has an active loan
    /// * InvalidAmount - if amount is <= 0 or too large
    pub fn transfer_loan(
        env: Env,
        recipient: Address,
        amount: i128,
        credit_score: u32,
    ) -> Result<TransferResult, LoanError> {
        // Validate contract is initialized
        let config = Self::require_initialized(&env)?;

        // Validate amount
        if amount <= 0 {
            return Err(LoanError::InvalidAmount);
        }

        // Check credit score requirement
        if credit_score < config.min_credit_score {
            return Err(LoanError::InsufficientCreditScore);
        }

        // Check for duplicate loan (within 24h)
        if Self::has_active_loan(&env, &recipient) {
            return Err(LoanError::DuplicateLoan);
        }

        // Check pool balance
        let pool_balance: i128 = env.storage().instance().get(&POOL_BAL).unwrap_or(0);
        if pool_balance < amount {
            return Err(LoanError::InsufficientPoolFunds);
        }

        // Update pool balance
        let new_balance = pool_balance - amount;
        env.storage().instance().set(&POOL_BAL, &new_balance);

        // Get current timestamp
        let timestamp = env.ledger().timestamp();

        // Create loan record
        let loan_record = LoanRecord {
            recipient: recipient.clone(),
            amount,
            credit_score,
            timestamp,
            transaction_hash: timestamp, // Simplified - use timestamp as hash for MVP
        };

        // Record the loan
        Self::record_loan(&env, loan_record.clone());

        // Create transfer result
        let result = TransferResult {
            success: true,
            amount,
            recipient: recipient.clone(),
            timestamp,
        };

        // Note: In production, you would actually invoke the token contract here
        // to transfer tokens. For MVP, we're simulating the transfer.
        // Example:
        // token_client.transfer(&config.pool_address, &recipient, &amount);

        Ok(result)
    }

    /// Get loan history for a specific user
    /// 
    /// # Arguments
    /// * `user` - Address to query loan history for
    /// 
    /// # Returns
    /// Vector of LoanRecord entries
    pub fn get_loan_history(env: Env, user: Address) -> Vec<LoanRecord> {
        let history_key = (symbol_short!("HISTORY"), user);
        env.storage()
            .instance()
            .get(&history_key)
            .unwrap_or(Vec::new(&env))
    }

    /// Deposit funds into the loan pool
    /// 
    /// # Arguments
    /// * `admin` - Admin address (must match configured admin)
    /// * `amount` - Amount to deposit
    /// 
    /// # Returns
    /// New pool balance after deposit
    /// 
    /// # Errors
    /// * Unauthorized - if caller is not admin
    /// * InvalidAmount - if amount <= 0
    pub fn deposit_to_pool(
        env: Env,
        admin: Address,
        amount: i128,
    ) -> Result<i128, LoanError> {
        // Validate admin
        Self::require_admin(&env, &admin)?;

        // Validate amount
        if amount <= 0 {
            return Err(LoanError::InvalidAmount);
        }

        // Get current balance
        let current_balance: i128 = env.storage().instance().get(&POOL_BAL).unwrap_or(0);
        
        // Add deposit
        let new_balance = current_balance + amount;
        env.storage().instance().set(&POOL_BAL, &new_balance);

        // Note: In production, you would actually invoke the token contract
        // to transfer tokens from admin to pool. For MVP, we're simulating.

        Ok(new_balance)
    }

    /// Get current pool balance
    /// 
    /// # Returns
    /// Current balance in the pool
    pub fn get_pool_balance(env: Env) -> i128 {
        env.storage().instance().get(&POOL_BAL).unwrap_or(0)
    }

    /// Check if a user is eligible for a loan
    /// 
    /// # Arguments
    /// * `user` - Address to check eligibility
    /// * `amount` - Requested loan amount
    /// * `credit_score` - User's credit score
    /// 
    /// # Returns
    /// true if eligible, false otherwise
    pub fn check_eligibility(
        env: Env,
        user: Address,
        amount: i128,
        credit_score: u32,
    ) -> bool {
        // Get config (return false if not initialized)
        let config = match Self::require_initialized(&env) {
            Ok(c) => c,
            Err(_) => return false,
        };

        // Check credit score
        if credit_score < config.min_credit_score {
            return false;
        }

        // Check for active loan
        if Self::has_active_loan(&env, &user) {
            return false;
        }

        // Check pool balance
        let pool_balance: i128 = env.storage().instance().get(&POOL_BAL).unwrap_or(0);
        if pool_balance < amount {
            return false;
        }

        // Check amount validity
        if amount <= 0 {
            return false;
        }

        true
    }
}

// Helper functions
impl LoanContract {
    /// Validate that the contract is initialized
    fn require_initialized(env: &Env) -> Result<LoanConfig, LoanError> {
        env.storage()
            .instance()
            .get(&CONFIG_KEY)
            .ok_or(LoanError::NotInitialized)
    }

    /// Validate that the caller is the admin
    fn require_admin(env: &Env, caller: &Address) -> Result<(), LoanError> {
        let config = Self::require_initialized(env)?;
        if config.admin != *caller {
            return Err(LoanError::Unauthorized);
        }
        Ok(())
    }

    /// Check if user has an active loan (within last 24 hours)
    fn has_active_loan(env: &Env, user: &Address) -> bool {
        let key = (symbol_short!("LAST_LOAN"), user.clone());
        
        if let Some(last_timestamp) = env.storage().instance().get::<(Symbol, Address), u64>(&key) {
            let current_time = env.ledger().timestamp();
            let time_diff = current_time.saturating_sub(last_timestamp);
            
            // 24 hours = 86400 seconds
            time_diff < 86400
        } else {
            false
        }
    }

    /// Record a loan in the history
    fn record_loan(env: &Env, loan: LoanRecord) {
        let user = loan.recipient.clone();
        
        // Store the loan in history (append to vector)
        let history_key = (symbol_short!("HISTORY"), user.clone());
        let mut history: Vec<LoanRecord> = env
            .storage()
            .instance()
            .get(&history_key)
            .unwrap_or(Vec::new(env));
        
        history.push_back(loan.clone());
        env.storage().instance().set(&history_key, &history);
        
        // Update last loan timestamp
        let timestamp_key = (symbol_short!("LAST_LOAN"), user);
        env.storage().instance().set(&timestamp_key, &loan.timestamp);
    }
}

#[cfg(test)]
mod loan_test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env};

    #[test]
    fn test_initialize_success() {
        let env = Env::default();
        let contract_id = env.register_contract(None, LoanContract);
        let client = LoanContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let token = Address::generate(&env);
        let pool = Address::generate(&env);
        let min_score = 700;

        // Initialize should succeed
        client.initialize(&admin, &token, &pool, &min_score);
        
        // Verify pool balance is 0 initially
        let balance = client.get_pool_balance();
        assert_eq!(balance, 0);
    }

    #[test]
    fn test_transfer_loan_success() {
        let env = Env::default();
        let contract_id = env.register_contract(None, LoanContract);
        let client = LoanContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let token = Address::generate(&env);
        let pool = Address::generate(&env);
        let recipient = Address::generate(&env);
        
        // Initialize contract
        client.initialize(&admin, &token, &pool, &700);
        
        // Deposit funds to pool
        client.deposit_to_pool(&admin, &10_000_000_000);
        
        let amount = 5_000_000_000; // 500 USDC (with 7 decimals)
        let credit_score = 750;

        // Transfer loan should succeed
        let result = client.transfer_loan(&recipient, &amount, &credit_score);
        assert!(result.success);
        assert_eq!(result.amount, amount);
        
        // Check pool balance decreased
        let balance = client.get_pool_balance();
        assert_eq!(balance, 5_000_000_000);
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #3)")]
    fn test_transfer_loan_insufficient_score() {
        let env = Env::default();
        let contract_id = env.register_contract(None, LoanContract);
        let client = LoanContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let token = Address::generate(&env);
        let pool = Address::generate(&env);
        let recipient = Address::generate(&env);
        
        client.initialize(&admin, &token, &pool, &700);
        client.deposit_to_pool(&admin, &10_000_000_000);
        
        let amount = 5_000_000_000;
        let credit_score = 650;

        client.transfer_loan(&recipient, &amount, &credit_score);
    }

    #[test]
    fn test_get_loan_history() {
        let env = Env::default();
        let contract_id = env.register_contract(None, LoanContract);
        let client = LoanContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let token = Address::generate(&env);
        let pool = Address::generate(&env);
        let user = Address::generate(&env);
        
        client.initialize(&admin, &token, &pool, &700);
        
        let history = client.get_loan_history(&user);
        assert_eq!(history.len(), 0);
        
        client.deposit_to_pool(&admin, &10_000_000_000);
        client.transfer_loan(&user, &5_000_000_000, &750);
        
        let history = client.get_loan_history(&user);
        assert_eq!(history.len(), 1);
    }

    #[test]
    fn test_deposit_to_pool() {
        let env = Env::default();
        let contract_id = env.register_contract(None, LoanContract);
        let client = LoanContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let token = Address::generate(&env);
        let pool = Address::generate(&env);
        
        client.initialize(&admin, &token, &pool, &700);
        
        let amount = 100_000_000_000;
        let new_balance = client.deposit_to_pool(&admin, &amount);
        assert_eq!(new_balance, amount);
    }

    #[test]
    fn test_check_eligibility() {
        let env = Env::default();
        let contract_id = env.register_contract(None, LoanContract);
        let client = LoanContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let token = Address::generate(&env);
        let pool = Address::generate(&env);
        let user = Address::generate(&env);
        
        client.initialize(&admin, &token, &pool, &700);
        client.deposit_to_pool(&admin, &10_000_000_000);
        
        let amount = 5_000_000_000;
        
        let eligible = client.check_eligibility(&user, &amount, &750);
        assert!(eligible);

        let not_eligible = client.check_eligibility(&user, &amount, &650);
        assert!(!not_eligible);
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #5)")]
    fn test_duplicate_loan_prevention() {
        let env = Env::default();
        let contract_id = env.register_contract(None, LoanContract);
        let client = LoanContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let token = Address::generate(&env);
        let pool = Address::generate(&env);
        let recipient = Address::generate(&env);
        
        client.initialize(&admin, &token, &pool, &700);
        client.deposit_to_pool(&admin, &20_000_000_000);
        
        let amount = 5_000_000_000;
        let credit_score = 750;

        let result1 = client.transfer_loan(&recipient, &amount, &credit_score);
        assert!(result1.success);

        client.transfer_loan(&recipient, &amount, &credit_score);
    }
}
