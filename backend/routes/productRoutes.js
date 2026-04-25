import express from "express";
import upload from "../middleware/upload.js";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

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
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);
router.post("/add-product", authMiddleware, isAdmin, createProduct);

export default router;
