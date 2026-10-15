import express from "express";

import {
  getSalesReport,
  downloadSalesReportExcel,
  downloadSalesReportPDF,
} from "../controllers/reportController.js";

import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get(
  "/sales",
  adminMiddleware,
  getSalesReport
);

router.get(
  "/sales/excel",
  adminMiddleware,
  downloadSalesReportExcel
);

router.get(
  "/sales/pdf",
  adminMiddleware,
  downloadSalesReportPDF
);

export default router;