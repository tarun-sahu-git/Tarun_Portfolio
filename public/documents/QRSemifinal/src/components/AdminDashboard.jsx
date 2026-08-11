import React, { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import QRCode from 'react-qr-code';
import * as XLSX from 'xlsx';
import {
  FiUsers, FiClock, FiCheckCircle, FiXCircle,
  FiTrash2, FiDownload, FiFilter, FiSearch,
  FiUserCheck, FiPrinter, FiEdit2, FiSave, FiX,
  FiCalendar, FiRefreshCw
} from 'react-icons/fi';
import { MdPending, MdQrCode, MdToday, MdBeachAccess } from 'react-icons/md';
import {
  getAttendance, getUsers, getPending, getRejected, getMasterQR, getHolidays,
  saveMasterQR, saveOfficeLocation,
  approveUser, rejectUser, updateUser, deleteUser,
  deleteRejected, deleteAttendance, editAttendance,
  addHoliday, deleteHoliday
} from '../api';
import './AdminDashboard.css';

const REFRESH = 15000;
const PER_PAGE = 10;

// ─── Helpers ──────────────────────────────────────────────────
const exId = (o) => {
  if (!o) return '';
  for (const v of [o.id, o.ID, o.Id, o.userId, o.user_id, o.timestamp, o.rowId])
    if (v != null && String(v).trim()) return String(v).trim();
  return '';
};

const exEmpId = (o) => {
  if (!o) return '';
  for (const v of [o.empId, o.emp_id, o.EmpId, o.empID, o.employeeId, o['Employee ID'], o['Emp Id']])
    if (v != null && String(v).trim()) return String(v).trim();
  return '';
};

const normalizeEmpId = (id) => {
  if (!id) return '';
  const s = String(id).trim();
  return s.toUpperCase().startsWith('EMP') ? 'YTS' + s.substring(3) : s;
};

const todayIN = () => {
  const n = new Date();
  return `${String(n.getDate()).padStart(2, '0')}/${String(n.getMonth() + 1).padStart(2, '0')}/${n.getFullYear()}`;
};

const onlyDate = (s) => {
  if (!s) return '';
  const t = String(s).trim();
  if (!t || t === '---') return '';
  const m = t.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return `${m[1].padStart(2, '0')}/${m[2].padStart(2, '0')}/${m[3]}`;
  const m2 = t.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m2) return `${m2[3]}/${m2[2]}/${m2[1]}`;
  try { const d = new Date(t); if (!isNaN(d)) return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`; } catch { }
  return t;
};

const onlyTime = (s) => {
  if (!s || s === '---') return s;
  const t = String(s).trim();
  const m = t.match(/(\d{1,2}):(\d{2}):?(\d{2})?\s*(AM|PM|am|pm)?/);
  if (m) {
    const h = m[1].padStart(2, '0');
    const mn = m[2];
    const sc = m[3] || '00';
    const ap = m[4] ? ' ' + m[4].toUpperCase() : '';
    return `${h}:${mn}:${sc}${ap}`;
  }
  return t;
};

const parseIN = (s) => {
  if (!s || s === '---') return null;
  const p = onlyDate(s).split('/');
  if (p.length !== 3) return null;
  const d = new Date(+p[2], +p[1] - 1, +p[0]);
  return isNaN(d) ? null : d;
};

const calcHrs = (a, b) => {
  try {
    const p = (t) => {
      const s = String(t).trim().toUpperCase();
      const pm = s.endsWith('PM'), am = s.endsWith('AM');
      const x = s.replace(/\s*(AM|PM)\s*$/, '').split(':');
      let h = +x[0] || 0;
      if (pm && h < 12) h += 12;
      if (am && h === 12) h = 0;
      return h * 3600 + (+x[1] || 0) * 60 + (+x[2] || 0);
    };
    let d = p(b) - p(a); if (d < 0) d += 86400;
    return `${String(Math.floor(d / 3600)).padStart(2, '0')}:${String(Math.floor((d % 3600) / 60)).padStart(2, '0')}`;
  } catch { return '00:00'; }
};

const exArr = (d, ...k) => {
  if (!d) return [];
  if (Array.isArray(d)) return d;
  for (const key of [...k, 'users', 'records', 'data', 'items', 'list', 'holidays'])
    if (Array.isArray(d[key])) return d[key];
  if (typeof d === 'object') {
    const v = Object.values(d);
    if (v.length && v.every(x => typeof x === 'object' && x && !Array.isArray(x))) return v;
  }
  return [];
};

const mapAtt = (r, i) => r ? {
  id: exId(r) || `a${i}`, empId: normalizeEmpId(exEmpId(r)) || '---',
  name: r.name || r.Name || 'Unknown', email: r.email || r.Email || '---',
  contact: r.contact || r.Contact || '---', role: r.role || r.Role || 'User',
  collegeName: r.collegeName || r['College Name'] || '---',
  address: r.address || r.Address || '---',
  date: onlyDate(r.date || r.Date || ''),
  inTime: onlyTime(r.inTime || r['In Time'] || '---'),
  outTime: onlyTime(r.outTime || r['Out Time'] || ''),
  totalHours: r.totalHours || r['Total Hours'] || '',
} : null;

const mapPend = (u, i) => u ? {
  id: exId(u) || `p${i}`, name: u.name || u.Name || '', email: u.email || u.Email || '',
  contact: u.contact || u.Contact || '', collegeName: u.collegeName || u['College Name'] || '',
  role: u.role || u.Role || 'User', address: u.address || u.Address || '',
  registeredAt: u.registeredAt || u['Registered At'] || '',
} : null;

const mapUsr = (u, i) => u ? {
  id: exId(u) || `u${i}`, empId: normalizeEmpId(exEmpId(u)) || '---',
  name: u.name || u.Name || 'Unknown', email: u.email || u.Email || '',
  contact: u.contact || u.Contact || '', role: u.role || u.Role || 'User',
  collegeName: u.collegeName || u['College Name'] || '',
  address: u.address || u.Address || '',
  approvedAt: u.approvedAt || u['Approved At'] || '',
} : null;

const mapRej = (u, i) => u ? {
  id: exId(u) || `r${i}`, name: u.name || u.Name || '', email: u.email || u.Email || '',
  contact: u.contact || u.Contact || '', collegeName: u.collegeName || u['College Name'] || '',
  role: u.role || u.Role || 'User', address: u.address || u.Address || '',
  rejectedAt: u.rejectedAt || u['Rejected At'] || '',
} : null;

const fmtDate = (s) => {
  if (!s) return '---';
  const only = onlyDate(s);
  return only || String(s).substring(0, 10);
};

const isSunday = (dateStr) => {
  const d = parseIN(dateStr);
  return d ? d.getDay() === 0 : false;
};

const getDayName = (dateStr) => {
  const d = parseIN(dateStr);
  if (!d) return '';
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];
};

const inputToDMY = (s) => {
  if (!s) return '';
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : s;
};

const Tip = ({ text, max = 20 }) => {
  const t = text ? String(text) : '---';
  const need = t.length > max;
  return <span className={need ? 'cell-tooltip' : ''} title={need ? t : undefined}>{need ? t.substring(0, max) + '...' : t}</span>;
};

// ═══════════════════════════════════════════════════════════════
const AdminDashboard = () => {
  const [tab, setTab] = useState(() => localStorage.getItem('admin_active_tab') || 'qr');
  const [search, setSearch] = useState('');
  const [fRole, setFRole] = useState('all');
  const [fStatus, setFStatus] = useState('all');
  const [fType, setFType] = useState('all');
  const [fDate, setFDate] = useState('');
  const [fMonth, setFMonth] = useState('');
  const [fYear, setFYear] = useState('');
  const [dling, setDling] = useState(false);

  const [att, setAtt] = useState([]);
  const [pend, setPend] = useState([]);
  const [approved, setApproved] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [notHolidays, setNotHolidays] = useState([]); // ✅ Sunday overrides
  const [todayReady, setTodayReady] = useState(false);

  const [qr, setQr] = useState(null);
  const [qrGen, setQrGen] = useState(false);
  const [qrLoad, setQrLoad] = useState(false);
  const [qrErr, setQrErr] = useState(false);

  const [oLat, setOLat] = useState(21.251572976965484);
  const [oLng, setOLng] = useState(81.61057862904782);
  const [oRadius, setORadius] = useState(100);
  const [showOff, setShowOff] = useState(false);
  const [oLatIn, setOLatIn] = useState('21.251572976965484');
  const [oLngIn, setOLngIn] = useState('81.61057862904782');
  const [oRadIn, setORadIn] = useState('100');

  const [ld, setLd] = useState({ a: false, p: false, u: false, r: false });
  const [err, setErr] = useState(null);
  const [procId, setProcId] = useState(null);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(null);

  const [editUser, setEditUser] = useState(null);
  const [editData, setEditData] = useState({ name: '', email: '', contact: '', address: '', collegeName: '', role: '' });

  const [approveModal, setApproveModal] = useState(null);
  const [approveRole, setApproveRole] = useState('Employee');

  const [editAttRecord, setEditAttRecord] = useState(null);
  const [editAttOut, setEditAttOut] = useState('');

  // ✅ Holiday input state (from Today tab)
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayReason, setHolidayReason] = useState('Holiday');

  const [selected, setSelected] = useState(new Set());
  const [deleting, setDeleting] = useState(false);

  const qrRef = useRef();
  const mounted = useRef(true);

  const toggleSelect = (id) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const toggleAll = (ids) => setSelected(prev => {
    const all = ids.length > 0 && ids.every(id => prev.has(id));
    return all ? new Set() : new Set(ids);
  });

  useEffect(() => { setPage(1); setExpanded(null); setSelected(new Set()); }, [tab, search, fRole, fStatus, fType, fDate, fMonth, fYear]);

  const pgn = (data) => ({
    items: data.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    total: Math.ceil(data.length / PER_PAGE),
  });

  const Pager = ({ total }) => total > 1 ? (
    <div className="pagination">
      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>◀ Prev</button>
      <span>{page} / {total}</span>
      <button onClick={() => setPage(p => Math.min(total, p + 1))} disabled={page === total}>Next ▶</button>
    </div>
  ) : null;

  const Chk = ({ id, ids }) => ids ? (
    <input type="checkbox" checked={ids.length > 0 && ids.every(i => selected.has(i))} onChange={() => toggleAll(ids)} />
  ) : (
    <input type="checkbox" checked={selected.has(id)} onChange={() => toggleSelect(id)} />
  );

  const SelectBar = ({ count, onDelete, label = 'Delete' }) => count > 0 ? (
    <div className="select-bar">
      <span>✅ <strong>{count}</strong> selected</span>
      <button className="sel-del" onClick={onDelete} disabled={deleting}>
        {deleting ? <FiRefreshCw className="spinning" /> : <FiTrash2 />} {label} ({count})
      </button>
      <button className="sel-clear" onClick={() => setSelected(new Set())}><FiX /> Clear</button>
    </div>
  ) : null;

  useEffect(() => {
    const s = localStorage.getItem('att_office_location');
    if (s) {
      try {
        const { lat, lng, radius } = JSON.parse(s);
        setOLat(lat); setOLng(lng); setORadius(radius || 100);
        setOLatIn(String(lat)); setOLngIn(String(lng)); setORadIn(String(radius || 100));
      } catch { }
    }
  }, []);

  const saveOff = async () => {
    const lat = parseFloat(oLatIn), lng = parseFloat(oLngIn), rad = parseInt(oRadIn);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) { toast.error('❌ Invalid coordinates!'); return; }
    if (isNaN(rad) || rad < 10) { toast.error('❌ Radius min 10m!'); return; }
    setOLat(lat); setOLng(lng); setORadius(rad);
    localStorage.setItem('att_office_location', JSON.stringify({ lat, lng, radius: rad }));
    try { await saveOfficeLocation(lat, lng, rad); toast.success('✅ Saved!'); }
    catch { toast.success('✅ Saved locally!'); }
    setShowOff(false);
  };

  // ─── Fetch ────────────────────────────────────────────────
  const fetchQR = useCallback(async (loader = true) => {
    if (loader) setQrLoad(true); setQrErr(false);
    try {
      const r = await getMasterQR();
      if (!mounted.current) return;
      if (r.status === 'success' && r.data?.qrValue) setQr(r.data.qrValue); else setQr(null);
    } catch { if (mounted.current) setQrErr(true); }
    finally { if (mounted.current) setQrLoad(false); }
  }, []);

  const fetchAtt = useCallback(async () => {
    if (!mounted.current) return;
    setLd(p => ({ ...p, a: true })); setErr(null);
    try {
      const r = await getAttendance();
      if (!mounted.current) return;
      if (r.status === 'success') setAtt(exArr(r.data, 'records').filter(Boolean).map(mapAtt).filter(Boolean));
      else setErr(r.message);
    } catch (e) { if (mounted.current) setErr(e.message); }
    finally { if (mounted.current) setLd(p => ({ ...p, a: false })); }
  }, []);

  const fetchPend = useCallback(async () => {
    if (!mounted.current) return;
    setLd(p => ({ ...p, p: true }));
    try { const r = await getPending(); if (!mounted.current) return;
      if (r.status === 'success') setPend(exArr(r.data, 'users').filter(Boolean).map(mapPend).filter(Boolean));
    } catch { } finally { if (mounted.current) setLd(p => ({ ...p, p: false })); }
  }, []);

  const fetchAppr = useCallback(async () => {
    if (!mounted.current) return;
    setLd(p => ({ ...p, u: true }));
    try { const r = await getUsers(); if (!mounted.current) return;
      if (r.status === 'success') setApproved(exArr(r.data, 'users').filter(Boolean).map(mapUsr).filter(Boolean));
    } catch { } finally { if (mounted.current) setLd(p => ({ ...p, u: false })); }
  }, []);

  const fetchRej = useCallback(async () => {
    if (!mounted.current) return;
    setLd(p => ({ ...p, r: true }));
    try { const r = await getRejected(); if (!mounted.current) return;
      if (r.status === 'success') setRejected(exArr(r.data, 'users').filter(Boolean).map(mapRej).filter(Boolean));
    } catch { } finally { if (mounted.current) setLd(p => ({ ...p, r: false })); }
  }, []);

  const fetchHol = useCallback(async () => {
    try {
      const r = await getHolidays();
      if (r?.status === 'success') {
        const all = exArr(r.data, 'holidays') || [];
        // ✅ Split holidays and not_holidays (Sunday overrides)
        setHolidays(all.filter(h => !String(h.date).startsWith('not_')));
        setNotHolidays(all.filter(h => String(h.date).startsWith('not_')).map(h => h.date.replace('not_', '')));
      }
    } catch { }
  }, []);

  const fetchToday = useCallback(async () => {
    if (!mounted.current) return;
    setTodayReady(false);
    try { await Promise.allSettled([fetchAtt(), fetchAppr(), fetchHol()]); }
    finally { if (mounted.current) setTodayReady(true); }
  }, [fetchAtt, fetchAppr, fetchHol]);

  const fetchAll = useCallback(() =>
    Promise.allSettled([fetchAtt(), fetchPend(), fetchAppr(), fetchRej(), fetchQR(false), fetchHol()]),
    [fetchAtt, fetchPend, fetchAppr, fetchRej, fetchQR, fetchHol]
  );

  const fetchAllRef = useRef(fetchAll);
  useEffect(() => { fetchAllRef.current = fetchAll; }, [fetchAll]);

  useEffect(() => {
    mounted.current = true;
    fetchAllRef.current();
    const i1 = setInterval(() => { if (mounted.current) fetchAllRef.current(); }, REFRESH);
    return () => { mounted.current = false; clearInterval(i1); };
  }, []);

  useEffect(() => {
    if (tab === 'pending') fetchPend();
    else if (tab === 'approved') fetchAppr();
    else if (tab === 'today') fetchToday();
    else if (tab === 'attendance') { fetchAtt(); fetchHol(); }
    else if (tab === 'rejected') fetchRej();
    else if (tab === 'qr') fetchQR(true);
  }, [tab, fetchPend, fetchAppr, fetchToday, fetchAtt, fetchRej, fetchQR, fetchHol]);

  // ─── Filters ──────────────────────────────────────────────
  const dateFilter = useCallback((r) => {
    if (fType === 'all') return true;
    if (!r?.date || r.date === '---') return false;
    const rd = parseIN(r.date); if (!rd) return false;
    if (fType === 'date') { if (!fDate) return true; const [y, m, d] = fDate.split('-').map(Number); return rd.getFullYear() === y && rd.getMonth() === m - 1 && rd.getDate() === d; }
    if (fType === 'week') { const t = new Date(); t.setHours(0, 0, 0, 0); const dow = t.getDay(); const diff = dow === 0 ? -6 : 1 - dow; const ws = new Date(t); ws.setDate(t.getDate() + diff); const we = new Date(ws); we.setDate(ws.getDate() + 6); we.setHours(23, 59, 59); return rd >= ws && rd <= we; }
    if (fType === 'month') { if (!fMonth) return true; const [y, m] = fMonth.split('-').map(Number); return rd.getFullYear() === y && rd.getMonth() === m - 1; }
    if (fType === 'year') { return !fYear || rd.getFullYear() === +fYear; }
    return true;
  }, [fType, fDate, fMonth, fYear]);

  const today = todayIN();
  const srch = (fields) => { const s = search.toLowerCase().trim(); if (!s) return true; return fields.some(f => String(f || '').toLowerCase().includes(s)); };
  const roleF = (role) => fRole === 'all' || role === fRole;
  const statusF = (status) => fStatus === 'all' || status === fStatus;

  const getApprovedDate = (empId) => {
    const u = approved.find(x => x.empId === empId);
    return u?.approvedAt ? parseIN(onlyDate(u.approvedAt)) : null;
  };

  // ✅ Check if date is holiday (Sunday override supported)
  const isHoliday = (dateStr) => {
    // Check "not_holiday" override
    if (notHolidays.includes(dateStr)) return { holiday: false };
    // Manual holiday
    const h = holidays.find(x => onlyDate(x.date) === dateStr);
    if (h) return { holiday: true, reason: h.reason || 'Holiday', dayName: getDayName(dateStr) };
    // Sunday auto
    if (isSunday(dateStr)) return { holiday: true, reason: 'Sunday', dayName: 'Sunday' };
    return { holiday: false };
  };

  // ─── TODAY VIEW ──────────────────────────────────────────
  const buildDailyView = useCallback(() => {
    const todayDate = todayIN();
    const holChk = isHoliday(todayDate);
    if (holChk.holiday) return [{ isHoliday: true, date: todayDate, dayName: holChk.dayName, reason: holChk.reason }];

    const attMap = {};
    att.forEach(r => {
      if (r && onlyDate(r.date) === todayDate)
        if (!attMap[r.empId] || String(r.inTime) > String(attMap[r.empId].inTime)) attMap[r.empId] = r;
    });
    const present = [], absent = [];
    approved.forEach(u => {
      if (!u || !u.empId || u.empId === '---') return;
      const rec = attMap[u.empId];
      if (rec) {
        present.push({
          ...u, date: rec.date || todayDate, inTime: rec.inTime || '---', outTime: rec.outTime || '',
          totalHours: rec.totalHours || '',
          attStatus: rec.outTime && rec.outTime !== '---' && rec.outTime !== '' ? 'checkedout' : 'active',
          status: 'present', attId: rec.id, id: rec.id
        });
      } else {
        absent.push({
          ...u, date: todayDate, inTime: '---', outTime: '', totalHours: '',
          attStatus: 'absent', status: 'absent', id: `abs_${todayDate}_${u.empId}`
        });
      }
    });
    present.sort((a, b) => { if ((a.attStatus === 'active') !== (b.attStatus === 'active')) return a.attStatus === 'active' ? -1 : 1; return String(b.inTime || '').localeCompare(String(a.inTime || '')); });
    absent.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
    return [...present, ...absent];
  }, [att, approved, holidays, notHolidays]);

  // ─── ATTENDANCE VIEW ──────────────────────────────────────
  const buildAttendanceView = useCallback(() => {
    const dateSet = new Set();
    att.forEach(r => { if (r?.date) dateSet.add(onlyDate(r.date)); });

    const todayD = new Date();
    approved.forEach(u => {
      const apprD = getApprovedDate(u.empId);
      if (!apprD) return;
      const cur = new Date(apprD);
      while (cur <= todayD) {
        dateSet.add(`${String(cur.getDate()).padStart(2,'0')}/${String(cur.getMonth()+1).padStart(2,'0')}/${cur.getFullYear()}`);
        cur.setDate(cur.getDate() + 1);
      }
    });

    // ✅ Add manual holiday dates
    holidays.forEach(h => { const d = onlyDate(h.date); if (d) dateSet.add(d); });

    const dates = Array.from(dateSet).sort((a, b) => (parseIN(b) || new Date(0)) - (parseIN(a) || new Date(0)));

    const rows = [];
    dates.forEach(dateStr => {
      const holChk = isHoliday(dateStr);
      if (holChk.holiday) {
        rows.push({ isHoliday: true, date: dateStr, dayName: holChk.dayName, reason: holChk.reason, id: `hol_${dateStr}` });
        return;
      }

      const attMap = {};
      att.forEach(r => {
        if (r && onlyDate(r.date) === dateStr)
          if (!attMap[r.empId] || String(r.inTime) > String(attMap[r.empId].inTime)) attMap[r.empId] = r;
      });

      const present = [], absent = [];
      approved.forEach(u => {
        if (!u || !u.empId || u.empId === '---') return;
        const apprD = getApprovedDate(u.empId);
        const rowD = parseIN(dateStr);
        if (apprD && rowD && apprD > rowD) return;

        const rec = attMap[u.empId];
        if (rec) {
          present.push({
            ...u, date: dateStr, inTime: rec.inTime || '---', outTime: rec.outTime || '',
            totalHours: rec.totalHours || '',
            attStatus: rec.outTime && rec.outTime !== '---' && rec.outTime !== '' ? 'checkedout' : 'active',
            status: 'present', id: rec.id
          });
        } else {
          absent.push({
            ...u, date: dateStr, inTime: '---', outTime: '', totalHours: '',
            attStatus: 'absent', status: 'absent', id: `abs_${dateStr}_${u.empId}`
          });
        }
      });

      present.sort((a, b) => String(b.inTime || '').localeCompare(String(a.inTime || '')));
      absent.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));

      rows.push(...present, ...absent);
    });

    return rows;
  }, [att, approved, holidays, notHolidays]);

  const fApproved = approved.filter(u => u && srch([u.name, u.empId, u.email]) && roleF(u.role));

  const attendanceView = buildAttendanceView();
  const fAtt = attendanceView.filter(r => {
    if (r.isHoliday) return dateFilter({ date: r.date });
    return r && srch([r.name, r.empId, r.email]) && roleF(r.role) && dateFilter(r) && statusF(r.status);
  });

  const fToday = buildDailyView().filter(r => {
    if (r.isHoliday) return true;
    return r && srch([r.name, r.empId, r.email, r.contact]) && roleF(r.role) && statusF(r.status);
  });

  const todayPresentCount = att.filter(r => onlyDate(r?.date) === today).length;
  const todayAbsentCount = Math.max(0, approved.length - todayPresentCount);

  const stats = {
    total: approved.length,
    pend: pend.length, rej: rejected.length,
    todayP: todayPresentCount, todayA: todayAbsentCount,
    active: att.filter(r => onlyDate(r?.date) === today && !r?.outTime).length,
    totalA: att.length,
  };

  const bulkDelAttendance = async () => {
    if (!selected.size || !window.confirm(`Delete ${selected.size} record(s)?`)) return;
    setDeleting(true); let ok = 0, skip = 0;
    for (const id of selected) {
      if (String(id).startsWith('abs_') || String(id).startsWith('hol_')) { skip++; continue; }
      try { await deleteAttendance(id); ok++; } catch { }
    }
    toast.success(`✅ Deleted: ${ok}${skip ? ` | Skipped: ${skip}` : ''}`);
    setSelected(new Set()); setDeleting(false);
    setTimeout(fetchAtt, 1000);
  };

  const bulkDel = async (ids, deleteFn, afterFn) => {
    if (!ids.size || !window.confirm(`Delete ${ids.size} item(s)?`)) return;
    setDeleting(true); let ok = 0;
    for (const id of ids) { try { await deleteFn(id); ok++; } catch { } }
    toast.success(`✅ Deleted: ${ok}`);
    setSelected(new Set()); setDeleting(false);
    setTimeout(afterFn, 1000);
  };

  const genQR = async () => {
    if (qr && !window.confirm('⚠️ Replace QR? Old QRs stop working!')) return;
    setQrGen(true);
    try {
      const v = `ATT-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const r = await saveMasterQR(v);
      if (!mounted.current) return;
      if (r?.status === 'success') { await fetchQR(false); toast.success('✅ QR saved!'); }
      else throw new Error(r?.message || 'Failed');
    } catch (e) { toast.error('❌ ' + e.message); }
    finally { if (mounted.current) setQrGen(false); }
  };

  const openApprove = (u) => { setApproveModal(u); setApproveRole(u?.role || 'Employee'); };
  const closeApprove = () => setApproveModal(null);

  const doApprove = async () => {
    if (!approveModal) return;
    const id = exId(approveModal); if (!id || procId === id) return;
    setProcId(id);
    try {
      const res = await approveUser(id, approveRole);
      if (res?.status === 'success') {
        toast.success(`✅ Approved as ${approveRole}!`);
        setPend(p => p.filter(x => exId(x) !== id));
        closeApprove();
        setTimeout(() => { fetchPend(); fetchAppr(); }, 1500);
      } else throw new Error(res?.message || 'Failed');
    } catch (e) { toast.error(`❌ ${e.message}`); }
    finally { setTimeout(() => setProcId(null), 2000); }
  };

  const doReject = async (u) => {
    if (!window.confirm('Reject?')) return;
    const id = exId(u); if (!id || procId === id) return;
    setProcId(id);
    try {
      const res = await rejectUser(id);
      if (res?.status === 'success') setPend(p => p.filter(x => exId(x) !== id));
      setTimeout(() => { fetchPend(); fetchRej(); }, 1500);
    } catch (e) { toast.error(`❌ ${e.message}`); }
    finally { setTimeout(() => setProcId(null), 2000); }
  };

  const doDel = async (eid) => {
    if (!window.confirm('Delete user + records?')) return;
    try { await deleteUser(eid); setTimeout(() => { fetchAppr(); fetchAtt(); }, 1000); }
    catch (e) { toast.error('❌ ' + e.message); }
  };

  const startEdit = (u) => { setEditUser(u); setEditData({ name: u?.name || '', email: u?.email || '', contact: u?.contact || '', address: u?.address || '', collegeName: u?.collegeName || '', role: u?.role || 'Employee' }); };
  const closeEdit = () => setEditUser(null);

  const saveEdit = async () => {
    if (!editUser) return;
    if (!editData.name.trim() || !editData.email.trim() || !editData.contact.trim()) { toast.error('Fill required!'); return; }
    try {
      const res = await updateUser(editUser.empId, { name: editData.name.trim(), email: editData.email.trim(), contact: editData.contact.trim(), address: editData.address.trim(), collegeName: editData.collegeName.trim(), role: editData.role });
      if (res?.status === 'success') { toast.success('✅ Updated!'); closeEdit(); setTimeout(fetchAppr, 1000); }
      else throw new Error(res?.message || 'Failed');
    } catch (e) { toast.error('❌ ' + e.message); }
  };

  const openEditAtt = (r) => { setEditAttRecord(r); setEditAttOut(r?.outTime || ''); };
  const closeEditAtt = () => setEditAttRecord(null);

  const saveEditAtt = async () => {
    if (!editAttRecord || !editAttOut.trim()) { toast.error('Enter out time!'); return; }
    const outT = editAttOut.trim();
    const totalH = calcHrs(editAttRecord.inTime, outT);
    try {
      const res = await editAttendance(editAttRecord.id, outT, totalH);
      if (res?.status === 'success') { toast.success('✅ Updated!'); closeEditAtt(); setTimeout(fetchAtt, 1000); }
      else throw new Error(res?.message || 'Failed');
    } catch (e) { toast.error('❌ ' + e.message); }
  };

  // ✅ Set Holiday from Today tab
  const setHoliday = async () => {
    if (!holidayDate) { toast.error('Select a date!'); return; }
    const dmy = inputToDMY(holidayDate);
    try {
      const res = await addHoliday(dmy, holidayReason.trim() || 'Holiday');
      if (res?.status === 'success') {
        toast.success(`✅ Holiday set: ${dmy}`);
        setHolidayDate(''); setHolidayReason('Holiday');
        setTimeout(fetchHol, 500);
      } else throw new Error(res?.message || 'Failed');
    } catch (e) { toast.error('❌ ' + e.message); }
  };

  // ✅ Remove Holiday (Sunday bhi)
  const removeHoliday = async (dateStr) => {
    if (!window.confirm(`Remove holiday on ${dateStr}?`)) return;
    try {
      const res = await deleteHoliday(dateStr);
      if (res?.status === 'success') { toast.success('✅ Holiday removed!'); setTimeout(fetchHol, 500); }
      else throw new Error(res?.message || 'Failed');
    } catch (e) { toast.error('❌ ' + e.message); }
  };

  const printQR = () => {
    const el = document.getElementById('qr-print'); if (!el) return;
    const w = window.open('', '', 'width=600,height=700');
    w.document.write(`<html><head><title>QR</title><style>body{display:flex;justify-content:center;align-items:center;min-height:100vh;font-family:Arial;flex-direction:column;margin:0;background:#f5f5f5}.box{border:4px solid #333;padding:50px;border-radius:24px;text-align:center;background:white}h1{color:#333;font-size:28px}p{color:#999;font-size:14px}</style></head><body><div class="box"><h1>📱 Scan for Attendance</h1>${el.innerHTML}<p>Scan to mark attendance</p></div></body></html>`);
    w.document.close(); setTimeout(() => w.print(), 500);
  };

  const reset = () => { setFType('all'); setFDate(''); setFMonth(''); setFYear(''); setFRole('all'); setFStatus('all'); setSearch(''); };

  const dlExcel = (data, isToday = false) => {
    if (!data.length) { toast.error('No data!'); return; }
    setDling(true);
    try {
      const hdr = ['#', 'Date', 'Day', 'Emp ID', 'Name', 'Email', 'Contact', 'Role', 'In', 'Out', 'Hours', 'Status'];
      const rows = data.map((r, i) => {
        if (r.isHoliday) return [i + 1, r.date, r.dayName, '---', 'HOLIDAY - ' + (r.reason || ''), '---', '---', '---', '---', '---', '---', '🏖️ Holiday'];
        const st = r.status === 'absent' ? 'Absent' : r?.outTime && r.outTime !== '---' && r.outTime !== '' ? 'Checked Out' : 'Active';
        return [i + 1, r?.date, getDayName(r?.date), r?.empId, r?.name, r?.email, r?.contact, r?.role, r?.inTime, r?.outTime || '---', r?.totalHours || '---', st];
      });
      const ws = XLSX.utils.aoa_to_sheet([hdr, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, isToday ? 'Today' : 'Attendance');
      const d = new Date();
      XLSX.writeFile(wb, `${isToday ? 'Today' : 'Attendance'}_${d.getDate()}_${d.getMonth() + 1}_${d.getFullYear()}.xlsx`);
      toast.success(`✅ Downloaded`);
    } catch (e) { toast.error('❌ ' + e.message); }
    finally { setDling(false); }
  };

  const tabClick = (key) => {
    setTab(key); localStorage.setItem('admin_active_tab', key);
    setTimeout(() => { const el = document.getElementById('tabs-bar'); if (el) { const nh = window.innerWidth <= 768 ? 64 : 70; window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - nh, behavior: 'smooth' }); } }, 80);
  };

  const roleBadge = (r) => <span className={`role-badge role-${String(r || 'user').toLowerCase()}`}>{r || 'User'}</span>;
  const statusBadge = (r) => {
    if (r?.status === 'absent' || r?.attStatus === 'absent') return <span className="st-absent">❌ Absent</span>;
    if (r?.attStatus === 'checkedout' || (r?.outTime && r.outTime !== '---' && r.outTime !== '')) return <span className="st-done">✅ Out</span>;
    return <span className="st-active">🟢 Active</span>;
  };
  const yrs = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

  const Card = ({ id, row1, row2, details, actions, selId }) => {
    const isOpen = expanded === id;
    return (
      <div className={`m-card ${selId && selected.has(selId) ? 'm-card-sel' : ''}`}>
        <div className="m-card-top" onClick={() => setExpanded(isOpen ? null : id)}>
          {selId && <span className="m-chk" onClick={e => e.stopPropagation()}><Chk id={selId} /></span>}
          <div className="m-card-info"><div className="m-card-name">{row1}</div><div className="m-card-sub">{row2}</div></div>
          <span className={`m-arrow ${isOpen ? 'open' : ''}`}>▼</span>
        </div>
        {isOpen && (<><div className="m-card-body">{details.map(([l, v], i) => <div className="m-row" key={i}><span className="m-label">{l}</span><span className="m-val">{v || '---'}</span></div>)}</div>{actions && <div className="m-card-acts">{actions}</div>}</>)}
      </div>
    );
  };

  const Table = ({ cols, rows, renderRow }) => (
    <table className="dtable"><thead><tr>{cols.map((c, i) => <th key={i}>{c}</th>)}</tr></thead><tbody>{rows.map(renderRow)}</tbody></table>
  );

  return (
    <div className="admin-dash">
      <div className="dash-hdr"><h1>📊 Admin Dashboard</h1></div>

      {/* STATS */}
      <div className="stats-grid">
        {[
          { icon: <FiUsers />, n: stats.total, l: 'Total Users', c: 'st-total' },
          { icon: <FiUserCheck />, n: approved.filter(u => u?.role === 'Employee').length, l: 'Employees', c: 'st-emp' },
          { icon: <FiUsers />, n: approved.filter(u => u?.role === 'Intern').length, l: 'Interns', c: 'st-int' },
          { icon: <FiUsers />, n: approved.filter(u => u?.role === 'HR').length, l: 'HRs', c: 'st-hr' },
          { icon: <MdPending />, n: stats.pend, l: 'Pending', c: 'st-pend' },
          { icon: <FiCheckCircle />, n: stats.todayP, l: 'Present', c: 'st-today' },
          { icon: <FiXCircle />, n: stats.todayA, l: 'Absent', c: 'st-absent' },
          { icon: <FiClock />, n: stats.active, l: 'Active', c: 'st-act' },
          { icon: <FiCalendar />, n: stats.totalA, l: 'Records', c: 'st-rec' },
        ].map((s, i) => (
          <div className={`stat-card ${s.c}`} key={i}>
            <div className="stat-icon">{s.icon}</div>
            <div><h3>{s.n}</h3><p>{s.l}</p></div>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div className="tabs" id="tabs-bar">
        {[
          { key: 'qr', label: 'Master QR', icon: <MdQrCode />, cnt: null },
          { key: 'today', label: 'Today', icon: <MdToday />, cnt: `${stats.todayP}/${stats.total}` },
          { key: 'pending', label: 'Pending', icon: <MdPending />, cnt: stats.pend },
          { key: 'approved', label: 'Approved', icon: <FiCheckCircle />, cnt: approved.length },
          { key: 'attendance', label: 'Attendance', icon: <FiClock />, cnt: stats.totalA },
          { key: 'rejected', label: 'Rejected', icon: <FiXCircle />, cnt: stats.rej },
        ].map(t => (
          <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => tabClick(t.key)}>
            {t.icon}{t.label}{t.cnt !== null && <span className="tab-cnt">{t.cnt}</span>}
          </button>
        ))}
      </div>

      {/* FILTERS */}
      {['approved', 'attendance', 'today', 'pending', 'rejected'].includes(tab) && (
        <div className="filter-bar">
          <div className="filter-row">
            <div className="search-box">
              <FiSearch />
              <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button className="clr-btn" onClick={() => setSearch('')}><FiX /></button>}
            </div>
            {['approved', 'attendance', 'today'].includes(tab) && (
              <div className="f-group">
                <FiFilter />
                <select value={fRole} onChange={e => setFRole(e.target.value)}>
                  <option value="all">All Roles</option>
                  <option value="Employee">Employee</option>
                  <option value="Intern">Intern</option>
                  <option value="HR">HR</option>
                  <option value="Student">Student</option>
                </select>
              </div>
            )}
            {['attendance', 'today'].includes(tab) && (
              <div className="f-group">
                <select value={fStatus} onChange={e => setFStatus(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="present">🟢 Present Only</option>
                  <option value="absent">❌ Absent Only</option>
                </select>
              </div>
            )}
          </div>

          {/* ✅ TODAY tab: Set Holiday inputs */}
          {tab === 'today' && (
            <div className="filter-row">
              <input type="date" className="f-input" value={holidayDate} onChange={e => setHolidayDate(e.target.value)} title="Select date" />
              <input type="text" className="f-input" placeholder="Reason (Diwali, Rakhi..)" value={holidayReason} onChange={e => setHolidayReason(e.target.value)} />
              <button className="f-excel" style={{ background: '#e67e22' }} onClick={setHoliday}>
                <MdBeachAccess /> Set Holiday
              </button>
            </div>
          )}

          {tab === 'attendance' && (
            <div className="filter-row">
              <div className="f-group">
                <FiCalendar />
                <select value={fType} onChange={e => { setFType(e.target.value); setFDate(''); setFMonth(''); setFYear(''); }}>
                  <option value="all">All Dates</option><option value="date">Date</option>
                  <option value="week">Week</option><option value="month">Month</option><option value="year">Year</option>
                </select>
              </div>
              {fType === 'date' && <input type="date" className="f-input" value={fDate} onChange={e => setFDate(e.target.value)} />}
              {fType === 'month' && <input type="month" className="f-input" value={fMonth} onChange={e => setFMonth(e.target.value)} />}
              {fType === 'year' && <select className="f-input" value={fYear} onChange={e => setFYear(e.target.value)}><option value="">Year</option>{yrs.map(y => <option key={y} value={y}>{y}</option>)}</select>}
              <button className="f-reset" onClick={reset}>🔄</button>
            </div>
          )}

          {['attendance', 'today'].includes(tab) && (
            <div className="filter-row">
              <span className="f-badge">
                {tab === 'today'
                  ? `✅ ${fToday.filter(r => r.status === 'present').length} | ❌ ${fToday.filter(r => r.status === 'absent').length} | 📊 ${fToday.length}`
                  : `📊 ${fAtt.length} records`}
              </span>
              <button className="f-excel" onClick={() => dlExcel(tab === 'today' ? fToday : fAtt, tab === 'today')}
                disabled={dling || (tab === 'today' ? !fToday.length : !fAtt.length)}>
                <FiDownload /> Excel
              </button>
            </div>
          )}
        </div>
      )}

      <div className="tab-content">

        {/* QR TAB */}
        {tab === 'qr' && (
          <div className="qr-section">
            <div className="qr-card">
              <h2><MdQrCode /> Master QR Code</h2>
              <div className="off-box">
                <div className="off-header">
                  <span className="off-info">📍 {oLat.toFixed(4)}, {oLng.toFixed(4)} <span className="off-radius">📏 {oRadius}m</span></span>
                  <button className="off-btn" onClick={() => setShowOff(!showOff)}>⚙️</button>
                </div>
                {showOff && (
                  <div className="off-form">
                    <input type="number" step="any" value={oLatIn} onChange={e => setOLatIn(e.target.value)} placeholder="Latitude" />
                    <input type="number" step="any" value={oLngIn} onChange={e => setOLngIn(e.target.value)} placeholder="Longitude" />
                    <input type="number" value={oRadIn} onChange={e => setORadIn(e.target.value)} placeholder="Radius (m)" min="10" />
                    <button className="off-save" onClick={saveOff}>💾 Save</button>
                    <button className="off-cancel" onClick={() => setShowOff(false)}>✕</button>
                  </div>
                )}
              </div>
              <div className="qr-display">
                {qr && <div id="qr-print" ref={qrRef}><div className="qr-white"><QRCode value={qr} size={260} level="H" /></div></div>}
                {!qr && qrLoad && <div className="center-msg"><div className="loader" /><p>Loading...</p></div>}
                {!qr && !qrLoad && qrErr && <div className="center-msg"><p>⚠️ Failed</p></div>}
                {!qr && !qrLoad && !qrErr && <div className="center-msg"><div className="big-icon">🔲</div><h3>No QR Yet</h3></div>}
                <div className="qr-btns" style={{ marginTop: 16 }}>
                  {qr && <><button className="btn-p" onClick={printQR}><FiPrinter /> Print</button><button className="btn-d" onClick={genQR} disabled={qrGen}><FiRefreshCw className={qrGen ? 'spinning' : ''} /> Replace</button></>}
                  {!qr && <button className="btn-p btn-lg" onClick={genQR} disabled={qrGen}>{qrGen ? '⏳...' : <><MdQrCode /> Generate QR</>}</button>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TODAY TAB */}
        {tab === 'today' && (() => {
          const isLoading = (ld.a || ld.u) && !todayReady;
          const { items, total } = pgn(fToday);
          const pageIds = items.filter(r => !r.isHoliday).map(r => r?.id).filter(Boolean);
          return (
            <div className="tbl-wrap">
              {isLoading ? <div className="empty"><div className="loader" /><h3>Loading...</h3></div>
                : approved.length === 0 ? <div className="empty"><FiUsers className="empty-ic" /><h3>No Approved Users</h3></div>
                  : fToday.length === 0 ? <div className="empty"><FiSearch className="empty-ic" /><h3>No Results</h3></div>
                    : <>
                      {!fToday[0]?.isHoliday && (
                        <div className="today-summary">
                          <span className="ts-present">🟢 Present: {fToday.filter(r => r.status === 'present').length}</span>
                          <span className="ts-absent">❌ Absent: {fToday.filter(r => r.status === 'absent').length}</span>
                          <span className="ts-active">⚡ Active: {fToday.filter(r => r.attStatus === 'active').length}</span>
                          <span className="ts-out">✅ Out: {fToday.filter(r => r.attStatus === 'checkedout').length}</span>
                        </div>
                      )}
                      <SelectBar count={selected.size} onDelete={bulkDelAttendance} label="Delete Records" />
                      <Table cols={[<Chk ids={pageIds} />, '#', 'Emp ID', 'Name', 'Role', 'In', 'Out', 'Hours', 'Status', '']}
                        rows={items} renderRow={(r, i) => {
                          const idx = (page - 1) * PER_PAGE + i + 1;
                          if (r.isHoliday) {
                            return (
                              <tr key={`hol_${r.date}`} className="row-holiday">
                                <td>-</td><td>{idx}</td>
                                <td colSpan={7} style={{ textAlign: 'center', fontWeight: 'bold', color: '#e67e22' }}>
                                  🏖️ {r.dayName} - {r.reason} ({r.date})
                                </td>
                                <td><button className="bd" onClick={() => removeHoliday(r.date)} title="Remove Holiday"><FiTrash2 /></button></td>
                              </tr>
                            );
                          }
                          const isAbs = r?.status === 'absent';
                          const noOut = !isAbs && (!r?.outTime || r.outTime === '');
                          return (
                            <tr key={r?.id || i} className={`${isAbs ? 'row-absent' : r?.attStatus === 'active' ? 'row-active' : ''} ${selected.has(r?.id) ? 'row-sel' : ''}`}>
                              <td><Chk id={r?.id} /></td>
                              <td>{idx}</td><td><strong className="eid">{r?.empId}</strong></td>
                              <td><strong><Tip text={r?.name} max={14} /></strong></td><td>{roleBadge(r?.role)}</td>
                              <td className={isAbs ? '' : 't-in'}>{isAbs ? '---' : r?.inTime}</td>
                              <td className={isAbs ? '' : 't-out'}>{isAbs ? '---' : (r?.outTime || <em style={{ color: '#e67e22', fontSize: 12 }}>Not Out</em>)}</td>
                              <td><strong>{isAbs ? '---' : (r?.totalHours || '---')}</strong></td>
                              <td>{statusBadge(r)}</td>
                              <td>{!isAbs && noOut && <button className="be" onClick={() => openEditAtt(r)}><FiEdit2 /></button>}</td>
                            </tr>
                          );
                        }} />
                      <div className="m-cards">
                        {items.map((r, i) => {
                          if (r.isHoliday) return (
                            <div className="m-card" key={`hol_${r.date}`} style={{ padding: 15, background: '#fff3cd', color: '#e67e22', fontWeight: 'bold' }}>
                              🏖️ {r.dayName} - {r.reason} ({r.date})
                              <button style={{ marginLeft: 10 }} className="md" onClick={() => removeHoliday(r.date)}><FiTrash2 /> Remove</button>
                            </div>
                          );
                          const isAbs = r?.status === 'absent';
                          const noOut = !isAbs && (!r?.outTime || r.outTime === '');
                          return (
                            <Card key={`t${r?.id || i}`} id={`t${r?.id || i}`} selId={r?.id}
                              row1={r?.name} row2={<><strong className="eid">{r?.empId}</strong> {roleBadge(r?.role)} {statusBadge(r)}</>}
                              details={[['In', isAbs ? '---' : r?.inTime], ['Out', isAbs ? '---' : (r?.outTime || 'Not Out')], ['Hours', r?.totalHours || '---']]}
                              actions={!isAbs && noOut ? <button className="me" onClick={() => openEditAtt(r)}><FiEdit2 /> Add Out Time</button> : null}
                            />
                          );
                        })}
                      </div>
                      <Pager total={total} />
                    </>}
            </div>
          );
        })()}

        {/* PENDING */}
        {tab === 'pending' && (() => {
          const fPend = pend.filter(u => u && srch([u.name, u.email, u.contact]));
          const { items, total } = pgn(fPend);
          const pageIds = items.map(u => exId(u)).filter(Boolean);
          return (
            <div className="tbl-wrap">
              {ld.p && !pend.length ? <div className="empty"><div className="loader" /><h3>Loading...</h3></div>
                : !fPend.length ? <div className="empty"><MdPending className="empty-ic" /><h3>No Pending</h3></div>
                  : <>
                    <SelectBar count={selected.size} onDelete={() => bulkDel(selected, rejectUser, () => { fetchPend(); fetchRej(); })} label="Reject All" />
                    <Table cols={[<Chk ids={pageIds} />, '#', 'Name', 'Email', 'Contact', 'College', 'Date', 'Actions']}
                      rows={items} renderRow={(u, i) => {
                        const uid = exId(u), ip = procId === uid, idx = (page - 1) * PER_PAGE + i + 1;
                        return (
                          <tr key={uid || i} className={selected.has(uid) ? 'row-sel' : ''}>
                            <td><Chk id={uid} /></td><td>{idx}</td>
                            <td><strong><Tip text={u?.name} max={16} /></strong></td>
                            <td><Tip text={u?.email} max={20} /></td><td>{u?.contact}</td>
                            <td><Tip text={u?.collegeName} max={14} /></td>
                            <td>{fmtDate(u?.registeredAt)}</td>
                            <td className="act-btns">
                              <button className="ba" onClick={() => openApprove(u)} disabled={ip}>{ip ? <FiRefreshCw className="spinning" /> : <FiCheckCircle />}</button>
                              <button className="br" onClick={() => doReject(u)} disabled={ip}>{ip ? <FiRefreshCw className="spinning" /> : <FiXCircle />}</button>
                            </td>
                          </tr>
                        );
                      }} />
                    <div className="m-cards">
                      {items.map((u, i) => {
                        const uid = exId(u), ip = procId === uid;
                        return (
                          <Card key={`p${uid || i}`} id={`p${uid || i}`} selId={uid}
                            row1={u?.name} row2={u?.contact}
                            details={[['Email', u?.email], ['College', u?.collegeName], ['Address', u?.address], ['Registered', fmtDate(u?.registeredAt)]]}
                            actions={<><button className="ma" onClick={() => openApprove(u)} disabled={ip}>{ip ? <FiRefreshCw className="spinning" /> : <><FiCheckCircle /> Approve</>}</button><button className="mr" onClick={() => doReject(u)} disabled={ip}>{ip ? <FiRefreshCw className="spinning" /> : <><FiXCircle /> Reject</>}</button></>}
                          />
                        );
                      })}
                    </div>
                    <Pager total={total} />
                  </>}
            </div>
          );
        })()}

        {/* APPROVED */}
        {tab === 'approved' && (() => {
          const { items, total } = pgn(fApproved);
          const pageIds = items.map(u => u?.empId).filter(Boolean);
          return (
            <div className="tbl-wrap">
              {ld.u && !approved.length ? <div className="empty"><div className="loader" /><h3>Loading...</h3></div>
                : !fApproved.length ? <div className="empty"><FiUsers className="empty-ic" /><h3>No Users</h3></div>
                  : <>
                    <SelectBar count={selected.size} onDelete={() => bulkDel(selected, deleteUser, () => { fetchAppr(); fetchAtt(); })} label="Delete Users" />
                    <Table cols={[<Chk ids={pageIds} />, '#', 'Emp ID', 'Name', 'Role', 'Contact', 'Email', 'College', 'Approved', 'Actions']}
                      rows={items} renderRow={(u, i) => {
                        const idx = (page - 1) * PER_PAGE + i + 1;
                        return (
                          <tr key={u?.empId || i} className={selected.has(u?.empId) ? 'row-sel' : ''}>
                            <td><Chk id={u?.empId} /></td><td>{idx}</td>
                            <td><strong className="eid">{u?.empId}</strong></td>
                            <td><strong><Tip text={u?.name} max={14} /></strong></td><td>{roleBadge(u?.role)}</td>
                            <td>{u?.contact}</td><td><Tip text={u?.email} max={18} /></td>
                            <td><Tip text={u?.collegeName} max={14} /></td>
                            <td>{fmtDate(u?.approvedAt)}</td>
                            <td className="act-btns">
                              <button className="be" onClick={() => startEdit(u)}><FiEdit2 /></button>
                              <button className="bd" onClick={() => doDel(u?.empId)}><FiTrash2 /></button>
                            </td>
                          </tr>
                        );
                      }} />
                    <div className="m-cards">
                      {items.map((u, i) => (
                        <Card key={`a${u?.empId || i}`} id={`a${u?.empId || i}`} selId={u?.empId}
                          row1={u?.name} row2={<><strong className="eid">{u?.empId}</strong> {roleBadge(u?.role)}</>}
                          details={[['Email', u?.email], ['Contact', u?.contact], ['College', u?.collegeName], ['Address', u?.address], ['Approved', fmtDate(u?.approvedAt)]]}
                          actions={<><button className="me" onClick={() => startEdit(u)}><FiEdit2 /> Edit</button><button className="md" onClick={() => doDel(u?.empId)}><FiTrash2 /> Delete</button></>}
                        />
                      ))}
                    </div>
                    <Pager total={total} />
                  </>}
            </div>
          );
        })()}

        {/* ATTENDANCE */}
        {tab === 'attendance' && (() => {
          const { items, total } = pgn(fAtt);
          const pageIds = items.filter(r => !r.isHoliday).map(r => r?.id).filter(Boolean);
          return (
            <div className="tbl-wrap">
              {err && <div className="err-bar">⚠️ {err}</div>}
              {ld.a && !att.length ? <div className="empty"><div className="loader" /><h3>Loading...</h3></div>
                : !fAtt.length ? <div className="empty"><FiClock className="empty-ic" /><h3>No Records</h3></div>
                  : <>
                    <SelectBar count={selected.size} onDelete={bulkDelAttendance} label="Delete Records" />
                    <Table cols={[<Chk ids={pageIds} />, '#', 'Date', 'Day', 'Emp ID', 'Name', 'In', 'Out', 'Hours', 'Status', '']}
                      rows={items} renderRow={(r, i) => {
                        const idx = (page - 1) * PER_PAGE + i + 1;
                        if (r.isHoliday) {
                          return (
                            <tr key={`hol_${r.date}`} className="row-holiday">
                              <td>-</td><td>{idx}</td>
                              <td><strong>{r.date}</strong></td>
                              <td><strong>{r.dayName}</strong></td>
                              <td colSpan={6} style={{ textAlign: 'center', fontWeight: 'bold', color: '#e67e22' }}>
                                🏖️ {r.reason || 'HOLIDAY'}
                              </td>
                              <td><button className="bd" onClick={() => removeHoliday(r.date)} title="Remove Holiday"><FiTrash2 /></button></td>
                            </tr>
                          );
                        }
                        const isAbs = r?.status === 'absent';
                        const noOut = !isAbs && (!r?.outTime || r.outTime === '');
                        return (
                          <tr key={r?.id || i} className={`${isAbs ? 'row-absent' : ''} ${selected.has(r?.id) ? 'row-sel' : ''}`}>
                            <td><Chk id={r?.id} /></td>
                            <td>{idx}</td>
                            <td>{r?.date}</td>
                            <td>{getDayName(r?.date)}</td>
                            <td><strong className="eid">{r?.empId}</strong></td>
                            <td><Tip text={r?.name} max={12} /></td>
                            <td className={isAbs ? '' : 't-in'}>{isAbs ? '---' : r?.inTime}</td>
                            <td className={isAbs ? '' : 't-out'}>{isAbs ? '---' : (noOut ? <em style={{ color: '#e67e22', fontSize: 12 }}>Not Out</em> : r.outTime)}</td>
                            <td><strong>{isAbs ? '---' : (r?.totalHours || '---')}</strong></td>
                            <td>{statusBadge(r)}</td>
                            <td>{!isAbs && noOut && <button className="be" onClick={() => openEditAtt(r)}><FiEdit2 /></button>}</td>
                          </tr>
                        );
                      }} />
                    <div className="m-cards">
                      {items.map((r, i) => {
                        if (r.isHoliday) return (
                          <div className="m-card" key={`hol_${r.date}`} style={{ padding: 15, background: '#fff3cd', color: '#e67e22', fontWeight: 'bold' }}>
                            📅 {r.date} - 🏖️ {r.reason || r.dayName + ' HOLIDAY'}
                            <button style={{ marginLeft: 10 }} className="md" onClick={() => removeHoliday(r.date)}><FiTrash2 /> Remove</button>
                          </div>
                        );
                        const isAbs = r?.status === 'absent';
                        const noOut = !isAbs && (!r?.outTime || r.outTime === '');
                        return (
                          <Card key={`at${r?.id || i}`} id={`at${r?.id || i}`} selId={r?.id}
                            row1={r?.name} row2={<><strong className="eid">{r?.empId}</strong> {roleBadge(r?.role)} {statusBadge(r)}</>}
                            details={[['Date', `${r?.date} (${getDayName(r?.date)})`], ['In', isAbs ? '---' : r?.inTime], ['Out', isAbs ? '---' : (r?.outTime || 'Not Out')], ['Hours', r?.totalHours || '---']]}
                            actions={!isAbs && noOut ? <button className="me" onClick={() => openEditAtt(r)}><FiEdit2 /> Add Out Time</button> : null}
                          />
                        );
                      })}
                    </div>
                    <Pager total={total} />
                  </>}
            </div>
          );
        })()}

        {/* REJECTED */}
        {tab === 'rejected' && (() => {
          const fRej = rejected.filter(u => u && srch([u.name, u.email, u.contact]));
          const { items, total } = pgn(fRej);
          const pageIds = items.map(u => u?.id).filter(Boolean);
          return (
            <div className="tbl-wrap">
              {ld.r && !rejected.length ? <div className="empty"><div className="loader" /><h3>Loading...</h3></div>
                : !fRej.length ? <div className="empty"><FiXCircle className="empty-ic" /><h3>No Rejected</h3></div>
                  : <>
                    <SelectBar count={selected.size} onDelete={() => bulkDel(selected, deleteRejected, fetchRej)} label="Delete Rejected" />
                    <Table cols={[<Chk ids={pageIds} />, '#', 'Name', 'Email', 'Contact', 'College', 'Rejected']}
                      rows={items} renderRow={(u, i) => {
                        const idx = (page - 1) * PER_PAGE + i + 1;
                        return (
                          <tr key={u?.id || i} className={selected.has(u?.id) ? 'row-sel' : ''}>
                            <td><Chk id={u?.id} /></td><td>{idx}</td>
                            <td><Tip text={u?.name} max={14} /></td><td><Tip text={u?.email} max={20} /></td>
                            <td>{u?.contact}</td><td><Tip text={u?.collegeName} max={14} /></td>
                            <td>{fmtDate(u?.rejectedAt)}</td>
                          </tr>
                        );
                      }} />
                    <div className="m-cards">
                      {items.map((u, i) => (
                        <Card key={`r${u?.id || i}`} id={`r${u?.id || i}`} selId={u?.id}
                          row1={u?.name} row2={u?.contact}
                          details={[['Email', u?.email], ['College', u?.collegeName], ['Address', u?.address], ['Rejected', fmtDate(u?.rejectedAt)]]}
                        />
                      ))}
                    </div>
                    <Pager total={total} />
                  </>}
            </div>
          );
        })()}
      </div>

      {/* APPROVE MODAL */}
      {approveModal && (
        <div className="modal-bg" onClick={closeApprove}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-hdr"><h2><FiUserCheck /> Approve User</h2><button className="modal-x" onClick={closeApprove}><FiX /></button></div>
            <div className="modal-body">
              <div className="edit-info"><p><strong>Name:</strong> {approveModal.name}</p><p><strong>Email:</strong> {approveModal.email}</p><p><strong>Contact:</strong> {approveModal.contact}</p></div>
              <div className="edit-form"><div className="fg"><label>Assign Role *</label><select value={approveRole} onChange={e => setApproveRole(e.target.value)}><option>Employee</option><option>Intern</option><option>HR</option><option>Student</option></select></div></div>
            </div>
            <div className="modal-ft"><button className="btn-c" onClick={closeApprove}><FiX /> Cancel</button><button className="btn-s" onClick={doApprove}><FiCheckCircle /> Approve as {approveRole}</button></div>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editUser && (
        <div className="modal-bg" onClick={closeEdit}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-hdr"><h2><FiEdit2 /> Edit User</h2><button className="modal-x" onClick={closeEdit}><FiX /></button></div>
            <div className="modal-body">
              <div className="edit-info"><p><strong>ID:</strong> {editUser.empId}</p></div>
              <div className="edit-form">
                {[{ l: 'Name *', n: 'name', t: 'text' }, { l: 'Email *', n: 'email', t: 'email' }, { l: 'Contact *', n: 'contact', t: 'text' }, { l: 'College', n: 'collegeName', t: 'text' }, { l: 'Address', n: 'address', t: 'text' }].map(f => (
                  <div className="fg" key={f.n}><label>{f.l}</label><input type={f.t} name={f.n} value={editData[f.n]} onChange={e => setEditData(p => ({ ...p, [e.target.name]: e.target.value }))} /></div>
                ))}
                <div className="fg"><label>Role *</label><select name="role" value={editData.role} onChange={e => setEditData(p => ({ ...p, role: e.target.value }))}><option>Employee</option><option>Intern</option><option>HR</option><option>Student</option></select></div>
              </div>
            </div>
            <div className="modal-ft"><button className="btn-c" onClick={closeEdit}><FiX /> Cancel</button><button className="btn-s" onClick={saveEdit}><FiSave /> Save</button></div>
          </div>
        </div>
      )}

      {/* EDIT ATTENDANCE MODAL */}
      {editAttRecord && (
        <div className="modal-bg" onClick={closeEditAtt}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-hdr"><h2><FiClock /> Add Out Time</h2><button className="modal-x" onClick={closeEditAtt}><FiX /></button></div>
            <div className="modal-body">
              <div className="edit-info">
                <p><strong>Employee:</strong> {editAttRecord.name} ({editAttRecord.empId})</p>
                <p><strong>Date:</strong> {editAttRecord.date}</p>
                <p><strong>In Time:</strong> {editAttRecord.inTime}</p>
              </div>
              <div className="edit-form">
                <div className="fg">
                  <label>Out Time * (e.g. 06:30:00 PM)</label>
                  <input type="text" placeholder="06:30:00 PM" value={editAttOut} onChange={e => setEditAttOut(e.target.value)} />
                </div>
                {editAttOut && editAttRecord.inTime && editAttRecord.inTime !== '---' && (
                  <div className="fg"><label>Total Hours (auto)</label><input type="text" value={calcHrs(editAttRecord.inTime, editAttOut)} readOnly /></div>
                )}
              </div>
            </div>
            <div className="modal-ft"><button className="btn-c" onClick={closeEditAtt}><FiX /> Cancel</button><button className="btn-s" onClick={saveEditAtt}><FiSave /> Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;