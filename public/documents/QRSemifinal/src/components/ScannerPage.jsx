import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { toast } from 'react-toastify';
import { MdQrCodeScanner } from 'react-icons/md';
import { FiClock, FiUser, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import {
  getSession,
  getAttendance,
  getMasterQR,
  getOfficeLocation,
  checkIn,
  checkOut,
  getGeolocation,
  isWithinOffice
} from '../api'; // ✅ Single import
import './ScannerPage.css';

const ScannerPage = () => {
  const currentUser = getSession();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [scanResult, setScanResult] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [qrLoading, setQrLoading] = useState(true);
  const [qrError, setQrError] = useState(false);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [distanceFromOffice, setDistanceFromOffice] = useState(null);
  const [todayCardData, setTodayCardData] = useState({ inTime: '', outTime: '', totalHours: '' });
  const [markedToday, setMarkedToday] = useState(false);

  const scannerRef = useRef(null);
  const isScannerActive = useRef(false);
  const lastScannedRef = useRef({ text: '', time: 0 });
  const isMounted = useRef(true);
  const processingRef = useRef(false);
  const processQRRef = useRef(null);
  const currentUserRef = useRef(currentUser); // ✅ Sirf ek baar

  const today = new Date().toLocaleDateString('en-GB').replace(/\//g, '/');

  // ✅ Attendance fetch helper
  const fetchAttendance = useCallback(() => {
    getAttendance().then(res => {
      const records = res?.data?.records || res?.data || [];
      if (isMounted.current) setAttendanceRecords(Array.isArray(records) ? records : []);
    }).catch(() => {});
  }, []);

  // Initial load
  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  const todayRecord = attendanceRecords?.find(r => {
    const empMatch = String(r.empId || '').trim().toUpperCase() ===
      String(currentUser?.empId || '').trim().toUpperCase();
    const dateMatch = String(r.date || '').trim() === today;
    return empMatch && dateMatch;
  });

  const displayInTime = todayCardData.inTime || todayRecord?.inTime || '--:--:--';
  const displayOutTime = todayCardData.outTime || todayRecord?.outTime || '--:--:--';
  const displayTotalHours = todayCardData.totalHours || todayRecord?.totalHours || '--';
  const isPresentToday = !!(todayRecord || markedToday || todayCardData.inTime);

  // ─── Load Master QR ───────────────────────────────────────
  const loadMasterQR = useCallback(async () => {
    setQrLoading(true);
    setQrError(false);
    try {
      const res = await getMasterQR();
      if (!res?.data?.qrValue) setQrError(true);
    } catch {
      if (isMounted.current) setQrError(true);
    } finally {
      if (isMounted.current) setQrLoading(false);
    }
  }, []);

  // ─── Location Check ───────────────────────────────────────
  const checkLocation = useCallback(async () => {
    setLocationStatus('checking');
    const loc = await getGeolocation();
    if (!loc) {
      setLocationStatus('denied');
      return { ok: false, error: 'Location access denied. Please enable GPS.' };
    }

    try {
      const officeRes = await getOfficeLocation();
      const office = officeRes?.data;

      if (!office?.lat || !office?.lng) {
        setLocationStatus('ok');
        return { ok: true, lat: loc.latitude, lng: loc.longitude, skipped: true };
      }

      const { withinRange, distance } = isWithinOffice(
        loc.latitude, loc.longitude,
        office.lat, office.lng,
        office.radius || 100
      );

      if (isMounted.current) setDistanceFromOffice(distance);

      if (!withinRange) {
        setLocationStatus('far');
        return {
          ok: false,
          error: `You are ${distance}m away. Must be within ${office.radius || 100}m.`,
          lat: loc.latitude, lng: loc.longitude
        };
      }

      setLocationStatus('ok');
      return { ok: true, lat: loc.latitude, lng: loc.longitude, distance };
    } catch {
      // Office location fetch fail → allow (no restriction)
      setLocationStatus('ok');
      return { ok: true, lat: loc.latitude, lng: loc.longitude, skipped: true };
    }
  }, []);

  // ─── Process QR Scan ──────────────────────────────────────
  const processQRScan = useCallback(async (scannedValue) => {
    if (processingRef.current) return;
    const user = currentUserRef.current;
    if (!user?.empId) { toast.error('Please login first!'); return; }

    processingRef.current = true;
    setProcessing(true);
    setScanResult(null);

    try {
      // Step 1: Validate QR
      const qrRes = await getMasterQR();
      const masterQR = qrRes?.data?.qrValue;
      if (!masterQR || scannedValue.trim() !== masterQR.trim()) {
        toast.error('Invalid QR Code!');
        setScanResult({ success: false, type: 'error', message: 'Invalid QR Code' });
        return;
      }
      toast.success('QR Validated!', { autoClose: 1000 });

      // Step 2: Location
      const locResult = await checkLocation();
      if (!locResult.ok) {
        toast.error(locResult.error);
        setScanResult({ success: false, type: 'error', message: locResult.error });
        return;
      }

      // Step 3: Check-In or Check-Out
      const hasInTime = todayRecord?.inTime && todayRecord.inTime !== '--:--:--';
      const hasOutTime = todayRecord?.outTime && todayRecord.outTime !== '--:--:--';

      if (hasInTime && hasOutTime) {
        toast.info('Already completed today!');
        setScanResult({ success: false, type: 'error', message: 'Already completed today!' });
        return;
      }

      let res;
      if (!hasInTime) {
        res = await checkIn({
          empId: user.empId,
          name: user.name,
          email: user.email || '',
          contact: user.contact || '',
          role: user.role || '',
          collegeName: user.collegeName || '',
          address: user.address || '',
          latitude: locResult.lat || '',
          longitude: locResult.lng || '',
        });
      } else {
        res = await checkOut({
          empId: user.empId,
          latitude: locResult.lat || '',
          longitude: locResult.lng || '',
        });
      }

      if (res?.status !== 'success') {
        toast.error(res?.message || 'Failed');
        setScanResult({ success: false, type: 'error', message: res?.message });
        return;
      }

      const data = res.data || {};

      if (!hasInTime) {
        setMarkedToday(true);
        setTodayCardData(prev => ({ ...prev, inTime: data.inTime || '' }));
        toast.success(`✅ Check-IN: ${data.inTime}`);
        setScanResult({ success: true, type: 'in', data: { ...data, name: user.name, empId: user.empId } });
      } else {
        setMarkedToday(true);
        setTodayCardData({
          inTime: todayRecord?.inTime || '',
          outTime: data.outTime || '',
          totalHours: data.totalHours || '',
        });
        toast.success(`✅ Check-OUT: ${data.outTime} | ${data.totalHours}`);
        setScanResult({ success: true, type: 'out', data });
      }

      // Refresh records after 1.5s
      setTimeout(fetchAttendance, 1500);

    } catch (err) {
      toast.error('Error: ' + err.message);
      setScanResult({ success: false, type: 'error', message: err.message });
    } finally {
      processingRef.current = false;
      setTimeout(() => { if (isMounted.current) setProcessing(false); }, 1000);
    }
  }, [checkLocation, todayRecord, fetchAttendance]); // ✅ refreshAttendance hata diya

  useEffect(() => { processQRRef.current = processQRScan; }, [processQRScan]);

  // Sync todayRecord to card
  useEffect(() => {
    if (!todayRecord) return;
    setTodayCardData({
      inTime: todayRecord.inTime || '',
      outTime: todayRecord.outTime || '',
      totalHours: todayRecord.totalHours || '',
    });
    setMarkedToday(true);
  }, [todayRecord]);

  // Scanner Effect
  useEffect(() => {
    if (!showScanner) return;
    isScannerActive.current = true;

    const timer = setTimeout(() => {
      const el = document.getElementById('qr-reader');
      if (!el || scannerRef.current) return;

      const scanner = new Html5QrcodeScanner('qr-reader', {
        fps: 10, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true
      });
      scannerRef.current = scanner;

      scanner.render((decodedText) => {
        if (!isScannerActive.current) return;
        const now = Date.now();
        if (lastScannedRef.current.text === decodedText && now - lastScannedRef.current.time < 3000) return;
        lastScannedRef.current = { text: decodedText, time: now };
        isScannerActive.current = false;
        scanner.clear().then(() => {
          scannerRef.current = null;
          setShowScanner(false);
          if (processQRRef.current) processQRRef.current(decodedText);
        });
      }, () => {});
    }, 300);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [showScanner]);

  // Mount/Unmount
  useEffect(() => {
    isMounted.current = true;
    loadMasterQR();
    return () => { isMounted.current = false; };
  }, [loadMasterQR]);

  const handleToggleScanner = () => {
    if (showScanner) setShowScanner(false);
    else { setScanResult(null); setShowScanner(true); }
  };

  const getBadge = () => {
    if (locationStatus === 'ok') return { bg: '#E8F5E9', color: '#2E7D32', text: `✅ Location OK${distanceFromOffice ? ` (${distanceFromOffice}m)` : ''}` };
    if (locationStatus === 'checking') return { bg: '#FFF3E0', color: '#E65100', text: '📍 Checking location...' };
    if (locationStatus === 'denied') return { bg: '#FFEBEE', color: '#C62828', text: '❌ GPS denied' };
    if (locationStatus === 'far') return { bg: '#FFEBEE', color: '#C62828', text: `❌ Too far (${distanceFromOffice}m)` };
    return null;
  };
  const badge = getBadge();

  return (
    <div className="scanner-page">
      <div className="scanner-header">
        <h1><MdQrCodeScanner /> Scan Attendance QR</h1>
        <div className="user-info-box">
          <FiUser /> <strong>{currentUser?.name}</strong> | {currentUser?.empId} | {currentUser?.role}
        </div>
      </div>

      {badge && (
        <div style={{ padding: '8px 16px', borderRadius: 10, marginBottom: 12, background: badge.bg, color: badge.color, fontWeight: 600 }}>
          {badge.text}
        </div>
      )}

      {qrLoading && <div style={{ textAlign: 'center', padding: 10 }}>⏳ Loading Master QR...</div>}
      {qrError && <div style={{ textAlign: 'center', padding: 10, color: '#d32f2f' }}>❌ Failed to load Master QR</div>}

      <div className="today-status">
        <h3>📅 Today — {today}</h3>
        {!isPresentToday ? (
          <div className="absent-card">
            <div className="absent-icon">❌</div>
            <div className="absent-info">
              <h3>Absent Today</h3>
              <p>Scan the office QR to check in.</p>
            </div>
          </div>
        ) : (
          <div className="status-cards">
            <div className={`status-card ${displayInTime !== '--:--:--' ? 'active' : 'inactive'}`}>
              <FiClock className="status-icon in" />
              <div><p>In Time</p><h3>{displayInTime}</h3></div>
            </div>
            <div className={`status-card ${displayOutTime !== '--:--:--' ? 'active' : 'inactive'}`}>
              <FiClock className="status-icon out" />
              <div><p>Out Time</p><h3>{displayOutTime}</h3></div>
            </div>
            <div className={`status-card ${displayTotalHours !== '--' ? 'active' : 'inactive'}`}>
              <FiCheckCircle className="status-icon total" />
              <div><p>Total Hours</p><h3>{displayTotalHours}</h3></div>
            </div>
          </div>
        )}
      </div>

      <div className="scanner-content">
        <div className="scan-section">
          {processing && (
            <div style={{ padding: '10px 20px', background: '#ffa726', color: 'white', borderRadius: 8, textAlign: 'center', marginBottom: 15 }}>
              <FiRefreshCw style={{ animation: 'spin 1s linear infinite' }} /> Processing...
            </div>
          )}

          <div className="scan-buttons">
            <button className="btn btn-scan" onClick={handleToggleScanner} disabled={processing}>
              <MdQrCodeScanner /> {showScanner ? 'Close Camera' : 'Open Camera'}
            </button>
          </div>

          {showScanner && (
            <div className="scanner-container">
              <div id="qr-reader" />
              <p className="scan-hint">Point camera at the office QR code</p>
            </div>
          )}

          {scanResult && (
            <div className={`scan-result ${scanResult.type === 'in' ? 'result-in' : scanResult.type === 'out' ? 'result-out' : 'result-error'}`}>
              {scanResult.type === 'in' && (
                <div className="result-content">
                  <div className="result-icon">🟢</div>
                  <h2>Check-IN Successful!</h2>
                  <p><strong>Name:</strong> {scanResult.data?.name}</p>
                  <p><strong>Emp ID:</strong> {scanResult.data?.empId}</p>
                  <p><strong>In Time:</strong> <span style={{ fontSize: 22, fontWeight: 'bold' }}>{scanResult.data?.inTime}</span></p>
                </div>
              )}
              {scanResult.type === 'out' && (
                <div className="result-content">
                  <div className="result-icon">🔴</div>
                  <h2>Check-OUT Successful!</h2>
                  <p><strong>Out Time:</strong> <span style={{ fontSize: 22, fontWeight: 'bold' }}>{scanResult.data?.outTime}</span></p>
                  <p><strong>Total Hours:</strong> <span style={{ fontSize: 22, fontWeight: 'bold' }}>{scanResult.data?.totalHours}</span></p>
                </div>
              )}
              {scanResult.type === 'error' && (
                <div className="result-content">
                  <div className="result-icon">❌</div>
                  <h2>Failed</h2>
                  <p style={{ color: '#ff6b6b' }}>{scanResult.message}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScannerPage;