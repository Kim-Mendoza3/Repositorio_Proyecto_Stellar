#![no_std]

use soroban_sdk::{contract, contracterror, contractimpl, symbol_short, Address, Env};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum ContractError {
    InvalidAmount = 1,
    InvalidRate = 2,
    InsufficientFunds = 3,
    NotInitialized = 4,
}

#[contract]
pub struct SmartTripTreasuryContract;

#[contractimpl]
impl SmartTripTreasuryContract {
    pub fn init(env: Env, admin: Address) -> Result<(), ContractError> {
        env.storage().persistent().set(&symbol_short!("admin"), &admin);
        env.storage().persistent().set(&symbol_short!("balance"), &0i128);
        env.storage().persistent().set(&symbol_short!("rate"), &300u32);
        Ok(())
    }

    pub fn deposit_commission(env: Env, amount: i128, _trip_id: u32) -> Result<(), ContractError> {
        if amount <= 0 {
            return Err(ContractError::InvalidAmount);
        }
        let balance_key = symbol_short!("balance");
        let current_balance: i128 = env.storage().persistent().get(&balance_key).unwrap_or(0);
        env.storage().persistent().set(&balance_key, &(current_balance + amount));
        Ok(())
    }

    pub fn get_balance(env: Env) -> Result<i128, ContractError> {
        Ok(env.storage().persistent().get(&symbol_short!("balance")).unwrap_or(0))
    }

    pub fn add_pending_distribution(env: Env, recipient: Address, amount: i128) -> Result<(), ContractError> {
        if amount <= 0 {
            return Err(ContractError::InvalidAmount);
        }
        let pending_key = (symbol_short!("pending"), recipient);
        let current_pending: i128 = env.storage().persistent().get(&pending_key).unwrap_or(0);
        env.storage().persistent().set(&pending_key, &(current_pending + amount));
        Ok(())
    }

    pub fn claim_pending(env: Env, claimant: Address) -> Result<i128, ContractError> {
        claimant.require_auth();
        let pending_key = (symbol_short!("pending"), claimant);
        let pending_amount: i128 = env.storage().persistent().get(&pending_key).unwrap_or(0);
        if pending_amount <= 0 {
            return Err(ContractError::InsufficientFunds);
        }

        let balance_key = symbol_short!("balance");
        let current_balance: i128 = env.storage().persistent().get(&balance_key).unwrap_or(0);
        if current_balance < pending_amount {
            return Err(ContractError::InsufficientFunds);
        }

        env.storage().persistent().set(&balance_key, &(current_balance - pending_amount));
        env.storage().persistent().set(&pending_key, &0i128);
        Ok(pending_amount)
    }

    pub fn set_commission_rate(env: Env, rate: u32) -> Result<(), ContractError> {
        let admin: Address = env
            .storage()
            .persistent()
            .get(&symbol_short!("admin"))
            .ok_or(ContractError::NotInitialized)?;
        admin.require_auth();

        if rate > 500 {
            return Err(ContractError::InvalidRate);
        }

        env.storage().persistent().set(&symbol_short!("rate"), &rate);
        Ok(())
    }

    pub fn get_commission_rate(env: Env) -> Result<u32, ContractError> {
        Ok(env.storage().persistent().get(&symbol_short!("rate")).unwrap_or(300))
    }

    pub fn get_pending_amount(env: Env, account: Address) -> Result<i128, ContractError> {
        let pending_key = (symbol_short!("pending"), account);
        Ok(env.storage().persistent().get(&pending_key).unwrap_or(0))
    }
}
