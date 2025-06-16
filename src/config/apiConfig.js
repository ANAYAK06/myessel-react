const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://myesselapi.esselprojects.com/api'
  : 'http://myesselapi.esselprojects.com/api';

export { API_BASE_URL };