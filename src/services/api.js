// API Client - Connects React Frontend to .NET Backend
// All requests go through Vite proxy: /api → http://localhost:5184/api
//
// FULL COVERAGE: every endpoint exposed by SignMate.API controllers is wrapped below.
// Naming mirrors the controllers (auth, users, admin, analytics, dashboard, centers,
// classes, courses, lessons, enrollments, games, practice, progress, tracking,
// notifications, onboarding, subscription, teacher, vocabulary, b2b contact, seed).

export const API_BASE = '/api';

// Helper: get JWT token from localStorage
const getToken = () => localStorage.getItem('accessToken');

// Helper: build headers. Pass isJson=false for multipart/form-data uploads
// (the browser must set the Content-Type + boundary itself).
const headers = (isJson = true) => {
  const h = {};
  if (isJson) h['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
};

// Helper: single-flight token refresh.
// Nhiều request 401 đồng thời chia sẻ chung MỘT lần gọi /auth/refresh —
// tránh đua nhau dùng refresh token cũ đã bị xoay → fail → bị đá về /login oan.
let refreshInFlight = null;

const tryRefreshToken = () => {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;
      const body = await res.json();
      // Unpack ApiResponse<T> envelope if present
      const data = body && typeof body === 'object' && 'data' in body ? body.data : body;
      if (!data?.accessToken) return false;
      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      return true;
    } catch {
      return false;
    }
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
};

// Helper: handle response
const handleResponse = async (res) => {
  if (res.status === 401) {
    // If we're on the login page, don't redirect — just show the error
    const isLoginPage = window.location.pathname === '/login';
    if (!isLoginPage) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }

    let errMsg = 'Sai email hoặc mật khẩu.';
    try {
      const text = await res.text();
      if (text) {
        const body = JSON.parse(text);
        if (body && body.message) {
          errMsg = body.message;
        }
      }
    } catch {
      // Ignore JSON parse or text read error, use fallback message
    }
    throw new Error(errMsg);
  }

  if (!res.ok) {
    let errMsg = `HTTP ${res.status}`;
    try {
      const text = await res.text();
      if (text) {
        if (text.startsWith('{')) {
          const body = JSON.parse(text);
          if (body) {
            if (body.message) {
              errMsg = body.message;
            } else if (body.errors && Array.isArray(body.errors)) {
              errMsg = body.errors.join(', ');
            }
          }
        } else if (!text.startsWith('<')) {
          errMsg = text;
        }
      }
    } catch {
      // Ignore parse/read error, use fallback HTTP status
    }
    throw new Error(errMsg);
  }

  const text = await res.text();
  if (!text) return null;

  let body;
  try {
    body = JSON.parse(text);
  } catch {
    return text; // Fallback to raw text if not JSON
  }

  // Unpack ApiResponse<T> envelope if present
  if (body && typeof body === 'object' && 'success' in body) {
    if (body.success) {
      return 'data' in body ? body.data : body;
    } else {
      throw new Error(body.message || 'Yêu cầu không thành công.');
    }
  }

  return body;
};

// Core request: gọi API, nếu access token hết hạn (401) thì refresh rồi thử lại MỘT lần.
// Không refresh cho /auth/* (tránh vòng lặp khi chính refresh/login bị 401).
const request = async (path, { method = 'GET', body, isJson = true } = {}) => {
  const doFetch = () =>
    fetch(`${API_BASE}${path}`, { method, headers: headers(isJson), body });

  let res = await doFetch();

  if (res.status === 401 && !path.startsWith('/auth/')) {
    const refreshed = await tryRefreshToken();
    if (refreshed) res = await doFetch();
  }

  return handleResponse(res);
};

// Small helpers to cut boilerplate
const get = (path) => request(path);

const post = (path, data) =>
  request(path, {
    method: 'POST',
    body: data === undefined ? undefined : JSON.stringify(data),
  });

const put = (path, data) =>
  request(path, {
    method: 'PUT',
    body: data === undefined ? undefined : JSON.stringify(data),
  });

const del = (path) => request(path, { method: 'DELETE' });

// multipart/form-data upload (file + extra fields), no JSON Content-Type header
const upload = (path, formData) =>
  request(path, { method: 'POST', body: formData, isJson: false });

