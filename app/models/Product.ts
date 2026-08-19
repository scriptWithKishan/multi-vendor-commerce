import mongoose, { Document, Model, model, models, Schema } from "mongoose";

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  stock: number;
  tags: string[];
  vendor: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Product regular price is required"],
      min: [0, "Price cannot be negative"],
    },
    salePrice: {
      type: Number,
      min: [0, "Sale price cannot be negative"],
    },
    stock: {
      type: Number,
      required: [true, "Product stock count is required"],
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    tags: {
      type: [String],
      default: [],
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Vendor reference is required"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category reference is required"],
    },
    images: {
      type: [String],
      required: [true, "At least one product image is required"],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Delete model cache in Next.js dev environment to ensure updated schema is recompiled
if (models.Product) {
  delete (models as Record<string, unknown>).Product;
}

const Product: Model<IProduct> = model<IProduct>("Product", ProductSchema);

export default Product;