const express = require("express");

const {
  getAllOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderById,
  getOrderByOrderId,
  orderUpdateStatusPayment,
  changeStatusDelivery,
} = require("../controllers/orderController");

const router = express.Router();

router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.post("/", createOrder);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);
router.get("/orders/:orderId", getOrderByOrderId);
router.patch("/:orderId/status-payment", orderUpdateStatusPayment);
router.patch("/status/:id", changeStatusDelivery);
module.exports = router;
