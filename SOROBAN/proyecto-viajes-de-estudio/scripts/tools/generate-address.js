const { Keypair } = require('@stellar/stellar-sdk');

// Generate a valid Stellar keypair
const keypair = Keypair.random();
console.log('Public Key (Address):', keypair.publicKey());
console.log('Length:', keypair.publicKey().length);
console.log('Secret Key (save this for testing):', keypair.secret());
