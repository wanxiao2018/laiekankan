# GitHub Pages 部署

这个项目是纯静态网站，GitHub Actions 只发布 `site/` 目录；研究笔记和本地其他文件不会出现在网站上。工作流文件位于 `.github/workflows/deploy-pages.yml`。

## 第一次发布

在项目根目录 `/Users/ddang/Desktop/russia-travel-concept` 执行：

```sh
gh auth login -h github.com
git init
git add site .github/workflows/deploy-pages.yml DEPLOY.md
git commit -m "Prepare generic Russia travel planner"
git branch -M main
gh repo create <你的仓库名> --public --source=. --remote=origin --push
```

之后每次推送 `main`，GitHub Actions 会自动发布。仓库的 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**；发布完成后，地址通常是：

```text
https://<你的 GitHub 用户名>.github.io/<你的仓库名>/
```

二维码和分享链接使用当前页面地址生成，因此换成 GitHub Pages 地址后不需要改代码。

## 发布前检查

- 只提交 `site/`、`.github/` 和本说明；不要提交 `.env`、令牌或本机数据。
- GitHub Pages 适合当前版本：没有后端、登录和数据库，行程保存在浏览器，分享内容放在 URL 片段中。
- 如果将来需要账号同步、多人协作或后台管理，再考虑 Cloudflare Pages／Netlify 加后端服务。
