// Base64 URL encoding utilities (adapted from kalepail/soroban-passkey)
//
// Copyright (c) 2024 Tyler van der Hoeven
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

use soroban_sdk::{Bytes, Env};

const ALPHABET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

/// Decode base64url bytes in Soroban environment
pub fn decode(env: &Env, base64_url: &Bytes) -> Result<Bytes, &'static str> {
    let mut output = Bytes::new(env);
    let input = base64_url.to_vec();
    
    if input.is_empty() {
        return Ok(output);
    }

    // Remove padding
    let input_len = input.len();
    let mut actual_len = input_len;
    
    // Base64url doesn't use padding, but handle it if present
    while actual_len > 0 && input.get(actual_len - 1) == Some(&(b'=' as u32)) {
        actual_len -= 1;
    }

    let mut acc = 0u32;
    let mut acc_len = 0u32;
    
    for i in 0..actual_len {
        let byte = input.get(i).ok_or("Invalid input")? as u8;
        let val = decode_char(byte)?;
        
        acc = (acc << 6) | (val as u32);
        acc_len += 6;
        
        if acc_len >= 8 {
            acc_len -= 8;
            let byte_val = (acc >> acc_len) & 0xFF;
            output.push_back(byte_val);
        }
    }
    
    Ok(output)
}

fn decode_char(byte: u8) -> Result<u8, &'static str> {
    match byte {
        b'A'..=b'Z' => Ok(byte - b'A'),
        b'a'..=b'z' => Ok(byte - b'a' + 26),
        b'0'..=b'9' => Ok(byte - b'0' + 52),
        b'-' => Ok(62),
        b'_' => Ok(63),
        _ => Err("Invalid base64url character"),
    }
}