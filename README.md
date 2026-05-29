# 🌍 SmarTrip
### Plataforma Descentralizada para Viajes Estudiantiles

![Soroban](https://img.shields.io/badge/Soroban-Smart%20Contracts-blue)
![Rust](https://img.shields.io/badge/Rust-Programming-orange)
![React](https://img.shields.io/badge/React-Frontend-61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![Stellar Testnet](https://img.shields.io/badge/Stellar-Testnet-purple)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📖 Descripción del Proyecto

**SmarTrip** es una plataforma Web3 descentralizada diseñada para facilitar la organización y financiamiento de viajes educativos, culturales y de investigación para estudiantes.

La plataforma conecta estudiantes, instituciones, empresas de turismo y fundaciones mediante contratos inteligentes desarrollados en **Soroban/Rust** sobre **Stellar Testnet**, garantizando transparencia, trazabilidad y seguridad en el uso de los fondos.

Además, implementa un sistema de recompensas basado en tokens que incentiva el cumplimiento de actividades académicas relacionadas con los viajes.

---

## Problemática

Muchos estudiantes enfrentan limitaciones económicas para participar en:

- viajes académicos
- congresos
- actividades de investigación
- intercambios culturales
- visitas técnicas

Los métodos tradicionales de financiamiento suelen presentar:

- poca transparencia
- burocracia administrativa
- dificultad para verificar el uso correcto de los fondos
- ausencia de incentivos académicos posteriores.

---

## Solución Propuesta

SmarTrip utiliza tecnologías Web3 para crear un ecosistema de financiamiento transparente.

Los estudiantes pueden crear campañas de viaje especificando:

- destino
- propósito académico
- presupuesto requerido
- duración del viaje

Empresas, organizaciones o fundaciones pueden actuar como patrocinadores aportando fondos.

Los contratos inteligentes gestionan automáticamente:

✔ registro de campañas

✔ almacenamiento de contribuciones

✔ administración de balances

✔ distribución segura de fondos

✔ emisión de recompensas tokenizadas.

---

# ⚙️ Arquitectura del Sistema

```plaintext
                    ┌───────────────────────┐
                    │       React UI        │
                    │ Dashboard / Frontend  │
                    └──────────┬────────────┘
                               │ API Calls
                               ▼
                    ┌───────────────────────┐
                    │      Node.js API      │
                    │ Auth / Metadata       │
                    └──────────┬────────────┘
                               │ Contract Calls
                               ▼
          ┌──────────────────────────────────────────┐
          │ Smart Contract Soroban (Rust)           │
          │                                          │
          │ • Funding Management                     │
          │ • Sponsorship Registration               │
          │ • Reward Token Logic                     │
          │ • Balance Validation                     │
          └──────────────────────────────────────────┘
                               │
                               ▼
                    ┌───────────────────────┐
                    │ Stellar Testnet       │
                    │ Blockchain Network    │
                    └───────────────────────┘
```

---

# 🚀 Funcionalidades Principales

## 👨‍🎓 Gestión de Campañas

Los estudiantes pueden:

- crear solicitudes de viaje
- definir metas de financiamiento
- registrar objetivos académicos
- consultar el estado del financiamiento.

---

## 💰 Patrocinios Descentralizados

Patrocinadores pueden:

- apoyar campañas estudiantiles
- registrar contribuciones on-chain
- visualizar historial de financiamiento.

---

## 🔐 Smart Contract Management

El contrato inteligente administra:

- balances
- aportaciones
- validaciones de seguridad
- autorización de transacciones
- distribución de recompensas.

---

## 🪙 Sistema de Tokens Académicos

Los estudiantes reciben tokens por:

- completar investigaciones
- publicar artículos
- entregar reportes académicos
- compartir evidencia del viaje.

---

# 🛠️ Stack Tecnológico

| Tecnología | Uso |
|------------|-----|
| Soroban | Smart Contracts |
| Rust | Desarrollo del contrato |
| Stellar Testnet | Blockchain de pruebas |
| React | Frontend |
| Node.js | Backend/API |
| GitHub | Control de versiones |

---

# 📁 Estructura del Proyecto

```plaintext
SmarTrip
│
├── contract/
│   ├── src/
│   │   ├── lib.rs
│   │   ├── storage.rs
│   │   └── tests.rs
│   │
│   └── Cargo.toml
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   │
│   └── package.json
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── config/
│   └── server.js
│
└── README.md
```

---

# 🔧 Instalación Local

## Requisitos Previos

Instalar:

- Rust
- Cargo
- Soroban CLI
- Node.js
- Git

---

## 1. Clonar repositorio

```bash
git clone https://github.com/usuario/edutravel-chain.git

cd edutravel-chain
```

---

## 2. Configurar Smart Contract

Entrar al directorio:

```bash
cd contract
```

Compilar:

```bash
cargo build --target wasm32-unknown-unknown --release
```

Verificar buenas prácticas:

```bash
cargo clippy
```

Ejecutar pruebas:

```bash
cargo test
```

---

## 3. Configurar Frontend

```bash
cd frontend

npm install

npm run dev
```

---

## 4. Configurar Backend

```bash
cd backend

npm install

npm start
```

---

# 🌐 Configuración Stellar Testnet

Agregar red de pruebas:

```bash
soroban network add \
--global testnet \
--rpc-url https://soroban-testnet.stellar.org \
--network-passphrase "Test SDF Network ; September 2015"
```

---

## Crear identidad local

```bash
soroban keys generate student-user
```

---

## Desplegar contrato

```bash
soroban contract deploy \
--wasm target/wasm32-unknown-unknown/release/contract.wasm \
--source student-user \
--network testnet
```

---

# 🧪 Testing

El proyecto implementa pruebas unitarias para validar:

- creación de campañas
- lógica de balances
- validaciones de seguridad
- distribución de recompensas
- transferencias autorizadas.

Ejecutar:

```bash
cargo test
```

---

# 🔒 Seguridad

Se implementan controles de seguridad:

- validación de firmas (`require_auth`)
- manejo de errores
- protección de balances negativos
- almacenamiento eficiente.

---

# 📝 Conventional Commits

Este proyecto utiliza el estándar **Conventional Commits**.

Ejemplos:

```bash
feat(contract): implement campaign funding logic

feat(frontend): create sponsor dashboard

fix(contract): validate transfer authorization

docs(readme): update installation section

refactor(api): improve reward endpoint

test(contract): add unit tests for balances
```

---

# 📹 Video Demo

Demo del proyecto:

```plaintext
(Agregar enlace de YouTube o Drive)
```

---

# 🛣️ Roadmap

### V1

✔ crowdfunding académico

✔ smart contracts básicos

✔ dashboard inicial

### V2

✔ wallet integration

✔ recompensas automáticas

✔ analytics de campañas

### V3

✔ integración institucional

✔ reputación estudiantil on-chain

✔ marketplace de patrocinadores.

---

# 📜 Licencia

MIT License

Copyright (c) 2026 EduTravel Chain Team

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files.
