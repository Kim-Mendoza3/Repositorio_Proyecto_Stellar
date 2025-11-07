use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol, Vec};

// Import types directly in this module
use crate::trip_types::{TripConfig, TripError, TripRecord, TripTransferResult};

// Storage keys
const CONFIG_KEY: Symbol = symbol_short!("CONFIG");
const POOL_BAL: Symbol = symbol_short!("POOL_BAL");

#[contract]
pub struct TripContract;

#[contractimpl]
impl TripContract {
    pub fn initialize(
        env: Env,
        admin: Address,
        token_address: Address,
        pool_address: Address,
        min_credit_score: u32,
    ) -> Result<(), TripError> {
        if env.storage().instance().has(&CONFIG_KEY) {
            return Err(TripError::AlreadyInitialized);
        }

        if min_credit_score < 500 || min_credit_score > 850 {
            return Err(TripError::InvalidAmount);
        }

        let config = TripConfig {
            admin: admin.clone(),
            token_address: token_address.clone(),
            pool_address: pool_address.clone(),
            min_credit_score,
            initialized: true,
        };

        env.storage().instance().set(&CONFIG_KEY, &config);
        env.storage().instance().set(&POOL_BAL, &0i128);

        Ok(())
    }

    pub fn transfer_trip(
        env: Env,
        recipient: Address,
        amount: i128,
        credit_score: u32,
    ) -> Result<TripTransferResult, TripError> {
        let config = Self::require_initialized(&env)?;

        if amount <= 0 {
            return Err(TripError::InvalidAmount);
        }

        if credit_score < config.min_credit_score {
            return Err(TripError::InsufficientCreditScore);
        }

        if Self::has_active_trip(&env, &recipient) {
            return Err(TripError::DuplicateTrip);
        }

        let pool_balance: i128 = env.storage().instance().get(&POOL_BAL).unwrap_or(0);
        if pool_balance < amount {
            return Err(TripError::InsufficientPoolFunds);
        }

        let new_balance = pool_balance - amount;
        env.storage().instance().set(&POOL_BAL, &new_balance);

        let timestamp = env.ledger().timestamp();

        let trip_record = TripRecord {
            recipient: recipient.clone(),
            amount,
            credit_score,
            timestamp,
            transaction_hash: timestamp,
        };

        Self::record_trip(&env, trip_record.clone());

        let result = TripTransferResult {
            success: true,
            amount,
            recipient: recipient.clone(),
            timestamp,
        };

        Ok(result)
    }

    pub fn get_trip_history(env: Env, user: Address) -> Vec<TripRecord> {
        let history_key = (symbol_short!("HISTORY"), user);
        env.storage()
            .instance()
            .get(&history_key)
            .unwrap_or(Vec::new(&env))
    }

    pub fn deposit_to_pool(
        env: Env,
        admin: Address,
        amount: i128,
    ) -> Result<i128, TripError> {
        Self::require_admin(&env, &admin)?;

        if amount <= 0 {
            return Err(TripError::InvalidAmount);
        }

        let current_balance: i128 = env.storage().instance().get(&POOL_BAL).unwrap_or(0);
        let new_balance = current_balance + amount;
        env.storage().instance().set(&POOL_BAL, &new_balance);

        Ok(new_balance)
    }

    pub fn get_pool_balance(env: Env) -> i128 {
        env.storage().instance().get(&POOL_BAL).unwrap_or(0)
    }

    pub fn check_eligibility(
        env: Env,
        user: Address,
        amount: i128,
        credit_score: u32,
    ) -> bool {
        let config = match Self::require_initialized(&env) {
            Ok(c) => c,
            Err(_) => return false,
        };

        if credit_score < config.min_credit_score {
            return false;
        }

        if Self::has_active_trip(&env, &user) {
            return false;
        }

        let pool_balance: i128 = env.storage().instance().get(&POOL_BAL).unwrap_or(0);
        if pool_balance < amount {
            return false;
        }

        if amount <= 0 {
            return false;
        }

        true
    }
}

impl TripContract {
    fn require_initialized(env: &Env) -> Result<TripConfig, TripError> {
        env.storage()
            .instance()
            .get(&CONFIG_KEY)
            .ok_or(TripError::NotInitialized)
    }

