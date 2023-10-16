import bcrypt from "bcryptjs";
import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import { Admin } from "../../models/index.js";
import { AuthFailedError } from "../../utils/errors.js";

export const login = async (email, password) => {
  const admin = await Admin.findOne({ email: email }).lean();
  if (!admin) {
    throw new AuthFailedError(
      ERROR_MESSAGES.EMAIL_NOT_FOUND,
      STATUS_CODES.VALIDATION_FAILED
    );
  }
  if (!(await bcrypt.compare(password, admin.password))) {
    throw new AuthFailedError(
      ERROR_MESSAGES.WRONG_PASSWORD,
      STATUS_CODES.VALIDATION_FAILED
    );
  }
  return admin;
};

export const changePassword = async (adminId, body) => {
  const admin = await Admin.findById(adminId).lean();
  if (!admin) {
    throw new AuthFailedError(
      ERROR_MESSAGES.ADMIN_NOT_FOUND,
      STATUS_CODES.VALIDATION_FAILED
    );
  }
  if (!(await bcrypt.compare(body.oldPassword, admin.password))) {
    throw new AuthFailedError(
      ERROR_MESSAGES.WRONG_PASSWORD,
      STATUS_CODES.VALIDATION_FAILED
    );
  }
  const newPass = await bcrypt.hash(body.newPassword, 8);
  await Admin.findByIdAndUpdate(adminId, { $set: { password: newPass } });
};

export const dashboard = async (_id) => {
  const admin = await Admin.findById(_id, { vendors: 1 });
  const count = admin.vendors.length;
  return count;
};

export const editMfa = async (_id, body) => {
  const admin = await Admin.findByIdAndUpdate(_id, {
    $set: { mfaEnabled: body.mfaEnabled, mfa: body.mfa },
  });
};
