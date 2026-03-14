import { ref, nextTick, watch, onUnmounted } from 'vue';
import type { Ref } from 'vue';

export function useShortcutPanel(contentBlockRef: Ref<HTMLElement | null>) {
  const showShortcutPanel = ref(false);
  const panelJustClosed = ref(false);

  let shortcutClickCleanup: (() => void) | null = null;
  let contextMenuBlockCleanup: (() => void) | null = null;

  const onContextMenuBlock = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  };

  function installContextMenuBlock() {
    if (contextMenuBlockCleanup) return;
    window.addEventListener('contextmenu', onContextMenuBlock, true);
    document.addEventListener('contextmenu', onContextMenuBlock, true);
    contextMenuBlockCleanup = () => {
      window.removeEventListener('contextmenu', onContextMenuBlock, true);
      document.removeEventListener('contextmenu', onContextMenuBlock, true);
      contextMenuBlockCleanup = null;
    };
  }

  watch(showShortcutPanel, (visible) => {
    if (shortcutClickCleanup) {
      shortcutClickCleanup();
      shortcutClickCleanup = null;
    }
    if (contextMenuBlockCleanup) {
      contextMenuBlockCleanup();
      contextMenuBlockCleanup = null;
    }
    if (visible) {
      installContextMenuBlock();
      nextTick(() => {
        const onDocClick = (e: MouseEvent) => {
          if (contentBlockRef.value && !contentBlockRef.value.contains(e.target as Node)) {
            closeShortcutPanel();
          }
        };
        document.addEventListener('mousedown', onDocClick);
        shortcutClickCleanup = () => document.removeEventListener('mousedown', onDocClick);
      });
    }
  });

  onUnmounted(() => {
    if (shortcutClickCleanup) shortcutClickCleanup();
    if (contextMenuBlockCleanup) contextMenuBlockCleanup();
  });

  function openShortcutPanel() {
    showShortcutPanel.value = true;
  }

  function closeShortcutPanel() {
    panelJustClosed.value = true;
    showShortcutPanel.value = false;
    nextTick(() => {
      panelJustClosed.value = false;
    });
  }

  return {
    showShortcutPanel,
    panelJustClosed,
    openShortcutPanel,
    closeShortcutPanel,
    installContextMenuBlock
  };
}
