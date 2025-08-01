export interface TokenVault {
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

export interface VaultToken {
  id: string;
  name: string;
  type: 'discord-bot' | 'discord-user' | 'openai' | 'anthropic' | 'custom';
  value: string; // Encrypted when stored
  description?: string;
  permissions: string[];
  expiresAt?: string;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
  metadata: {
    serverId?: string;
    userId?: string;
    scopes?: string[];
    rateLimit?: {
      requests: number;
      window: number; // seconds
    };
  };
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  action: 'token-access' | 'token-create' | 'token-delete' | 'vault-unlock' | 'vault-lock' | 'failed-auth' | 'suspicious-activity';
  details: string;
  tokenId?: string;
  vaultId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress?: string;
  userAgent?: string;
}

export interface EncryptionConfig {
  algorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  keyDerivation: 'PBKDF2' | 'Argon2id';
  iterations: number;
  saltLength: number;
  ivLength: number;
}

export interface SecuritySettings {
  autoLockTimeout: number; // minutes
  requireAuthForAccess: boolean;
  enableAuditLogging: boolean;
  maxFailedAttempts: number;
  lockoutDuration: number; // minutes
  encryptionConfig: EncryptionConfig;
  backupReminders: boolean;
  tokenRotationWarnings: boolean;
}

export interface VaultBackup {
  id: string;
  vaultId: string;
  timestamp: string;
  encrypted: boolean;
  checksum: string;
  size: number;
  metadata: {
    tokenCount: number;
    version: string;
    exportedBy: string;
  };
}

export interface TokenUsageStats {
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

export interface TokenVaultAccessors {
  getToken: (vaultId: string, tokenId: string) => Promise<Token | null>;
  activeVaultId: string | null;
  isLocked: boolean;
}

export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  autoLockTimeout: 15,
  requireAuthForAccess: true,
  enableAuditLogging: true,
  maxFailedAttempts: 3,
  lockoutDuration: 30,
  encryptionConfig: {
    algorithm: 'AES-256-GCM',
    keyDerivation: 'PBKDF2',
    iterations: 100000,
    saltLength: 32,
    ivLength: 12
  },
  backupReminders: true,
  tokenRotationWarnings: true
};

export const TOKEN_TEMPLATES = [
  {
    name: 'Discord Bot Token',
    type: 'discord-bot' as const,
    description: 'Bot token for Discord API access',
    permissions: ['read_messages', 'send_messages', 'manage_messages'],
    placeholder: 'Bot TOKEN_HERE'
  },
  {
    name: 'Discord User Token',
    type: 'discord-user' as const,
    description: 'User token for Discord self-bot (use carefully)',
    permissions: ['read_messages', 'send_messages'],
    placeholder: 'USER_TOKEN_HERE'
  },
  {
    name: 'OpenAI API Key',
    type: 'openai' as const,
    description: 'OpenAI API key for GPT models',
    permissions: ['chat_completions', 'embeddings'],
    placeholder: 'sk-...'
  },
  {
    name: 'Anthropic API Key',
    type: 'anthropic' as const,
    description: 'Anthropic API key for Claude models',
    permissions: ['messages', 'completions'],
    placeholder: 'sk-ant-...'
  },
  {
    name: 'Custom API Token',
    type: 'custom' as const,
    description: 'Custom API token or key',
    permissions: ['api_access'],
    placeholder: 'your_token_here'
  }
];