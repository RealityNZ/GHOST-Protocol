import { useState, useCallback } from 'react';
import { Plugin, PluginExecution, PluginAPI, PLUGIN_TEMPLATES } from '@/types/plugins';

interface UsePluginLoaderReturn {
  plugins: Plugin[];
  executions: PluginExecution[];
  isExecuting: boolean;
  addPlugin: (plugin: Omit<Plugin, 'id' | 'metadata'>) => void;
  updatePlugin: (id: string, updates: Partial<Plugin>) => void;
  deletePlugin: (id: string) => void;
  executePlugin: (pluginId: string, input: any, context?: any) => Promise<any>;
  testPlugin: (code: string, input: any) => Promise<{ success: boolean; result?: any; error?: string }>;
  importPlugins: (pluginsData: Plugin[]) => void;
  exportPlugins: () => Plugin[];
  loadTemplate: (templateIndex: number) => Omit<Plugin, 'id' | 'metadata'>;
  clearExecutions: () => void;
}

export function usePluginLoader(): UsePluginLoaderReturn {
  const [plugins, setPlugins] = useState<Plugin[]>([
    {
      id: 'example-sentiment',
      name: 'Sentiment Analyzer',
      description: 'Analyzes message sentiment before processing',
      category: 'preprocessor',
      version: '1.0.0',
      author: 'VICE System',
      enabled: true,
      code: PLUGIN_TEMPLATES[0].code,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        executionCount: 0
      }
    }
  ]);

  const [executions, setExecutions] = useState<PluginExecution[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  const createPluginAPI = useCallback((pluginId: string): PluginAPI => {
    const storage = new Map<string, any>();
    
    return {
      log: (message: string) => {
        console.log(`[Plugin ${pluginId}] ${message}`);
      },
      error: (message: string) => {
        console.error(`[Plugin ${pluginId}] ${message}`);
      },
      storage: {
        get: (key: string) => storage.get(`${pluginId}:${key}`),
        set: (key: string, value: any) => storage.set(`${pluginId}:${key}`, value),
        remove: (key: string) => storage.delete(`${pluginId}:${key}`)
      },
      utils: {
        hash: (input: string) => btoa(input).slice(0, 8),
        timestamp: () => new Date().toISOString(),
        random: () => Math.random()
      }
    };
  }, []);

  const executePlugin = useCallback(async (pluginId: string, input: any, context: any = {}): Promise<any> => {
    const plugin = plugins.find(p => p.id === pluginId);
    if (!plugin || !plugin.enabled) {
      throw new Error(`Plugin ${pluginId} not found or disabled`);
    }

    setIsExecuting(true);
    const startTime = Date.now();
    const api = createPluginAPI(pluginId);

    try {
      // Create sandboxed execution environment
      const sandboxGlobals = {
        console: {
          log: api.log,
          error: api.error
        },
        fetch: fetch, // Allow network requests
        setTimeout,
        clearTimeout,
        setInterval,
        clearInterval
      };

      // Execute plugin code in controlled environment
      const executeFunction = new Function(
        'input', 'context', 'api', 'globals',
        `
        const { console, fetch, setTimeout, clearTimeout, setInterval, clearInterval } = globals;
        ${plugin.code}
        return execute(input, context, api);
        `
      );

      const result = await executeFunction(input, context, api, sandboxGlobals);
      const duration = Date.now() - startTime;

      // Log successful execution
      const execution: PluginExecution = {
        pluginId,
        timestamp: new Date().toISOString(),
        input,
        output: result,
        duration,
        success: true
      };

      setExecutions(prev => [execution, ...prev.slice(0, 99)]); // Keep last 100

      // Update plugin metadata
      setPlugins(prev => prev.map(p => 
        p.id === pluginId 
          ? { 
              ...p, 
              metadata: { 
                ...p.metadata, 
                executionCount: p.metadata.executionCount + 1,
                lastError: undefined
              } 
            }
          : p
      ));

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Log failed execution
      const execution: PluginExecution = {
        pluginId,
        timestamp: new Date().toISOString(),
        input,
        output: null,
        duration,
        success: false,
        error: errorMessage
      };

      setExecutions(prev => [execution, ...prev.slice(0, 99)]);

      // Update plugin metadata with error
      setPlugins(prev => prev.map(p => 
        p.id === pluginId 
          ? { 
              ...p, 
              metadata: { 
                ...p.metadata, 
                lastError: errorMessage
              } 
            }
          : p
      ));

      throw error;
    } finally {
      setIsExecuting(false);
    }
  }, [plugins, createPluginAPI]);

  const testPlugin = useCallback(async (code: string, input: any): Promise<{ success: boolean; result?: any; error?: string }> => {
    const api = createPluginAPI('test');
    
    try {
      const sandboxGlobals = {
        console: {
          log: api.log,
          error: api.error
        },
        fetch: fetch
      };

      const executeFunction = new Function(
        'input', 'context', 'api', 'globals',
        `
        const { console, fetch } = globals;
        ${code}
        return execute(input, {}, api);
        `
      );

      const result = await executeFunction(input, {}, api, sandboxGlobals);
      return { success: true, result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }, [createPluginAPI]);

  const addPlugin = useCallback((plugin: Omit<Plugin, 'id' | 'metadata'>) => {
    const newPlugin: Plugin = {
      ...plugin,
      id: `plugin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        executionCount: 0
      }
    };
    setPlugins(prev => [...prev, newPlugin]);
  }, []);

  const updatePlugin = useCallback((id: string, updates: Partial<Plugin>) => {
    setPlugins(prev => prev.map(plugin => 
      plugin.id === id 
        ? { 
            ...plugin, 
            ...updates, 
            metadata: { 
              ...plugin.metadata, 
              updatedAt: new Date().toISOString() 
            } 
          }
        : plugin
    ));
  }, []);

  const deletePlugin = useCallback((id: string) => {
    setPlugins(prev => prev.filter(plugin => plugin.id !== id));
    setExecutions(prev => prev.filter(execution => execution.pluginId !== id));
  }, []);

  const importPlugins = useCallback((pluginsData: Plugin[]) => {
    const importedPlugins = pluginsData.map(plugin => ({
      ...plugin,
      id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        ...plugin.metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }));
    setPlugins(prev => [...prev, ...importedPlugins]);
  }, []);

  const exportPlugins = useCallback(() => {
    return plugins.map(plugin => ({
      ...plugin,
      metadata: {
        ...plugin.metadata,
        executionCount: 0, // Reset execution count on export
        lastError: undefined
      }
    }));
  }, [plugins]);

  const loadTemplate = useCallback((templateIndex: number): Omit<Plugin, 'id' | 'metadata'> => {
    const template = PLUGIN_TEMPLATES[templateIndex];
    if (!template) {
      throw new Error('Template not found');
    }

    return {
      name: template.name,
      description: template.description,
      category: template.category,
      version: '1.0.0',
      author: 'Template',
      enabled: false,
      code: template.code
    };
  }, []);

  const clearExecutions = useCallback(() => {
    setExecutions([]);
  }, []);

  return {
    plugins,
    executions,
    isExecuting,
    addPlugin,
    updatePlugin,
    deletePlugin,
    executePlugin,
    testPlugin,
    importPlugins,
    exportPlugins,
    loadTemplate,
    clearExecutions
  };
}