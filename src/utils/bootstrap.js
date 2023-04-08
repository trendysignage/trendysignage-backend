import { Token, Admin, Vendor } from "../models/index.js";

const Run = async () => {
  /*-------------------------------------------------------------------------------
   * add admin
   * -----------------------------------------------------------------------------*/
  let password = "$2a$08$8QBeUqrXcf334kMMrDS1euP5nbn00MZpP5Yi4PBucI9MIdASz8qDC";

  let adminDetails = {
    name: "Trendy App Admin",
    email: "admin@test.com",
    $setOnInsert: { password },
  };

  let vendorDetails = {
    name: "Test Vendor",
    email: "vendor@test.com",
    isVerified: true,
    $setOnInsert: { password },
  };

  CreateAdmin(adminDetails);
  CreateVendor(vendorDetails);
};

const CreateAdmin = async (adminDetails) => {
  try {
    let adminData = await Admin.findOneAndUpdate(
      { email: adminDetails.email },
      adminDetails,
      { lean: true, upsert: true, new: true }
    );
    console.log("=================");

    return adminData;
  } catch (err) {
    console.log(
      "**********************************************************************",
      err
    );
  }
};

const CreateVendor = async (vendorDetails) => {
  try {
    let vendorData = await Vendor.findOneAndUpdate(
      { email: vendorDetails.email },
      vendorDetails,
      { lean: true, upsert: true, new: true }
    );
    console.log("=================");

    return vendorData;
  } catch (err) {
    console.log(
      "**********************************************************************",
      err
    );
  }
};

export default Run;
