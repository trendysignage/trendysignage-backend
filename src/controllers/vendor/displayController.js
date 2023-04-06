const { displayService } = require("../../services");
const { catchAsync } = require("../../utils/universalFunction");
const { successResponse } = require("../../utils/response");
const { SUCCESS_MESSAGES, STATUS_CODES } = require("../../config/appConstants");

exports.addScreen = catchAsync(async (req, res) => {
  const screen = await displayService.addScreen(req.token.vendor._id, req.body);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});
