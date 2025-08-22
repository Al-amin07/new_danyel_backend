import config from '../../config';
import ApppError from '../../error/AppError';
import { IAddress, ILoad } from './load.interface';
import { LoadModel } from './load.model';

const createLoadToDB = async (payload: ILoad, files: Express.Multer.File[]) => {
  if (!files || files.length === 0) {
    throw new ApppError(404, 'No files uploaded');
  }

  const documents = files.map((file) => ({
    type: file?.mimetype,
    url: `${config.server_url}/uploads/${file?.filename}`,
  }));
  console.log({ documents, payload });

  if (!payload?.totalPayment) {
    payload.totalPayment = payload.totalDistance * payload.ratePerMile;
  }

  const result = await LoadModel.create({ ...payload, documents });
  return result;
};

const getAllLoad = async () => {
  const result = await LoadModel.find().populate('assignedDriver');
  return result;
};

const getSingleLoad = async (id: string) => {
  const result = await LoadModel.findById(id).populate('assignedDriver');
  return result;
};

const updateLoadToDB = async (
  id: string,
  payload: Partial<ILoad>,
  files: Express.Multer.File[],
) => {
  const { pickupAddress, deliveryAddress, ...loadData } = payload;
  const isLoadExist = (await LoadModel.findById(id)) as ILoad;
  if (!isLoadExist) {
    throw new ApppError(404, 'Load not found');
  }
  const updatedLoad: Record<string, unknown> = { ...loadData };
  if (pickupAddress) {
    (Object.keys(pickupAddress) as (keyof IAddress)[]).forEach((key) => {
      updatedLoad[`pickupAddress.${key}`] = pickupAddress[key];
    });
  }
  if (deliveryAddress) {
    (Object.keys(deliveryAddress) as (keyof IAddress)[]).forEach((key) => {
      updatedLoad[`deliveryAddress.${key}`] = deliveryAddress[key];
    });
  }
  let documents: { type: string; url: string }[] = [];
  if (files.length > 0) {
    documents = files.map((file) => {
      return {
        type: file?.mimetype,
        url: `${config.server_url}/uploads/${file?.filename}`,
      };
    });
  }

  console.log({ documents });

  const result = await LoadModel.findByIdAndUpdate(
    id,
    {
      $set: {
        ...updatedLoad,
      },
      $push: { documents },
    },
    { new: true },
  );
  return result;
};

const assignDriver = async (loadId: string, payload: { driverId: string }) => {
  const result = await LoadModel.findByIdAndUpdate(
    loadId,
    {
      assignedDriver: payload?.driverId,
    },
    { new: true },
  );
  return result;
};

// Function to generate random load ID
async function generateLoadId(): Promise<string> {
  const numbers = Math.floor(100 + Math.random() * 900); // 3 random digits
  const letters = Array.from(
    { length: 2 },
    () => String.fromCharCode(65 + Math.floor(Math.random() * 26)), // 2 random uppercase letters
  ).join('');
  const moreNumbers = Math.floor(1000 + Math.random() * 9000); // 4 random digits

  return `#${numbers}${letters}${moreNumbers}`;
}

export const loadService = {
  createLoadToDB,
  getAllLoad,
  getSingleLoad,
  updateLoadToDB,
  assignDriver,
  generateLoadId,
};
