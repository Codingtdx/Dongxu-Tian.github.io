# GitHub 主页维护

此仓库使用 `master` 分支根目录发布，正式网址：

https://codingtdx.github.io/Dongxu-Tian.github.io/

`content/site.json` 是内容源，`src/` 和 `scripts/` 是页面模板与构建工具；`dist/` 保留完整静态输出。根目录的 HTML、CSS、JavaScript 与 `assets/` 是 GitHub Pages 实际使用的输出副本。

## 更新内容

1. 编辑 `content/site.json`；新的图片或 PDF 放在 `dist/assets/`，配置填写 `./assets/文件名`。
2. 运行 `node scripts/build.mjs`，完成内容校验和生成。
3. 按 `README.md` 的方法预览，确认内容、图片和中英文。
4. 将当前构建所需的静态文件同步到仓库根目录，并一起提交内容源、`dist/` 和根目录输出。只构建或只提交 JSON，不会更新线上页面。

在 macOS / Linux 上，可在项目根目录用以下方法生成一个全新的干净输出目录，再同步它。构建工具只复制页面引用的资源与必要许可，避免带入未使用的设计素材。

```sh
homepage_publish_dir=$(mktemp -d)
node scripts/build.mjs --out-dir "$homepage_publish_dir" && cp -R "$homepage_publish_dir"/. .
```

上述步骤不提交或推送。确认后，通过 GitHub Desktop 或 Git 将改动提交并推送到 `master`；等待仓库 Actions 中 `pages build and deployment` 成功，再打开正式网址确认。若删除或改名图片，也要删除根目录 `assets/` 中对应的旧副本。

不要手工编辑生成的 `index.html`、`content.js` 或 `renderer.js`；重新构建和复制即可。`README.md` 与 `更新内容.md` 的“本地保存、未部署”描述记录的是之前的本地交付状态，当前 GitHub 发布流程以本文件为准。

## 发布范围

根目录 `.nojekyll` 让 Pages 直接使用静态文件。此版没有后台、额外依赖或第三方追踪。旧模板已由新版完整替换，旧版本仍可从 Git 历史查看。保留原 `LICENSE` 与 Phosphor 图标许可；它们不额外授予科研图和个人学术资料的再使用权限。
