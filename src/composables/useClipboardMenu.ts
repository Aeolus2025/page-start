import { ref, computed } from 'vue';
import type { Ref } from 'vue';
import type { ContextMenuItem } from '@/types';

export function useClipboardMenu(query: Ref<string>) {
  const savedSelection = ref({ start: 0, end: 0 });

  function doCopy() {
    const { start, end } = savedSelection.value;
    const text = query.value.slice(start, end);
    if (text) navigator.clipboard?.writeText(text).catch(() => {});
  }

  function doCut() {
    const { start, end } = savedSelection.value;
    const text = query.value.slice(start, end);
    if (text) {
      navigator.clipboard
        ?.writeText(text)
        .then(() => {
          query.value = query.value.slice(0, start) + query.value.slice(end);
        })
        .catch(() => {});
    }
  }

  async function doPaste() {
    try {
      const text = await navigator.clipboard?.readText();
      if (text == null) return;
      const { start, end } = savedSelection.value;
      query.value = query.value.slice(0, start) + text + query.value.slice(end);
    } catch (_) {}
  }

  const searchMenuItems = computed<ContextMenuItem[]>(() => [
    { label: '剪切', shortcut: 'Ctrl+X', action: doCut },
    { label: '复制', shortcut: 'Ctrl+C', action: doCopy },
    { label: '粘贴', shortcut: 'Ctrl+V', action: doPaste }
  ]);

  function openContextMenu(getInputEl: () => HTMLInputElement | null) {
    const el = getInputEl();
    if (el) {
      savedSelection.value = { start: el.selectionStart ?? 0, end: el.selectionEnd ?? 0 };
    }
    return savedSelection;
  }

  return { savedSelection, searchMenuItems, openContextMenu };
}
