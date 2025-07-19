import express from "express";
import upImage from "../routes/uiRoute.js"
import {connectToDb }from "./database.js";
import dataBas from "../routes/dbRoute.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON (for base64 image)
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.static("public"));

app.use(`/img`,upImage);
app.use(`/data`, dataBas);

connectToDb(() => {
  console.log("Successfully connected to Database");
  app.listen(PORT,"0.0.0.0", () => {
    console.log(`listening on port ${PORT}`);
  });
});
