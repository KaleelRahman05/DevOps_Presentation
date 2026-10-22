import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Attach Authorization header if token exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cinescope_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response error handler helper
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const movieService = {
  getMovies: (params) => api.get('/movies', { params }).then((res) => res.data),
  getFeaturedMovies: () => api.get('/movies/featured').then((res) => res.data),
  getMovieById: (id) => api.get(`/movies/${id}`).then((res) => res.data),
  getRecommendations: (id, limit = 4) =>
    api.get(`/movies/${id}/recommendations`, { params: { limit } }).then((res) => res.data),
  createMovie: (data) => api.post('/movies', data).then((res) => res.data),
  updateMovie: (id, data) => api.put(`/movies/${id}`, data).then((res) => res.data),
  deleteMovie: (id) => api.delete(`/movies/${id}`).then((res) => res.data),
};

export const reviewService = {
  getReviewsForMovie: (movieId) =>
    api.get(`/movies/${movieId}/reviews`).then((res) => res.data),
  createReview: (movieId, data) =>
    api.post(`/movies/${movieId}/reviews`, data).then((res) => res.data),
  deleteReview: (reviewId) =>
    api.delete(`/reviews/${reviewId}`).then((res) => res.data),
};

export const authService = {
  login: (credentials) =>
    api.post('/auth/login', credentials).then((res) => res.data),
  getMe: () => api.get('/auth/me').then((res) => res.data),
  logout: () => {
    localStorage.removeItem('cinescope_token');
    localStorage.removeItem('cinescope_user');
  },
};

export default api;
