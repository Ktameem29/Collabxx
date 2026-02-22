const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const createStorage = (subdir) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, '../../uploads', subdir);
      ensureDir(dir);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname));
    },
  });

const fileFilter = (req, file, cb) => {
  const allowed =
    /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar|mp4|mp3|svg/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  if (ext) return cb(null, true);
  cb(new Error('File type not supported'), false);
};

const upload = multer({
  storage: createStorage('files'),
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

const avatarUpload = multer({
  storage: createStorage('avatars'),
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ext) return cb(null, true);
    cb(new Error('Only image files allowed for avatars'), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = { upload, avatarUpload };
