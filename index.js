import express from "express";
import multer from "multer";
import PDFDocument from "pdfkit";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(path.resolve(), "views"));
app.use(express.static("public"));

const storage = multer.memoryStorage();
const upload = multer({ storage });


app.get("/", (req, res) => {
  res.render("index"); // renders views/index.ejs
});

app.post("/upload-image", upload.single("image"), (req, res) => {
  try {
    const imageBuffer = req.file.buffer;

    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
    });

    const now = new Date();

    // Auto-detect user's system locale
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;

    // Format date and time based on locale
    const formattedDate = new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(now);

    const formattedTime = new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // change to true for AM/PM format
    }).format(now);

    // Clean up and combine for filename
    const safeDate = formattedDate.replace(/[^\d]/g, "-"); // Replace slashes/dots
    const safeTime = formattedTime.replace(/[^\d]/g, "-"); // Replace colon or space
    const fileName = `pdf_${safeDate}_${safeTime}.pdf`; 

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    // Embed image from buffer instead of file path
    doc.image(imageBuffer, 0, 0, {
      width: doc.page.width,
      height: doc.page.height,
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Failed to generate full-page image PDF");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
