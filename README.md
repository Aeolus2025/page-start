# Page Start

轻量化起始页

## 功能概览

- **时钟**：数字时钟，可配置 12/24 制、秒显、字号与字重
- **搜索栏**：多引擎切换、搜索历史、占位符搜索；支持当前页跳转或新标签页打开
- **快捷面板**：右键空白处（PC）或长按背景（移动端）唤起；自定义快捷方式；编辑/删除快捷方式
- **设置面板**：背景图上传、时钟与搜索相关选项、导入/导出配置（JSON，可选是否含背景图）
- **移动端适配**：在小屏设备（宽度 ≤ 640px）下自动调整布局、字号、间距和快捷方式网格列数
- **PWA 支持**：提供 `manifest.webmanifest`，可在手机浏览器中“添加到主屏幕”作为独立应用使用

## 技术栈

- **Vue 3**
- **Pinia**
- **Vite**
- **TypeScript**

## 项目结构

```
src/
├── App.vue                       # 根布局：背景、时钟、搜索/快捷面板、设置入口 + 响应式布局
├── main.ts
├── assets/                       # 图标字体等静态资源（iconfont 等）
├── components/                   # 页面级与通用组件
│   ├── DigitalClock.vue
│   ├── SearchBar.vue             # 搜索栏面板（历史、联想、引擎选择）
│   ├── ShortCutsPanel.vue        # 快捷方式网格面板
│   ├── SettingsPanel.vue         # 设置面板
│   ├── settings/                 # 设置各分区（外观、背景、时钟、搜索、导入导出）
│   ├── search/                   # SearchHistory / SearchSuggest / SearchEnginePickerPanel / SearchEngineIcon
│   ├── shortcuts/                # ShortCutsCardButton / ShortCutsEditorPanel 等
│   └── ...
├── composables/                  # 可复用逻辑
│   ├── useShortCutsPanel.ts      # 快捷面板显隐、右键/长按唤起、点击外部关闭
│   ├── useShortCutsGridLayout.ts # 快捷网格列数与 ResizeObserver
│   ├── useClickOutside.ts
│   ├── useSearchFocus.ts / useSearchHistory.ts / useSearchSuggest.ts / ...
│   └── ...
├── constants/                    # 内置搜索引擎等常量
├── store/
│   ├── settings.ts               # 全局配置（主题、时钟、搜索、导入导出）
│   ├── shortcuts.ts              # 快捷方式列表
│   └── search.ts                 # 搜索引擎列表、隐藏/自定义引擎与当前引擎
├── types/                        # 全局类型与 StorageKey 枚举
└── utils/
    ├── storage.ts                # localStorage 封装（统一前缀 + JSON 工具）
    ├── getIcon.ts                # 搜索/快捷方式 favicon 与首字母工具
    ├── checkUrl.ts               # URL 校验
    └── jsonp.ts                  # 搜索联想 JSONP 请求封装
```

## 开发与工程化

```bash
# 安装依赖
npm install

# 开发
npm run dev

# 类型检查
npm run typecheck

# 代码规范检查（ESLint）
npm run lint

# 类型检查 + 构建
npm run build

# 预览构建产物
npm run preview

# 本地完整 CI（类型 + lint + 构建 + manifest 校验）
npm run ci
```

工程化说明：

- 使用 **ESLint flat config**（`eslint.config.ts`）+ Prettier 统一代码风格
- Husky + lint-staged：提交前对变更文件执行 eslint / prettier
- GitHub Actions：
  - `ci.yml`：每次 push / PR 自动跑 `npm run ci`
  - `release.yml`：推送 tag（如 `v1.0.0`）自动构建、打包 `dist.zip` 并创建 Release

## Tag 发布与自动打包

推荐发布流程：

```bash
# 本地确认通过
npm run ci

# 提交并推送代码
git add .
git commit -m "chore: release v1.0.0"
git push origin main

# 打 tag 并推送（必须是 vX.Y.Z 格式）
git tag v1.0.0
git push origin v1.0.0
```

`release.yml` 会在 tag push 后自动：

1. 安装依赖（`npm ci`）
2. 从 `GITHUB_REF_NAME`（如 `v1.0.0`）解析版本号写入 `package.json` 与 `public/manifest.json`
3. 执行 `npm run ci`
4. 在仓库根目录生成：
   - `release-assets/page-start-v1.0.0-dist.zip`
5. 使用 `softprops/action-gh-release` 创建/更新对应 Release 并上传上述产物

## 作为浏览器扩展使用

本项目支持以**新标签页扩展**形式安装，兼容 **Chrome** 与 **Edge**（同一份构建产物即可）。

1. **构建扩展包**：在项目根目录执行 `npm run build`，生成 `dist/` 目录。
2. **加载扩展**：
   - 打开 Chrome 或 Edge，进入 **扩展程序** 页面（`chrome://extensions` 或 `edge://extensions`）。
   - 开启右上角 **开发者模式**。
   - 点击 **加载已解压的扩展程序**，选择项目下的 **`dist`** 目录。
3. 之后打开新标签页即可看到本起始页。

也可以在 Release 中下载 `page-start-vX.Y.Z-dist.zip`，解压后按上述方式加载。

## 在移动端与 PWA 中使用

- **手机浏览器直接访问**：部署到静态站点（自托管或 Vercel / Netlify 等），在手机浏览器访问 URL 即可自动启用移动布局：
  - 小屏下时钟字号、搜索栏高度、快捷网格列数会变得更适合竖屏触控。
  - 触摸长按背景可唤起快捷面板，桌面端仍使用右键。
- **PWA 安装到主屏幕**：
  - `index.html` 中已声明：
    - `<link rel="manifest" href="/manifest.webmanifest" />`
    - `<meta name="theme-color" content="#0b1020" />`
  - `public/manifest.webmanifest` 提供 `192x192` 与 `512x512` 图标（当前复用 `icons/logo.png`），在支持的平台上可通过浏览器菜单“添加到主屏幕”。

## 配置与数据

- **本地存储**：键均带前缀 `page-start-`，包括配置项、快捷方式、隐藏引擎 ID、自定义引擎、搜索历史等。
- **导出文件**：JSON，含 `version`（当前为 1）、`config`、`hiddenEngineIds`，以及可选的 `customEngines` / `currentEngine`、`shortcuts`；可选是否包含背景图 base64。
