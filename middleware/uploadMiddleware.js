import multer from "multer"
import path from "path"
import fs from "fs"

const uploadDir = path.join(process.cwd(), "uploads")

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir)
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
  },
})

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx/
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = filetypes.test(file.mimetype)

  if (extname && mimetype) {
    return cb(null, true)
  } else {
    cb("Error: Images, PDFs, and Office documents only!")
  }
}

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb)
  },
})

export default upload

