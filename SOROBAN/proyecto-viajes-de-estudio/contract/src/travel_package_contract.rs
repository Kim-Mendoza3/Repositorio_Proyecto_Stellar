use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol, Vec, token};

use crate::travel_package_types::{
    TravelPackage, TravelPackageError, TravelBooking, TransactionRecord,
};

// Storage keys
const PACKAGES_KEY: Symbol = symbol_short!("PACKAGES");
const BOOKINGS_KEY: Symbol = symbol_short!("BOOKINGS");
const POOL_BAL: Symbol = symbol_short!("POOL_BAL");
const CONFIG_KEY: Symbol = symbol_short!("CONFIG");
const ADMIN_KEY: Symbol = symbol_short!("ADMIN");

#[contract]
pub struct TravelPackageContract;

#[contractimpl]
impl TravelPackageContract {
    /// Initialize the contract with admin and token addresses
    pub fn initialize(
        env: Env,
        admin: Address,
        token_address: Address,
        pool_address: Address,
    ) -> Result<(), TravelPackageError> {
        if env.storage().instance().has(&CONFIG_KEY) {
            return Err(TravelPackageError::AlreadyInitialized);
        }

        admin.require_auth();

        env.storage().instance().set(&ADMIN_KEY, &admin);
        env.storage().instance().set(&CONFIG_KEY, &token_address);
        env.storage().instance().set(&POOL_BAL, &0i128);

        Ok(())
    }

    /// Create a new travel package (admin only)
    pub fn create_package(
        env: Env,
        admin: Address,
        package_id: u32,
        destination: Symbol,
        price: i128,
        duration_days: u32,
        max_students: u32,
        min_credit_score: u32,
    ) -> Result<TravelPackage, TravelPackageError> {
        Self::require_admin(&env, &admin)?;

        if price <= 0 {
            return Err(TravelPackageError::InvalidPrice);
        }

        if duration_days == 0 {
            return Err(TravelPackageError::InvalidDuration);
        }

        let package = TravelPackage {
            package_id,
            destination,
            price,
            duration_days,
            max_students,
            enrolled_students: 0,
            min_credit_score,
            active: true,
            created_at: env.ledger().timestamp(),
        };

        let mut packages: Vec<TravelPackage> = env
            .storage()
            .instance()
            .get(&PACKAGES_KEY)
            .unwrap_or(Vec::new(&env));

        packages.push_back(package.clone());
        env.storage().instance().set(&PACKAGES_KEY, &packages);

        Ok(package)
    }

    /// Get all available packages
    pub fn get_packages(env: Env) -> Vec<TravelPackage> {
        env.storage()
            .instance()
            .get(&PACKAGES_KEY)
            .unwrap_or(Vec::new(&env))
    }

    /// Book a travel package and release funds
    pub fn book_package(
        env: Env,
        student: Address,
        package_id: u32,
        credit_score: u32,
    ) -> Result<TravelBooking, TravelPackageError> {
        student.require_auth();

        let packages: Vec<TravelPackage> = env
            .storage()
            .instance()
            .get(&PACKAGES_KEY)
            .ok_or(TravelPackageError::NoPackagesAvailable)?;

        let mut package_found = false;
        let mut selected_package = TravelPackage {
            package_id: 0,
            destination: symbol_short!("NONE"),
            price: 0,
            duration_days: 0,
            max_students: 0,
            enrolled_students: 0,
            min_credit_score: 0,
            active: false,
            created_at: 0,
        };

        for pkg in packages.iter() {
            if pkg.package_id == package_id {
                package_found = true;
                selected_package = pkg.clone();
                break;
            }
        }

        if !package_found {
            return Err(TravelPackageError::PackageNotFound);
        }

        if !selected_package.active {
            return Err(TravelPackageError::PackageNotActive);
        }

        if credit_score < selected_package.min_credit_score {
            return Err(TravelPackageError::InsufficientCreditScore);
        }

        if selected_package.enrolled_students >= selected_package.max_students {
            return Err(TravelPackageError::PackageFull);
        }

        // Check if student already has an active booking for this package
        if Self::has_active_booking(&env, &student, package_id) {
            return Err(TravelPackageError::DuplicateBooking);
        }

        // Check pool balance
        let pool_balance: i128 = env.storage().instance().get(&POOL_BAL).unwrap_or(0);
        if pool_balance < selected_package.price {
            return Err(TravelPackageError::InsufficientPoolFunds);
        }

        // Release funds from pool
        let new_balance = pool_balance - selected_package.price;
        env.storage().instance().set(&POOL_BAL, &new_balance);

        let timestamp = env.ledger().timestamp();

        // Create booking record
        let booking = TravelBooking {
            booking_id: Self::generate_booking_id(&env),
            student: student.clone(),
            package_id,
            destination: selected_package.destination.clone(),
            amount_disbursed: selected_package.price,
            credit_score,
            booking_date: timestamp,
            departure_date: timestamp + (selected_package.duration_days as u64 * 86400),
            status: symbol_short!("CONFIRMED"),
        };

        // Record the transaction
        Self::record_transaction(&env, &student, &booking);

        // Record the booking
        let mut bookings: Vec<TravelBooking> = env
            .storage()
            .instance()
            .get(&BOOKINGS_KEY)
            .unwrap_or(Vec::new(&env));
        bookings.push_back(booking.clone());
        env.storage().instance().set(&BOOKINGS_KEY, &bookings);

        Ok(booking)
    }

