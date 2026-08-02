import type { LessonSettings } from '@persian-writing/core';

const CREDENTIAL_KEY = 'persian-writing-local-admin-credential-v1';
const SETTINGS_KEY = 'persian-writing-admin-settings-v1';
const ITERATIONS = 120_000;

export interface LocalAdminSettings {
  readonly defaults: Partial<LessonSettings>;
  readonly locked: readonly (keyof LessonSettings)[];
}

interface StoredCredential {
  readonly salt: string;
  readonly hash: string;
  readonly iterations: number;
}

export function hasLocalAdminPin(storage: Storage = localStorage): boolean {
  return storage.getItem(CREDENTIAL_KEY) !== null;
}

export async function setLocalAdminPin(pin: string, storage: Storage = localStorage): Promise<void> {
  validatePin(pin);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePin(pin, salt, ITERATIONS);
  storage.setItem(CREDENTIAL_KEY, JSON.stringify({
    salt: toBase64(salt), hash: toBase64(hash), iterations: ITERATIONS
  } satisfies StoredCredential));
}

export async function verifyLocalAdminPin(pin: string, storage: Storage = localStorage): Promise<boolean> {
  const raw = storage.getItem(CREDENTIAL_KEY);
  if (raw === null) return false;
  try {
    const credential = JSON.parse(raw) as StoredCredential;
    const actual = await derivePin(pin, fromBase64(credential.salt), credential.iterations);
    return constantTimeEqual(actual, fromBase64(credential.hash));
  } catch {
    return false;
  }
}

export function readLocalAdminSettings(storage: Storage = localStorage): LocalAdminSettings {
  const raw = storage.getItem(SETTINGS_KEY);
  if (raw === null) return { defaults: {}, locked: [] };
  try {
    const parsed = JSON.parse(raw) as Partial<LocalAdminSettings>;
    return {
      defaults: typeof parsed.defaults === 'object' && parsed.defaults !== null ? parsed.defaults : {},
      locked: Array.isArray(parsed.locked) ? parsed.locked : []
    };
  } catch {
    return { defaults: {}, locked: [] };
  }
}

export function saveLocalAdminSettings(settings: LocalAdminSettings, storage: Storage = localStorage): void {
  storage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function validatePin(pin: string): void {
  if (!/^\d{6,12}$/u.test(pin)) throw new Error('Administrator PIN must contain 6 to 12 digits.');
}

async function derivePin(pin: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256);
  return new Uint8Array(bits);
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index]! ^ right[index]!;
  return difference === 0;
}

function toBase64(value: Uint8Array): string {
  return btoa(String.fromCharCode(...value));
}

function fromBase64(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}
