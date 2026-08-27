const express = require("express");
const {
  deleteABook,
  getAllBooks,
  getBookDocument,
  getMyBooks,
  getSingleBook,
  postABook,
  setTrendingStatus,
  updateBook,
} = require("./book.controller");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");
const { uploadBookFiles } = require("./book.upload");

const router = express.Router();

router.get("/", getAllBooks);
router.get("/mine", verifyToken, getMyBooks);
router.patch("/trending/:id", verifyAdmin, setTrendingStatus);
router.get("/:id/document", verifyToken, getBookDocument);
router.get("/:id", getSingleBook);
router.post("/create-book", verifyToken, uploadBookFiles, postABook);
router.put("/edit/:id", verifyToken, uploadBookFiles, updateBook);
router.delete("/:id", verifyToken, deleteABook);

router.use((error, _req, res, _next) => {
  if (error?.name === "MulterError") {
    if (error.code === "LIMIT_FILE_SIZE") {
      if (error.field === "coverImage") {
        return res.status(400).json({ message: "Cover image size must be 5MB or less." });
      }
      return res.status(400).json({ message: "Document size must be 10MB or less." });
    }

    if (error.field === "coverImage") {
      return res
        .status(400)
        .json({ message: "Only JPEG, PNG, GIF, and WebP images are supported." });
    }

    return res
      .status(400)
      .json({ message: "Only PDF, DOC, DOCX, and TXT files are supported." });
  }

  return res.status(500).json({ message: "Unable to process the uploaded file." });
});

module.exports = router;
