const STORAGE_KEYS = {
  PASSWORD_HASH: 'antigravity_finance_password_hash',
  PASSWORD_HINT: 'antigravity_finance_password_hint',
};

/**
 * SHA-256 password hashing utility using Web Crypto API.
 * Ensures plain-text passwords are never saved in storage.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '_antigravity_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const SecurityService = {
  hasPasswordSet(): boolean {
    const hash = localStorage.getItem(STORAGE_KEYS.PASSWORD_HASH);
    return Boolean(hash && hash.trim().length > 0);
  },

  async setPassword(password: string, hint?: string): Promise<boolean> {
    try {
      if (!password || password.trim().length === 0) return false;
      const hash = await hashPassword(password);
      localStorage.setItem(STORAGE_KEYS.PASSWORD_HASH, hash);
      if (hint && hint.trim()) {
        localStorage.setItem(STORAGE_KEYS.PASSWORD_HINT, hint.trim());
      } else {
        localStorage.removeItem(STORAGE_KEYS.PASSWORD_HINT);
      }
      return true;
    } catch (error) {
      console.error('[SecurityService] Error setting password:', error);
      return false;
    }
  },

  async verifyPassword(password: string): Promise<boolean> {
    try {
      const storedHash = localStorage.getItem(STORAGE_KEYS.PASSWORD_HASH);
      if (!storedHash) return false;
      const inputHash = await hashPassword(password);
      return storedHash === inputHash;
    } catch (error) {
      console.error('[SecurityService] Error verifying password:', error);
      return false;
    }
  },

  getHint(): string | null {
    return localStorage.getItem(STORAGE_KEYS.PASSWORD_HINT);
  },

  async changePassword(
    currentPass: string,
    newPass: string,
    newHint?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const isCurrentValid = await this.verifyPassword(currentPass);
      if (!isCurrentValid) {
        return { success: false, error: 'Current password is incorrect.' };
      }
      if (!newPass || newPass.trim().length < 3) {
        return { success: false, error: 'New password must be at least 3 characters long.' };
      }
      const success = await this.setPassword(newPass, newHint);
      return { success };
    } catch (error) {
      console.error('[SecurityService] Error changing password:', error);
      return { success: false, error: 'Failed to update password.' };
    }
  },

  resetSecurity(): void {
    localStorage.removeItem(STORAGE_KEYS.PASSWORD_HASH);
    localStorage.removeItem(STORAGE_KEYS.PASSWORD_HINT);
  }
};