    /// Deposit funds to the pool (admin only)
    pub fn deposit_to_pool(
        env: Env,
        admin: Address,
        amount: i128,
    ) -> Result<i128, TravelPackageError> {
        Self::require_admin(&env, &admin)?;

        if amount <= 0 {
            return Err(TravelPackageError::InvalidAmount);
        }

        let current_balance: i128 = env.storage().instance().get(&POOL_BAL).unwrap_or(0);
        let new_balance = current_balance + amount;
        env.storage().instance().set(&POOL_BAL, &new_balance);

        Ok(new_balance)
    }

    /// Get current pool balance
    pub fn get_pool_balance(env: Env) -> i128 {
        env.storage().instance().get(&POOL_BAL).unwrap_or(0)
    }

    /// Get student's bookings
    pub fn get_student_bookings(env: Env, student: Address) -> Vec<TravelBooking> {
        let bookings_key = (symbol_short!("STU_BOOKINGS"), student);
        env.storage()
            .instance()
            .get(&bookings_key)
            .unwrap_or(Vec::new(&env))
    }

    /// Get transaction history
    pub fn get_transaction_history(env: Env, student: Address) -> Vec<TransactionRecord> {
        let history_key = (symbol_short!("HISTORY"), student);
        env.storage()
            .instance()
            .get(&history_key)
            .unwrap_or(Vec::new(&env))
    }

    /// Check if student is eligible for a package
    pub fn check_eligibility(
        env: Env,
        student: Address,
        package_id: u32,
        credit_score: u32,
    ) -> bool {
        let packages: Vec<TravelPackage> = match env.storage().instance().get(&PACKAGES_KEY) {
            Some(p) => p,
            None => return false,
        };

        let mut package_found = false;
        for pkg in packages.iter() {
            if pkg.package_id == package_id {
                if !pkg.active || credit_score < pkg.min_credit_score {
                    return false;
                }
                if pkg.enrolled_students >= pkg.max_students {
                    return false;
                }
                package_found = true;
                break;
            }
        }

        if !package_found {
            return false;
        }

        if Self::has_active_booking(&env, &student, package_id) {
            return false;
        }

        let pool_balance: i128 = env.storage().instance().get(&POOL_BAL).unwrap_or(0);
        if pool_balance <= 0 {
            return false;
        }

        true
    }

    /// Cancel a booking (returns funds to pool)
    pub fn cancel_booking(
        env: Env,
        student: Address,
        booking_id: u32,
    ) -> Result<i128, TravelPackageError> {
        student.require_auth();

        let bookings: Vec<TravelBooking> = env
            .storage()
            .instance()
            .get(&BOOKINGS_KEY)
            .ok_or(TravelPackageError::NoBookingsFound)?;

        let mut booking_found = false;
        let mut refund_amount = 0i128;

        for booking in bookings.iter() {
            if booking.booking_id == booking_id && booking.student == student {
                booking_found = true;
                refund_amount = booking.amount_disbursed;
                break;
            }
        }

        if !booking_found {
            return Err(TravelPackageError::BookingNotFound);
        }

        // Return funds to pool
        let current_balance: i128 = env.storage().instance().get(&POOL_BAL).unwrap_or(0);
        let new_balance = current_balance + refund_amount;
        env.storage().instance().set(&POOL_BAL, &new_balance);

        Ok(new_balance)
    }
}

