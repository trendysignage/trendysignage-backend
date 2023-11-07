import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      required: true,
    },
    password: { type: String, required: true },
    vendors: [{ type: mongoose.Schema.Types.ObjectId, ref: "vendors" }],
    mfa: { type: String, default: null },
    mfaEnabled: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

adminSchema.methods.isPasswordMatch = async function (password) {
  const admin = this;
  return bcrypt.compare(password, admin.password);
};

adminSchema.pre("save", async function (next) {
  const admin = this;
  if (admin.isModified("password")) {
    admin.password = await bcrypt.hash(admin.password, 8);
  }
  next();
});

const Admin = mongoose.model("admins", adminSchema);

export { Admin };
