rsync -r src/ docs/
rsync -r build/contracts/* docs/
git add .
git commit -m "Deploying frontend code to Github pages"
git push -u origin master