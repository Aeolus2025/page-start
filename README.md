# Page Start

轻量化起始页

## 功能概览

- **时钟**：数字时钟，可配置 12/24 制、秒显、字号与字重
- **搜索栏**：多引擎切换、搜索历史、占位符搜索；支持当前页跳转或新标签页打开
- **快捷面板**：右键空白处（PC）或长按背景（移动端）唤起；自定义快捷方式；编辑/删除快捷方式
- **设置面板**：背景图上传、时钟与搜索相关选项、导入/导出配置（JSON，可选是否含背景图）
- **移动端适配**：在小屏设备（宽度 ≤ 640px）下自动调整布局、字号、间距和快捷方式网格列数
- **PWA 支持**：提供 `manifest.webmanifest`，可在手机浏览器中“添加到主屏幕”作为独立应用使用

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

## 作为浏览器扩展使用

本项目支持以**新标签页扩展**形式安装，兼容 **Chrome** 与 **Edge**（同一份构建产物即可）。

1. **构建扩展包**：在项目根目录执行 `npm run build`，生成 `dist/` 目录。
2. **加载扩展**：
   - 打开 Chrome 或 Edge，进入 **扩展程序** 页面（`chrome://extensions` 或 `edge://extensions`）。
   - 开启右上角 **开发者模式**。
   - 点击 **加载已解压的扩展程序**，选择项目下的 **`dist`** 目录。
3. 之后打开新标签页即可看到本起始页。

也可以在 Release 中下载 `page-start-vX.Y.Z-dist.zip`，解压后按上述方式加载。

## 配置与数据

- **本地存储**：键均带前缀 `page-start-`，包括配置项、快捷方式、隐藏引擎 ID、自定义引擎、搜索历史等。
- **导出文件**：JSON，含 `version`（当前为 1）、`config`、`hiddenEngineIds`，以及可选的 `customEngines` / `currentEngine`、`shortcuts`；可选是否包含背景图 base64。
