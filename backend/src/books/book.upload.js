const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const documentDirectory = path.join(__dirname, "../../uploads/documents");
const imageDirectory = path.join(__dirname, "../../uploads/images");

const allowedDocumentMimeTypes = new Set([
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const allowedDocumentExtensions = new Set([".pdf", ".txt", ".doc", ".docx"]);

const allowedImageMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);
const allowedImageExtensions = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

fs.mkdirSync(documentDirectory, { recursive: true });
fs.mkdirSync(imageDirectory, { recursive: true });

const documentStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, documentDirectory);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const safeName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
    cb(null, safeName);
  },
});

const imageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, imageDirectory);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const safeName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
    cb(null, safeName);
  },
});

const documentFileFilter = (_req, file, cb) => {
  const extension = path.extname(file.originalname || "").toLowerCase();

  if (!allowedDocumentExtensions.has(extension) || !allowedDocumentMimeTypes.has(file.mimetype)) {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "document"));
    return;
  }

  cb(null, true);
};

const imageFileFilter = (_req, file, cb) => {
  const extension = path.extname(file.originalname || "").toLowerCase();

  if (!allowedImageExtensions.has(extension) || !allowedImageMimeTypes.has(file.mimetype)) {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "coverImage"));
    return;
  }

  cb(null, true);
};

const uploadBookDocument = multer({
  storage: documentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
  fileFilter: documentFileFilter,
});

const uploadCoverImage = multer({
  storage: imageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: imageFileFilter,
});

const bookFilesStorage = multer.diskStorage({
  destination: (_req, file, cb) => {
    if (file.fieldname === "coverImage") {
      cb(null, imageDirectory);
    } else {
      cb(null, documentDirectory);
    }
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const safeName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
    cb(null, safeName);
  },
});

const bookFilesFilter = (_req, file, cb) => {
  const extension = path.extname(file.originalname || "").toLowerCase();

  if (file.fieldname === "coverImage") {
    if (!allowedImageExtensions.has(extension) || !allowedImageMimeTypes.has(file.mimetype)) {
      cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "coverImage"));
      return;
    }
  } else {
    if (!allowedDocumentExtensions.has(extension) || !allowedDocumentMimeTypes.has(file.mimetype)) {
      cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "document"));
      return;
    }
  }

  cb(null, true);
};

const uploadBookFiles = multer({
  storage: bookFilesStorage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 2,
  },
  fileFilter: bookFilesFilter,
}).fields([
  { name: "document", maxCount: 1 },
  { name: "coverImage", maxCount: 1 },
]);

const removeUploadedFile = async (filePath) => {
  if (!filePath) {
    return;
  }

  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
};

const removeUploadedDocument = async (storageName) => {
  if (!storageName) {
    return;
  }

  const filePath = path.join(documentDirectory, storageName);
  await removeUploadedFile(filePath);
};

const removeUploadedImage = async (filename) => {
  if (!filename) {
    return;
  }

  const filePath = path.join(imageDirectory, filename);
  await removeUploadedFile(filePath);
};

const getDocumentFilePath = (storageName) => path.join(documentDirectory, storageName);
const getImageFilePath = (filename) => path.join(imageDirectory, filename);

module.exports = {
  getDocumentFilePath,
  getImageFilePath,
  removeUploadedDocument,
  removeUploadedImage,
  uploadBookDocument,
  uploadCoverImage,
  uploadBookFiles,
};
