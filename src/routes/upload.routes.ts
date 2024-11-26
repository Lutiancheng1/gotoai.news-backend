import express, { RequestHandler } from 'express';
import multer from 'multer';
import { UploadController } from '../controllers/upload.controller';
import { auth } from '../middlewares/auth.middleware';

const router = express.Router();
const upload = multer({
  storage: UploadController.storage,
  fileFilter: (req, file, cb) => {
    try {
      // 使用 iconv-lite 进行编码转换
      const iconv = require('iconv-lite')
      file.originalname = iconv.decode(Buffer.from(file.originalname, 'binary'), 'utf-8')
      cb(null, true)
    } catch (error) {
      console.error('文件名解码失败:', error)
      cb(null, true)
    }
  }
});

// 处理函数包装器
const handleUpload: RequestHandler = async (req, res, next) => {
  try {
    await UploadController.upload(req, res);
  } catch (error) {
    next(error);
  }
};

const handleDelete: RequestHandler = async (req, res, next) => {
  try {
    await UploadController.delete(req, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: 上传文件
 *     tags: [Upload]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: 文件上传成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 文件上传成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 550e8400-e29b-41d4-a716-446655440000
 *                     url:
 *                       type: string
 *                       example: /uploads/123/550e8400-e29b-41d4-a716-446655440000.jpg
 */
router.post('/', auth, upload.single('file'), handleUpload);

/**
 * @swagger
 * /upload/{fileId}:
 *   delete:
 *     summary: 删除文件
 *     tags: [Upload]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: 文件ID
 *     responses:
 *       200:
 *         description: 文件删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 文件删除成功
 *       404:
 *         description: 文件不存在
 */
router.delete('/:fileId', auth, handleDelete);

router.get('/', auth, async (req, res, next) => {
  try {
    await UploadController.getUserFiles(req, res);
  } catch (error) {
    next(error);
  }
});

export default router; 