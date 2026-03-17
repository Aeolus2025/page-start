import { ref, nextTick, watch, onUnmounted } from 'vue';
import type { Ref } from 'vue';
import { useClickOutside } from './useClickOutside';

/**
 * 快捷面板显隐与右键唤起逻辑。
 * 点击 contentBlock 外部关闭面板；面板打开时阻止默认右键菜单以便在空白处右键打开面板。
 */
export function useShortCutsPanel(contentBlockRef: Ref<HTMLElement | null>) {
  const showShortcutPanel = ref(false);
  const panelJustClosed = ref(false);

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

  function closeShortcutPanel() {
    panelJustClosed.value = true;
    showShortcutPanel.value = false;
    nextTick(() => {
      panelJustClosed.value = false;
    });
  }

  useClickOutside(contentBlockRef, closeShortcutPanel, showShortcutPanel);

  watch(showShortcutPanel, (visible) => {
    if (contextMenuBlockCleanup) {
      contextMenuBlockCleanup();
      contextMenuBlockCleanup = null;
    }
    if (visible) installContextMenuBlock();
  });

  onUnmounted(() => {
    if (contextMenuBlockCleanup) contextMenuBlockCleanup();
  });

  function openShortcutPanel() {
    showShortcutPanel.value = true;
  }

  return {
    showShortcutPanel,
    panelJustClosed,
    openShortcutPanel,
    closeShortcutPanel
  };
}

