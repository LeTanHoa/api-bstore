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
const generateColorFields = (maxColors = 10) => {
  const fields = [];
  for (let i = 0; i < maxColors; i++) {
    fields.push({ name: `colors[${i}][images]`, maxCount: 10 });
  }
  return fields;
};
router.post("/", upload.fields(generateColorFields()), createProduct);

router.get("/", getProducts);
router.get("/:id", getOneProduct);
router.put("/:id", upload.fields(generateColorFields()), updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
