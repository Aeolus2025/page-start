/** 搜索引擎项（内置或自定义） */
export interface SearchEngine {
  id: string;
  name: string;
  url: string;
  icon?: string;
  iconUrl?: string;
}

/** 校验结果 */
export interface ValidateResult {
  valid: boolean;
  message?: string;
}

/** 配置 store 的 state 类型 */
export interface ConfigState {
  backgroundImage: string;
  timeFormat24: boolean;
  timeShowSeconds: boolean;
  timeFontSize: 'small' | 'medium' | 'large';
  timeFontWeight: 'normal' | 'bold';
  timeFontStyle: 'normal' | 'italic' | 'script';
  focusSearchOnLoad: boolean;
  searchHistoryEnabled: boolean;
  /** 搜索结果在新标签页打开，否则当前页跳转 */
  openSearchInNewTab: boolean;
}

/** 右键菜单项 */
export interface ContextMenuItem {
  label: string;
  shortcut?: string;
  action: () => void;
}
