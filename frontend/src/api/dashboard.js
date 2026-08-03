import API from './axios';

/**
 * Fetch paginated dashboard data for the authenticated student.
 * @param {number} page - zero‑based page index
 * @param {number} size - number of entries per page
 * @returns {Promise<Object>} DashboardResponse payload
 */
export const fetchDashboard = async (page = 0, size = 7) => {
  const response = await API.get(`/api/dashboard?page=${page}&size=${size}`);
  return response.data;
};
