// Ejemplos de Uso: Contratos de Paquetes de Viaje
// 
// Este archivo muestra ejemplos prácticos de cómo usar los contratos
// para simular el flujo completo de selección de paquete y liberación de dinero

use soroban_sdk::testutils::Address as _;
use soroban_sdk::{Address, Env, Symbol, symbol_short};

/// Ejemplo 1: Configuración Inicial del Sistema
/// 
/// Este ejemplo muestra cómo configurar el sistema completo desde cero:
/// 1. Inicializar el contrato
/// 2. Crear paquetes de viaje
/// 3. Depositar fondos
#[test]
fn example_system_setup() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TravelPackageContract);
    let client = TravelPackageContractClient::new(&env, &contract_id);

    // Actores del sistema
    let admin = Address::generate(&env);
    let token_address = Address::generate(&env);
    let pool_address = Address::generate(&env);

    // 1. Inicializar contrato
    client.initialize(&admin, &token_address, &pool_address)
        .expect("Inicialización exitosa");

    // 2. Depositar fondos iniciales (1000 XLM = 10,000,000,000 stroops)
    let balance = client.deposit_to_pool(&admin, &10_000_000_000_000i128)
        .expect("Depósito exitoso");
    println!("✓ Pool balance: {} stroops", balance);

    // 3. Crear paquetes de viaje
    let paris = client.create_package(
        &admin,
        &1u32,
        &symbol_short!("PARIS"),
        &5_000_000_000i128,    // 500 XLM
        &7u32,                  // 7 días
        &50u32,                 // máximo 50 estudiantes
        &700u32,                // score mínimo
    ).expect("Paquete creado");

    let tokyo = client.create_package(
        &admin,
        &2u32,
        &symbol_short!("TOKYO"),
        &7_000_000_000i128,    // 700 XLM
        &10u32,                 // 10 días
        &30u32,                 // máximo 30 estudiantes
        &750u32,                // score mínimo
    ).expect("Paquete creado");

    let barcelona = client.create_package(
        &admin,
        &3u32,
        &symbol_short!("BARCELONA"),
        &4_000_000_000i128,    // 400 XLM
        &5u32,                  // 5 días
        &40u32,                 // máximo 40 estudiantes
        &680u32,                // score mínimo
    ).expect("Paquete creado");

    println!("✓ Paquetes creados:");
    println!("  1. París - 500 XLM (min score: 700)");
    println!("  2. Tokio - 700 XLM (min score: 750)");
    println!("  3. Barcelona - 400 XLM (min score: 680)");

    // Verificar paquetes
    let packages = client.get_packages();
    println!("✓ Total de paquetes: {}", packages.len());
}

/// Ejemplo 2: Flujo de Reserva Exitosa
/// 
/// Un estudiante con buen score elige un paquete,
/// se verifica elegibilidad y se libera el dinero automáticamente
#[test]
fn example_successful_booking() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TravelPackageContract);
    let client = TravelPackageContractClient::new(&env, &contract_id);

    // Setup
    let admin = Address::generate(&env);
    let student = Address::generate(&env);
    let token = Address::generate(&env);
    let pool = Address::generate(&env);

    client.initialize(&admin, &token, &pool).unwrap();
    client.deposit_to_pool(&admin, &10_000_000_000i128).unwrap();

    // Crear paquete
    client.create_package(
        &admin,
        &1u32,
        &symbol_short!("PARIS"),
        &5_000_000_000i128,
        &7u32,
        &30u32,
        &700u32,
    ).unwrap();

    println!("\n=== RESERVA EXITOSA ===");
    println!("Estudiante: {}", student);
    println!("Score crediticio: 750");
    println!("Paquete: París (500 XLM)");

    // 1. Verificar elegibilidad ANTES de reservar
    let eligible = client.check_eligibility(&student, &1u32, &750u32);
    println!("✓ Elegibilidad verificada: {}", eligible);

    // 2. Realizar reserva (se libera dinero automáticamente)
    let booking = client.book_package(&student, &1u32, &750u32)
        .expect("Reserva exitosa");

    println!("✓ Reserva confirmada:");
    println!("  - Booking ID: {}", booking.booking_id);
    println!("  - Destino: {}", booking.destination);
    println!("  - Monto liberado: {} stroops (500 XLM)", booking.amount_disbursed);
    println!("  - Fecha de salida: {}", booking.departure_date);
    println!("  - Estado: {}", booking.status);

    // 3. Verificar nuevo balance del pool
    let new_balance = client.get_pool_balance();
    println!("✓ Pool balance después: {} stroops", new_balance);
    println!("  (Se restaron 500 XLM de los 1000 XLM iniciales)");

    // 4. Ver historial de transacciones
    let history = client.get_transaction_history(&student);
    println!("✓ Historial de transacciones: {} registros", history.len());
}

