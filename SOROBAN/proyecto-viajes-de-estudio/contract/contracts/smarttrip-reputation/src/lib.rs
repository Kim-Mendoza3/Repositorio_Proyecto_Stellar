#![no_std]

use soroban_sdk::{contract, contracterror, contractimpl, symbol_short, Address, Env};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum ContractError {
    InvalidInput = 1,
}

#[contract]
pub struct SmartTripReputationContract;

#[contractimpl]
impl SmartTripReputationContract {
    pub fn record_action(env: Env, wallet: Address, _action_type: u32, score_change: i32) -> Result<(), ContractError> {
        let score_key = (symbol_short!("score"), wallet.clone());
        let current_score: i32 = env.storage().persistent().get(&score_key).unwrap_or(100);
        let new_score = (current_score + score_change).clamp(0, 1000);
        env.storage().persistent().set(&score_key, &new_score);

        let history_key = (symbol_short!("hist"), wallet);
        let action_count: u32 = env.storage().persistent().get(&history_key).unwrap_or(0);
        env.storage().persistent().set(&history_key, &(action_count + 1));

        Ok(())
    }

    pub fn get_reputation_score(env: Env, wallet: Address) -> Result<u32, ContractError> {
        let score_key = (symbol_short!("score"), wallet);
        let score: i32 = env.storage().persistent().get(&score_key).unwrap_or(100);
        Ok(score as u32)
    }

    pub fn get_user_level(env: Env, wallet: Address) -> Result<u32, ContractError> {
        let score_key = (symbol_short!("score"), wallet);
        let score: i32 = env.storage().persistent().get(&score_key).unwrap_or(100);
        let level = match score {
            0..=100 => 1,
            101..=300 => 2,
            301..=600 => 3,
            601..=800 => 4,
            _ => 5,
        };
        Ok(level)
    }

    pub fn get_action_history_count(env: Env, wallet: Address) -> Result<u32, ContractError> {
        let history_key = (symbol_short!("hist"), wallet);
        Ok(env.storage().persistent().get(&history_key).unwrap_or(0))
    }
}
