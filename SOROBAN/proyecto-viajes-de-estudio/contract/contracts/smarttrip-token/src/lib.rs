#![no_std]

use soroban_sdk::{contract, contracterror, contractimpl, symbol_short, Address, Env};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum ContractError {
    Unauthorized = 1,
    InsufficientBalance = 2,
    InvalidAmount = 3,
    NotInitialized = 4,
}

#[contract]
pub struct SmartTripTokenContract;

#[contractimpl]
impl SmartTripTokenContract {
    pub fn init(env: Env, admin: Address, initial_supply: i128) -> Result<(), ContractError> {
        if initial_supply < 0 {
            return Err(ContractError::InvalidAmount);
        }
        env.storage().persistent().set(&symbol_short!("admin"), &admin);
        env.storage().persistent().set(&symbol_short!("supply"), &initial_supply);
        let balance_key = (symbol_short!("bal"), admin);
        env.storage().persistent().set(&balance_key, &initial_supply);
        Ok(())
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) -> Result<(), ContractError> {
        if amount <= 0 {
            return Err(ContractError::InvalidAmount);
        }
        from.require_auth();
        let from_key = (symbol_short!("bal"), from.clone());
        let to_key = (symbol_short!("bal"), to);
        let from_balance: i128 = env.storage().persistent().get(&from_key).unwrap_or(0);
        if from_balance < amount {
            return Err(ContractError::InsufficientBalance);
        }
        let to_balance: i128 = env.storage().persistent().get(&to_key).unwrap_or(0);
        env.storage().persistent().set(&from_key, &(from_balance - amount));
        env.storage().persistent().set(&to_key, &(to_balance + amount));
        Ok(())
    }

    pub fn mint(env: Env, recipient: Address, amount: i128) -> Result<(), ContractError> {
        if amount <= 0 {
            return Err(ContractError::InvalidAmount);
        }
        let admin: Address = env
            .storage()
            .persistent()
            .get(&symbol_short!("admin"))
            .ok_or(ContractError::NotInitialized)?;
        admin.require_auth();
        let balance_key = (symbol_short!("bal"), recipient);
        let current_balance: i128 = env.storage().persistent().get(&balance_key).unwrap_or(0);
        let supply: i128 = env.storage().persistent().get(&symbol_short!("supply")).unwrap_or(0);
        env.storage().persistent().set(&balance_key, &(current_balance + amount));
        env.storage().persistent().set(&symbol_short!("supply"), &(supply + amount));
        Ok(())
    }

    pub fn burn(env: Env, holder: Address, amount: i128) -> Result<(), ContractError> {
        if amount <= 0 {
            return Err(ContractError::InvalidAmount);
        }
        let admin: Address = env
            .storage()
            .persistent()
            .get(&symbol_short!("admin"))
            .ok_or(ContractError::NotInitialized)?;
        admin.require_auth();
        let balance_key = (symbol_short!("bal"), holder);
        let current_balance: i128 = env.storage().persistent().get(&balance_key).unwrap_or(0);
        if current_balance < amount {
            return Err(ContractError::InsufficientBalance);
        }
        let supply: i128 = env.storage().persistent().get(&symbol_short!("supply")).unwrap_or(0);
        env.storage().persistent().set(&balance_key, &(current_balance - amount));
        env.storage().persistent().set(&symbol_short!("supply"), &(supply - amount));
        Ok(())
    }

    pub fn balance_of(env: Env, account: Address) -> Result<i128, ContractError> {
        let balance_key = (symbol_short!("bal"), account);
        Ok(env.storage().persistent().get(&balance_key).unwrap_or(0))
    }

    pub fn total_supply(env: Env) -> Result<i128, ContractError> {
        Ok(env.storage().persistent().get(&symbol_short!("supply")).unwrap_or(0))
    }
}
