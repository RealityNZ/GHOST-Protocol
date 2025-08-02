import { useState, useCallback, useRef, useEffect } from 'react';

export interface DebugLogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  category: 'system' | 'discord' | 'ai' | 'security' | 'ui' | 'network' | 'storage';
  message: string;
  details?: any;
  stackTrace?: string;
  source?: string;
}

interface DebugLoggerState {
  logs: DebugLogEntry[];
  isEnabled: boolean;
  maxLogs: number;
  autoExport: boolean;
  verboseMode: boolean;
}

export function useDebugLogger() {
  const [state, setState] = useState<DebugLoggerState>({
    logs: [],
    isEnabled: true,
    maxLogs: 1000,
    autoExport: false,
    verboseMode: true,
  });

  const logCountRef = useRef(0);
  const originalConsoleRef = useRef<{
    log: typeof console.log;
    warn: typeof console.warn;
    error: typeof console.error;
    debug: typeof console.debug;
  }>();

  useEffect(() => {
    if (state.isEnabled) {
      interceptConsole();
      interceptErrors();
    } else {
      restoreConsole();
    }

    return () => {
      restoreConsole();
    };
  }, [state.isEnabled]);

  const interceptConsole = useCallback(() => {
    // Store original console methods
    originalConsoleRef.current = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      debug: console.debug,
    };

    // Override console methods
    console.log = (...args) => {
      originalConsoleRef.current?.log(...args);
      addLog('debug', 'system', formatConsoleMessage(args), { args });
    };

    console.warn = (...args) => {
      originalConsoleRef.current?.warn(...args);
      addLog('warn', 'system', formatConsoleMessage(args), { args });
    };

    console.error = (...args) => {
      originalConsoleRef.current?.error(...args);
      addLog('error', 'system', formatConsoleMessage(args), { args });
    };

    console.debug = (...args) => {
      originalConsoleRef.current?.debug(...args);
      addLog('debug', 'system', formatConsoleMessage(args), { args });
    };
  }, []);

  const restoreConsole = useCallback(() => {
    if (originalConsoleRef.current) {
      console.log = originalConsoleRef.current.log;
      console.warn = originalConsoleRef.current.warn;
      console.error = originalConsoleRef.current.error;
      console.debug = originalConsoleRef.current.debug;
    }
  }, []);

  const interceptErrors = useCallback(() => {
    // Global error handler
    window.addEventListener('error', (event) => {
      addLog('error', 'system', `Uncaught Error: ${event.message}`, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      }, event.error?.stack);
    });

    // Promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      addLog('error', 'system', `Unhandled Promise Rejection: ${event.reason}`, {
        reason: event.reason,
        promise: event.promise,
      });
    });
  }, []);

  const formatConsoleMessage = (args: any[]): string => {
    return args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
  };

  const addLog = useCallback((
    level: DebugLogEntry['level'],
    category: DebugLogEntry['category'],
    message: string,
    details?: any,
    stackTrace?: string,
    source?: string
  ) => {
    if (!state.isEnabled) return;

    const logEntry: DebugLogEntry = {
      id: `log_${Date.now()}_${++logCountRef.current}`,
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      details: state.verboseMode ? details : undefined,
      stackTrace,
      source: source || getCallerInfo(),
    };

    setState(prev => {
      const newLogs = [logEntry, ...prev.logs];
      
      // Trim logs if exceeding max
      if (newLogs.length > prev.maxLogs) {
        newLogs.splice(prev.maxLogs);
      }

      return { ...prev, logs: newLogs };
    });

    // Auto-export if enabled
    if (state.autoExport && level === 'error') {
      exportCrashLog(logEntry);
    }
  }, [state.isEnabled, state.verboseMode, state.maxLogs, state.autoExport]);

  const getCallerInfo = (): string => {
    try {
      const stack = new Error().stack;
      if (stack) {
        const lines = stack.split('\n');
        // Skip first 3 lines (Error, getCallerInfo, addLog)
        const callerLine = lines[3] || lines[2] || 'unknown';
        return callerLine.trim();
      }
    } catch {
      // Ignore errors in stack trace parsing
    }
    return 'unknown';
  };

  const exportCrashLog = useCallback((crashLog: DebugLogEntry) => {
    const crashReport = {
      timestamp: crashLog.timestamp,
      level: crashLog.level,
      message: crashLog.message,
      details: crashLog.details,
      stackTrace: crashLog.stackTrace,
      userAgent: navigator.userAgent,
      url: window.location.href,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      memory: (performance as any).memory ? {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit,
      } : undefined,
    };

    console.log('🚨 CRASH REPORT GENERATED:', crashReport);
  }, []);

  const clearLogs = useCallback(() => {
    setState(prev => ({ ...prev, logs: [] }));
    logCountRef.current = 0;
  }, []);

  const exportLogs = useCallback((filterLevel?: DebugLogEntry['level']) => {
    const logsToExport = filterLevel 
      ? state.logs.filter(log => log.level === filterLevel)
      : state.logs;

    const exportData = {
      exportedAt: new Date().toISOString(),
      totalLogs: logsToExport.length,
      systemInfo: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        memory: (performance as any).memory ? {
          used: (performance as any).memory.usedJSHeapSize,
          total: (performance as any).memory.totalJSHeapSize,
          limit: (performance as any).memory.jsHeapSizeLimit,
        } : undefined,
      },
      logs: logsToExport,
    };

    return JSON.stringify(exportData, null, 2);
  }, [state.logs]);

  const getLogStats = useCallback(() => {
    const stats = {
      total: state.logs.length,
      debug: state.logs.filter(l => l.level === 'debug').length,
      info: state.logs.filter(l => l.level === 'info').length,
      warn: state.logs.filter(l => l.level === 'warn').length,
      error: state.logs.filter(l => l.level === 'error').length,
      fatal: state.logs.filter(l => l.level === 'fatal').length,
    };

    const categories = {
      system: state.logs.filter(l => l.category === 'system').length,
      discord: state.logs.filter(l => l.category === 'discord').length,
      ai: state.logs.filter(l => l.category === 'ai').length,
      security: state.logs.filter(l => l.category === 'security').length,
      ui: state.logs.filter(l => l.category === 'ui').length,
      network: state.logs.filter(l => l.category === 'network').length,
      storage: state.logs.filter(l => l.category === 'storage').length,
    };

    return { levels: stats, categories };
  }, [state.logs]);

  const updateSettings = useCallback((newSettings: Partial<DebugLoggerState>) => {
    setState(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Public logging methods
  const logDebug = useCallback((category: DebugLogEntry['category'], message: string, details?: any) => {
    addLog('debug', category, message, details);
  }, [addLog]);

  const logInfo = useCallback((category: DebugLogEntry['category'], message: string, details?: any) => {
    addLog('info', category, message, details);
  }, [addLog]);

  const logWarn = useCallback((category: DebugLogEntry['category'], message: string, details?: any) => {
    addLog('warn', category, message, details);
  }, [addLog]);

  const logError = useCallback((category: DebugLogEntry['category'], message: string, details?: any, error?: Error) => {
    addLog('error', category, message, details, error?.stack);
  }, [addLog]);

  const logFatal = useCallback((category: DebugLogEntry['category'], message: string, details?: any, error?: Error) => {
    addLog('fatal', category, message, details, error?.stack);
  }, [addLog]);

  return {
    state,
    logs: state.logs,
    isEnabled: state.isEnabled,
    addLog,
    clearLogs,
    exportLogs,
    getLogStats,
    updateSettings,
    logDebug,
    logInfo,
    logWarn,
    logError,
    logFatal,
  };
}