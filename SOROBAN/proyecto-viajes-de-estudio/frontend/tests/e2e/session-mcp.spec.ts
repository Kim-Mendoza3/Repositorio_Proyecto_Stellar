import { test, expect } from '@playwright/test';

// Test profesional: Validación de flujo MCP y WebAuthn en frontend

test.describe('Flujo seguro de sesión y wallet por usuario', () => {
  test('Registro y login de usuarios distintos generan sesiones y wallets independientes', async ({ page }) => {
    // Usuario 1
    await page.goto('http://localhost:3000/login');
    await page.fill('input#username', 'UsuarioTest1');
    await page.click('button:has-text("Crear Passkey")');
    await page.waitForTimeout(2000); // Espera a que se cree la sesión
    await page.goto('http://localhost:3000/dashboard');
    const nombre1 = await page.textContent('span.text-purple-400');
    const wallet1 = await page.textContent('div:has-text("Stellar Wallet") + div code');
    expect(nombre1).toContain('UsuarioTest1');
    expect(wallet1).toBeTruthy();

    // Cerrar sesión
    await page.click('button:has-text("Cerrar Sesión")');
    await page.waitForTimeout(1000);

    // Usuario 2
    await page.goto('http://localhost:3000/login');
    await page.fill('input#username', 'UsuarioTest2');
    await page.click('button:has-text("Crear Passkey")');
    await page.waitForTimeout(2000);
    await page.goto('http://localhost:3000/dashboard');
    const nombre2 = await page.textContent('span.text-purple-400');
    const wallet2 = await page.textContent('div:has-text("Stellar Wallet") + div code');
    expect(nombre2).toContain('UsuarioTest2');
    expect(wallet2).toBeTruthy();
    expect(wallet2).not.toEqual(wallet1);
  });

  test('No debe mostrar datos de otro usuario tras login', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input#username', 'UsuarioTest3');
    await page.click('button:has-text("Crear Passkey")');
    await page.waitForTimeout(2000);
    await page.goto('http://localhost:3000/dashboard');
    const nombre3 = await page.textContent('span.text-purple-400');
    expect(nombre3).toContain('UsuarioTest3');
  });
});
