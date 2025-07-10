import express from 'express';
import multer from 'multer';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import path from 'path';
import os from 'os'; // for Downloads path

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(path.resolve(), 'views'));
app.use(express.static('public'));

// Ensure folders exist
['uploads', 'output'].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

// Multer config
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Route to render EJS form
app.get('/', (req, res) => {
  res.render('index'); // renders views/index.ejs
});

// Route to handle image upload
app.post('/upload-image', upload.single('image'), (req, res) => {
  try {
    const imagePath = req.file.path;

    // Create a new PDF
    const doc = new PDFDocument({
      size: 'A4', // Standard page size
      margin: 0   // No margin for full-page image
    });

    const timestamp = Date.now();
    const fileName = `${timestamp}_image_only.pdf`;

    // Set headers for browser download
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/pdf');

    // Pipe PDF directly to the browser
    doc.pipe(res);

    // Add the full-page image
    doc.image(imagePath, 0, 0, {
      width: doc.page.width,
      height: doc.page.height
    });

    doc.end();

    // Clean up the uploaded image after sending
    fs.unlink(imagePath, (err) => {
      if (err) console.warn('Could not delete temp image:', err.message);
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to generate full-page image PDF');
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
