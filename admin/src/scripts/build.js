const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const dayjs = require('dayjs');

// 确保 dist 目录存在
const distPath = path.join(__dirname, '../dist');
if (!fs.existsSync(distPath)) {
  console.error('dist 目录不存在，请先运行 npm run build');
  process.exit(1);
}

// 生成压缩包名称
const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss');
const zipName = `news_${timestamp}.zip`;
const outputPath = path.join(__dirname, '../', zipName);

// 创建写入流
const output = fs.createWriteStream(outputPath);
const archive = archiver('zip', {
  zlib: { level: 9 } // 设置压缩级别
});

// 监听压缩完成事件
output.on('close', () => {
  console.log(`✨ 压缩完成！文件大小: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📦 压缩包路径: ${outputPath}`);
});

// 监听错误
archive.on('error', (err) => {
  throw err;
});

// 将输出流管道连接到归档
archive.pipe(output);

// 将整个 dist 目录添加到压缩包
archive.directory(distPath, false);

// 完成压缩
archive.finalize();