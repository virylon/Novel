# 📖 我的小说（在线阅读网站）

用 Markdown 写小说，推到 GitHub，开启 GitHub Pages 后就能通过链接在线阅读。
自带章节目录、阅读进度条、翻页、字号调节，以及浅色/深色两种主题。

> 在线阅读：`https://你的用户名.github.io/仓库名/`（开启 Pages 后生效）

---

## 一、项目结构

```
my-novel/
├── index.html          ← 阅读站首页，不用改
├── book.json           ← 【常改】书名、作者、章节目录
├── chapters/           ← 【常改】每一章一个 .md 文件
│   ├── 000.md
│   ├── 001.md
│   └── 002.md
├── assets/
│   ├── style.css       ← 阅读界面样式（想改外观时动它）
│   └── reader.js       ← 阅读逻辑，一般不用改
└── README.md           ← 本说明
```

---

## 二、上传到 GitHub

**方式 A：网页上传（最简单，不用装软件）**

1. 在 GitHub 点右上角 ➕ → **New repository**，填仓库名（如 `my-novel`），选 Public，点创建。
2. 进入空仓库页面 → **uploading an existing file** → 把本项目里**所有文件和文件夹**拖进去 → **Commit changes**。

**方式 B：用 Git 命令**

```bash
cd my-novel
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

---

## 三、开启在线阅读（GitHub Pages）

1. 进入仓库 → **Settings**（设置）。
2. 左侧菜单点 **Pages**。
3. **Source** 选 `Deploy from a branch`，分支选 `main`，目录选 `/ (root)`，点 **Save**。
4. 等 1～2 分钟，页面顶部会出现网址：`https://你的用户名.github.io/仓库名/`，点开就是你的阅读站。

> 提示：直接在电脑上**双击 index.html 打开会读不到章节**（浏览器安全限制）。
> 本地预览请在项目目录里跑一句 `python3 -m http.server`，然后访问 `http://localhost:8000`。

---

## 四、怎么写 / 加新章节

### 1. 写正文
在 `chapters/` 里新建一个 `.md` 文件，比如 `003.md`，用普通文字写就行。**空一行 = 分段**，开头建议放一个标题：

```markdown
# 第三章 重逢

这是正文。空一行就是新的一段。

这是第二段，会自动首行缩进。

> 这是引用，常用来放信件、诗句、内心独白。

---

（上面这条横线会显示成一个分隔花纹）
```

### 2. 登记到目录
打开 `book.json`，在 `chapters` 列表里加一行（注意每行末尾的逗号）：

```json
{
  "title": "未命名的小说",
  "author": "佚名",
  "description": "这里写一句话简介。",
  "chapters": [
    { "title": "楔子",        "file": "chapters/000.md" },
    { "title": "第一章 启程", "file": "chapters/001.md" },
    { "title": "第二章 风雨", "file": "chapters/002.md" },
    { "title": "第三章 重逢", "file": "chapters/003.md" }
  ]
}
```

- `title` 是显示在目录里的章节名，`file` 是对应的文件路径。
- 改完上传（或 `git push`），刷新网页就能看到新章节，**1 分钟左右生效**。

### 3. 改书名 / 作者
直接改 `book.json` 顶部的 `title`、`author`、`description` 即可。

---

## 五、常见问题

| 问题 | 解决 |
|------|------|
| 打开网页一片空白 / 提示读不到 book.json | 你是不是双击 html 打开的？请用 GitHub Pages 链接，或本地起 `python3 -m http.server` |
| 加了章节但网页没更新 | Pages 部署有几十秒延迟，强制刷新（Ctrl/Cmd + Shift + R）再看 |
| 中文显示成方块字 | 需要联网加载字体，断网时会退回系统宋体，属正常 |
| 想换颜色 / 字体 | 改 `assets/style.css` 顶部的 `--bg`、`--text` 等变量 |

---

祝写作顺利。✍️
