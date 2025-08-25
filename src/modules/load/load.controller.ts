import catchAsync from '../../util/catchAsync';
import sendResponse from '../../util/sendResponse';
import { loadService } from './load.service';

const createLoad = catchAsync(async (req, res) => {
  const result = await loadService.createLoadToDB(
    req.body,
    req.files as Express.Multer.File[],
  );
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: 201,
    message: 'Load  created successfully',
  });
});
const getAllLoad = catchAsync(async (req, res) => {
  const result = await loadService.getAllLoad();
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: 200,
    message: 'Loads  retrived successfully',
  });
});
const getSingleLoad = catchAsync(async (req, res) => {
  const { loadId } = req.params;
  const result = await loadService.getSingleLoad(loadId);
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: 200,
    message: 'Load  retrived successfully',
  });
});
const updateLoad = catchAsync(async (req, res) => {
  const { loadId } = req.params;
  const result = await loadService.updateLoadToDB(
    loadId,
    req.body,
    req.files as Express.Multer.File[],
  );
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: 200,
    message: 'Load  updated successfully',
  });
});
const aassignDriverToLoad = catchAsync(async (req, res) => {
  const { loadId } = req.params;

  const result = await loadService.assignDriver(loadId, req.body);
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: 200,
    message: 'Driver assigned successfully',
  });
});

const generateLoadId = catchAsync(async (req, res) => {
  const result = await loadService.generateLoadId();
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: 200,
    message: 'Load id generated successfully',
  });
});
const updateLoadStatus = catchAsync(async (req, res) => {
  const { loadId } = req.params;
  const result = await loadService.updateLoadStatus(loadId, req.body);
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: 200,
    message: 'Load status updated successfully',
  });
});

export const loadController = {
  createLoad,
  getAllLoad,
  getSingleLoad,
  updateLoad,
  aassignDriverToLoad,
  generateLoadId,
  updateLoadStatus,
};
