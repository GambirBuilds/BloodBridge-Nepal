import { Router } from 'express';
import * as locationController from '../controllers/locationController.js';

export const locationRouter = Router();

locationRouter.get('/provinces', locationController.getProvinces);
locationRouter.get('/districts', locationController.getDistricts);
locationRouter.get('/municipalities', locationController.getMunicipalities);
locationRouter.get('/hierarchy', locationController.getHierarchy);
