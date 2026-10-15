import Order from "../models/Order.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

export const getSalesReport = async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;

    const now = new Date();

    let start;
    let end;

    if (period === "daily") {
      start = new Date(now);
      start.setHours(0, 0, 0, 0);

      end = new Date(now);
      end.setHours(23, 59, 59, 999);
    }

    else if (period === "weekly") {
      start = new Date(now);
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);

      end = new Date(now);
      end.setHours(23, 59, 59, 999);
    }

    else if (period === "yearly") {
      start = new Date(now.getFullYear(), 0, 1);

      end = new Date(
        now.getFullYear(),
        11,
        31,
        23,
        59,
        59,
        999
      );
    }

    else if (period === "custom") {
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "Start date and end date are required",
        });
      }

      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    }

    else {
      return res.status(400).json({
        success: false,
        message:
          "Invalid period. Use daily, weekly, yearly or custom",
      });
    }

    const orders = await Order.find({
      createdAt: {
        $gte: start,
        $lte: end,
      },

      paymentStatus: "Paid",

      orderStatus: {
        $ne: "Cancelled",
      },
    }).sort({ createdAt: -1 });

    let totalSales = 0;
    let totalDiscount = 0;

    orders.forEach((order) => {
      totalSales += order.totalAmount || 0;
      totalDiscount += order.discount || 0;
    });

    res.status(200).json({
      success: true,

      report: {
        period,
        startDate: start,
        endDate: end,

        totalOrders: orders.length,

        totalSales,

        totalDiscount,

        averageOrderValue:
          orders.length > 0
            ? totalSales / orders.length
            : 0,

        orders,
      },
    });
  } catch (error) {
    console.error("Sales report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate sales report",
    });
  }
};

