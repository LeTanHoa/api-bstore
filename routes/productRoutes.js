const express = require("express");

const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getOneProduct,
} = require("../controllers/productController");
const upload = require("../config/multerConfig");

const router = express.Router();

router.post(
  "/",
  upload.fields(
    Array.from({ length: 10 }, (_, i) => ({
      name: `colors[${i}][images]`,
      maxCount: 10,
    }))
  ),
  createProduct
);

router.get("/", getProducts);
router.get("/:id", getOneProduct);
router.put(
  "/:id/:action?",
  upload.fields(
    Array.from({ length: 10 }, (_, i) => ({
      name: `colors[${i}][images]`,
      maxCount: 10,
    }))
  ),
  updateProduct
);
router.delete("/:id", deleteProduct);

module.exports = router;
