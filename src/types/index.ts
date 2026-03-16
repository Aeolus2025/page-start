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

/** 导出配置的 JSON 结构 */
export interface ExportPayload {
  version: number;
  config: ConfigState;
  hiddenEngineIds: string[];
  customEngines: { name: string; url: string }[];
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
  /** 导出配置时是否包含背景图（方案 C），默认 true */
  exportIncludeBackground: boolean;
}

/** 右键菜单项 */
export interface ContextMenuItem {
  label: string;
  shortcut?: string;
  action: () => void;
}

/** 快捷面板中的一项 */
export interface ShortcutItem {
  id: string;
  name: string;
  url: string;
  /** 展示用，如 emoji 或单字符 */
  icon: string;
}

/** localStorage 使用到的键（不含全局前缀） */
export enum StorageKey {
  BackgroundImage = 'backgroundImage',
  TimeFormat24 = 'timeFormat24',
  TimeShowSeconds = 'timeShowSeconds',
  TimeFontSize = 'timeFontSize',
  TimeFontWeight = 'timeFontWeight',
  TimeFontStyle = 'timeFontStyle',
  FocusSearchOnLoad = 'focusSearchOnLoad',
  SearchHistoryEnabled = 'searchHistoryEnabled',
  OpenSearchInNewTab = 'openSearchInNewTab',
  ExportIncludeBackground = 'exportIncludeBackground',
  HiddenEngineIds = 'hiddenEngineIds',
  CustomEngines = 'custom-engines',
  Shortcuts = 'shortcuts',
  SearchHistory = 'searchHistory',
  SelectedEngine = 'page-start-selected-engine'
}
