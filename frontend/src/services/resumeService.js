import axios from 'axios';

const API_BASE_URL = '/api/resumes';

function authConfig() {
  const session = JSON.parse(localStorage.getItem('fairlens_auth_session') || '{}');
  return { headers: { Authorization: `Bearer ${session.token || ''}` } };
}

export const previewResumeAnonymization = async (rawText) => {
  const response = await axios.post(`${API_BASE_URL}/preview`, { rawText });
  return response.data.data;
};

export const uploadResume = async (rawText, jobTitle, structuredData = {}) => {
  const response = await axios.post(`${API_BASE_URL}/upload`, { rawText, jobTitle, structuredData });
  return response.data.data;
};

export const fetchAllResumes = async () => {
  const response = await axios.get(API_BASE_URL, authConfig());
  return response.data.data || [];
};

export const updateCandidateEvaluation = async (id, evaluationData) => {
  const response = await axios.put(`${API_BASE_URL}/${id}/evaluate`, evaluationData, authConfig());
  return response.data.data;
};