impl TravelPackageContract {
    fn require_admin(env: &Env, caller: &Address) -> Result<(), TravelPackageError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&ADMIN_KEY)
            .ok_or(TravelPackageError::NotInitialized)?;

        if admin != *caller {
            return Err(TravelPackageError::Unauthorized);
        }
        Ok(())
    }

    fn has_active_booking(env: &Env, student: &Address, package_id: u32) -> bool {
        let bookings: Vec<TravelBooking> = match env.storage().instance().get(&BOOKINGS_KEY) {
            Some(b) => b,
            None => return false,
        };

        for booking in bookings.iter() {
            if booking.student == *student && booking.package_id == package_id {
                return booking.status == symbol_short!("CONFIRMED");
            }
        }
        false
    }

    fn record_transaction(env: &Env, student: &Address, booking: &TravelBooking) {
        let history_key = (symbol_short!("HISTORY"), student.clone());
        let mut history: Vec<TransactionRecord> = env
            .storage()
            .instance()
            .get(&history_key)
            .unwrap_or(Vec::new(env));

        let transaction = TransactionRecord {
            transaction_id: booking.booking_id,
            student: student.clone(),
            package_id: booking.package_id,
            amount: booking.amount_disbursed,
            timestamp: booking.booking_date,
            status: booking.status.clone(),
        };

        history.push_back(transaction);
        env.storage().instance().set(&history_key, &history);
    }

    fn generate_booking_id(env: &Env) -> u32 {
        let timestamp = env.ledger().timestamp();
        (timestamp % 1_000_000_000) as u32
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn test_initialize_success() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TravelPackageContract);
        let client = TravelPackageContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let token = Address::generate(&env);
        let pool = Address::generate(&env);

        let result = client.initialize(&admin, &token, &pool);
        assert!(result.is_ok());
    }

    #[test]
    fn test_create_package() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TravelPackageContract);
        let client = TravelPackageContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let token = Address::generate(&env);
        let pool = Address::generate(&env);

        client.initialize(&admin, &token, &pool).unwrap();

        let package = client.create_package(
            &admin,
            &1u32,
            &symbol_short!("PARIS"),
            &5000_000_000i128,
            &7u32,
            &20u32,
            &700u32,
        );

        assert!(package.is_ok());
        assert_eq!(package.unwrap().price, 5000_000_000);
    }

    #[test]
    fn test_book_package_success() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TravelPackageContract);
        let client = TravelPackageContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let student = Address::generate(&env);
        let token = Address::generate(&env);
        let pool = Address::generate(&env);

        client.initialize(&admin, &token, &pool).unwrap();
        client.deposit_to_pool(&admin, &10000_000_000).unwrap();

        client
            .create_package(
                &admin,
                &1u32,
                &symbol_short!("PARIS"),
                &5000_000_000i128,
                &7u32,
                &20u32,
                &700u32,
            )
            .unwrap();

        let booking = client.book_package(&student, &1u32, &750u32);
        assert!(booking.is_ok());
        assert_eq!(booking.unwrap().amount_disbursed, 5000_000_000);
    }

    #[test]
    fn test_insufficient_credit_score() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TravelPackageContract);
        let client = TravelPackageContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let student = Address::generate(&env);
        let token = Address::generate(&env);
        let pool = Address::generate(&env);

        client.initialize(&admin, &token, &pool).unwrap();
        client.deposit_to_pool(&admin, &10000_000_000).unwrap();

        client
            .create_package(
                &admin,
                &1u32,
                &symbol_short!("PARIS"),
                &5000_000_000i128,
                &7u32,
                &20u32,
                &700u32,
            )
            .unwrap();

        let booking = client.book_package(&student, &1u32, &650u32);
        assert!(booking.is_err());
    }

    #[test]
    fn test_deposit_to_pool() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TravelPackageContract);
        let client = TravelPackageContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let token = Address::generate(&env);
        let pool = Address::generate(&env);

        client.initialize(&admin, &token, &pool).unwrap();

        let balance = client.deposit_to_pool(&admin, &1000_000_000);
        assert_eq!(balance.unwrap(), 1000_000_000);
    }

    #[test]
    fn test_check_eligibility() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TravelPackageContract);
        let client = TravelPackageContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let student = Address::generate(&env);
        let token = Address::generate(&env);
        let pool = Address::generate(&env);

        client.initialize(&admin, &token, &pool).unwrap();
        client.deposit_to_pool(&admin, &10000_000_000).unwrap();

        client
            .create_package(
                &admin,
                &1u32,
                &symbol_short!("PARIS"),
                &5000_000_000i128,
                &7u32,
                &20u32,
                &700u32,
            )
            .unwrap();

        let eligible = client.check_eligibility(&student, &1u32, &750u32);
        assert!(eligible);
    }
}