// ============================
// AUTH  (api/auth)
// ============================
export const authApi = {
  login: (email, password) => post('/auth/login', { email, password }),

  sendRegisterOtp: (email) => post('/auth/send-register-otp', { email }),

  register: (data) => post('/auth/register', data),

  // body: { refreshToken }
  refresh: (refreshToken) => post('/auth/refresh', { refreshToken }),

  logout: (refreshToken) => post('/auth/logout', { refreshToken }),

  // body: { email }
  forgotPassword: (data) => post('/auth/forgot-password', data),

  // body: { email, otp, newPassword } (see ResetPasswordRequest)
  resetPassword: (data) => post('/auth/reset-password', data),

  // body: { currentPassword, newPassword } (see ChangePasswordRequest)
  changePassword: (data) => post('/auth/change-password', data),

  me: () => get('/users/me'),
};

// ============================
// USERS  (api/users)  — SuperAdmin for list/CRUD, self for /me
// ============================
export const usersApi = {
  getAll: (role) => get(role ? `/users?role=${encodeURIComponent(role)}` : '/users'),

  getById: (id) => get(`/users/${id}`),

  create: (data) => post('/users', data),

  update: (id, data) => put(`/users/${id}`, data),

  delete: (id) => del(`/users/${id}`),

  getMe: () => get('/users/me'),

  updateMe: (data) => put('/users/me', data),

  getMyStreak: () => get('/users/me/streak'),

  getMyAchievements: () => get('/users/me/achievements'),
};

// ============================
// ADMIN  (api/admin)  — SuperAdmin
// ============================
export const adminApi = {
  getDashboard: () => get('/admin/dashboard'),
};

// ============================
// GLOBAL ANALYTICS  (api/analytics)  — SuperAdmin
// ============================
export const analyticsApi = {
  getGlobal: () => get('/analytics'),
  // AI insight (SuperAdmin). forceRefresh=true bỏ qua cache 3h ở BE để tạo lại.
  getInsight: (forceRefresh = false) => get(`/analytics/insight${forceRefresh ? '?forceRefresh=true' : ''}`),
  getRevenueInsight: (forceRefresh = false) => get(`/analytics/revenue-insight${forceRefresh ? '?forceRefresh=true' : ''}`),
  getAlerts: () => get('/analytics/alerts'),
};

// ============================
// DASHBOARD  (api/dashboard)
// ============================
export const dashboardApi = {
  getOverview: () => get('/dashboard'),
  getProgressStats: () => get('/dashboard/progress'),
};

// ============================
// B2B CENTERS  (api/centers)
// ============================
export const centersApi = {
  getAll: () => get('/centers'),

  create: (data) => post('/centers', data),

  update: (id, data) => put(`/centers/${id}`, data),

  delete: (id) => del(`/centers/${id}`),

  getDashboard: (id) => get(`/centers/${id}/dashboard`),
  getStats: (id) => get(`/centers/${id}/dashboard`),

  // Nhận định AI cho trung tâm (CenterAdmin chỉ đọc center mình — BE chặn IDOR).
  getInsight: (id, forceRefresh = false) => get(`/centers/${id}/insight${forceRefresh ? '?forceRefresh=true' : ''}`),

  createAdmin: (centerId, data) => post(`/centers/${centerId}/admin`, data),

  getMember: (centerId, userId) => get(`/centers/${centerId}/members/${userId}`),

  updateMember: (centerId, userId, data) =>
    put(`/centers/${centerId}/members/${userId}`, data),

  deleteMember: (centerId, userId) =>
    del(`/centers/${centerId}/members/${userId}`),

  getTeachers: (id) => get(`/centers/${id}/teachers`),

  createTeacher: (centerId, data) => post(`/centers/${centerId}/teachers`, data),

  getStudents: (centerId) => get(`/centers/${centerId}/students`),

  createStudent: (centerId, data) => post(`/centers/${centerId}/students`, data),
};