    fn require_admin(env: &Env, caller: &Address) -> Result<(), TripError> {
        let config = Self::require_initialized(env)?;
        if config.admin != *caller {
            return Err(TripError::Unauthorized);
        }
        Ok(())
    }

    fn has_active_trip(env: &Env, user: &Address) -> bool {
        let key = (symbol_short!("LAST_LOAN"), user.clone());

        if let Some(last_timestamp) = env.storage().instance().get::<(Symbol, Address), u64>(&key) {
            let current_time = env.ledger().timestamp();
            let time_diff = current_time.saturating_sub(last_timestamp);
            time_diff < 86400
        } else {
            false
        }
    }

    fn record_trip(env: &Env, trip: TripRecord) {
        let user = trip.recipient.clone();

        let history_key = (symbol_short!("HISTORY"), user.clone());
        let mut history: Vec<TripRecord> = env
            .storage()
            .instance()
            .get(&history_key)
            .unwrap_or(Vec::new(env));

        history.push_back(trip.clone());
        env.storage().instance().set(&history_key, &history);

        let timestamp_key = (symbol_short!("LAST_LOAN"), user);
        env.storage().instance().set(&timestamp_key, &trip.timestamp);
    }
}

#[cfg(test)]
mod trip_test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env};

    #[test]
    fn test_initialize_success() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TripContract);
        let client = TripContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let token = Address::generate(&env);
        let pool = Address::generate(&env);
        let min_score = 700;

        client.initialize(&admin, &token, &pool, &min_score);

        let balance = client.get_pool_balance();
        assert_eq!(balance, 0);
    }

    #[test]
    fn test_transfer_trip_success() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TripContract);
        let client = TripContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let token = Address::generate(&env);
        let pool = Address::generate(&env);
        let recipient = Address::generate(&env);

        client.initialize(&admin, &token, &pool, &700);
        client.deposit_to_pool(&admin, &10_000_000_000);

        let amount = 5_000_000_000;
        let credit_score = 750;

        let result = client.transfer_trip(&recipient, &amount, &credit_score);
        assert!(result.success);
        assert_eq!(result.amount, amount);

        let balance = client.get_pool_balance();
        assert_eq!(balance, 5_000_000_000);
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #3)")]
    fn test_transfer_trip_insufficient_score() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TripContract);
        let client = TripContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let token = Address::generate(&env);
        let pool = Address::generate(&env);
        let recipient = Address::generate(&env);

        client.initialize(&admin, &token, &pool, &700);
        client.deposit_to_pool(&admin, &10_000_000_000);

        let amount = 5_000_000_000;
        let credit_score = 650;

        client.transfer_trip(&recipient, &amount, &credit_score);
    }

    #[test]
    fn test_get_trip_history() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TripContract);
        let client = TripContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let token = Address::generate(&env);
        let pool = Address::generate(&env);
        let user = Address::generate(&env);

        client.initialize(&admin, &token, &pool, &700);

        let history = client.get_trip_history(&user);
        assert_eq!(history.len(), 0);

        client.deposit_to_pool(&admin, &10_000_000_000);
        client.transfer_trip(&user, &5_000_000_000, &750);

        let history = client.get_trip_history(&user);
        assert_eq!(history.len(), 1);
    }

    #[test]
    fn test_deposit_to_pool() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TripContract);
        let client = TripContractClient::new(&env, &contract_id);

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
        let contract_id = env.register_contract(None, TripContract);
        let client = TripContractClient::new(&env, &contract_id);

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
    fn test_duplicate_trip_prevention() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TripContract);
        let client = TripContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let token = Address::generate(&env);
        let pool = Address::generate(&env);
        let recipient = Address::generate(&env);

        client.initialize(&admin, &token, &pool, &700);
        client.deposit_to_pool(&admin, &20_000_000_000);

        let amount = 5_000_000_000;
        let credit_score = 750;

        let result1 = client.transfer_trip(&recipient, &amount, &credit_score);
        assert!(result1.success);

        client.transfer_trip(&recipient, &amount, &credit_score);
    }
}
