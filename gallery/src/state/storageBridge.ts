// storage-bridge.ts

export interface NativeStorageBridge {
  read(key: string): Promise<string | null> | (string | null);
  write(key: string, value: string): Promise<void> | void;
}

/**
 * Fallback memory store when running headlessly or during early bootstrap.
 */
export class MemoryStorageBridge implements NativeStorageBridge {
  #store = new Map<string, string>();

  read(key: string): string | null {
    return this.#store.get(key) ?? null;
  }

  write(key: string, value: string): void {
    this.#store.set(key, value);
  }
}

/**
 * Native bridge interfacing with GPUI's Rust host bindings.
 * Rust exposes these directly via embedded JS runtime (e.g., QuickJS, V8, or Boa).
 */
export class GpuiStorageBridge implements NativeStorageBridge {
  async read(key: string): Promise<string | null> {
    // Calls into native Rust host function registered in the GPUI window/app context
    if (typeof (globalThis as any).__native_read_config === 'function') {
      return (globalThis as any).__native_read_config(key);
    }
    return null;
  }

  async write(key: string, value: string): Promise<void> {
    if (typeof (globalThis as any).__native_write_config === 'function') {
      // Dispatched to GPUI's async background executor in Rust
      (globalThis as any).__native_write_config(key, value);
    }
  }
}