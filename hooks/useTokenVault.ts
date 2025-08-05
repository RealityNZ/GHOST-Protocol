import { useState, useCallback, useRef, useEffect } from 'react';

interface TokenVault {
  id: string;
  name: string;
  description?: string;
  tokens: VaultToken[];
  encrypted: boolean;
  createdAt: string;
  updatedAt: string;
  lastAccessed?: string;
  accessCount: number;
}

interface VaultToken {
  id: string;
  name: string;
  type: 'discord-bot' | 'discord-user' | 'openai' | 'anthropic' | 'custom';
  value: string;
  description?: string;
  permissions: string[];
  expiresAt?: string;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
  metadata: Record<string, any>;
}

interface SecurityAuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  tokenId?: string;
  vaultId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface SecuritySettings {
  autoLockTimeout: number;
  requireAuthForAccess: boolean;
  enableAuditLogging: boolean;
  maxFailedAttempts: number;
  lockoutDuration: number;
  encryptionConfig: any;
  backupReminders: boolean;
  tokenRotationWarnings: boolean;
}

interface VaultBackup {
  id: string;
  vaultId: string;
  timestamp: string;
  encrypted: boolean;
  checksum: string;
  size: number;
  metadata: any;
}

interface TokenUsageStats {
  tokenId: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgLatency: number;
  lastError?: string;
  dailyUsage: Array<{
    date: string;
    requests: number;
  }>;
  rateLimitHits: number;
}

const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  autoLockTimeout: 15,
  requireAuthForAccess: true,
  enableAuditLogging: true,
  maxFailedAttempts: 3,
  lockoutDuration: 30,
  encryptionConfig: {},
  backupReminders: true,
  tokenRotationWarnings: true
};

interface UseTokenVaultReturn {
  vaults: TokenVault[];
  activeVault: TokenVault | null;
  isLocked: boolean;
  auditLogs: SecurityAuditLog[];
  securitySettings: SecuritySettings;
  usageStats: TokenUsageStats[];
  createVault: (name: string, description?: string) => TokenVault;
  deleteVault: (vaultId: string) => void;
  unlockVault: (vaultId: string, password: string) => Promise<boolean>;
  lockVault: (vaultId: string) => void;
  addToken: (vaultId: string, token: Omit<VaultToken, 'id' | 'createdAt' | 'usageCount'>) => void;
  updateToken: (vaultId: string, tokenId: string, updates: Partial<VaultToken>) => void;
  deleteToken: (vaultId: string, tokenId: string) => void;
  getToken: (vaultId: string, tokenId: string) => string | null;
  rotateToken: (vaultId: string, tokenId: string, newValue: string) => void;
  createBackup: (vaultId: string) => VaultBackup;
  restoreBackup: (backupData: string, password: string) => Promise<TokenVault>;
  updateSecuritySettings: (settings: Partial<SecuritySettings>) => void;
  clearAuditLogs: () => void;
  exportVault: (vaultId: string, includeTokens: boolean) => string;
  importVault: (vaultData: string, password?: string) => Promise<TokenVault>;
}

