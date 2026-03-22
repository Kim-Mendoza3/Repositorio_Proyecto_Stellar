#![no_std]

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, symbol_short, Address, Env};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum ContractError {
    NotFound = 1,
    InvalidInput = 2,
}

#[contracttype]
#[derive(Clone)]
pub struct Badge {
    pub id: u32,
    pub owner: Address,
    pub badge_type: u32,
    pub trip_id: u32,
    pub points: u32,
    pub created_at: u64,
}

#[contract]
pub struct SmartTripBadgeContract;

#[contractimpl]
impl SmartTripBadgeContract {
    pub fn mint_badge(env: Env, recipient: Address, badge_type: u32, trip_id: u32) -> Result<u32, ContractError> {
        let points = match badge_type {
            0 => 50,
            1 => 100,
            2 => 75,
            3 => 150,
            _ => return Err(ContractError::InvalidInput),
        };

        let badge_counter_key = symbol_short!("bcnt");
        let badge_id: u32 = env.storage().persistent().get(&badge_counter_key).unwrap_or(0) + 1;
        let badge = Badge {
            id: badge_id,
            owner: recipient.clone(),
            badge_type,
            trip_id,
            points,
            created_at: env.ledger().timestamp(),
        };

        let badge_key = (symbol_short!("badge"), badge_id);
        env.storage().persistent().set(&badge_key, &badge);
        env.storage().persistent().set(&badge_counter_key, &badge_id);

        let points_key = (symbol_short!("upoints"), recipient.clone());
        let current_points: u32 = env.storage().persistent().get(&points_key).unwrap_or(0);
        env.storage().persistent().set(&points_key, &(current_points + points));

        let count_key = (symbol_short!("ucount"), recipient);
        let current_count: u32 = env.storage().persistent().get(&count_key).unwrap_or(0);
        env.storage().persistent().set(&count_key, &(current_count + 1));

        Ok(badge_id)
    }

    pub fn get_badge(env: Env, badge_id: u32) -> Result<(u32, Address, u32, u32, u32, u64), ContractError> {
        let badge_key = (symbol_short!("badge"), badge_id);
        match env.storage().persistent().get::<_, Badge>(&badge_key) {
            Some(badge) => Ok((
                badge.id,
                badge.owner,
                badge.badge_type,
                badge.trip_id,
                badge.points,
                badge.created_at,
            )),
            None => Err(ContractError::NotFound),
        }
    }

    pub fn get_user_badge_points(env: Env, wallet: Address) -> Result<u32, ContractError> {
        let points_key = (symbol_short!("upoints"), wallet);
        Ok(env.storage().persistent().get(&points_key).unwrap_or(0))
    }

    pub fn get_user_badge_count(env: Env, wallet: Address) -> Result<u32, ContractError> {
        let count_key = (symbol_short!("ucount"), wallet);
        Ok(env.storage().persistent().get(&count_key).unwrap_or(0))
    }
}
