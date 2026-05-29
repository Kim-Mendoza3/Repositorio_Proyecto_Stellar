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

# 🌐 Colaboración en el Ecosistema Stellar

Durante el desarrollo de **SmartTrip**, el equipo participó activamente en espacios comunitarios del ecosistema Stellar para resolver dudas técnicas relacionadas con Soroban, contratos inteligentes y despliegue en Testnet.

## Participación Comunitaria

### Discord — Stellar Developers Community

Temas consultados:

- Configuración inicial de Soroban CLI.
- Manejo de almacenamiento en Smart Contracts.
- Validaciones de autorización (`require_auth`).
- Estrategias para despliegue en Stellar Testnet.

### Ejemplo de interacción realizada

**Pregunta publicada:**

> "We are developing a decentralized educational travel platform using Soroban smart contracts. What is the recommended approach for managing sponsorship balances while minimizing storage costs?"

**Respuesta obtenida de la comunidad:**

Se recomendó utilizar estructuras eficientes de almacenamiento (`Map`) y separar metadata del estado financiero del contrato.

---

### GitHub Discussions / Comunidad Técnica

Se participó consultando sobre:

- buenas prácticas en Rust para Soroban.
- optimización de almacenamiento.
- testing de contratos inteligentes.

**Ejemplo de contribución realizada:**

> "Our team implemented a sponsorship-based educational funding contract and discovered that balance validation using `unwrap_or(0)` simplified edge-case handling."

---


# 📋 Gestión del Proyecto — eduScrum

Proyecto desarrollado utilizando metodología **eduScrum**.

El trabajo se dividió en sprints incrementales para mantener trazabilidad, colaboración y seguimiento continuo.

---

# 👥 Equipo de Trabajo

| Integrante | Rol |
|------------|------|
| Kimberly Mendoza Hernandez | Smart Contract Developer |
| Arcangel Gonzalez Cruz | Frontend Developer |
| Angel Antonio Lopez Perez | Backend / Integration Developer |

---

# 📌 Product Backlog

| ID | Historia de Usuario | Prioridad |
|----|--------------------|------------|
| US01 | Como estudiante quiero crear una campaña de viaje para solicitar financiamiento. | Alta |
| US02 | Como patrocinador quiero aportar fondos a campañas académicas. | Alta |
| US03 | Como usuario quiero consultar balances registrados en blockchain. | Alta |
| US04 | Como estudiante quiero recibir tokens por completar actividades académicas. | Media |
| US05 | Como administrador quiero validar despliegues y transacciones. | Media |

---

# 🚀 Sprint Backlog

## Sprint 1

Objetivo:

Construir infraestructura base del proyecto.

Tareas:

- Configuración Rust.
- Instalación Soroban CLI.
- Inicialización React.
- Configuración Node.js.

Estado:

DONE ✅

---

## Sprint 2

Objetivo:

Implementación del Smart Contract.

Tareas:

- lógica de balances.
- sponsorship funding.
- transferencias.
- validaciones de seguridad.

Estado:

DONE ✅

---

## Sprint 3

Objetivo:

Integración completa del ecosistema.

Tareas:

- conectar frontend.
- conectar backend.
- pruebas en Stellar Testnet.
- documentación final.

Estado:

DONE ✅

---

# 📊 Sprint Board

## To Do

- Preparar documentación final.

## In Progress

- Ajustes de testing.

## Done

✔ Smart Contract.

✔ Frontend React.

✔ Backend Node.js.

✔ Stellar Testnet deployment.

✔ Testing.

✔ README.

---

# 📝 GitHub Issues

### Issue #1 — Smart Contract Logic

**Descripción**

Implementar contrato inteligente Soroban para gestionar financiamiento estudiantil.

**Tasks**

- [x] create contract structure
- [x] implement balances
- [x] add transfer logic
- [x] validate signatures
- [x] testing

---

### Issue #2 — React Dashboard

**Descripción**

Construcción del dashboard principal.

**Tasks**

- [x] create UI
- [x] student campaign form
- [x] sponsor panel
- [x] wallet interaction

---

### Issue #3 — Backend API

**Descripción**

Crear API auxiliar Node.js.

**Tasks**

- [x] authentication
- [x] routes
- [x] metadata handling
- [x] integration support

---

# ☀ Daily Scrum Logs

## Daily 1

**¿Qué hice ayer?**

Configuración inicial del entorno.

**¿Qué haré hoy?**

Implementar almacenamiento del contrato.

**¿Existe algún bloqueo?**

Configuración de Soroban CLI.

---

## Daily 2

**¿Qué hice ayer?**

Finalización de balances y transferencias.

**¿Qué haré hoy?**

Conectar frontend con backend.

**¿Existe algún bloqueo?**

Testing de endpoints.

---

## Daily 3

**¿Qué hice ayer?**

Integración completa.

**¿Qué haré hoy?**

Documentación y revisión final.

**¿Existe algún bloqueo?**

No.

---

# 🔄 Sprint Retrospective

## What went well

- Buena división de responsabilidades.
- Integración exitosa entre tecnologías.
- Testing satisfactorio.

---

## What could improve

- Reducir tiempo invertido en configuración inicial.
- Mejorar automatización de despliegues.

---

## Action Items

- incorporar CI/CD.
- ampliar cobertura de pruebas.
- mejorar monitoreo del contrato.

---

# 🌱 Vinculación y Sostenibilidad

SmartTrip fue diseñado con visión de crecimiento real dentro del ecosistema educativo y blockchain.

---

## Feedback Recibido

Feedback simulado basado en revisión académica y usuarios potenciales.

### Estudiantes

Comentarios:

> "La transparencia del financiamiento genera mayor confianza."

Sugerencia:

Agregar métricas visuales del avance de campañas.

---

### Patrocinadores

Comentarios:

> "La plataforma facilita visualizar el impacto educativo de cada aportación."

Sugerencia:

Implementar dashboard de analytics.

---

## Mejoras Basadas en Feedback

Se propusieron nuevas funcionalidades:

- estadísticas de campañas.
- integración institucional.
- reputación académica blockchain.
- dashboards avanzados.

---

# 🛣️ Roadmap de Crecimiento

## V1 — MVP

✔ crowdfunding educativo.

✔ smart contracts.

✔ dashboard inicial.

---

## V2 — Expansión

✔ wallet integration.

✔ analytics.

✔ sistema avanzado de recompensas.

---

## V3 — Escalabilidad

✔ alianzas universitarias.

✔ fundaciones internacionales.

✔ marketplace educativo descentralizado.

---

# 📈 Modelo de Sostenibilidad

SmartTrip propone sostenibilidad mediante:

- alianzas con universidades.
- colaboración con fundaciones educativas.
- patrocinio empresarial.
- programas de visibilidad institucional.

Esto permite crecimiento continuo sin depender exclusivamente de financiamiento académico.

---

# 🔥 Conventional Commit Examples

```bash
feat(contract): implement sponsorship logic

feat(frontend): add campaign dashboard

fix(api): correct balance endpoint

docs(readme): update installation guide

test(contract): add reward validation tests

refactor(frontend): optimize dashboard rendering
```

