const express = require("express");
const {
  getAllPayment,
  getPaymentById,
  paymentMomo,
  checkStatusPayment,
  callBack,
} = require("../controllers/paymentMomoController");

const router = express.Router();

// Route to create a new class

// Route to get all classes
router.get("/get-all-payment", getAllPayment);
router.get("/:studentId", getPaymentById);
router.post("/payment", paymentMomo);
router.post("/callback", callBack);
router.post("/check-status-transaction", checkStatusPayment);

module.exports = router;
