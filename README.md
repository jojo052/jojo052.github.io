# 钟选的个人项目主页

默认中文，可切换英文。桌面端为左侧个人资料、右侧项目内容；移动端自动上下排列。适用于 GitHub Pages，无第三方依赖。

## 填写内容

编辑 `content/site.json`。`zh` 是中文，`en` 是英文。

侧栏邮箱按钮固定显示 `@ E-mail`，点击复制 `profile.email`；复制结果会短暂显示在按钮下方。Currently、Selected Work、Experience 三个栏目标题固定使用英文，其他内容继续支持中英文切换。

| 字段 | 内容 |
| --- | --- |
| `profile` | 姓名、照片、个人介绍、教育信息、邮箱、GitHub |
| `currently` | 近期正在做的事 |
| `projects` | 精选项目，可添加 VLA、Web3、Quant、Agent 等方向 |
| `experience` | 工作经历 |

在 `projects` 中复制一条项目，修改 `id`（唯一英文标识）、标题、介绍、日期、分类、技术标签与链接。

- `ongoing: true` 的项目排在前面；同组内按 `sortDate` 从新到旧排序。
- `sortDate` 使用 `YYYY-MM`，如 `2026-08`。相同月份保持文件中的顺序。
- `date` 是显示给访客的日期，中英文分别填写。
- `visible: false` 可以保留尚未填完的草稿，不展示给访客。
- `url` 暂时没有就留空，页面不会显示无效按钮。
- SmolVLA 未填写起始日期，仅标注进行中。商汤三个项目暂共用经历时间；准确项目月份补充后再排序。
- Web3、Quant、Agent 尚无已提供的项目内容，可按同一格式添加，分类不影响时间排序。

编辑后，在本目录执行以下命令更新网页：

```sh
python3 scripts/build.py
```

打开 `index.html` 即可查看。也可启动本地预览：

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

访问 `http://127.0.0.1:4173`。语言选择保存在当前浏览器；首次访问默认中文。

## 照片与排版

当前头像为 `assets/profile-personal.jpeg`，来自用户指定的 `个人照.jpeg`。修改 `content/site.json` 中的 `profile.photo` 可选择其他照片。原始照片完整保留，显示区域由 `cosmic.css` 中的 `.portrait-frame .portrait` 调整。

`styles.css` 保留基础布局，`cosmic.css` 控制蓝黑星空主题、NASA 背景和按钮光效；`template.html` 控制页面结构。生成的 `index.html` 不建议直接编辑，重新生成会覆盖它。星空图片及完整署名见 `assets/CREDITS.md`，页面底部也可展开来源链接。

## GitHub Pages

发布目标为 [jojo052.github.io](https://jojo052.github.io/)，源码仓库为 [jojo052/jojo052.github.io](https://github.com/jojo052/jojo052.github.io)。GitHub Pages 使用 `main` 分支根目录发布。网页运行只需 `index.html`、`styles.css`、`cosmic.css`、`app.js`、`assets/` 和 `.nojekyll`；保留其他源文件方便更新。

每次修改内容后，重新生成网页，再提交并推送 `main` 分支，GitHub Pages 会更新网站。内容仍由 `content/site.json` 管理。

无需 npm 或服务器运行时。未加入简历原文件的下载入口，以免旧版日期与主页信息混用。