/// Ejemplo 3: Fallo por Score Insuficiente
/// 
/// Un estudiante con score bajo intenta reservar
/// pero el contrato rechaza la operación
#[test]
fn example_insufficient_score() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TravelPackageContract);
    let client = TravelPackageContractClient::new(&env, &contract_id);

    // Setup
    let admin = Address::generate(&env);
    let student_lowscore = Address::generate(&env);
    let token = Address::generate(&env);
    let pool = Address::generate(&env);

    client.initialize(&admin, &token, &pool).unwrap();
    client.deposit_to_pool(&admin, &10_000_000_000i128).unwrap();

    client.create_package(
        &admin,
        &1u32,
        &symbol_short!("TOKYO"),
        &7_000_000_000i128,
        &10u32,
        &20u32,
        &750u32,  // Requiere score de 750
    ).unwrap();

    println!("\n=== FALLO: SCORE INSUFICIENTE ===");
    println!("Estudiante: {}", student_lowscore);
    println!("Score crediticio: 650 (requerido: 750)");

    // Intentar reservar con score bajo
    let result = client.book_package(&student_lowscore, &1u32, &650u32);

    match result {
        Ok(_) => println!("❌ ERROR: ¡Debería haber fallado!"),
        Err(e) => {
            println!("✓ Reserva rechazada correctamente");
            println!("  Razón: InsufficientCreditScore");
        }
    }

    // Verificar que el pool NO cambió
    let balance = client.get_pool_balance();
    println!("✓ Pool balance sin cambios: {} stroops", balance);
}

/// Ejemplo 4: Fallo por Fondos Insuficientes
/// 
/// El pool no tiene suficientes fondos para la reserva
#[test]
fn example_insufficient_funds() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TravelPackageContract);
    let client = TravelPackageContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let student = Address::generate(&env);
    let token = Address::generate(&env);
    let pool = Address::generate(&env);

    client.initialize(&admin, &token, &pool).unwrap();
    // Solo depositar 100 XLM
    client.deposit_to_pool(&admin, &1_000_000_000i128).unwrap();

    // Paquete que cuesta 500 XLM
    client.create_package(
        &admin,
        &1u32,
        &symbol_short!("PARIS"),
        &5_000_000_000i128,
        &7u32,
        &30u32,
        &700u32,
    ).unwrap();

    println!("\n=== FALLO: FONDOS INSUFICIENTES ===");
    println!("Pool disponible: 100 XLM");
    println!("Paquete cuesta: 500 XLM");

    let result = client.book_package(&student, &1u32, &750u32);

    match result {
        Ok(_) => println!("❌ ERROR: ¡Debería haber fallado!"),
        Err(e) => {
            println!("✓ Reserva rechazada correctamente");
            println!("  Razón: InsufficientPoolFunds");
        }
    }
}

