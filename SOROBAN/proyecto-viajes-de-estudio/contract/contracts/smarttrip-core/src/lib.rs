#![no_std]

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, symbol_short, Address, Env};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum ContractError {
    InvalidRole = 1,
    UserNotFound = 2,
    InvalidInput = 3,
}

#[contracttype]
#[derive(Clone)]
pub struct User {
    pub wallet: Address,
    pub role: u32,
    pub reputation_score: u32,
    pub total_trips: u32,
    pub total_earnings_xlm: i128,
    pub kyc_verified: bool,
    pub created_at: u64,
}

#[contract]
pub struct SmartTripCoreContract;

#[contractimpl]
impl SmartTripCoreContract {
    pub fn register_user(env: Env, wallet: Address, role: u32, kyc_verified: bool) -> Result<Address, ContractError> {
        if role > 2 {
            return Err(ContractError::InvalidRole);
        }

        wallet.require_auth();
        let user_key = (symbol_short!("user"), wallet.clone());
        let user = User {
            wallet: wallet.clone(),
            role,
            reputation_score: 100,
            total_trips: 0,
            total_earnings_xlm: 0,
            kyc_verified,
            created_at: env.ledger().timestamp(),
        };
        env.storage().persistent().set(&user_key, &user);
        Ok(wallet)
    }

    pub fn get_user_profile(
        env: Env,
        wallet: Address,
    ) -> Result<(Address, u32, u32, u32, i128, bool, u64), ContractError> {
        let user_key = (symbol_short!("user"), wallet);
        match env.storage().persistent().get::<_, User>(&user_key) {
            Some(user) => Ok((
                user.wallet,
                user.role,
                user.reputation_score,
                user.total_trips,
                user.total_earnings_xlm,
                user.kyc_verified,
                user.created_at,
            )),
            None => Err(ContractError::UserNotFound),
        }
    }

    pub fn update_reputation_score(env: Env, wallet: Address, new_score: u32) -> Result<(), ContractError> {
        let user_key = (symbol_short!("user"), wallet);
        let mut user = env
            .storage()
            .persistent()
            .get::<_, User>(&user_key)
            .ok_or(ContractError::UserNotFound)?;

        user.reputation_score = if new_score > 1000 { 1000 } else { new_score };
        env.storage().persistent().set(&user_key, &user);
        Ok(())
    }

    pub fn record_earnings(env: Env, wallet: Address, amount: i128) -> Result<(), ContractError> {
        if amount < 0 {
            return Err(ContractError::InvalidInput);
        }

        let user_key = (symbol_short!("user"), wallet);
        let mut user = env
            .storage()
            .persistent()
            .get::<_, User>(&user_key)
            .ok_or(ContractError::UserNotFound)?;

        user.total_earnings_xlm = user.total_earnings_xlm.saturating_add(amount);
        env.storage().persistent().set(&user_key, &user);
        Ok(())
    }

    pub fn increment_trips(env: Env, wallet: Address) -> Result<(), ContractError> {
        let user_key = (symbol_short!("user"), wallet);
        let mut user = env
            .storage()
            .persistent()
            .get::<_, User>(&user_key)
            .ok_or(ContractError::UserNotFound)?;

        user.total_trips = user.total_trips.saturating_add(1);
        env.storage().persistent().set(&user_key, &user);
        Ok(())
    }
}
