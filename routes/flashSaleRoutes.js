const express = require("express");
const {
  getActiveFlashSales,
  createFlashSale,
  updateFlashSale,
  deleteFlashSale,
  getFlashSaleById,
  getAllFlashSales,
} = require("../controllers/saleController");

const router = express.Router();

router.get("/flash-sales", getAllFlashSales);
router.get("/", getActiveFlashSales);
router.post("/", createFlashSale);
router.put("/:id", updateFlashSale);
router.delete("/:id", deleteFlashSale);
router.get("/:id", getFlashSaleById);

module.exports = router;
