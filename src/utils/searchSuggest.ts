/**
 * 搜索建议联想接口配置（JSONP）。
 * 所有搜索引擎（含内置与自定义）统一使用百度联想接口。
 */

export interface SuggestConfig {
  url: string;
  /** 关键词参数名，如 wd / q */
  paramKeyForKeyword: string;
  /** JSONP 回调参数名，如 cb / callback */
  callbackParam: string;
  /** 额外固定参数 */
  extraParams?: Record<string, string>;
  /** 从 JSONP 回调传入的响应中解析出字符串数组 */
  parse: (response: unknown) => string[];
}

/** 百度：回调参数为 { q, p, s: string[] } */
function baiduParse(res: unknown): string[] {
  if (res && typeof res === 'object' && Array.isArray((res as { s?: unknown }).s)) {
    return ((res as { s: unknown[] }).s).filter((x): x is string => typeof x === 'string');
  }
  return [];
}

/** 所有引擎（含自定义）统一使用百度建议接口 */
const BAIDU_SUGGEST_CONFIG: SuggestConfig = {
  url: 'https://suggestion.baidu.com/su',
  paramKeyForKeyword: 'wd',
  callbackParam: 'cb',
  parse: baiduParse
};

/** 任意引擎均返回百度建议配置，便于自定义引擎也获得联想词 */
export function getSuggestConfig(_engineId: string): SuggestConfig | null {
  return BAIDU_SUGGEST_CONFIG;
}
