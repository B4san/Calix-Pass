# Calix Pass - Security Guidelines

**Version**: 1.0.0
**Date**: 2026-02-19
**Derived from**: `secure-coding-cybersecurity` skill + Project Constitution

---

## Threat Model

Calix Pass operates under a **local-first threat model** where:

1. **Primary adversary**: Malware on the user's machine attempting
   process memory dumps, clipboard interception, or keylogging.
2. **Secondary adversary**: An attacker who obtains a copy of the
   .kdbx file and attempts offline brute-force/dictionary attacks.
3. **Tertiary adversary**: Supply chain attacks via compromised
   dependencies or build artifacts.

The application has **no server-side component** for MVP. There are
no APIs, no user accounts, no network requests. This eliminates
entire classes of vulnerabilities (SQLi, SSRF, CSRF, etc.) but
concentrates risk on the cryptographic implementation and client-
side security.

---

## Mandatory Security Controls

### 1. Cryptographic Implementation

- [ ] AES-256-CBC via Web Crypto API (`crypto.subtle`) only
- [ ] SHA-256 and SHA-512 via Web Crypto API only
- [ ] HMAC-SHA-256 via Web Crypto API only
- [ ] Argon2id via audited WASM module (never JS implementation)
- [ ] All random values via `crypto.getRandomValues()` (CSPRNG)
- [ ] Never use `Math.random()` for any purpose in the codebase
- [ ] IV must be unique per encryption operation (16 bytes random)
- [ ] Key material must be zeroed after use (overwrite ArrayBuffer)
- [ ] No custom cryptographic schemes or algorithms

### 2. Memory Protection (Web Context)

- [ ] Sensitive strings (passwords, keys) stored as `Uint8Array`,
      never as JavaScript `string` (strings are immutable and
      cannot be reliably zeroed)
- [ ] Implement `secureZero(buffer)` utility that overwrites with
      random bytes then zeros
- [ ] Use `FinalizationRegistry` as safety net for buffer cleanup
- [ ] Vault key derived fresh on each unlock, never persisted
- [ ] Clear all sensitive state from Zustand on lock/close
- [ ] Web Worker memory is isolated; crypto runs in Worker

### 3. Input Validation

- [ ] All KDBX binary input validated against format spec before
      parsing (magic bytes, version, field lengths)
- [ ] XML parser must reject external entities (XXE prevention)
- [ ] File size limits enforced before processing (max 256MB)
- [ ] Password input has no maximum length restriction
- [ ] Group/entry names sanitized for XSS before DOM insertion
- [ ] URL fields validated but not restricted (user data)

### 4. Clipboard Security

- [ ] Auto-clear clipboard after configurable timeout (default 12s)
- [ ] Use `navigator.clipboard.writeText()` (async API)
- [ ] Clear by writing empty string, not by reading/comparing
- [ ] Never log clipboard contents

### 5. Content Security Policy (Web)

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  connect-src 'self';
  worker-src 'self' blob:;
  object-src 'none';
  base-uri 'self';
  form-action 'none';
  frame-ancestors 'none';
```

### 6. Dependency Security

- [ ] All dependencies pinned in bun.lock
- [ ] No dependencies with known vulnerabilities at build time
- [ ] `eval()`, `Function()`, `innerHTML` banned via ESLint rules
- [ ] WASM modules built from auditable source (not pre-compiled
      binary blobs)
- [ ] Prefer Web platform APIs over third-party libraries

### 7. Build & Distribution Security

- [ ] No secrets in source code (enforced by `.gitignore`)
- [ ] No `.env` files committed to version control
- [ ] Test vectors use published NIST/RFC values only
- [ ] GitHub Actions secrets for signing/publishing only
- [ ] Reproducible builds from source

### 8. Error Handling Security

- [ ] Cryptographic errors must not leak key material in messages
- [ ] Failed decryption returns generic "Invalid credentials" only
- [ ] Stack traces never exposed to user in production build
- [ ] All errors logged without sensitive data

---

## Prohibited Patterns

| Pattern | Why | Alternative |
|---------|-----|-------------|
| `Math.random()` | Not cryptographically secure | `crypto.getRandomValues()` |
| `eval()` / `Function()` | Code injection vector | Static analysis |
| `innerHTML` | XSS vector | `textContent` or React JSX |
| `document.write()` | XSS vector | React rendering |
| `JSON.parse()` on user input without schema validation | Prototype pollution | Validate schema first |
| Storing passwords as `string` | Cannot zero immutable strings | Use `Uint8Array` |
| `console.log(password)` | Credential leakage | Never log secrets |
| Hardcoded crypto parameters | Inflexible security | Configuration constants |
