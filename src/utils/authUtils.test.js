import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getAuthRedirectUrl } from './authUtils';

describe('authUtils', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    delete window.location;
    window.location = new URL('http://localhost:5174/login');
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  it('resolves root redirect URL from current origin', () => {
    expect(getAuthRedirectUrl()).toBe('http://localhost:5174/');
    expect(getAuthRedirectUrl('/')).toBe('http://localhost:5174/');
  });

  it('resolves specific path redirect URL from current origin', () => {
    expect(getAuthRedirectUrl('/login')).toBe('http://localhost:5174/login');
    expect(getAuthRedirectUrl('login')).toBe('http://localhost:5174/login');
  });
});

