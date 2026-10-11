# Dongxu Tian 学术主页

这是现有学术主页的可填写、可继续扩展版本。使用原来的静态 HTML、CSS 和 JavaScript；不需要 CMS、后台或安装依赖。包内 `dist/` 已构建，可用于静态托管。构建只需要 Node.js 18 或更新版本。

## 更新一次内容

1. 用文本编辑器打开 `content/site.json`，填写或修改对应字段。
2. 将自己的图片或 PDF 放入 `dist/assets/`，配置使用 `./assets/文件名`；路径相对于 `dist/`，不是相对于 JSON 文件。
3. 在项目目录运行 `node scripts/build.mjs`。构建会先校验，再同时生成静态页面、浏览器配置和共享渲染文件。
4. 在本地预览确认内容。需要预览服务时，可运行 `python3 -m http.server 8767 --directory dist`，然后打开 `http://127.0.0.1:8767/`。若已有预览服务，刷新对应页面即可。

只检查内容可运行 `node scripts/validate.mjs`。错误提示会指出具体字段和原因，如 `research[0].zh.summary` 漏填、ID 重复或本地图片不存在。外部 URL 仅校验格式，不检测远站是否存活。校验失败不会写入新的构建结果。

`dist/index.html`、`dist/content.js`、`dist/renderer.js` 是生成文件，**不要手动同步**。布局源在 `src/index.template.html`，共享内容渲染在 `src/renderer.js`；外观和交互分别在 `dist/style.css`、`dist/app.js`。编辑 JSON 只改内容，通常无需修改这些文件。

## 字段说明

双语字段使用 `{"en":"English text","zh":"中文文本"}`。两种语言都要填写；普通内容是纯文本，不填 HTML。JSON 不支持注释，不要留下末尾多余逗号。可选字段可以整项省略，或从对象中删除；不要用空字符串或 `null` 代替。

| 区域 | 填写字段 | 说明 |
| --- | --- | --- |
| `profile` | `name`、`pageTitle`、`description`、`role`、`institution`、`status`、`bio` | 必填双语；姓名、页面标题、搜索简介、身份、单位、现状与简介。英文姓名用于突出论文作者列表中的本人。 |
| `profile.heroLines` | `en` 与 `zh` 文本数组 | 必填，至少一行；每项是一行主张，建议保持简短。当前网站只保留这一处研究愿景。内容较高时首屏会自然撑高。 |
| `profile` 可选 | `socialDescription`、`topics` | 分享摘要为双语；未填时使用简介。`topics` 为文字数组，仅供结构化资料使用。 |
| `labels` | `en` / `zh` 中现有界面文字 | 默认可保留；修改时保持双语键完整。含导航、筛选、图片弹窗与箭头的无障碍名称。 |
| `research` | 研究对象数组 | 可以增删、重排；不依赖四项。见下面示例。 |
| `publications` | 论文对象数组 | 可以增删、重排；不依赖五篇。见下面示例。 |
| `education` | 教育对象数组 | 每项 `id`、双语 `date` / `degree` / `school` 必填；`current:true` 可选。 |
| `contact` | 可选 `email`、`scholar`、`links` | 没有的字段可删除；`scholar` 只展示在论文区。联系方式展示在结尾。 |

每个研究、论文、教育、联系链接对象的 `id` 应在所在数组中唯一，以小写字母开头，只用字母、数字、连字符，例如 `polymer-foam`。编号由顺序自动生成，第十项显示 `10`。图片文件名不必与 ID 相同。

### 研究对象

最少只需 `id`、`en.title` / `en.summary` 与 `zh.title` / `zh.summary`。每个 summary 用一句话写本人贡献。下面展示含图片的形式；**示例图片路径须替换为真实文件**。

```json
{
  "id": "my-project",
  "layout": "wide",
  "ongoing": true,
  "en": {"title":"A research direction","summary":"One contribution I made.","alt":"Describe the actual figure."},
  "zh": {"title":"一个研究方向","summary":"一句本人贡献。","alt":"描述实际图片内容。"},
  "figure": {"preview":"./assets/my-preview.webp","original":"./assets/my-original.png","width":1800,"height":1239},
  "paper": "10.1234/example"
}
```

`layout` 可选 `wide`、`detail`、`routes` 或 `landscape`，缺省为 `wide`。`ongoing` 可省略。`figure` 整体可省略，研究会以文字展示；有图时双语 `alt` 和预览图真实像素 `width` / `height` 必填，以保持比例与加载稳定。`original` 可省略，放大后的原图入口会回退到 `preview`。预览路径和原图路径都可自定义，放大弹窗也使用这些路径。请勿裁切图内坐标、标尺或标签来适应页面。

`paper` 是可选 DOI，不含 `https://doi.org/`。没有 DOI 但有资料链接时可用可选 `url`；同时填两者时优先 DOI。两者都没有就不显示论文入口。本地资料用 `./assets/paper.pdf`，外部链接用完整 `https://...`；配置的本地文件必须存在。

### 论文对象

```json
{
  "id": "my-paper",
  "year": 2026,
  "title": "Actual published title",
  "authors": ["Your Name", "Another Author"],
  "journal": "Journal name",
  "details": "Volume, pages or article number",
  "doi": "10.1234/example",
  "first": true
}
```

`id`、四位整数 `year` 和 `title` 必填。标题可用正式论文原文字符串，或完整双语对象。`authors`、`journal`、`details`、`doi`、`url` 和 `first` 都可省略；缺少的信息正常隐藏，不会生成 `undefined`。`journal` / `details` 也支持原文字符串或双语对象。没有 DOI 时可填资料 `url`；无链接则标题为普通文本。`first:true` 表示本人第一作者，用于筛选。相同 DOI 不应重复录入。

### 教育与联系方式

教育每项示例：`{"id":"phd","date":{"en":"2025 — PRESENT","zh":"2025 — 至今"},"degree":{"en":"PhD student","zh":"博士研究生"},"school":{"en":"Your university","zh":"你的学校"},"current":true}`。

联系 `links` 的每项为 `{"id":"github","label":{"en":"GitHub","zh":"GitHub"},"url":"https://github.com/your-account"}`。`scholar` 使用相同的 `label` 与 `url`，不需要 `id`。`email` 只填邮箱，不加 `mailto:`。

## 从通用示例开始

`examples/site.example.json` 是独立通用示例，不含伪造的个人研究结果；其中研究省略图片，论文省略 DOI，用来演示可选字段。可先在**项目副本**里把它复制为 `content/site.json` 再构建，随后填写真实资料和图片。原项目的 Dongxu Tian 正式配置保持独立。

仅验证示例、不替换正式内容：`node scripts/validate.mjs --content examples/site.example.json`。构建示例可用 `node scripts/build.mjs --content examples/site.example.json --out-dir ../homepage-example-preview`；它生成一个独立、带运行资源的静态目录，正式 `dist/` 保持不变。替代内容必须指定独立输出目录，否则构建会拒绝覆盖正式页面。配置中的本地文件仍从本项目 `dist/` 读取并复制到独立输出。

## 部署与许可

本轮交付是本地项目包，不包含自动推送或部署。将构建后的 `dist/` 发布到静态托管即可，保留相对路径和 `.nojekyll`；未来更新同样先编辑 JSON、构建、预览，再发布。

`dist/assets/arrow-right.svg` 使用 Phosphor Icons，原有 MIT 许可位于 `dist/assets/phosphor-LICENSE.txt`，需随图标保留。科研图和个人学术资料仍属于原作者；本项目没有为它们额外赋予开放再使用许可。
