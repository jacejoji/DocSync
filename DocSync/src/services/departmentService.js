import axios from '@/lib/axios';

// Configure your base URL (adjust port if needed)
const API_URL = "https://docsync.datavoid.in/departments";

export const departmentService = {
  // GET /departments
  getAll: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  // POST /departments
  create: async (department) => {
    const response = await axios.post(API_URL, department);
    return response.data;
  },

  // PUT /departments/{id}
  update: async (id, department) => {
    const response = await axios.put(`${API_URL}/${id}`, department);
    return response.data;
  },

  // DELETE /departments/{id}
  delete: async (id) => {
    await axios.delete(`${API_URL}/${id}`);
  }
};