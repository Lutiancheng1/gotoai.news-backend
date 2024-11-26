const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const dayjs = require('dayjs');

// 等待一段时间确保构建完成
setTimeout(() => {
  // 确保 build 目录存在
  const buildPath = path.join(__dirname, '../../build');
  if (!fs.existsSync(buildPath)) {
    console.error('❌ build 目录不存在，构建可能失败');
    process.exit(1);
  }

  // 创建 releases 目录（如果不存在）
  const releasesPath = path.join(__dirname, '../../releases');
  if (!fs.existsSync(releasesPath)) {
    fs.mkdirSync(releasesPath);
  }

  // 生成压缩包名称
  const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss');
  const zipName = `news_${timestamp}.zip`;
  const outputPath = path.join(releasesPath, zipName);

  // 创建写入流
  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', {
    zlib: { level: 9 }
  });

  // 监听压缩完成事件
  output.on('close', () => {
    console.log('\n✨ 打包完成！');
    console.log(`📦 文件名：${zipName}`);
    console.log(`📂 位置：${outputPath}`);
    console.log(`📊 大小：${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
  });

  // 监听错误
  archive.on('error', (err) => {
    console.error('❌ 打包失败：', err);
    process.exit(1);
  });

  // 将输出流管道连接到归档
  archive.pipe(output);

  // 将整个 build 目录添加到压缩包
  archive.directory(buildPath, false);

  // 完成压缩
  archive.finalize();
}, 2000); // 等待 2 秒确保构建完成