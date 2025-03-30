const express = require("express");
const { emailOrder, emailStatus } = require("../controllers/emailController");

const router = express.Router();

router.post("/emailOrder", emailOrder);
router.post("/emailStatus", emailStatus);

module.exports = router;
