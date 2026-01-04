# 音频播放器项目 (Web Audio Player)

这是一个基于 Web 的静态音频播放器，部署在 GitHub Pages 上，音频文件托管在 Cloudflare R2 以节省带宽和存储空间。

## 项目特点

- **目录浏览**：支持多级目录展开/折叠，方便管理大量音频文件。
- **搜索功能**：顶部搜索栏支持实时过滤音频文件。
- **连续播放**：底部常驻播放器，支持自动播放下一首。
- **响应式设计**：完美适配手机、平板和桌面端。
- **存算分离**：前端代码托管在 GitHub，大体积音频文件托管在 Cloudflare R2。

## 目录结构

- `GK 音频/`, `G1 音频/`, `G2 音频/`: 音频文件目录（这些目录在本地仓库中可能为空或仅包含指针文件，实际音频需上传至 R2）。
- `playlist.json`: 自动生成的音频索引文件，包含文件名和对应的 R2 下载链接。
- `generate_playlist.py`: 用于扫描本地目录并生成 `playlist.json` 的 Python 脚本。
- `index.html`, `app.js`, `style.css`: 前端播放器代码。

## 如何添加/更新音频

由于音频文件不直接由 GitHub Pages 提供服务，而是通过 Cloudflare R2，因此添加音频需要两个步骤：**上传文件** 和 **更新列表**。

### 1. 上传音频到 Cloudflare R2

你需要手动将音频文件上传到 Cloudflare R2 存储桶中。

- **存储桶地址**: `https://pub-bf941e18a2b946d588e85e7141c87b2c.r2.dev`
- **路径规则**: R2 中的路径必须与仓库中的目录结构完全一致。
  - 例如：仓库中的 `G1 音频/Book 1.mp3`
  - 对应 R2 URL: `https://pub-bf941e18a2b946d588e85e7141c87b2c.r2.dev/G1%20%E9%9F%B3%E9%A2%91/Book%201.mp3`

### 2. 更新播放列表 (`playlist.json`)

你可以选择自动或手动方式更新播放列表。

#### 方式 A：通过 GitHub Actions 自动更新 (推荐)

1. 在本地仓库对应的目录中创建音频文件（如果是 Git LFS，只需提交指针文件；或者创建一个同名的空文件作为占位符也可以，只要文件名一致）。
2. 将更改提交并推送到 GitHub 的 `main` 分支。
3. GitHub Actions 会自动运行生成脚本，更新 `playlist.json` 并部署到 `gh-pages` 分支。

#### 方式 B：本地手动更新

1. 确保本地目录中有对应的音频文件（文件名必须与上传到 R2 的一致）。
2. 运行生成脚本：
   ```bash
   python3 generate_playlist.py
   ```
3. 提交生成的 `playlist.json` 到 GitHub。

## 本地开发

如果你想在本地运行播放器进行开发或调试：

1. 克隆仓库：
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. 启动本地服务器：
   ```bash
   python3 -m http.server
   ```

3. 在浏览器中访问：`http://localhost:8000`

*注意：本地开发时，音频播放依然依赖网络，因为播放器会直接从 Cloudflare R2 加载音频流。*

## 部署机制

本项目使用 GitHub Actions 进行自动部署：
- 当 `main` 分支有推送时，Action 会触发。
- Action 会扫描仓库中的文件，生成包含 R2 链接的 `playlist.json`。
- 生成的内容会被推送到 `gh-pages` 分支，GitHub Pages 将从该分支提供服务。

## 许可证

MIT License
