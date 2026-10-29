<!-- AppShell.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { GpuixEvent } from 'gpuix-fractalsvelte';
  import { appshell } from '../state/appShell.svelte.ts';

  import PanelLeft from '../icons/panelLeft.svelte';
  import PanelRight from '../icons/panelRight.svelte';
  import PanelRight2 from '../icons/panelRight2.svelte';

  interface Props {
    center: Snippet;
    headerCenter?: Snippet;
    sidebarLeft?: Snippet;
    sidebarRight1?: Snippet;
    sidebarRight2?: Snippet;
    footer?: Snippet;
  }

  let {
    center,
    headerCenter,
    sidebarLeft,
    sidebarRight1,
    sidebarRight2,
    footer
  }: Props = $props();

  const press = (fn: () => void) => (e: GpuixEvent) => {
    if (e.key === 'enter' || e.key === 'space') fn();
  };
</script>

<div class="fs-app-shell">
  <!-- HEADER: native macOS header strip; the left padding clears the traffic lights -->
  {#if appshell.headerVisible}
    <div 
      class="row ycenter wfull"
      style="padding-left: {appshell.trafficLightsPadding}px;"
    >
      <!-- Header Left Row: Left sidebar toggle next to macOS traffic lights -->
      <div class="row ycenter gap-bs">
        {#if sidebarLeft}
          <div 
            class="btn-icon el-variant ghost el-shape square el-size h-md"
            role="button"
            tabindex="0"
            onclick={() => appshell.toggleLeft()}
            onkeydown={press(() => appshell.toggleLeft())}
          >
            <PanelLeft />
          </div>
        {/if}
      </div>

      <!-- Header Center Row: flex-grow, drag area, double-click to maximize -->
      <div 
        class="row ycenter grow"
      >
        {#if headerCenter}
          {@render headerCenter()}
        {/if}
      </div>

      <!-- Header Right Row: Right sidebar toggles -->
      <div class="row ycenter gap-bs">
        {#if sidebarRight1}
          <div 
            class="btn-icon el-variant ghost el-shape square el-size h-md"
            role="button"
            tabindex="0"
            onclick={() => appshell.toggleRight1()}
            onkeydown={press(() => appshell.toggleRight1())}
          >
            <PanelRight />
          </div>
        {/if}
        {#if sidebarRight2}
          <div 
            class="btn-icon el-variant ghost el-shape square el-size h-md"
            role="button"
            tabindex="0"
            onclick={() => appshell.toggleRight2()}
            onkeydown={press(() => appshell.toggleRight2())}
          >
            <PanelRight2 />
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- MAIN SUBSHELL: flex-row, up to 4 columns -->
  <div class="row shell-body">
    <!-- 1. Left Sidebar -->
    {#if sidebarLeft && appshell.isOpen('left')}
      <div 
        class="box br relative"
        testId="shell-left"
        style="width: {appshell.getWidth('left')}px;"
      >
        <div class="shell-pane wfull box" style="width: 100%">
          {@render sidebarLeft()}
        </div>
        <div 
          class="resizer resizer-right" 
          onmousedown={(e) => appshell.startResize('left', e)}
        ></div>
      </div>
    {/if}

    <!-- 2. Central Area -->
    <div class="box center" testId="shell-center">
      {@render center()}
    </div>

    <!-- 3. Right Sidebar 1 -->
    {#if sidebarRight1 && appshell.isOpen('right1')}
      <div 
        class="box bl relative"
        style="width: {appshell.getWidth('right1')}px;"
        testId="shell-right1"
      >
        <div 
          class="resizer resizer-left" 
          onmousedown={(e) => appshell.startResize('right1', e)}
        ></div>
        <div class="shell-pane wfull box" style="width: 100%">
          {@render sidebarRight1()}
        </div>
      </div>
    {/if}

    <!-- 4. Right Sidebar 2 -->
    {#if sidebarRight2 && appshell.isOpen('right2')}
      <div 
        class="box bl relative"
        style="width: {appshell.getWidth('right2')}px;"
        testId="shell-right2"
      >
        <div 
          class="resizer resizer-left" 
          onmousedown={(e) => appshell.startResize('right2', e)}
        ></div>
        <div class="shell-pane wfull box" style="width: 100%">
          {@render sidebarRight2()}
        </div>
      </div>
    {/if}
  </div>

  <!-- FOOTER: flex-row -->
  {#if appshell.footerVisible && footer}
    <div class="row wfull state-surface ycenter">
      {@render footer()}
    </div>
  {/if}
</div>

<style>
  .fs-app-shell { display: flex; flex-direction: column; width: 100%; height: 100%; }
  .shell-body { flex-grow: 1; min-height: 0; }
  .shell-pane { flex-grow: 1; min-height: 0; }
  .center { flex-grow: 1; flex-basis: 0; min-width: 0; overflow: hidden; }
  .box.br, .box.bl { min-width: 0; overflow: hidden; }
  .resizer { position: absolute; top: 0; bottom: 0; width: 6px; cursor: col-resize; }
  .resizer-right { right: 0; }
  .resizer-left { left: 0; }
</style>