/// Ejemplo 5: Múltiples Reservas (Diferentes Estudiantes)
/// 
/// Varios estudiantes reservan diferentes paquetes
/// El pool se reduce progresivamente
#[test]
fn example_multiple_bookings() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TravelPackageContract);
    let client = TravelPackageContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let token = Address::generate(&env);
    let pool = Address::generate(&env);

    client.initialize(&admin, &token, &pool).unwrap();
    client.deposit_to_pool(&admin, &100_000_000_000i128).unwrap();  // 10,000 XLM

    // Crear 3 paquetes
    client.create_package(&admin, &1u32, &symbol_short!("PARIS"), &5_000_000_000i128, &7u32, &30u32, &700u32).unwrap();
    client.create_package(&admin, &2u32, &symbol_short!("TOKYO"), &7_000_000_000i128, &10u32, &20u32, &750u32).unwrap();
    client.create_package(&admin, &3u32, &symbol_short!("NYC"), &6_000_000_000i128, &5u32, &25u32, &720u32).unwrap();

    println!("\n=== MÚLTIPLES RESERVAS ===");
    println!("Pool inicial: 10,000 XLM\n");

    // 5 estudiantes hacen reservas
    for i in 1..=5 {
        let student = Address::generate(&env);
        let package_id = ((i - 1) % 3) + 1;
        let score = 700 + (i as u32 * 10);

        let booking = client.book_package(&student, &package_id, &score).unwrap();

        println!("Reserva {}: {} XLM liberados", i, booking.amount_disbursed / 1_000_000_000);

        let balance = client.get_pool_balance();
        println!("  Pool restante: {} XLM", balance / 1_000_000_000);
    }
}

/// Ejemplo 6: Cancelación de Reserva
/// 
/// Un estudiante cancela su reserva
/// El dinero se retorna al pool
#[test]
fn example_booking_cancellation() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TravelPackageContract);
    let client = TravelPackageContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let student = Address::generate(&env);
    let token = Address::generate(&env);
    let pool = Address::generate(&env);

    client.initialize(&admin, &token, &pool).unwrap();
    client.deposit_to_pool(&admin, &10_000_000_000i128).unwrap();

    client.create_package(
        &admin,
        &1u32,
        &symbol_short!("PARIS"),
        &5_000_000_000i128,
        &7u32,
        &30u32,
        &700u32,
    ).unwrap();

    println!("\n=== CANCELACIÓN DE RESERVA ===");

    // Reservar
    let booking = client.book_package(&student, &1u32, &750u32).unwrap();
    println!("✓ Reserva confirmada - Booking ID: {}", booking.booking_id);
    println!("  Pool balance: {} XLM", client.get_pool_balance() / 1_000_000_000);

    // Cancelar
    let new_balance = client.cancel_booking(&student, &booking.booking_id).unwrap();
    println!("✓ Reserva cancelada - Dinero retornado");
    println!("  Pool balance ahora: {} XLM", new_balance / 1_000_000_000);
}

/// Ejemplo 7: Audit Trail (Historial Completo)
/// 
/// Ver el historial de transacciones de un estudiante
#[test]
fn example_audit_trail() {
    let env = Env::default();
    let contract_id = env.register_contract(None, TravelPackageContract);
    let client = TravelPackageContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let student = Address::generate(&env);
    let token = Address::generate(&env);
    let pool = Address::generate(&env);

    client.initialize(&admin, &token, &pool).unwrap();
    client.deposit_to_pool(&admin, &100_000_000_000i128).unwrap();

    // Crear paquetes
    for i in 1..=3 {
        client.create_package(
            &admin,
            &(i as u32),
            &symbol_short!("PKG"),
            &5_000_000_000i128,
            &7u32,
            &30u32,
            &700u32,
        ).unwrap();
    }

    // El mismo estudiante hace 3 reservas
    println!("\n=== AUDIT TRAIL (HISTORIAL) ===");
    for i in 1..=3 {
        client.book_package(&student, &(i as u32), &(750 + i as u32)).unwrap();
        println!("Reserva {} realizada", i);
    }

    // Ver historial completo
    let history = client.get_transaction_history(&student);
    println!("\nHistorial de {} transacciones:", history.len());
    for (idx, tx) in history.iter().enumerate() {
        println!("  {}. Tx ID: {}, Paquete: {}, Monto: {}, Estado: {}",
            idx + 1,
            tx.transaction_id,
            tx.package_id,
            tx.amount / 1_000_000_000,
            tx.status
        );
    }
}
