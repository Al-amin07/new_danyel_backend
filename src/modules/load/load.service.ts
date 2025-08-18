import config from "../../config";
import ApppError from "../../error/AppError";
import { IAddress, ILoad } from "./load.interface"
import { LoadModel } from "./load.model";

const createLoadToDB = async(payload: ILoad, files: Express.Multer.File[] ) => {
   
if (!files || files.length === 0) {
        throw new ApppError(404, "No files uploaded")
    }
  
    const documents = files.map(file => ({
      type: file?.mimetype, 
            url: `${config.server_url}/uploads/${file?.filename}`,
    }));
   console.log({documents, payload})

   if(!payload?.totalPayment){
    payload.totalPayment = payload.totalDistance * payload.ratePerMile   
   }

    const result = await LoadModel.create({...payload, documents})
    return result
}

const getAllLoad = async() => {
    const result = await LoadModel.find().populate('assignedDriver')
    return result
}



const getSingleLoad = async(id: string) => {
    const result = await LoadModel.findById(id).populate('assignedDriver')
    return result
}


const updateLoadToDB = async(id: string, payload: Partial<ILoad>) => {
        const {pickupAddress, deliveryAddress, ...loadData} = payload;
         const updatedLoad: Record<string, unknown> = {...loadData}
         if(pickupAddress){
             (Object.keys(pickupAddress) as (keyof IAddress)[]).forEach(key => {
                updatedLoad[`pickupAddress.${key}`] = pickupAddress[key] 
            })
         }
         if(deliveryAddress){
            (Object.keys(deliveryAddress) as (keyof IAddress)[]).forEach(key => {
                updatedLoad[`deliveryAddress.${key}`] = deliveryAddress[key]
            })
         }
         console.log({updatedLoad})
         const result = await LoadModel.findByIdAndUpdate(id, updatedLoad, {new: true});
         return result
}

export const loadService = {
    createLoadToDB,
    getAllLoad,
    getSingleLoad,
    updateLoadToDB
}