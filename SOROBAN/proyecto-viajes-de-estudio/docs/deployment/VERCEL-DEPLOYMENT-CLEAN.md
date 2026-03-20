# 🚀 Deployment a Vercel - Configuración Limpia

## Estado Actual

✅ **Frontend**: Next.js 14.2.15 completamente funcional
✅ **Blockchain**: Integración directa con contratos Stellar Testnet
✅ **Wallets**: Freighter wallet conectado
✅ **Build**: Npm build funcionando sin errores

## Quick Start - Deploy en Vercel

### 1. Conectar Repositorio a Vercel

```bash
# En https://vercel.com/new
1. Click "Import Git Repository"
2. Selecciona: repositorio_proyecto_stellarr
3. Click Import
```

### 2. Configurar Build Settings

En Vercel Dashboard:

```
Framework Preset:     Next.js
Build Command:        npm run build
Output Directory:     .next
Install Command:      npm install
Node Version:         22.x (LTS)
```

### 3. Environment Variables

Agregar en Vercel (Settings → Environment Variables):

```
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_CONTRACT_ADDRESS=CBELUS7MVYDXFKB3262ZRCZ5RR3EG3HG4FJ3L6OLSO3JJNVVT43V2NBF
NEXT_PUBLIC_TOKEN_CONTRACT_ID=CA7N7ME5RCXHM3YOCM3YTM5FTKRIPVAJAEZWKLUJNINDQZQV73GNCHAA
NEXT_PUBLIC_FREIGHTER_API_ENABLED=true
```

### 4. Deploy

```bash
# Automático al hacer push a main
git push origin main

# O hacer redeploy desde Vercel Dashboard
```

## Verificación Post-Deploy

### ✅ Checklist

- [ ] App carga en https://viajes-estudio.vercel.app
- [ ] Freighter wallet se conecta
- [ ] Página principal muestra correctamente
- [ ] Client-side routing funciona
- [ ] Tailwind CSS estilos se aplican
- [ ] No hay errores en console

### 🔍 Verificar en Browser Console

```javascript
// Debe mostrar true
console.log(typeof window !== 'undefined');

// Debe mostrar valores correctos
console.log({
  network: process.env.NEXT_PUBLIC_STELLAR_NETWORK,
  contract: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
});

// Freighter disponible
console.log(typeof window.freighter !== 'undefined');
```

## Architecture - Frontend Only

```
┌─────────────────────────────────────┐
│   Vercel Frontend (Next.js SPA)     │
│   - React Components                │
│   - Tailwind CSS Styling            │
│   - Client-side Routing             │
│   - WebAuthn Support                │
└──────────┬──────────────────────────┘
           │
           │ Direct Blockchain Calls
           ▼
┌─────────────────────────────────────┐
│   Stellar Testnet                   │
│   - Smart Contracts (Soroban)       │
│   - Freighter Wallet Integration    │
│   - Direct RPC Calls                │
└─────────────────────────────────────┘
```

**Key Point**: No backend separado - todo ocurre en el frontend + blockchain

## Archivos Principales

```
frontend/
├── pages/
│   ├── index.js          # Home page
│   ├── [slug].js         # Dynamic routes
│   └── _document.js      # HTML wrapper
├── components/           # React components
├── styles/
│   └── globals.css       # Tailwind CSS
├── public/               # Static assets
├── package.json          # Dependencies
├── next.config.mjs       # Next.js config
├── tailwind.config.js    # Tailwind config
├── postcss.config.js     # PostCSS config
├── .env.production       # Production vars
└── vercel.json          # Vercel config
```

## Dependencias Críticas

Todas en `package.json` → `dependencies` (no devDependencies):

```json
{
  "dependencies": {
    "next": "14.2.15",
    "react": "18.3.1",
    "typescript": "^5",
    "tailwindcss": "^3.4.13",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "@types/node": "^20",
    "@types/react": "^18",
    "stellar-sdk": "^12.11.0",
    "react-helmet": "^6.1.0",
    "crypto-js": "^4.2.1"
  }
}
```

## Build Process

### Local Development

```bash
cd frontend
npm install
npm run dev
# Accede a http://localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

### Vercel Build (Automático)

1. Push a `main` branch
2. Vercel detecta cambios
3. Ejecuta `npm run build`
4. Despliega a `.next` output
5. URL actualizada automáticamente

## Troubleshooting

### Error: Module not found

**Causa**: Dependencias faltantes
**Solución**:
```bash
npm install
npm run build
```

### Error: Cannot find module 'tailwindcss'

**Causa**: tailwindcss en devDependencies
**Solución**: Mover a `dependencies` en package.json

### Error: Freighter not detected

**Causa**: Extensión no instalada en browser
**Solución**: Instalar extensión de Freighter en Chrome/Firefox

### Build timeout

**Causa**: Build tarda más de 12 minutos
**Solución**: Optimizar imports, remover unused dependencies

## Performance Tips

### Image Optimization

```javascript
import Image from 'next/image';

<Image 
  src="/image.jpg" 
  alt="description" 
  width={800} 
  height={600}
/>
```

### Code Splitting

Next.js hace automáticamente code splitting por rutas.

### Caching

Vercel maneja caching automáticamente para assets estáticos.

## Security Checklist

✅ No exposar claves privadas en `.env` (solo public vars)
✅ HTTPS automático en Vercel
✅ Headers CORS en next.config.mjs
✅ WebAuthn headers configurados
✅ Validar transacciones en blockchain

## Monitoreo

### Vercel Analytics

- Acceder a https://vercel.com/dashboard
- Ver builds, deployments, logs
- Configurar alertas de errores

### Runtime Logs

```bash
# Ver logs en tiempo real
vercel logs --follow
```

## Rollback

Si un deploy falla:

```bash
# En Vercel Dashboard → Deployments
# Click "Redeploy" en una versión anterior

# O localmente
git revert <commit>
git push origin main
```

## URLs Importantes

| Recurso | URL |
|---------|-----|
| **App** | https://viajes-estudio.vercel.app |
| **Dashboard** | https://vercel.com/dashboard |
| **Repository** | https://github.com/Kim-Mendoza3/repositorio_proyecto_stellarr |
| **Stellar Testnet** | https://horizon-testnet.stellar.org |
| **Soroban RPC** | https://soroban-testnet.stellar.org |

## Próximos Pasos (Opcional)

Si en el futuro necesitas backend:

1. **Opción A**: Agregar API routes en `/pages/api` (Next.js serverless)
2. **Opción B**: Vercel Serverless Functions en `/api`
3. **Opción C**: Backend separado en Heroku/Railway

## Soporte

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Stellar Docs**: https://developers.stellar.org
- **Freighter Docs**: https://freighter.app

---

**Status**: ✅ Listo para Deploy
**Last Updated**: 2024-12-21
**Version**: 1.0 - Clean Frontend Only
