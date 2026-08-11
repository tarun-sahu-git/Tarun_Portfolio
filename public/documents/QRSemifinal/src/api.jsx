// ═══════════════════════════════════════════════════════════════
// api.js - CORS Fixed
// ═══════════════════════════════════════════════════════════════

export const API_URL = 'https://script.google.com/macros/s/AKfycbwB60XoB5ncSt2kfq3LynsNtyvEuNfvvHG2J5IWWBIgclLb1eHq1oHpT2ay1ryjGljN5w/exec';

// ─── Base Request (CORS-Safe) ────────────────────────────────
const request = async (method, action, data = {}) => {
  const url = new URL(API_URL);

  if (method === 'GET') {
    url.searchParams.set('action', action);
    url.searchParams.set('limit', '1000');
    url.searchParams.set('t', Date.now());
    Object.keys(data).forEach(k => {
      if (data[k] != null) url.searchParams.set(k, data[k]);
    });
  }

  const res = await fetch(url.toString(), {
    method,
    redirect: 'follow',
    body: method === 'POST' ? JSON.stringify({ action, ...data }) : null,
  });

  const text = await res.text();
  if (text.trim().startsWith('<')) throw new Error('HTML response - Re-deploy Apps Script');
  return JSON.parse(text);
};

// ─── GET ──────────────────────────────────────────────────────
export const getAttendance     = () => request('GET', 'getAttendance');
export const getUsers          = () => request('GET', 'getUsers');
export const getPending        = () => request('GET', 'getPending');
export const getRejected       = () => request('GET', 'getRejected');
export const getMasterQR       = () => request('GET', 'getMasterQR');
export const getOfficeLocation = () => request('GET', 'getOfficeLocation');
export const getHolidays = () => request('GET', 'getHolidays');
export const addHoliday = (date, reason = 'Holiday') => request('POST', 'addHoliday', { date, reason });
export const deleteHoliday = (date) => request('POST', 'deleteHoliday', { date });

// ─── POST ─────────────────────────────────────────────────────
export const registerUser       = (d)               => request('POST', 'addPendingUser', d);
export const saveMasterQR       = (qrValue)         => request('POST', 'saveMasterQR', { qrValue, generatedAt: new Date().toISOString() });
export const saveOfficeLocation = (lat, lng, r=100) => request('POST', 'saveOfficeLocation', { latitude: lat, longitude: lng, radius: r });
export const approveUser        = (userId, role)    => request('POST', 'approveUser', { userId, role });
export const rejectUser         = (userId)          => request('POST', 'rejectUser', { userId });
export const updateUser         = (empId, data)     => request('POST', 'updateUser', { empId, ...data });
export const deleteUser         = (empId)           => request('POST', 'deleteUser', { empId });
export const deleteRejected     = (userId)          => request('POST', 'deleteRejected', { userId });
export const deleteAttendance   = (recordId)        => request('POST', 'deleteAttendance', { recordId });
export const editAttendance     = (recordId, outTime, totalHours) =>
  request('POST', 'editAttendance', { recordId, outTime, totalHours });
export const checkIn            = (data)            => request('POST', 'checkIn', data);
export const checkOut           = (data)            => request('POST', 'checkOut', data);

// ─── Session (Navbar & ProtectedRoute) ────────────────────────
export const saveSession       = (u) => { try { localStorage.setItem('att_user', JSON.stringify(u)); } catch {} };
export const getSession        = ()  => { try { return JSON.parse(localStorage.getItem('att_user')); } catch { return null; } };
export const clearSession      = ()  => { try { localStorage.removeItem('att_user'); } catch {} };
export const saveAdminSession  = ()  => { try { localStorage.setItem('att_admin', 'true'); } catch {} };
export const isAdmin           = ()  => { try { return localStorage.getItem('att_admin') === 'true'; } catch { return false; } };
export const clearAdminSession = ()  => { try { localStorage.removeItem('att_admin'); } catch {} };
export const logout            = ()  => { clearSession(); clearAdminSession(); };

// ─── Login (Dual-Login Bug Fixed) ─────────────────────────────
const getEmpId = (u) => {
  if (!u) return '';
  for (const v of [u.empId, u.emp_id, u.EmpId, u.employeeId, u['Employee ID'], u['Emp Id']]) {
    if (v != null && String(v).trim()) return String(v).trim().toUpperCase();
  }
  return '';
};

export const loginUser = async (empId) => {
  try {
    const id = String(empId).trim().toUpperCase();
    const res = await getUsers();
    const users = res?.data?.users || res?.data || [];
    const user = (Array.isArray(users) ? users : []).find(u => getEmpId(u) === id);
    if (!user) return { success: false, message: 'Invalid Employee ID or not approved yet.' };
    const normalizedUser = { ...user, empId: getEmpId(user) };
    clearAdminSession();
    saveSession(normalizedUser);
    return { success: true, user: normalizedUser };
  } catch (e) {
    return { success: false, message: e.message || 'Login failed' };
  }
};

export const adminLogin = (username, password) => {
  const ok = username === 'admin' && password === 'admin123';
  if (ok) {
    clearSession();
    saveAdminSession();
  }
  return ok;
};

// ─── Geolocation ──────────────────────────────────────────────
export const getGeolocation = () => new Promise((resolve) => {
  if (!navigator.geolocation) return resolve(null);
  navigator.geolocation.getCurrentPosition(
    ({ coords: { latitude, longitude, accuracy } }) => resolve({
      latitude: latitude.toFixed(6),
      longitude: longitude.toFixed(6),
      accuracy: Math.round(accuracy),
      mapLink: `https://maps.google.com/?q=${latitude},${longitude}`,
    }),
    () => resolve(null),
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
});

// ─── Distance Check ───────────────────────────────────────────
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
};

export const isWithinOffice = (uLat, uLng, oLat, oLng, radius = 100) => {
  const distance = calculateDistance(+uLat, +uLng, +oLat, +oLng);
  return { withinRange: distance <= radius, distance };
};