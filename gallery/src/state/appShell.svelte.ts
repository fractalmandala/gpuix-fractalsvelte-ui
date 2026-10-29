const STORAGE_KEY = 'appshell:layout';

export type SidebarId = 'left' | 'right1' | 'right2';

export const SIDEBAR_DEFAULTS: Record<SidebarId, number> = {
  left: 260,
  right1: 280,
  right2: 240
};

export const SIDEBAR_CLAMPS: Record<SidebarId, { min: number; max: number }> = {
  left: { min: 160, max: 480 },
  right1: { min: 200, max: 520 },
  right2: { min: 160, max: 400 }
};

interface PersistedLayout {
  leftW: number;
  right1W: number;
  right2W: number;
  leftCollapsed: boolean;
  right1Collapsed: boolean;
  right2Collapsed: boolean;
  headerVisible: boolean;
  footerVisible: boolean;
}

function clampWidth(id: SidebarId, width: number): number {
  const { min, max } = SIDEBAR_CLAMPS[id];
  return Math.round(Math.min(max, Math.max(min, width)));
}

function loadPersisted(): Partial<PersistedLayout> {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<PersistedLayout>) : {};
  } catch {
    return {};
  }
}

export class AppShellState {
  // Container Visibility
  headerVisible = $state(true);
  footerVisible = $state(true);

  // Exact 80px offset reserved for native macOS traffic lights
  readonly trafficLightsPadding = 80;

  // Panel Dimensions
  leftW = $state(SIDEBAR_DEFAULTS.left);
  right1W = $state(SIDEBAR_DEFAULTS.right1);
  right2W = $state(SIDEBAR_DEFAULTS.right2);

  // Panel Collapse States
  leftCollapsed = $state(false);
  right1Collapsed = $state(true);
  right2Collapsed = $state(true);

  // Active Resizing Flag
  isResizing = $state(false);

  #persistScheduled = false;

  constructor() {
    const p = loadPersisted();
    if (typeof p.leftW === 'number') this.leftW = clampWidth('left', p.leftW);
    if (typeof p.right1W === 'number') this.right1W = clampWidth('right1', p.right1W);
    if (typeof p.right2W === 'number') this.right2W = clampWidth('right2', p.right2W);

    if (typeof p.leftCollapsed === 'boolean') this.leftCollapsed = p.leftCollapsed;
    if (typeof p.right1Collapsed === 'boolean') this.right1Collapsed = p.right1Collapsed;
    if (typeof p.right2Collapsed === 'boolean') this.right2Collapsed = p.right2Collapsed;

    if (typeof p.headerVisible === 'boolean') this.headerVisible = p.headerVisible;
    if (typeof p.footerVisible === 'boolean') this.footerVisible = p.footerVisible;
  }

  // --- Queries ---

  getWidth(id: SidebarId): number {
    if (id === 'left') return this.leftW;
    if (id === 'right1') return this.right1W;
    return this.right2W;
  }

  isCollapsed(id: SidebarId): boolean {
    if (id === 'left') return this.leftCollapsed;
    if (id === 'right1') return this.right1Collapsed;
    return this.right2Collapsed;
  }

  isOpen(id: SidebarId): boolean {
    return !this.isCollapsed(id);
  }

  // --- Toggles ---

  toggleLeft(): void {
    this.leftCollapsed = !this.leftCollapsed;
    this.schedulePersist();
  }

  toggleRight1(): void {
    this.right1Collapsed = !this.right1Collapsed;
    this.schedulePersist();
  }

  toggleRight2(): void {
    this.right2Collapsed = !this.right2Collapsed;
    this.schedulePersist();
  }

  toggleHeader(): void {
    this.headerVisible = !this.headerVisible;
    this.schedulePersist();
  }

  toggleFooter(): void {
    this.footerVisible = !this.footerVisible;
    this.schedulePersist();
  }

  // --- Resizing ---

  resize(id: SidebarId, width: number): void {
    const next = clampWidth(id, width);
    if (id === 'left') this.leftW = next;
    else if (id === 'right1') this.right1W = next;
    else if (id === 'right2') this.right2W = next;
    this.schedulePersist();
  }

  resetWidth(id: SidebarId): void {
    this.resize(id, SIDEBAR_DEFAULTS[id]);
  }

  /**
   * Resizer trigger supporting GPUIX and native pointer events.
   * Extracts horizontal coordinates from either standard or custom GPUI event structures.
   */
  startResize(id: SidebarId, event: any): void {
    if (event?.preventDefault) event.preventDefault();
    this.isResizing = true;

    const startX = typeof event?.clientX === 'number'
      ? event.clientX
      : (event?.x ?? event?.position?.x ?? 0);

    const startW = this.getWidth(id);
    const isInverted = id === 'right1' || id === 'right2';

    const onMove = (e: any) => {
      const currentX = typeof e?.clientX === 'number'
        ? e.clientX
        : (e?.x ?? e?.position?.x ?? 0);

      const delta = currentX - startX;
      const targetW = isInverted ? startW - delta : startW + delta;
      this.resize(id, targetW);
    };

    const onUp = () => {
      this.isResizing = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    }
  }

  // --- macOS Header Double Click ---

  // GPUI has no double-click event, so this is called from a native shortcut or menu, not a click.
  handleHeaderDoubleClick(): void {
    if (typeof globalThis !== 'undefined' && typeof (globalThis as any).__native_toggle_maximize === 'function') {
      (globalThis as any).__native_toggle_maximize();
    }
  }

  // --- Microtask Debounced Persistence ---

  private schedulePersist(): void {
    if (this.#persistScheduled) return;
    this.#persistScheduled = true;

    queueMicrotask(() => {
      this.#persistScheduled = false;
      this.persist();
    });
  }

  private persist(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const snapshot: PersistedLayout = {
        leftW: this.leftW,
        right1W: this.right1W,
        right2W: this.right2W,
        leftCollapsed: this.leftCollapsed,
        right1Collapsed: this.right1Collapsed,
        right2Collapsed: this.right2Collapsed,
        headerVisible: this.headerVisible,
        footerVisible: this.footerVisible
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // Storage access blocked or quota exceeded
    }
  }
}

export const appshell = new AppShellState();