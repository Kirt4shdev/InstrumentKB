import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Articles (reemplaza instruments)
export const getArticles = (params?: any) => api.get('/articles', { params });
export const getArticle = (id: string) => api.get(`/articles/${id}`);
export const createArticle = (data: any) => api.post('/articles', data);
export const updateArticle = (id: string, data: any) => api.put(`/articles/${id}`, data);
export const deleteArticle = (id: string) => api.delete(`/articles/${id}`);
export const searchArticles = (q?: string) => api.get('/articles/search', { params: { q } });

// Article metadata
export const getArticleFamilies = () => api.get('/articles/meta/families');
export const getArticleSubfamilies = (family?: string) => 
  api.get('/articles/meta/subfamilies', { params: { family } });
export const getArticleTypes = () => api.get('/articles/meta/types');
export const getArticleCategories = (article_type?: string) => 
  api.get('/articles/meta/categories', { params: { article_type } });

// Manufacturers
export const getManufacturers = () => api.get('/manufacturers');
export const createManufacturer = (data: any) => api.post('/manufacturers', data);

// Variables
export const getVariables = () => api.get('/variables');
export const createVariable = (data: any) => api.post('/variables', data);

// Upload
export const uploadDocument = (formData: FormData) => 
  api.post('/upload/document', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const uploadImage = (formData: FormData) => 
  api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

// Export
export const exportJSON = () => api.get('/export/json');
export const exportExcel = () => api.get('/export/excel', { responseType: 'blob' });
export const exportSQL = () => api.get('/export/sql');
