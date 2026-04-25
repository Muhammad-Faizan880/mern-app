import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: { type: String },

    sizes: [String],

    colors: [
      {
        name: String,
        hex: String,
      },
    ],

    stock: Number,

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },

  { timestamps: true },
);

export default mongoose.model("Product", productSchema);
