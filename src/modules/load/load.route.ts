import { Router } from "express";
import { loadController } from "./load.controller";
import { upload } from "../../util/uploadImgToCloudinary";

const route = Router()

route.post('/create-load',
upload.array('documents', 2), 
(req, res, next) => {
    req.body = JSON.parse(req.body.data)
    next()
},
loadController.createLoad)

route.get('/', loadController.getAllLoad)

route.get('/:loadId', loadController.getSingleLoad)
route.patch('/:loadId', loadController.updateLoad)

export const loadRoute = route