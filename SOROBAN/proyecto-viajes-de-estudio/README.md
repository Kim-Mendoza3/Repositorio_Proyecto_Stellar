# 🎒 Proyecto: Viajes de Estudio — dApp

Aplicación demo que muestra autenticación con Passkeys (WebAuthn) y funcionalidades para gestionar viajes de estudio: roles (estudiantes, empresas, escuela), solicitudes de viaje y panel de control. Basado en la plantilla original de Soroban/Passkey pero adaptado para la temática de viajes de estudio.

## 🎯 Estado Actual (Fase MVP)

**Funcionalidades Operativas:**
- ✅ Transacciones reales en blockchain Stellar testnet
- ✅ Cálculo de scoring crediticio
- ✅ API de solicitudes de viaje (`/api/request-trip`)
- ✅ Flujo de verificación de ingresos
- ✅ Notificaciones de éxito con hash de transacción

**Correcciones Recientes:**
- ✅ Node.js actualizado a v20.19.5 (desde v10.19.0)
- ✅ Montos de transferencia XLM optimizados (rango 50-500 XLM)
- ✅ Dirección Stellar mock inválida reemplazada con dirección válida de testnet
- ✅ Mensajes de error de Horizon API mejorados (amigables al usuario)
- ✅ Caché de Next.js limpiada y servidor reiniciado

**Últimas Transacciones Exitosas:**
- Hash 1: `c53551b31642959779f6db9d1e4ff90bf3f31c70a09e0476eb90037e97d20fbb`
- Hash 2: `7dbf366ecd09c4e3f84f879e4a0b31b342c89d8da42f06839c675456958a1947`
- Monto: 295.5 XLM (~$591 USDC equivalente)
- Estado: ✅ Confirmadas en Stellar testnet

## 📋 Estrategia de Implementación

**Enfoque Práctico: Funcional Primero, IA Después**

### Fase 1-3: MVP sin IA (Semanas 1-2)
1. ✅ Transacciones blockchain funcionando
2. 🔄 Autenticación biométrica (Passkeys)
3. 🔄 Dashboard autenticado
4. 🔄 Flujo completo de crédito (sin voz)

### Fase 4: Mejora con IA (Semana 3 - Opcional)
5. ⏭️ Asistente de voz
6. ⏭️ Chat con IA
7. ⏭️ Sugerencias inteligentes

**Ventajas de este enfoque:**
- ✅ MVP funcional más rápido
- ✅ Sin dependencias de APIs externas inicialmente
- ✅ Reducción de costos durante desarrollo
- ✅ Base sólida antes de agregar IA
- ✅ Si IA falla, el sistema sigue operativo

## 📋 Requisitos Previos

- **Rust** 1.75+
- **Node.js** 18+
- **Stellar CLI** (soroban-cli)
- **HTTPS** (para WebAuthn - incluye certificado self-signed para desarrollo)

## 🚀 Instalación Rápida

```bash
# Clonar el proyecto
git clone <tu-repo>
cd soroban-passkey-demo

# Instalar dependencias del contrato
cd contract
make build

# Instalar dependencias del frontend
cd ../frontend
npm install

# Iniciar desarrollo
npm run dev
```

## 📁 Estructura del Proyecto

```
soroban-passkey-demo/
├── contract/               # Contrato Soroban en Rust
│   ├── src/
│   │   ├── lib.rs         # Contrato principal con __check_auth
│   │   └── test.rs        # Tests del contrato
│   ├── Cargo.toml
│   └── Makefile
├── frontend/              # Aplicación Next.js
│   ├── src/
│   │   ├── app/          # App Router de Next.js 14
│   │   ├── components/   # Componentes React
│   │   ├── hooks/        # Custom hooks (usePasskey, useStellar)
│   │   └── lib/          # Utilidades y configuración
│   ├── package.json
│   └── next.config.js
├── scripts/              # Scripts de deployment
└── README.md
```

## 🔧 Cómo Funciona

### 1. Registro de Passkey

```typescript
// El usuario crea un passkey (clave biométrica)
const credential = await navigator.credentials.create({
  publicKey: {
    challenge: randomChallenge,
    rp: { name: "Soroban Passkey Demo" },
    user: { id, name, displayName },
    pubKeyCredParams: [{ type: "public-key", alg: -7 }], // ES256 (secp256r1)
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      userVerification: "required"
    }
  }
});
```

### 2. Almacenamiento en el Contrato

```rust
// La clave pública se almacena en el contrato Soroban
pub fn init(env: Env, public_key: BytesN<64>) {
    env.storage().instance().set(&DataKey::Owner, &public_key);
}
```

### 3. Autenticación

```rust
// El contrato verifica la firma usando secp256r1
fn __check_auth(
    env: Env,
    signature_payload: Hash<32>,
    signature: BytesN<64>,
    _auth_context: Vec<Context>,
) -> Result<(), Error> {
    let public_key: BytesN<64> = env.storage()
        .instance()
        .get(&DataKey::Owner)
        .unwrap();
    
    env.crypto().secp256r1_verify(
        &public_key,
        &signature_payload.into(),
        &signature
    );
    Ok(())
}
```

## 🌐 Desarrollo con HTTPS

WebAuthn requiere HTTPS. Para desarrollo local:

```bash
cd frontend
npm run dev:https
# Acepta el certificado self-signed en el navegador
```

## 🧪 Testing

```bash
# Tests del contrato
cd contract
cargo test

# Tests del frontend
cd frontend
npm test
```

## 📦 Deployment

### Testnet

```bash
# Compilar el contrato
cd contract
make build

# Desplegar a Stellar Testnet
./scripts/deploy-testnet.sh

# Configurar el frontend
cd frontend
cp .env.example .env.local
# Edita .env.local con el CONTRACT_ID

# Deploy del frontend (Vercel)
npm run build
vercel deploy
```

## 🎓 Recursos

- [Soroban Documentation](https://soroban.stellar.org/)
- [WebAuthn Guide](https://webauthn.guide/)
- [Stellar SDK](https://stellar.github.io/js-stellar-sdk/)

## ⏱️ Tiempo de Implementación

**Desarrollo completo**: ~4-6 horas

- Contrato Soroban: 1.5-2 horas
- Frontend Next.js: 2-3 horas
- Integración y testing: 0.5-1 hora

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios.

## 📄 Licencia

MIT License - ver LICENSE para más detalles

## 👨‍💻 Autor

Creado con ❤️ para la comunidad de Stellar/Soroban
