const fs = require('fs');
const path = require('path');

const root = 'dist';
const htmlFiles = [];

// 递归查找所有 HTML 文件
function findHtmlFiles(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findHtmlFiles(fullPath);
    } else if (file.endsWith('.html')) {
      htmlFiles.push(fullPath);
    }
  });
}

// 替换 /dist/cesium/ 为 /dist/dist/cesium/
function fixPaths() {
  findHtmlFiles(root);
  htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    const original = content;
    content = content.replace(/(["'])\/cesium-lite\/cesium\//g, '$1/cesium-lite/cesium-lite/cesium/');
    if (content !== original) {
      fs.writeFileSync(file, content);
      console.log(`✅ Fixed paths in ${file}`);
    }
  });
}

fixPaths();
