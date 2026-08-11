import React, { useState, useEffect } from 'react';
import { getSession, getAttendance } from '../api';
import { FiClock, FiCalendar, FiUser, FiCheckCircle } from 'react-icons/fi';
import './EmployeeReport.css';

const EmployeeReport = () => {
  const currentUser = getSession();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    getAttendance()
      .then(res => {
        const records = res?.data?.records || res?.data || [];
        setAttendanceRecords(Array.isArray(records) ? records : []);
      })
      .catch(() => setAttendanceRecords([]));
  }, []);

  const myRecords = attendanceRecords
    .filter(r => r.empId === currentUser?.empId)
    .sort((a, b) => b.id - a.id);

  const totalDays = myRecords.length;
  const completeDays = myRecords.filter(r => r.outTime).length;
  const activeDays = myRecords.filter(r => !r.outTime).length;

  return (
    <div className="report-page">
      <div className="report-header">
        <h1>📊 My Attendance Report</h1>
        <div className="user-info-box">
          <FiUser /> <strong>{currentUser?.name}</strong> |{' '}
          {currentUser?.empId} | {currentUser?.role}
        </div>
      </div>

      <div className="report-stats">
        <div className="report-stat-card">
          <FiCalendar className="report-stat-icon stat-blue" />
          <div><h3>{totalDays}</h3><p>Total Days</p></div>
        </div>
        <div className="report-stat-card">
          <FiCheckCircle className="report-stat-icon stat-green" />
          <div><h3>{completeDays}</h3><p>Complete Days</p></div>
        </div>
        <div className="report-stat-card">
          <FiClock className="report-stat-icon stat-yellow" />
          <div><h3>{activeDays}</h3><p>Active (No Out)</p></div>
        </div>
      </div>

      <div className="table-container">
        {myRecords.length === 0 ? (
          <div className="empty-state">
            <FiCalendar className="empty-icon" />
            <h3>No Attendance Records Yet</h3>
            <p>Start scanning the office QR code to mark your daily attendance.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th><th>Date</th><th>In Time</th>
                  <th>Out Time</th><th>Total Hours</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myRecords.map((r, i) => (
                  <tr key={r.id}>
                    <td>{i + 1}</td>
                    <td><strong>{r.date}</strong></td>
                    <td className="time-in">{r.inTime}</td>
                    <td className="time-out">{r.outTime || '---'}</td>
                    <td><strong>{r.totalHours || '---'}</strong></td>
                    <td>
                      {r.outTime
                        ? <span className="status-complete">✅ Complete</span>
                        : <span className="status-active">🟢 Active</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="report-mobile-cards">
              {myRecords.map((r, i) => {
                const cardId = `report_${r.id || i}`;
                const isOpen = expandedCard === cardId;
                return (
                  <div className="report-m-card" key={cardId}>
                    <div
                      className="report-m-card-top"
                      onClick={() => setExpandedCard(isOpen ? null : cardId)}
                    >
                      <div className="report-m-card-info">
                        <div className="report-m-card-date">📅 {r.date}</div>
                        <div className="report-m-card-sub">
                          <span className="time-in">{r.inTime}</span>
                          <span>→</span>
                          <span className="time-out">{r.outTime || '---'}</span>
                          {r.outTime
                            ? <span className="status-complete">✅</span>
                            : <span className="status-active">🟢</span>}
                        </div>
                      </div>
                      <span className={`report-m-arrow ${isOpen ? 'open' : ''}`}>▼</span>
                    </div>
                    {isOpen && (
                      <div className="report-m-card-body">
                        <div className="report-m-row">
                          <span className="report-m-label">In Time</span>
                          <span className="report-m-val in">{r.inTime}</span>
                        </div>
                        <div className="report-m-row">
                          <span className="report-m-label">Out Time</span>
                          <span className="report-m-val out">{r.outTime || '---'}</span>
                        </div>
                        <div className="report-m-row">
                          <span className="report-m-label">Total Hours</span>
                          <span className="report-m-val hrs">{r.totalHours || '---'}</span>
                        </div>
                        <div className="report-m-row">
                          <span className="report-m-label">Status</span>
                          <span className="report-m-val">
                            {r.outTime
                              ? <span className="status-complete">✅ Complete</span>
                              : <span className="status-active">🟢 Active</span>}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeReport;