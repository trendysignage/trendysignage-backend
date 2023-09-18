import {
  LOG_MESSAGES,
  STATUS_CODES,
  SUCCESS_MESSAGES,
} from "../../config/appConstants.js";
import { logService, profileService } from "../../services/index.js";
import { formatVendor } from "../../utils/formatResponse.js";
import { successResponse } from "../../utils/response.js";
import { catchAsync } from "../../utils/universalFunction.js";

export const defaultComposition = catchAsync(async (req, res) => {
  await profileService.defaultComposition(req.token.vendor._id, req.body);
  await logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.DEFAULT_COMPOSITION,
    req.headers.timezone ?? "Asia/Kolkata"
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const getProfile = catchAsync(async (req, res) => {
  const data = await profileService.getProfile(req.token.vendor._id);
  formatVendor(data);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    data
  );
});

export const editProfile = catchAsync(async (req, res) => {
  await profileService.editProfile(req.token.vendor._id, req.body);
  await logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.EDIT_PROFILE,
    req.headers.timezone ?? "Asia/Kolkata"
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const getRoles = catchAsync(async (req, res) => {
  const roles = await profileService.getRoles(req.token.vendor._id);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    roles
  );
});

export const editRole = catchAsync(async (req, res) => {
  await profileService.editRole(req.token.vendor._id, req.body);
  await logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.EDIT_ROLES,
    req.headers.timezone ?? "Asia/Kolkata"
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const auditReport = catchAsync(async (req, res) => {
  const logs = await logService.getLogs(
    req.token.vendor._id,
    req.query,
    req.headers.timezone
  );
  await logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.GET_AUDIT_LOGS,
    req.headers.timezone ?? "Asia/Kolkata"
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    logs
  );
});

export const uptimeReport = catchAsync(async (req, res) => {
  const report = await profileService.uptimeReport(
    req.token.vendor._id,
    req.query
  );
  await logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.GET_UPTIME_REPORTS,
    req.headers.timezone ?? "Asia/Kolkata"
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    report
  );
});

export const mediaReport = catchAsync(async (req, res) => {
  const report = await profileService.mediaReport(
    req.token.vendor._id,
    req.query
  );
  await logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.GET_MEDIA_REPORTS,
    req.headers.timezone ?? "Asia/Kolkata"
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    report
  );
});

export const getUsers = catchAsync(async (req, res) => {
  const users = await profileService.getUsers(req.token.vendor._id);
  users.map((user) => {
    formatVendor(user);
  });
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    users
  );
});

export const addUser = catchAsync(async (req, res) => {
  const user = await profileService.addUser(req.token.vendor._id, req.body);
  formatVendor(user);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    user
  );
});

export const editUser = catchAsync(async (req, res) => {
  await profileService.editUser(req.token.vendor._id, req.body);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const deleteUser = catchAsync(async (req, res) => {
  await profileService.deleteUser(req.token.vendor._id, req.query.userId);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const changePassword = catchAsync(async (req, res) => {
  await profileService.changePassword(req.token.vendor._id, req.body);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const disableUser = catchAsync(async (req, res) => {
  await profileService.disableUser(req.token.vendor._id, req.body.userId);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const getGroups = catchAsync(async (req, res) => {
  const groups = await profileService.getGroups(req.token.vendor._id);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    groups
  );
});

export const addGroups = catchAsync(async (req, res) => {
  const groups = await profileService.addGroups(req.token.vendor._id, req.body);
  formatVendor(groups);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    groups
  );
});

export const editGroups = catchAsync(async (req, res) => {
  await profileService.editGroups(req.token.vendor._id, req.body);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const deleteGroup = catchAsync(async (req, res) => {
  await profileService.deleteGroup(req.token.vendor._id, req.query.groupId);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const addTags = catchAsync(async (req, res) => {
  const tags = await profileService.addTags(req.token.vendor._id, req.body);
  formatVendor(tags);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    tags
  );
});

export const getDeviceProfiles = catchAsync(async (req, res) => {
  const profiles = await profileService.getDeviceProfiles(req.token.vendor._id);
  await logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.GET_PROFILES,
    req.headers.timezone ?? "Asia/Kolkata"
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    profiles
  );
});

export const addDeviceProfile = catchAsync(async (req, res) => {
  const profile = await profileService.addDeviceProfile(
    req.token.vendor._id,
    req.body
  );
  await logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.ADD_PROFILE,
    req.headers.timezone ?? "Asia/Kolkata"
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    profile
  );
});

export const editDeviceProfile = catchAsync(async (req, res) => {
  await profileService.editDeviceProfile(req.token.vendor._id, req.body);
  await logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.EDIT_PROFILE,
    req.headers.timezone ?? "Asia/Kolkata"
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const deleteDeviceProfile = catchAsync(async (req, res) => {
  await profileService.deleteDeviceProfile(
    req.token.vendor._id,
    req.query.profileId
  );
  await logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.DELETE_PROFILE,
    req.headers.timezone ?? "Asia/Kolkata"
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const assign = catchAsync(async (req, res) => {
  await profileService.assign(req.token.vendor._id, req.body);
  await logService.createLog(
    req.token.vendor._id,
    LOG_MESSAGES.ASSIGN_DEVICE_PROFILE,
    req.headers.timezone ?? "Asia/Kolkata"
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS
  );
});

export const getVendorRole = catchAsync(async (req, res) => {
  const role = await profileService.getVendorRole(req.token.vendor._id);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    role
  );
});
