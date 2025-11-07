#![cfg(test)]
extern crate std;

use super::*;
use soroban_sdk::{testutils::BytesN as _, Env};

#[test]
fn test_init_success() {
    let env = Env::default();
    let contract_id = env.register(PasskeyAccount, ());
    let client = PasskeyAccountClient::new(&env, &contract_id);

    // Generate a random 64-byte public key (simulating a secp256r1 public key)
    let public_key = BytesN::random(&env);
    let credential_id = Bytes::from_slice(&env, b"test-credential-id");

    // Initialize the contract
    let result = client.init(&public_key, &Some(credential_id.clone()));
    assert!(result.is_ok());

    // Verify the owner was set
    let owner = client.get_owner();
    assert!(owner.is_ok());
    assert_eq!(owner.unwrap(), public_key);

    // Verify credential ID was set
    let stored_cred_id = client.get_credential_id();
    assert_eq!(stored_cred_id, Some(credential_id));
}

#[test]
fn test_init_already_initialized() {
    let env = Env::default();
    let contract_id = env.register(PasskeyAccount, ());
    let client = PasskeyAccountClient::new(&env, &contract_id);

    let public_key = BytesN::random(&env);

    // Initialize once
    client.init(&public_key, &None).unwrap();

    // Try to initialize again
    let result = client.init(&public_key, &None);
    assert_eq!(result, Err(Ok(Error::AlreadyInitialized)));
}

#[test]
fn test_get_owner_not_initialized() {
    let env = Env::default();
    let contract_id = env.register(PasskeyAccount, ());
    let client = PasskeyAccountClient::new(&env, &contract_id);

    // Try to get owner before initialization
    let result = client.get_owner();
    assert_eq!(result, Err(Ok(Error::NotInitialized)));
}

#[test]
fn test_get_credential_id_none() {
    let env = Env::default();
    let contract_id = env.register(PasskeyAccount, ());
    let client = PasskeyAccountClient::new(&env, &contract_id);

    let public_key = BytesN::random(&env);

    // Initialize without credential ID
    client.init(&public_key, &None).unwrap();

    // Verify credential ID is None
    let cred_id = client.get_credential_id();
    assert_eq!(cred_id, None);
}

#[test]
fn test_multiple_keys() {
    let env = Env::default();
    let contract_id = env.register(PasskeyAccount, ());
    let client = PasskeyAccountClient::new(&env, &contract_id);

    // Test with different public keys
    let public_key1 = BytesN::random(&env);
    let public_key2 = BytesN::random(&env);

    // Initialize with first key
    client.init(&public_key1, &None).unwrap();

    // Verify first key is stored
    assert_eq!(client.get_owner().unwrap(), public_key1);
    
    // Ensure second key is different
    assert_ne!(public_key1, public_key2);
}

// Note: Testing __check_auth requires more complex setup with actual signature generation
// This would require secp256r1 signature creation which is typically done off-chain
#[test]
fn test_check_auth_not_initialized() {
    let env = Env::default();
    let contract_id = env.register(PasskeyAccount, ());
    
    // Create a random signature and payload
    let signature = BytesN::random(&env);
    let payload = Hash::random(&env);
    
    // Try to authenticate without initialization
    let result = env.try_invoke_contract_check_auth::<Error>(
        &contract_id,
        &payload,
        signature.into_val(&env),
        &soroban_sdk::vec![&env],
    );
    
    // Should fail because no owner is set
    assert!(result.is_err());
}