// ============================
// CLASSES  (api/centers/{centerId}/classes)
// ============================
export const classesApi = {
  getAll: (centerId) => get(`/centers/${centerId}/classes`),

  getById: (centerId, classId) =>
    get(`/centers/${centerId}/classes/${classId}`),

  create: (centerId, data) => post(`/centers/${centerId}/classes`, data),

  update: (centerId, classId, data) =>
    put(`/centers/${centerId}/classes/${classId}`, data),

  delete: (centerId, classId) =>
    del(`/centers/${centerId}/classes/${classId}`),

  getStudents: (centerId, classId) =>
    get(`/centers/${centerId}/classes/${classId}/students`),

  addStudents: (centerId, classId, studentIds) =>
    post(`/centers/${centerId}/classes/${classId}/students`, { studentIds }),

  removeStudent: (centerId, classId, studentId) =>
    del(`/centers/${centerId}/classes/${classId}/students/${studentId}`),

  // Assign a lesson to a class. body: { lessonId }
  assignLesson: (centerId, classId, lessonId) =>
    post(`/centers/${centerId}/classes/${classId}/lessons`, { lessonId }),
};

// ============================
// COURSES  (api/courses)
// ============================
export const coursesApi = {
  getAll: (search, level, includeUnpublished = false) => {
    let url = '/courses';
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (level && level !== 'All') params.append('level', level);
    if (includeUnpublished) params.append('includeUnpublished', 'true');
    if (params.toString()) url += `?${params.toString()}`;
    return get(url);
  },

  getById: (id) => get(`/courses/${id}`),

  getLessons: (id) => get(`/courses/${id}/lessons`),

  create: (data) => post('/courses', data),

  update: (id, data) => put(`/courses/${id}`, data),

  delete: (id) => del(`/courses/${id}`),
};

// ============================
// LESSONS  (api/lessons)
// ============================
export const lessonsApi = {
  getById: (id) => get(`/lessons/${id}`),

  create: (courseId, data) => post(`/lessons/course/${courseId}`, data),

  update: (id, data) => put(`/lessons/${id}`, data),

  delete: (id) => del(`/lessons/${id}`),
};

// ============================
// ENROLLMENTS  (api/enrollments)  — student
// ============================
export const enrollmentsApi = {
  // body: { courseId }
  enroll: (data) => post('/enrollments', data),

  getMine: () => get('/enrollments/me'),
};

// ============================
// GAMES  (api/games)  — minigame XP/streak
// ============================
export const gamesApi = {
  // body: { gameType } → returns { sessionId }
  start: (gameType) => post('/games/start', { gameType }),

  // body: CompleteGameRequest (sessionId, score, ...)
  complete: (data) => post('/games/complete', data),
};

// ============================
// PRACTICE  (api/practice)  — sign-language practice flow
// ============================
export const practiceApi = {
  // body: { signId }
  startSession: (signId) => post('/practice/session/start', { signId }),

  // multipart: sessionId + video file → AI scoring
  submitAttempt: (sessionId, videoFile) => {
    const fd = new FormData();
    fd.append('sessionId', sessionId);
    fd.append('video', videoFile);
    return upload('/practice/attempt', fd);
  },

  // body: { sessionId }
  endSession: (sessionId) => post('/practice/session/end', { sessionId }),

  getHistory: (signId) => get(`/practice/history/${signId}`),
};

// ============================
// PROGRESS  (api/progress)  — learner progress updates
//   (tracking reports live under trackingApi below)
// ============================
export const progressApi = {
  // body: UpdateLessonProgressRequest (lessonId, ...)
  updateLesson: (data) => put('/progress/lesson', data),

  // body: UpdateSignProgressRequest (signId, ...)
  updateSign: (data) => put('/progress/sign', data),

  // ── Backwards-compatible aliases (tracking endpoints) ──
  getClassProgress: (classId) => get(`/tracking/classes/${classId}/students`),
  getCenterReports: (centerId) => get(`/tracking/centers/${centerId}/reports`),
};

