import express from "express";
import upImage from "../routes/uiRoute.js"

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON (for base64 image)
app.use(express.json({ limit: "10mb" }));
app.use(express.static("public"));

app.use("/",upImage);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
