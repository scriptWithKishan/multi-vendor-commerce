import mongoose, { Schema, Document, Model, models, model } from "mongoose";

export interface IVendorStore {
  shopName?: string;
  subdomain?: string;
  shopDescription?: string;
  phoneNumber?: string;
  storeAddress?: string;
}

export interface IOtp {
  code?: string;
  expiresAt?: Date;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  image?: string;
  provider: "credentials" | "google" | "both";
  googleId?: string;
  role: "customer" | "vendor" | "admin";
  isEmailVerified: boolean;
  vendorStore?: IVendorStore;
  otp?: IOtp;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: function (this: IUser) {
        return this.provider === "credentials" && !this.googleId;
      },
      select: false,
    },
    image: {
      type: String,
      default: "",
    },
    provider: {
      type: String,
      enum: ["credentials", "google", "both"],
      default: "credentials",
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["customer", "vendor", "admin"],
      default: "customer",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    vendorStore: {
      shopName: { type: String, trim: true },
      subdomain: { type: String, trim: true, lowercase: true, sparse: true },
      shopDescription: { type: String, trim: true },
      phoneNumber: { type: String, trim: true },
      storeAddress: { type: String, trim: true },
    },
    otp: {
      code: { type: String },
      expiresAt: { type: Date },
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// In Next.js development, delete model cache to ensure updated schema fields (otp, vendorStore) are always compiled.
if (models.User) {
  delete (models as Record<string, unknown>).User;
}

const User: Model<IUser> = model<IUser>("User", UserSchema);

export default User;
