import express from "express";
import * as dbController from "../controllers/dbController.js";

const router = express.Router();

router.get("/automotive-companies", dbController.fetchAutomotiveCompanies);
router.get("/workshop-services", dbController.fetchWorkshopServices);
router.get("/last-invoice", dbController.fetchLastInvoice);
router.post("/store-invoice", dbController.storeCustomerInvoices);

export default router;