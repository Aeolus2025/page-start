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
  /** 快捷方式列表 */
  shortcuts?: ShortcutItem[];
  /** 当前选中的搜索引擎（用于恢复用户的默认引擎） */
  currentEngine?: { id?: string; name?: string; url?: string };
}

/** 主题：浅色 / 深色 / 根据系统（prefers-color-scheme） */
export type ThemeMode = 'light' | 'dark' | 'system';

/** 配置 store 的 state 类型 */
export interface ConfigState {
  /** 主题：light | dark | system */
  theme: ThemeMode;
  backgroundImage: string;
  timeFormat24Enabled: boolean;
  timeShowSecondsEnabled: boolean;
  timeFontSize: 'small' | 'medium' | 'large';
  timeFontWeight: 'normal' | 'bold';
  timeFontStyle: 'normal' | 'italic' | 'script';
  focusSearchOnLoadEnabled: boolean;
  searchHistoryEnabled: boolean;
  /** 输入时是否请求并展示在线搜索建议（联想词） */
  searchSuggestEnabled: boolean;
  /** 搜索结果在新标签页打开，否则当前页跳转 */
  openSearchInNewTabEnabled: boolean;
  /** 导出配置时是否包含背景图（方案 C），默认 true */
  exportBackgroundEnabled: boolean;
  /** 导出配置时是否包含自定义搜索引擎与默认引擎 */
  exportSearchEnginesEnabled: boolean;
  /** 导出配置时是否包含快捷方式 */
  exportShortCutsEnabled: boolean;
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
  Theme = 'theme',
  BackgroundImage = 'backgroundImage',
  TimeFormat24Enabled = 'timeFormat24Enabled',
  TimeShowSecondsEnabled = 'timeShowSecondsEnabled',
  TimeFontSize = 'timeFontSize',
  TimeFontWeight = 'timeFontWeight',
  TimeFontStyle = 'timeFontStyle',
  FocusSearchOnLoadEnabled = 'focusSearchOnLoadEnabled',
  SearchHistoryEnabled = 'searchHistoryEnabled',
  SearchSuggestEnabled = 'searchSuggestEnabled',
  OpenSearchInNewTabEnabled = 'openSearchInNewTabEnabled',
  ExportBackgroundEnabled = 'exportBackgroundEnabled',
  ExportSearchEnginesEnabled = 'exportSearchEnginesEnabled',
  ExportShortCutsEnabled = 'exportShortCutsEnabled',
  HiddenEngineIds = 'hiddenEngineIds',
  CustomEngines = 'custom-engines',
  Shortcuts = 'shortcuts',
  SearchHistory = 'searchHistory',
  SelectedEngine = 'selectedEngine'
}
