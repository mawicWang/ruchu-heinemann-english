# 音频播放器项目

这是一个简单的在线音频播放器，支持 Web 和移动端访问。

## 架构说明

为了解决 GitHub Pages 对大文件（如音频）的带宽限制和 Git LFS 的兼容性问题，本项目采用了以下架构：

*   **前端应用**：托管在 GitHub Pages 上（HTML, CSS, JS）。
*   **音频存储**：音频文件实际由 **Cloudflare R2** 提供流媒体服务。
*   **版本控制**：仓库中的音频文件使用 **Git LFS** 进行版本控制，作为目录结构的“真理来源”。
*   **播放列表**：`playlist.json` 由脚本生成，将仓库中的文件路径映射到 Cloudflare R2 的绝对 URL。

## 目录结构

*   `GK`, `G1`, `G2`...: 存放音频文件的目录。
*   `generate_playlist.py`: 扫描当前目录结构并生成 `playlist.json` 的 Python 脚本。
*   `index.html`, `style.css`, `app.js`: 前端源代码。

## 如何添加音频

1.  **添加文件**：将 `.mp3` 等音频文件放入相应的目录（如 `GK`），或创建新目录。
2.  **Git LFS**：确保 Git LFS 已正确安装并跟踪音频文件（`.gitattributes` 已配置）。
3.  **R2 同步**：
    *   播放器实际上是从 `https://pub-bf941e18a2b946d588e85e7141c87b2c.r2.dev` 读取音频。
    *   **重要**：你需要确保仓库中的音频文件结构与 Cloudflare R2 存储桶中的内容保持同步。当前 GitHub Actions 仅负责部署前端和更新播放列表，**不负责**自动上传音频到 R2。请手动或其他方式同步音频文件到 R2。
4.  **更新播放列表**：
    *   提交更改推送到 GitHub 后，GitHub Actions 会自动运行 `generate_playlist.py` 并重新部署。

## 本地开发

1.  **更新播放列表**：
    ```bash
    python3 generate_playlist.py
    ```
    这将生成包含最新 R2 链接的 `playlist.json`。

2.  **启动本地服务器**：
    ```bash
    python3 -m http.server
    ```

3.  **预览**：
    在浏览器访问 `http://localhost:8000`。
    *   *注意：由于音频链接指向 Cloudflare R2，本地预览时也需要联网才能播放音频。*

## 部署

本项目配置了 GitHub Actions (`.github/workflows/deploy.yml`)。

*   当推送到 `main` 分支时，Actions 会自动：
    1.  运行 `python3 generate_playlist.py` 生成最新的播放列表。
    2.  将生成的内容部署到 `gh-pages` 分支。

### GitHub Pages 设置

确保你的仓库 Settings -> Pages 中：
*   **Source**: Deploy from a branch
*   **Branch**: `gh-pages` / `/ (root)`

## 功能特性

*   **目录浏览**：支持多级目录结构。
*   **全局搜索**：实时搜索文件名。
*   **持续播放**：支持下一首、自动播放等。
*   **R2 加速**：利用 Cloudflare R2 CDN 提供快速的音频加载。
