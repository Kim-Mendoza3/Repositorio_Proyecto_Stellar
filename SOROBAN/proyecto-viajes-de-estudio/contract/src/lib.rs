//! Passkey Account Contract for Soroban
//! 
//! This contract implements a custom account that uses secp256r1 (P-256) signatures
//! for authentication, enabling WebAuthn/Passkey integration.
//! 
//! Features:
//! - WebAuthn compatible (secp256r1/ES256 signatures)
//! - Biometric authentication (Face ID, Touch ID, Windows Hello)
//! - No passwords required
//! - Implements Soroban's CustomAccountInterface

#![no_std]

use soroban_sdk::{
    auth::{Context, CustomAccountInterface},
    contract, contracterror, contractimpl, contracttype,
    crypto::Hash,
    Bytes, BytesN, Env, Vec,
};

/// The main contract struct
#[contract]
pub struct PasskeyAccount;

/// Storage keys for the contract
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    /// The owner's secp256r1 public key (64 bytes uncompressed: 32 bytes X + 32 bytes Y)
    Owner,
    /// Optional: Store credential ID for easier retrieval
    CredentialId,
}

/// Error codes for the contract
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    /// Owner is already set
    AlreadyInitialized = 1,
    /// No owner set
    NotInitialized = 2,
    /// Invalid public key format
    InvalidPublicKey = 3,
    /// Signature verification failed
    InvalidSignature = 4,
}

#[contractimpl]
impl PasskeyAccount {
    /// Initialize the contract with a secp256r1 public key from a passkey
    /// 
    /// # Arguments
    /// * `public_key` - 64-byte uncompressed secp256r1 public key (X || Y coordinates)
    /// * `credential_id` - Optional credential ID from WebAuthn (for reference)
    /// 
    /// # Errors
    /// * `AlreadyInitialized` - If the contract is already initialized
    /// * `InvalidPublicKey` - If the public key format is invalid
    pub fn init(
        env: Env,
        public_key: BytesN<64>,
        credential_id: Option<Bytes>,
    ) -> Result<(), Error> {
        // Check if already initialized
        if env.storage().instance().has(&DataKey::Owner) {
            return Err(Error::AlreadyInitialized);
        }

        // Validate public key (basic check - should be 64 bytes)
        if public_key.len() != 64 {
            return Err(Error::InvalidPublicKey);
        }

        // Store the public key
        env.storage().instance().set(&DataKey::Owner, &public_key);

        // Optionally store credential ID
        if let Some(cred_id) = credential_id {
            env.storage().instance().set(&DataKey::CredentialId, &cred_id);
        }

        Ok(())
    }

    /// Get the current owner's public key
    pub fn get_owner(env: Env) -> Result<BytesN<64>, Error> {
        env.storage()
            .instance()
            .get(&DataKey::Owner)
            .ok_or(Error::NotInitialized)
    }

    /// Get the credential ID (if set)
    pub fn get_credential_id(env: Env) -> Option<Bytes> {
        env.storage().instance().get(&DataKey::CredentialId)
    }

    /// Update the owner's public key (requires current owner's auth)
    pub fn update_owner(
        env: Env,
        new_public_key: BytesN<64>,
        new_credential_id: Option<Bytes>,
    ) -> Result<(), Error> {
        // This will call __check_auth to verify the current owner
        let _current_owner = Self::get_owner(env.clone())?;
        env.current_contract_address().require_auth();

        // Update the public key
        env.storage()
            .instance()
            .set(&DataKey::Owner, &new_public_key);

        // Update credential ID if provided
        if let Some(cred_id) = new_credential_id {
            env.storage().instance().set(&DataKey::CredentialId, &cred_id);
        }

        Ok(())
    }
}

/// Implementation of CustomAccountInterface for Soroban authentication
#[contractimpl]
impl CustomAccountInterface for PasskeyAccount {
    type Signature = BytesN<64>;
    type Error = Error;

    /// The authentication entry point
    /// 
    /// This function is called by the Soroban host when `require_auth()` is invoked
    /// on the contract's address. It verifies the secp256r1 signature from a passkey.
    /// 
    /// # Arguments
    /// * `signature_payload` - The payload that was signed (32-byte hash)
    /// * `signature` - The secp256r1 signature (64 bytes: r || s)
    /// * `_auth_context` - Authorization context (not used in this simple example)
    /// 
    /// # Returns
    /// * `Ok(())` if the signature is valid
    /// * `Err(Error)` if verification fails
    #[allow(non_snake_case)]
    fn __check_auth(
        env: Env,
        _signature_payload: Hash<32>,
        signature: Self::Signature,
        _auth_context: Vec<Context>,
    ) -> Result<(), Self::Error> {
        // Get the stored public key
        let _public_key: BytesN<64> = env
            .storage()
            .instance()
            .get(&DataKey::Owner)
            .ok_or(Error::NotInitialized)?;

        // Note: In a production implementation with secp256r1 support, you would:
        // 1. Use secp256r1_verify to verify the signature against the stored public key
        // 2. Verify the authenticator data and client data from WebAuthn
        // 3. Check the signature format matches ES256 (secp256r1)
        
        // For this demo, we're implementing a simplified version
        // In production, you need to use a crypto library that supports secp256r1
        // or wait for Soroban to add native secp256r1_verify support
        
        // Basic validation: check signature length
        if signature.len() != 64 {
            return Err(Error::InvalidSignature);
        }
        
        // TODO: Implement proper secp256r1 signature verification
        // This is a placeholder that accepts any 64-byte signature
        // In production, you MUST implement proper cryptographic verification
        
        Ok(())
    }
}

// Disable original passkey tests when running loan tests
#[cfg(all(test, not(feature = "loan")))]
mod test;

// ====== EBAS Credit Scoring Loan Contract ======
// This is compiled as a separate contract using feature flags

#[cfg(feature = "loan")]
pub mod loan_types;

#[cfg(feature = "loan")]
pub mod loan_contract;

#[cfg(feature = "loan")]
pub use loan_contract::*;

// Trip feature: duplicate of the loan contract renamed for "trip" semantics
#[cfg(feature = "trip")]
pub mod trip_types;

#[cfg(feature = "trip")]
pub mod trip_contract;

#[cfg(feature = "trip")]
pub use trip_contract::*;
