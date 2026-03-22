#![no_std]

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, symbol_short, Address, Env};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum ContractError {
    InvalidFundingGoal = 1,
    InvalidDateRange = 2,
    InvalidMilestoneCount = 3,
    InvalidAmount = 4,
    TripNotFound = 5,
    Unauthorized = 6,
    InvalidStatus = 7,
}

#[contracttype]
#[derive(Clone)]
pub struct Trip {
    pub id: u32,
    pub student: Address,
    pub status: u32,
    pub total_funding_goal: i128,
    pub total_funding_received: i128,
    pub created_at: u64,
    pub milestone_count: u32,
}

#[contract]
pub struct SmartTripTripContract;

#[contractimpl]
impl SmartTripTripContract {
    pub fn create_trip(
        env: Env,
        student: Address,
        funding_goal: i128,
        start_date: u64,
        end_date: u64,
        milestone_count: u32,
    ) -> Result<u32, ContractError> {
        if funding_goal <= 0 { return Err(ContractError::InvalidFundingGoal); }
        if start_date >= end_date { return Err(ContractError::InvalidDateRange); }
        if milestone_count == 0 { return Err(ContractError::InvalidMilestoneCount); }

        student.require_auth();

        let counter_key = symbol_short!("tripCnt");
        let trip_id: u32 = env.storage().persistent().get(&counter_key).unwrap_or(0) + 1;

        let trip = Trip {
            id: trip_id,
            student: student.clone(),
            status: 0,
            total_funding_goal: funding_goal,
            total_funding_received: 0,
            created_at: env.ledger().timestamp(),
            milestone_count,
        };

        let trip_key = (symbol_short!("trip"), trip_id);
        env.storage().persistent().set(&trip_key, &trip);
        env.storage().persistent().set(&counter_key, &trip_id);

        let st_count_key = (symbol_short!("stCount"), student);
        let current_count: u32 = env.storage().persistent().get(&st_count_key).unwrap_or(0);
        env.storage().persistent().set(&st_count_key, &(current_count + 1));

        Ok(trip_id)
    }

    pub fn get_trip(env: Env, trip_id: u32) -> Result<(u32, Address, u32, i128, i128, u64, u32), ContractError> {
        let trip_key = (symbol_short!("trip"), trip_id);
        match env.storage().persistent().get::<_, Trip>(&trip_key) {
            Some(trip) => Ok((trip.id, trip.student, trip.status, trip.total_funding_goal, trip.total_funding_received, trip.created_at, trip.milestone_count)),
            None => Err(ContractError::TripNotFound),
        }
    }

    pub fn sponsor_trip(env: Env, trip_id: u32, amount: i128) -> Result<(), ContractError> {
        if amount <= 0 { return Err(ContractError::InvalidAmount); }
        let trip_key = (symbol_short!("trip"), trip_id);
        let mut trip: Trip = env.storage().persistent().get(&trip_key).ok_or(ContractError::TripNotFound)?;
        if trip.status > 1 { return Err(ContractError::InvalidStatus); }
        trip.total_funding_received = trip.total_funding_received.saturating_add(amount);
        env.storage().persistent().set(&trip_key, &trip);
        Ok(())
    }

    pub fn activate_trip(env: Env, student: Address, trip_id: u32) -> Result<(), ContractError> {
        student.require_auth();
        let trip_key = (symbol_short!("trip"), trip_id);
        let mut trip: Trip = env.storage().persistent().get(&trip_key).ok_or(ContractError::TripNotFound)?;
        if trip.status != 0 { return Err(ContractError::InvalidStatus); }
        if student != trip.student { return Err(ContractError::Unauthorized); }
        trip.status = 1;
        env.storage().persistent().set(&trip_key, &trip);
        Ok(())
    }

    pub fn release_milestone_funds(env: Env, trip_id: u32, _milestone_idx: u32) -> Result<i128, ContractError> {
        let trip_key = (symbol_short!("trip"), trip_id);
        let trip: Trip = env.storage().persistent().get(&trip_key).ok_or(ContractError::TripNotFound)?;
        Ok(trip.total_funding_received / (trip.milestone_count as i128))
    }

    pub fn get_student_trip_count(env: Env, student: Address) -> Result<u32, ContractError> {
        let count_key = (symbol_short!("stCount"), student);
        Ok(env.storage().persistent().get(&count_key).unwrap_or(0))
    }
}
