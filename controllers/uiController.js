import sizeOf from "image-size";
import PDFDocument from "pdfkit";

const uploadImage = async  (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).send("❌ No base64 image provided.");
    }

    const imageBuffer = Buffer.from(imageBase64, "base64");

    const doc = new PDFDocument({
      size: "A4",
      margin: 0, // Remove default margins
    });

    const now = new Date();
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;

    const formattedDate = new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(now);

    const formattedTime = new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(now);

    const safeDate = formattedDate.replace(/[^\d]/g, "-");
    const safeTime = formattedTime.replace(/[^\d]/g, "-");
    const fileName = `pdf_${safeDate}_${safeTime}.pdf`;

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    //  Get original image dimensions
    const dimensions = sizeOf(imageBuffer);
    const imgWidth = dimensions.width;
    const imgHeight = dimensions.height;

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    //  Scale proportionally
    const scale = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;

    //  Centered image
    const x = (pageWidth - scaledWidth) / 2;
    const y = (pageHeight - scaledHeight) / 2;

    doc.image(imageBuffer, x, y, {
      width: scaledWidth,
      height: scaledHeight,
    });

    console.log(" PDF generated with scaled and centered image.");
    doc.end();
  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).send("Failed to generate PDF.");
  }
};

export default uploadImage;
