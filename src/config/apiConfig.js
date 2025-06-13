const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://myesselapi.esselprojects.com/api'
  : 'http://localhost:57771/api';

export { API_BASE_URL };