export const downloadSalesReportExcel = async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;

    const now = new Date();

    let start;
    let end;

    if (period === "daily") {
      start = new Date(now);
      start.setHours(0, 0, 0, 0);

      end = new Date(now);
      end.setHours(23, 59, 59, 999);
    }

    else if (period === "weekly") {
      start = new Date(now);
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);

      end = new Date(now);
      end.setHours(23, 59, 59, 999);
    }

    else if (period === "yearly") {
      start = new Date(now.getFullYear(), 0, 1);

      end = new Date(
        now.getFullYear(),
        11,
        31,
        23,
        59,
        59,
        999
      );
    }

    else if (period === "custom") {
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "Start date and end date are required",
        });
      }

      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    }

    else {
      return res.status(400).json({
        success: false,
        message: "Invalid report period",
      });
    }

    const orders = await Order.find({
      createdAt: {
        $gte: start,
        $lte: end,
      },
      paymentStatus: "Paid",
      orderStatus: {
        $ne: "Cancelled",
      },
    }).sort({ createdAt: -1 });

    let totalSales = 0;
    let totalDiscount = 0;

    orders.forEach((order) => {
      totalSales += order.totalAmount || 0;
      totalDiscount += order.discount || 0;
    });

    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet("Sales Report");

    // Title
    worksheet.mergeCells("A1:F1");
    worksheet.getCell("A1").value = "LAPZONE SALES REPORT";
    worksheet.getCell("A1").font = {
      bold: true,
      size: 16,
    };

    // Summary
    worksheet.getCell("A3").value = "Period";
    worksheet.getCell("B3").value = period;

    worksheet.getCell("A4").value = "Total Orders";
    worksheet.getCell("B4").value = orders.length;

    worksheet.getCell("A5").value = "Total Sales";
    worksheet.getCell("B5").value = totalSales;

    worksheet.getCell("A6").value = "Total Discount";
    worksheet.getCell("B6").value = totalDiscount;

    worksheet.getCell("A7").value = "Average Order Value";
    worksheet.getCell("B7").value =
      orders.length > 0
        ? totalSales / orders.length
        : 0;

    // Table headers
    worksheet.addRow([]);

    const headerRow = worksheet.addRow([
      "Order ID",
      "Date",
      "Payment Method",
      "Order Status",
      "Discount",
      "Amount",
    ]);

    headerRow.font = {
      bold: true,
    };

    // Orders
    orders.forEach((order) => {
      worksheet.addRow([
        order.orderId,
        new Date(order.createdAt).toLocaleDateString("en-IN"),
        order.paymentMethod,
        order.orderStatus,
        order.discount || 0,
        order.totalAmount || 0,
      ]);
    });

    // Column widths
    worksheet.columns = [
      { width: 25 },
      { width: 15 },
      { width: 20 },
      { width: 20 },
      { width: 15 },
      { width: 15 },
    ];

    // Response
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="lapzone-sales-report-${period}.xlsx"`
    );

    await workbook.xlsx.write(res);

    res.end();

  } catch (error) {
    console.error("Excel report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate Excel report",
    });
  }
};

export const downloadSalesReportPDF = async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;

    const now = new Date();

    let start;
    let end;

    if (period === "daily") {
      start = new Date(now);
      start.setHours(0, 0, 0, 0);

      end = new Date(now);
      end.setHours(23, 59, 59, 999);
    }

    else if (period === "weekly") {
      start = new Date(now);
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);

      end = new Date(now);
      end.setHours(23, 59, 59, 999);
    }

    else if (period === "yearly") {
      start = new Date(now.getFullYear(), 0, 1);

      end = new Date(
        now.getFullYear(),
        11,
        31,
        23,
        59,
        59,
        999
      );
    }

    else if (period === "custom") {
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "Start date and end date are required",
        });
      }

      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    }

    else {
      return res.status(400).json({
        success: false,
        message: "Invalid report period",
      });
    }

    const orders = await Order.find({
      createdAt: {
        $gte: start,
        $lte: end,
      },

      paymentStatus: "Paid",

      orderStatus: {
        $ne: "Cancelled",
      },
    }).sort({ createdAt: -1 });

    let totalSales = 0;
    let totalDiscount = 0;

    orders.forEach((order) => {
      totalSales += order.totalAmount || 0;
      totalDiscount += order.discount || 0;
    });

    const averageOrderValue =
      orders.length > 0
        ? totalSales / orders.length
        : 0;

    const doc = new PDFDocument({
      margin: 40,
    });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="lapzone-sales-report-${period}.pdf"`
    );

    doc.pipe(res);

    // Title
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("LAPZONE SALES REPORT", {
        align: "center",
      });

    doc.moveDown();

    // Summary
    doc.fontSize(12).font("Helvetica");

    doc.text(`Period: ${period}`);
    doc.text(`From: ${start.toLocaleDateString("en-IN")}`);
    doc.text(`To: ${end.toLocaleDateString("en-IN")}`);

    doc.moveDown();

    doc.font("Helvetica-Bold");
    doc.text(`Total Orders: ${orders.length}`);
    doc.text(`Total Sales: Rs. ${totalSales.toLocaleString("en-IN")}`);
    doc.text(`Total Discount: Rs. ${totalDiscount.toLocaleString("en-IN")}`);
    doc.text(
      `Average Order Value: Rs. ${Math.round(
        averageOrderValue
      ).toLocaleString("en-IN")}`
    );

    doc.moveDown();

    doc.fontSize(14).text("Orders");

    doc.moveDown();

    // Table header
    doc.fontSize(9).font("Helvetica-Bold");

    doc.text(
      "Order ID",
      40,
      doc.y
    );

    doc.text(
      "Date",
      160,
      doc.y
    );

    doc.text(
      "Payment",
      230,
      doc.y
    );

    doc.text(
      "Discount",
      320,
      doc.y
    );

    doc.text(
      "Amount",
      400,
      doc.y
    );

    doc.moveDown();

    doc.font("Helvetica");

    orders.forEach((order) => {
      const y = doc.y;

      doc.text(order.orderId, 40, y, {
        width: 110,
      });

      doc.text(
        new Date(order.createdAt).toLocaleDateString("en-IN"),
        160,
        y
      );

      doc.text(
        order.paymentMethod,
        230,
        y
      );

      doc.text(
        `Rs. ${order.discount || 0}`,
        320,
        y
      );

      doc.text(
        `Rs. ${order.totalAmount || 0}`,
        400,
        y
      );

      doc.moveDown(1.5);
    });

    doc.end();

  } catch (error) {
    console.error("PDF report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate PDF report",
    });
  }
};