# Page Start

轻量化起始页

## 功能概览

- **时钟**：数字时钟，可配置 12/24 制、秒显、字号与字重
- **搜索栏**：多引擎切换、搜索历史、占位符搜索；支持当前页跳转或新标签页打开
- **快捷面板**：右键空白处唤起；自定义快捷方式；编辑/删除快捷方式
- **设置面板**：背景图上传、时钟与搜索相关选项、导入/导出配置（JSON，可选是否含背景图）

## 技术栈

- **Vue 3**
- **Pinia**
- **Vite**
- **TypeScript**

## 项目结构

```
src/
├── App.vue                 # 根布局：背景、时钟、搜索/快捷面板、设置入口
├── main.ts
├── assets/                 # 图标字体等静态资源
├── components/             # 页面级与通用组件
│   ├── DigitalClock.vue
│   ├── SearchBar.vue      # 搜索栏面板
│   ├── ShortcutGrid.vue   # 快捷方式面板
│   ├── SettingsPanel.vue  # 设置面板
│   ├── settings/          # 设置内各区块
│   ├── EnginePicker.vue / EngineIcon.vue
│   └── ...
├── composables/            # 可复用逻辑
│   ├── useShortcutPanel.ts # 快捷面板显隐与右键逻辑
│   ├── useShortcutGridLayout.ts # 快捷网格列数与样式
│   ├── useClickOutside.ts
│   ├── useSearchFocus.ts / useSearchHistory.ts / ...
│   └── ...
├── constants/              # 内置搜索引擎等常量
├── store/
│   ├── config.ts          # 全局配置 
│   └── shortcuts.ts       # 快捷方式列表 
├── types/                  # 全局类型
└── utils/
    ├── storage.ts         # localStorage 封装 
    ├── engine.ts          # 搜索引擎与 favicon 工具
    └── shortcutIcon.ts    # 快捷方式图标/首字母工具
```

## 开发与构建

```bash
# 安装依赖
npm install

# 开发
npm run dev

# 类型检查 + 构建
npm run build

# 预览构建产物
npm run preview
```

## 作为浏览器扩展使用

本项目支持以**新标签页扩展**形式安装，兼容 **Chrome** 与 **Edge**（同一份构建产物即可）。

1. **构建扩展包**：在项目根目录执行 `npm run build`，生成 `dist/` 目录。
2. **加载扩展**：
   - 打开 Chrome 或 Edge，进入 **扩展程序** 页面（`chrome://extensions` 或 `edge://extensions`）。
   - 开启右上角 **开发者模式**。
   - 点击 **加载已解压的扩展程序**，选择项目下的 **`dist`** 目录。
3. 之后打开新标签页即可看到本起始页。

## 配置与数据

- **本地存储**：键均带前缀 `page-start-`，包括配置项、快捷方式、隐藏引擎 ID、自定义引擎、搜索历史等。
- **导出文件**：JSON，含 `version`、`config`、`hiddenEngineIds`、`customEngines`；可选是否包含背景图 base64。