// ============================
// TRACKING  (api/tracking)  — teacher/center reports
// ============================
export const trackingApi = {
  getClassStudents: (classId) => get(`/tracking/classes/${classId}/students`),
  getCenterReports: (centerId, from, to) => 
    get(`/tracking/centers/${centerId}/reports?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
};

// ============================
// NOTIFICATIONS  (api/notifications)
// ============================
export const notificationsApi = {
  getAll: (page = 1, pageSize = 20) =>
    get(`/notifications?page=${page}&pageSize=${pageSize}`),

  markAsRead: (id) => put(`/notifications/${id}/read`),
};

// ============================
// ONBOARDING  (api/onboarding)  — student personalization
// ============================
export const onboardingApi = {
  // body: OnboardingRequest (goal, level, ...)
  submit: (data) => post('/onboarding', data),
};

// ============================
// SUBSCRIPTIONS  (api/plans + api/subscription/*)
// ============================
export const subscriptionApi = {
  getPlans: () => get('/plans'),

  getMyPlan: () => get('/subscription/me'),

  // body: { planId, returnUrl }
  upgrade: (planId, returnUrl) =>
    post('/subscription/subscribe', { planId, returnUrl }),

  verifyPayment: (orderCode) => post(`/subscription/verify-payment?orderCode=${orderCode}`),

  getMyTransactions: (params = {}) => {
    const query = new URLSearchParams();
    if (params.fromDate) query.append('fromDate', params.fromDate);
    if (params.toDate) query.append('toDate', params.toDate);
    if (params.status) query.append('status', params.status);
    const qs = query.toString();
    const endpoint = qs ? `/subscription/my-history?${qs}` : '/subscription/my-history';
    return get(endpoint);
  },

  getAdminTransactions: (params = {}) => {
    const query = new URLSearchParams();
    if (params.userId) query.append('userId', params.userId);
    if (params.status) query.append('status', params.status);
    if (params.fromDate) query.append('fromDate', params.fromDate);
    if (params.toDate) query.append('toDate', params.toDate);
    const qs = query.toString();
    const endpoint = qs ? `/subscription/admin/transactions?${qs}` : '/subscription/admin/transactions';
    return get(endpoint);
  },

  getAll: () => get('/subscription/all'),

  createPlan: (data) => post('/plans', data),

  updatePlan: (id, data) => put(`/plans/${id}`, data),

  deletePlan: (id) => del(`/plans/${id}`),
};

// ============================
// TEACHER  (api/teacher)  — CenterAdmin/Teacher
// ============================
export const teacherApi = {
  getDashboard: () => get('/teacher/dashboard'),

  getClasses: () => get('/teacher/classes'),

  getStudents: () => get('/teacher/students'),

  // body: CreateCommentRequest (studentId, content, ...)
  addComment: (data) => post('/teacher/comments', data),

  getComments: (studentId) => get(`/teacher/students/${studentId}/comments`),

  updateComment: (id, content) => put(`/teacher/comments/${id}`, { content }),

  deleteComment: (id) => del(`/teacher/comments/${id}`),

  // Assign a lesson to a class (also available on classesApi.assignLesson)
  assignLesson: (centerId, classId, lessonId) =>
    post(`/centers/${centerId}/classes/${classId}/lessons`, { lessonId }),
};

// ============================
// VOCABULARY  (api/vocabulary)  — AI reference data management
// ============================
export const vocabularyApi = {
  // multipart upload of a reference video → background keypoint extraction
  uploadReference: (signId, videoFile) => {
    const fd = new FormData();
    fd.append('video', videoFile);
    return upload(`/vocabulary/${signId}/upload-reference`, fd);
  },

  getPendingReferences: () => get('/vocabulary/pending-references'),

  approveRequest: (requestId) =>
    post(`/vocabulary/requests/${requestId}/approve`),

  rejectRequest: (requestId, reason) =>
    post(
      `/vocabulary/requests/${requestId}/reject${
        reason ? `?reason=${encodeURIComponent(reason)}` : ''
      }`
    ),
};

// ============================
// B2B CONTACT  (api/b2b/contact)  — Public
// ============================
export const contactApi = {
  submit: (data) => post('/b2b/contact', data),
};

// ============================
// SEED  (api/seed)  — dev/demo utility
// ============================
export const seedApi = {
  // POST /api/seed?reset=true wipes & reseeds; otherwise idempotent top-up
  seed: (reset = false) => post(`/seed${reset ? '?reset=true' : ''}`),
};
