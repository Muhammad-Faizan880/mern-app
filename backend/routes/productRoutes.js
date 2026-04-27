// routes/productRoutes.js
import express from "express";
import upload from "../middleware/upload.js";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateVariantStock,
  getVariantById,
  getProductVariants,
  updateSingleVariantStock,
} from "../controllers/productController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

// Product routes
router.post(
  "/",
  authMiddleware,
  isAdmin,
  upload.single("image"),
  createProduct,
);

router.get("/", getProducts);
router.get("/:id", getProductById);

router.put(
  "/:id",
  upload.single("image"),
  authMiddleware,
  isAdmin,
  updateProduct,
);

router.delete("/:id", authMiddleware, isAdmin, deleteProduct); // ✅ Delete route

// Variant routes
router.get("/:productId/variants", getProductVariants);
router.get("/variant/:id", getVariantById);
router.put("/variant/:variantId/stock", authMiddleware, isAdmin, updateSingleVariantStock);
router.post("/checkout/update-stock", authMiddleware, updateVariantStock);

export default router;