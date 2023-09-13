import { config } from "../config/config.js";
import { Admin, Layout, Vendor } from "../models/index.js";

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
    email: "demo@example.com",
    isVerified: true,
    $setOnInsert: { password },
  };

  CreateAdmin(adminDetails);
  CreateVendor(vendorDetails);
  createLayouts();
  defaultComposition();
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

const createLayouts = async () => {
  try {
    await Promise.all([
      Layout.findOneAndUpdate(
        { title: "Single Zone Landscape" },
        {
          screenType: "landscape",
          screenResolution: "1920*1080",
          zones: [
            {
              name: "Zone1",
              x: 0,
              y: 0,
              height: 1080,
              width: 1920,
              _id: "64562bce81a7ad616561409b",
            },
          ],
          isDeleted: false,
        },
        { lean: true, upsert: true, new: true }
      ),
      Layout.findOneAndUpdate(
        { title: "Single Zone Potrait" },
        {
          screenType: "potrait",
          screenResolution: "1080*1920",
          zones: [
            {
              name: "Zone1",
              x: 0,
              y: 0,
              height: 1920,
              width: 1080,
              _id: "64562bed81a7ad61656140af",
            },
          ],
          isDeleted: false,
        },
        { lean: true, upsert: true, new: true }
      ),
      Layout.findOneAndUpdate(
        { title: "Two Zone Potrait" },
        {
          screenType: "potrait",
          screenResolution: "1080*1920",
          zones: [
            {
              name: "Zone1",
              x: 0,
              y: 0,
              height: 0,
              width: 0,
              _id: "64562c5881a7ad61656140ef",
            },
            {
              name: "Zone2",
              x: 0,
              y: 0,
              height: 0,
              width: 0,
              _id: "64562c5881a7ad61656140f0",
            },
          ],
          isDeleted: false,
        },
        { lean: true, upsert: true, new: true }
      ),
      Layout.findOneAndUpdate(
        { title: "Two Zone Landscape" },
        {
          screenType: "landscape",
          screenResolution: "1920*1080",
          zones: [
            {
              name: "Zone1",
              x: 0,
              y: 0,
              height: 0,
              width: 0,
              _id: "64562c7881a7ad6165614105",
            },
            {
              name: "Zone2",
              x: 0,
              y: 0,
              height: 0,
              width: 0,
              _id: "64562c7881a7ad6165614106",
            },
          ],
          isDeleted: false,
        },
        { lean: true, upsert: true, new: true }
      ),
      Layout.findOneAndUpdate(
        { title: "Three Zone Landscape" },
        {
          screenType: "landscape",
          screenResolution: "1920*1080",
          zones: [
            {
              name: "Zone1",
              x: 0,
              y: 0,
              height: 0,
              width: 0,
              _id: "64562c9181a7ad6165614118",
            },
            {
              name: "Zone2",
              x: 0,
              y: 0,
              height: 0,
              width: 0,
              _id: "64562c9181a7ad6165614119",
            },
            {
              name: "Zone3",
              x: 0,
              y: 0,
              height: 0,
              width: 0,
              _id: "64562c9181a7ad616561411a",
            },
          ],
          isDeleted: false,
        },
        { lean: true, upsert: true, new: true }
      ),
    ]);
  } catch (err) {
    console.log(err, "---======+++++");
  }
};

const defaultComposition = async () => {
  const layout = await Layout.findOne({
    title: "Single Zone Landscape",
  }).lean();

  const zones = [
    {
      name: "Zone1",
      zoneId: layout.zones[0]._id,
      content: [
        {
          url: config.defaultComposition,
          type: "image",
          maintainAspectRatio: false,
          fitToScreen: true,
          crop: false,
          duration: 10,
        },
      ],
    },
  ];

  console.log(config.defaultComposition);

  // const composition = await Composition.create({
  //   name: "Default Composition",
  //   layout: layout._id,
  //   zones,
  //   duration: 10,
  //   type: "composition",
  // });
};

export default Run;
