// React Native compatible — pure axios wrappers, no browser/DOM APIs used.
import api from '../api/axios'

export const getAllCities = async () => {
  const response = await api.get('/api/city-details')
  return response.data
}

export const getCityById = async (id) => {
  const response = await api.get(`/api/city-details/${id}`)
  return response.data
}

// Admin functions (optional)
export const createCity = async (cityData) => {
  const response = await api.post('/api/city-details', cityData)
  return response.data
}

export const updateCity = async (id, cityData) => {
  const response = await api.put(`/api/city-details/${id}`, cityData)
  return response.data
}

export const deleteCity = async (id) => {
  const response = await api.delete(`/api/city-details/${id}`)
  return response.data
}
