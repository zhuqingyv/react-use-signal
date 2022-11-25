#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 进入生成的文件夹
cd docs

# 如果是发布到自定义域名
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# 方案一：
# 如果发布到 https://<USERNAME>.github.io
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

# 方案二： （我们使用方案二）
# 如果发布到 https://<USERNAME>.github.io/<REPO> （意思就是将打包好的docs文档发布到你的github的某个项目的gh-pages分支上）
git push -f git@github.com:zhuqingyv/react-use-signal.git main

cd -