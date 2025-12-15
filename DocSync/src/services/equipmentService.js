import axios from '@/lib/axios';

const API_URL = "https://docsync.datavoid.in/equipment";

export const equipmentService = {
  // GET /equipment
  getAll: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  // POST /equipment
  create: async (equipment) => {
    const response = await axios.post(API_URL, equipment);
    return response.data;
  },

  // PUT /equipment/{id}
  update: async (id, equipment) => {
    const response = await axios.put(`${API_URL}/${id}`, equipment);
    return response.data;
  },

  // DELETE /equipment/{id}
  delete: async (id) => {
    await axios.delete(`${API_URL}/${id}`);
  },

  // GET /equipment/status/{status}
  getByStatus: async (status) => {
    const response = await axios.get(`${API_URL}/status/${status}`);
    return response.data;
  },

  // GET /equipment/serial/{serialNumber}
  getBySerial: async (serial) => {
    const response = await axios.get(`${API_URL}/serial/${serial}`);
    return response.data;
  }
};
