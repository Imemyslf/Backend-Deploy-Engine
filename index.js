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
    const timestamp = Date.now();
    const pdfFileName = `${timestamp}_with_image.pdf`;
    const pdfOutputPath = path.join('output', pdfFileName);
    const downloadsPath = path.join(os.homedir(), 'Downloads', pdfFileName);

    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(pdfOutputPath);
    doc.pipe(writeStream);

    // PDF content
    doc.fontSize(18).text('Invoice with Embedded Image', { align: 'center' });
    doc.moveDown();

    doc.image(imagePath, {
      fit: [400, 300],
      align: 'center',
      valign: 'center'
    });

    doc.moveDown();
    doc.fontSize(14).text('This image was uploaded and embedded into the PDF.');
    doc.end();

    writeStream.on('finish', () => {
      // Copy to Downloads folder
      fs.copyFileSync(pdfOutputPath, downloadsPath);
      console.log(`PDF saved to output/ and also copied to: ${downloadsPath}`);
    });

    res.status(200).send('✅ PDF generated and saved in Downloads folder.');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to generate PDF');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
