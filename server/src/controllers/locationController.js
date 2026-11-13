import {
  getDistrictsByProvince,
  getMunicipalitiesByDistrict,
  getProvinceNames,
  NEPAL_PROVINCES,
} from '../../../src/data/locations.js';

export function getProvinces(req, res) {
  return res.json({
    success: true,
    data: getProvinceNames(),
  });
}

export function getDistricts(req, res) {
  const { province } = req.query;
  return res.json({
    success: true,
    data: getDistrictsByProvince(province),
  });
}

export function getMunicipalities(req, res) {
  const { province, district } = req.query;
  return res.json({
    success: true,
    data: getMunicipalitiesByDistrict(province, district),
  });
}

export function getHierarchy(req, res) {
  return res.json({
    success: true,
    data: NEPAL_PROVINCES,
  });
}
