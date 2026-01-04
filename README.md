# 音频播放器项目

这是一个简单的在线音频播放器，支持Web和Mobile端访问。

## 目录结构

- `GK`, `G1`, `G2`: 存放音频文件的目录（当前为示例，可以添加更多）。
- `测试`: 包含测试音频文件。
- `index.html`: 播放器主页。
- `style.css`: 样式文件。
- `app.js`: 播放器逻辑。
- `generate_playlist.py`: 用于扫描目录生成音频列表的脚本。

## 如何添加音频

1. 将 MP3 文件放入相应的目录（如 `GK`, `G1` 等），或者创建新的目录。
2. 更新播放列表。

### 本地更新播放列表

如果你在本地开发，运行以下命令：

```bash
python3 generate_playlist.py
```

这将生成一个新的 `playlist.json` 文件，其中包含最新的文件列表。

### 通过 GitHub 更新

本项目配置了 GitHub Actions。当你将更改（新文件）推送到 `main` 分支时，Actions 会自动运行生成脚本并部署到 GitHub Pages。

## 部署

本项目支持部署到 GitHub Pages。

1. 确保你的仓库已经开启 GitHub Pages。
2. 在 GitHub 仓库设置中，找到 Pages 设置。
3. Source 选择 `Deploy from a branch`。
4. Branch 选择 `gh-pages` / `/ (root)`。 (注意：GitHub Actions 会自动推送到 `gh-pages` 分支，所以请选择 `gh-pages` 分支作为源)。

## 功能

- **目录浏览**：支持多级目录展开/折叠。
- **搜索**：顶部搜索栏可以实时过滤音频文件。
- **播放**：点击文件即可播放，底部显示播放控件。
- **响应式**：适配手机和电脑屏幕。

## 开发

本地启动服务器预览：

```bash
python3 -m http.server
```

然后在浏览器访问 `http://localhost:8000`。