export function useTokenVault(): UseTokenVaultReturn {
  const [vaults, setVaults] = useState<TokenVault[]>([]);
  const [activeVault, setActiveVault] = useState<TokenVault | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(DEFAULT_SECURITY_SETTINGS);
  const [usageStats, setUsageStats] = useState<TokenUsageStats[]>([]);

  const autoLockTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const failedAttemptsRef = useRef(0);
  const lockoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mock encryption functions (in production, use proper crypto libraries)
  const encrypt = useCallback((data: string, password: string): string => {
    // Mock encryption - in production use Web Crypto API or similar
    const encoded = btoa(data + ':' + password.slice(0, 8));
    return `encrypted:${encoded}`;
  }, []);

  const decrypt = useCallback((encryptedData: string, password: string): string => {
    // Mock decryption
    if (!encryptedData.startsWith('encrypted:')) {
      throw new Error('Invalid encrypted data format');
    }
    
    const encoded = encryptedData.replace('encrypted:', '');
    const decoded = atob(encoded);
    const [data, passwordHash] = decoded.split(':');
    
    if (passwordHash !== password.slice(0, 8)) {
      throw new Error('Invalid password');
    }
    
    return data;
  }, []);

  const addAuditLog = useCallback((log: Omit<SecurityAuditLog, 'id' | 'timestamp'>) => {
    const auditLog: SecurityAuditLog = {
      ...log,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    
    setAuditLogs(prev => [auditLog, ...prev.slice(0, 999)]); // Keep last 1000 logs
    console.log(`🔒 Security Audit: ${log.action} - ${log.details}`);
  }, []);

  const resetAutoLockTimer = useCallback(() => {
    if (autoLockTimeoutRef.current) {
      clearTimeout(autoLockTimeoutRef.current);
    }

    if (!isLocked && securitySettings.autoLockTimeout > 0) {
      autoLockTimeoutRef.current = setTimeout(() => {
        setIsLocked(true);
        setActiveVault(null);
        addAuditLog({
          action: 'vault-lock',
          details: 'Auto-lock timeout reached',
          severity: 'low'
        });
      }, securitySettings.autoLockTimeout * 60 * 1000);
    }
  }, [isLocked, securitySettings.autoLockTimeout, addAuditLog]);

  const createVault = useCallback((name: string, description?: string): TokenVault => {
    const vault: TokenVault = {
      id: `vault-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      description: description?.trim(),
      tokens: [],
      encrypted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      accessCount: 0
    };

    setVaults(prev => [...prev, vault]);
    
    addAuditLog({
      action: 'vault-unlock',
      details: `Created new vault: ${vault.name}`,
      vaultId: vault.id,
      severity: 'low'
    });

    return vault;
  }, [addAuditLog]);

  const deleteVault = useCallback((vaultId: string) => {
    const vault = vaults.find(v => v.id === vaultId);
    if (!vault) return;

    setVaults(prev => prev.filter(v => v.id !== vaultId));
    setUsageStats(prev => prev.filter(stat => 
      !vault.tokens.some(token => token.id === stat.tokenId)
    ));

    if (activeVault?.id === vaultId) {
      setActiveVault(null);
    }

    addAuditLog({
      action: 'vault-unlock',
      details: `Deleted vault: ${vault.name} (${vault.tokens.length} tokens)`,
      vaultId,
      severity: 'medium'
    });
  }, [vaults, activeVault, addAuditLog]);

  const unlockVault = useCallback(async (vaultId: string, password: string): Promise<boolean> => {
    // Check if locked out
    if (lockoutTimeoutRef.current) {
      addAuditLog({
        action: 'failed-auth',
        details: 'Attempted access during lockout period',
        vaultId,
        severity: 'high'
      });
      return false;
    }

    try {
      // Mock password validation
      if (password.length < 8) {
        throw new Error('Invalid password');
      }

      const vault = vaults.find(v => v.id === vaultId);
      if (!vault) {
        throw new Error('Vault not found');
      }

      // Simulate decryption delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update vault access info
      const updatedVault = {
        ...vault,
        lastAccessed: new Date().toISOString(),
        accessCount: vault.accessCount + 1
      };

      setVaults(prev => prev.map(v => v.id === vaultId ? updatedVault : v));
      setActiveVault(updatedVault);
      setIsLocked(false);
      failedAttemptsRef.current = 0;

      addAuditLog({
        action: 'vault-unlock',
        details: `Successfully unlocked vault: ${vault.name}`,
        vaultId,
        severity: 'low'
      });

      resetAutoLockTimer();
      return true;

    } catch (error) {
      failedAttemptsRef.current++;
      
      addAuditLog({
        action: 'failed-auth',
        details: `Failed vault unlock attempt (${failedAttemptsRef.current}/${securitySettings.maxFailedAttempts})`,
        vaultId,
        severity: failedAttemptsRef.current >= securitySettings.maxFailedAttempts ? 'critical' : 'medium'
      });

      // Trigger lockout if max attempts reached
      if (failedAttemptsRef.current >= securitySettings.maxFailedAttempts) {
        lockoutTimeoutRef.current = setTimeout(() => {
          lockoutTimeoutRef.current = null;
          failedAttemptsRef.current = 0;
        }, securitySettings.lockoutDuration * 60 * 1000);

        addAuditLog({
          action: 'failed-auth',
          details: `Account locked due to failed attempts. Lockout duration: ${securitySettings.lockoutDuration} minutes`,
          vaultId,
          severity: 'critical'
        });
      }

      return false;
    }
  }, [vaults, securitySettings, addAuditLog, resetAutoLockTimer]);

  const lockVault = useCallback((vaultId: string) => {
    setIsLocked(true);
    setActiveVault(null);
    
    if (autoLockTimeoutRef.current) {
      clearTimeout(autoLockTimeoutRef.current);
      autoLockTimeoutRef.current = null;
    }

    addAuditLog({
      action: 'vault-lock',
      details: 'Vault manually locked',
      vaultId,
      severity: 'low'
    });
  }, [addAuditLog]);

  const addToken = useCallback((vaultId: string, token: Omit<VaultToken, 'id' | 'createdAt' | 'usageCount'>) => {
    if (isLocked) {
      addAuditLog({
        action: 'failed-auth',
        details: 'Attempted to add token while vault locked',
        vaultId,
        severity: 'high'
      });
      return;
    }

    const newToken: VaultToken = {
      ...token,
      id: `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      usageCount: 0,
      value: encrypt(token.value, 'vault-password') // Mock encryption
    };

    setVaults(prev => prev.map(vault => 
      vault.id === vaultId 
        ? { 
            ...vault, 
            tokens: [...vault.tokens, newToken],
            updatedAt: new Date().toISOString()
          }
        : vault
    ));

    // Initialize usage stats
    setUsageStats(prev => [...prev, {
      tokenId: newToken.id,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      avgLatency: 0,
      dailyUsage: [],
      rateLimitHits: 0
    }]);

    addAuditLog({
      action: 'token-create',
      details: `Added new ${token.type} token: ${token.name}`,
      vaultId,
      tokenId: newToken.id,
      severity: 'low'
    });

    resetAutoLockTimer();
  }, [isLocked, encrypt, addAuditLog, resetAutoLockTimer]);

  const updateToken = useCallback((vaultId: string, tokenId: string, updates: Partial<VaultToken>) => {
    if (isLocked) return;

    setVaults(prev => prev.map(vault => 
      vault.id === vaultId 
        ? {
            ...vault,
            tokens: vault.tokens.map(token => 
              token.id === tokenId 
                ? { 
                    ...token, 
                    ...updates,
                    value: updates.value ? encrypt(updates.value, 'vault-password') : token.value
                  }
                : token
            ),
            updatedAt: new Date().toISOString()
          }
        : vault
    ));

    addAuditLog({
      action: 'token-access',
      details: `Updated token: ${tokenId}`,
      vaultId,
      tokenId,
      severity: 'low'
    });

    resetAutoLockTimer();
  }, [isLocked, encrypt, addAuditLog, resetAutoLockTimer]);

  const deleteToken = useCallback((vaultId: string, tokenId: string) => {
    if (isLocked) return;

    const vault = vaults.find(v => v.id === vaultId);
    const token = vault?.tokens.find(t => t.id === tokenId);

    setVaults(prev => prev.map(vault => 
      vault.id === vaultId 
        ? {
            ...vault,
            tokens: vault.tokens.filter(token => token.id !== tokenId),
            updatedAt: new Date().toISOString()
          }
        : vault
    ));

    setUsageStats(prev => prev.filter(stat => stat.tokenId !== tokenId));

    addAuditLog({
      action: 'token-delete',
      details: `Deleted token: ${token?.name || tokenId}`,
      vaultId,
      tokenId,
      severity: 'medium'
    });

    resetAutoLockTimer();
  }, [isLocked, vaults, addAuditLog, resetAutoLockTimer]);

  const getToken = useCallback((vaultId: string, tokenId: string): string | null => {
    if (isLocked) {
      addAuditLog({
        action: 'failed-auth',
        details: 'Attempted token access while vault locked',
        vaultId,
        tokenId,
        severity: 'high'
      });
      return null;
    }

    const vault = vaults.find(v => v.id === vaultId);
    const token = vault?.tokens.find(t => t.id === tokenId);
    
    if (!token) return null;

    try {
      const decryptedValue = decrypt(token.value, 'vault-password');
      
      // Update usage stats
      setUsageStats(prev => prev.map(stat => 
        stat.tokenId === tokenId 
          ? { ...stat, totalRequests: stat.totalRequests + 1 }
          : stat
      ));

      // Update token usage
      updateToken(vaultId, tokenId, { 
        lastUsed: new Date().toISOString(),
        usageCount: token.usageCount + 1
      });

      addAuditLog({
        action: 'token-access',
        details: `Accessed token: ${token.name}`,
        vaultId,
        tokenId,
        severity: 'low'
      });

      resetAutoLockTimer();
      return decryptedValue;

    } catch (error) {
      addAuditLog({
        action: 'failed-auth',
        details: `Failed to decrypt token: ${token.name}`,
        vaultId,
        tokenId,
        severity: 'high'
      });
      return null;
    }
  }, [isLocked, vaults, decrypt, updateToken, addAuditLog, resetAutoLockTimer]);

  const rotateToken = useCallback((vaultId: string, tokenId: string, newValue: string) => {
    if (isLocked) return;

    updateToken(vaultId, tokenId, { 
      value: newValue,
      usageCount: 0,
      lastUsed: undefined
    });

    addAuditLog({
      action: 'token-access',
      details: `Rotated token: ${tokenId}`,
      vaultId,
      tokenId,
      severity: 'medium'
    });
  }, [isLocked, updateToken, addAuditLog]);

  const createBackup = useCallback((vaultId: string): VaultBackup => {
    const vault = vaults.find(v => v.id === vaultId);
    if (!vault) {
      throw new Error('Vault not found');
    }

    const backupData = JSON.stringify(vault);
    const backup: VaultBackup = {
      id: `backup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      vaultId,
      timestamp: new Date().toISOString(),
      encrypted: vault.encrypted,
      checksum: btoa(backupData).slice(0, 16), // Mock checksum
      size: backupData.length,
      metadata: {
        tokenCount: vault.tokens.length,
        version: '1.0.0',
        exportedBy: 'VICE Logger'
      }
    };

    addAuditLog({
      action: 'vault-unlock',
      details: `Created backup for vault: ${vault.name}`,
      vaultId,
      severity: 'low'
    });

    return backup;
  }, [vaults, addAuditLog]);

  const restoreBackup = useCallback(async (backupData: string, password: string): Promise<TokenVault> => {
    try {
      const vaultData = JSON.parse(backupData);
      
      // Validate backup structure
      if (!vaultData.id || !vaultData.name || !Array.isArray(vaultData.tokens)) {
        throw new Error('Invalid backup format');
      }

      // Create new vault ID to avoid conflicts
      const restoredVault: TokenVault = {
        ...vaultData,
        id: `restored-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${vaultData.name} (Restored)`,
        updatedAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        accessCount: 0
      };

      setVaults(prev => [...prev, restoredVault]);

      addAuditLog({
        action: 'vault-unlock',
        details: `Restored vault from backup: ${restoredVault.name}`,
        vaultId: restoredVault.id,
        severity: 'medium'
      });

      return restoredVault;

    } catch (error) {
      addAuditLog({
        action: 'failed-auth',
        details: `Failed to restore backup: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'high'
      });
      throw error;
    }
  }, [addAuditLog]);

  const updateSecuritySettings = useCallback((settings: Partial<SecuritySettings>) => {
    setSecuritySettings(prev => {
      const updated = { ...prev, ...settings };
      
      addAuditLog({
        action: 'vault-unlock',
        details: `Updated security settings: ${Object.keys(settings).join(', ')}`,
        severity: 'low'
      });

      // Reset auto-lock timer if timeout changed
      if ('autoLockTimeout' in settings) {
        resetAutoLockTimer();
      }

      return updated;
    });
  }, [addAuditLog, resetAutoLockTimer]);

  const clearAuditLogs = useCallback(() => {
    const logCount = auditLogs.length;
    setAuditLogs([]);
    
    addAuditLog({
      action: 'vault-unlock',
      details: `Cleared ${logCount} audit logs`,
      severity: 'medium'
    });
  }, [auditLogs.length, addAuditLog]);

  const exportVault = useCallback((vaultId: string, includeTokens: boolean): string => {
    const vault = vaults.find(v => v.id === vaultId);
    if (!vault) {
      throw new Error('Vault not found');
    }

    const exportData = {
      ...vault,
      tokens: includeTokens ? vault.tokens : vault.tokens.map(token => ({
        ...token,
        value: '[REDACTED]'
      })),
      exportedAt: new Date().toISOString(),
      exportVersion: '1.0.0'
    };

    addAuditLog({
      action: 'vault-unlock',
      details: `Exported vault: ${vault.name} (tokens ${includeTokens ? 'included' : 'redacted'})`,
      vaultId,
      severity: includeTokens ? 'medium' : 'low'
    });

    return JSON.stringify(exportData, null, 2);
  }, [vaults, addAuditLog]);

  const importVault = useCallback(async (vaultData: string, password?: string): Promise<TokenVault> => {
    try {
      const data = JSON.parse(vaultData);
      
      if (!data.id || !data.name) {
        throw new Error('Invalid vault data format');
      }

      const importedVault: TokenVault = {
        ...data,
        id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${data.name} (Imported)`,
        updatedAt: new Date().toISOString(),
        accessCount: 0
      };

      setVaults(prev => [...prev, importedVault]);

      addAuditLog({
        action: 'vault-unlock',
        details: `Imported vault: ${importedVault.name} (${importedVault.tokens.length} tokens)`,
        vaultId: importedVault.id,
        severity: 'medium'
      });

      return importedVault;

    } catch (error) {
      addAuditLog({
        action: 'failed-auth',
        details: `Failed to import vault: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'high'
      });
      throw error;
    }
  }, [addAuditLog]);

  // Initialize with demo vault
  useEffect(() => {
    if (vaults.length === 0) {
      const demoVault = createVault('Default Vault', 'Primary token storage');
      
      // Add demo tokens
      setTimeout(() => {
        addToken(demoVault.id, {
          name: 'Main Discord Bot',
          type: 'discord-bot',
          value: 'Bot_DEMO_TOKEN_12345',
          description: 'Primary surveillance bot token',
          permissions: ['read_messages', 'send_messages', 'manage_messages'],
          metadata: {
            serverId: 'underground_collective',
            scopes: ['bot', 'applications.commands']
          }
        });

        addToken(demoVault.id, {
          name: 'OpenAI GPT-4',
          type: 'openai',
          value: 'sk-demo_openai_key_67890',
          description: 'AI generation backend',
          permissions: ['chat_completions'],
          metadata: {
            rateLimit: {
              requests: 3500,
              window: 60
            }
          }
        });
      }, 100);
    }
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoLockTimeoutRef.current) {
        clearTimeout(autoLockTimeoutRef.current);
      }
      if (lockoutTimeoutRef.current) {
        clearTimeout(lockoutTimeoutRef.current);
      }
    };
  }, []);

  return {
    vaults,
    activeVault,
    isLocked,
    auditLogs,
    securitySettings,
    usageStats,
    createVault,
    deleteVault,
    unlockVault,
    lockVault,
    addToken,
    updateToken,
    deleteToken,
    getToken,
    rotateToken,
    createBackup,
    restoreBackup,
    updateSecuritySettings,
    clearAuditLogs,
    exportVault,
    importVault
  };
}