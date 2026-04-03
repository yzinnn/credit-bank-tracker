import React, { useState, useMemo } from 'react';
import './App.css';
import { useStorage } from './useStorage';
import { COURSE_COLORS } from './data';

/* ─── 유틸 ─── */
function parseRange(periodStr, year = 2026) {
  if (!periodStr) return { start: null, end: null };
  const parts = periodStr.split('~').map(s => s.trim());
  if (parts.length < 2) return { start: null, end: null };
  const [sm, sd] = parts[0].split('-').map(Number);
  const [em, ed] = parts[1].split('-').map(Number);
  return {
    start: new Date(year, sm - 1, sd, 0, 0, 0),
    end: new Date(year, em - 1, ed, 23, 59, 59)
  };
}

function getDday(targetDate) {
  if (!targetDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 864e5);
}

function ddayText(d) {
  if (d === null) return '';
  if (d < 0) return `D+${Math.abs(d)}`;
  if (d === 0) return 'D-Day';
  return `D-${d}`;
}

export default function App() {
  const { courses, certs, loaded, toggleLecture, toggleCert, addCert, deleteCert } = useStorage();
  
  const [tab, setTab] = useState('dash');
  const [selCourse, setSelCourse] = useState(0);
  const [taskMode, setTaskMode] = useState('todo'); 
  const [currMonth, setCurrMonth] = useState(new Date());
  const [selDate, setSelDate] = useState(new Date());
  
  const [showCertModal, setShowCertModal] = useState(false);
  const [newCertName, setNewCertName] = useState('');
  const [newCertDate, setNewCertDate] = useState('');
  const [newCertTime, setNewCertTime] = useState('23:59');

  const calendarDays = useMemo(() => {
    const year = currMonth.getFullYear(), month = currMonth.getMonth();
    const first = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();
    const res = [];
    for (let i = first - 1; i >= 0; i--) res.push({ d: prevDays - i, m: month - 1, y: year, current: false });
    for (let i = 1; i <= daysInMonth; i++) res.push({ d: i, m: month, y: year, current: true });
    const next = 42 - res.length;
    for (let i = 1; i <= next; i++) res.push({ d: i, m: month + 1, y: year, current: false });
    return res;
  }, [currMonth]);

  const allTasks = useMemo(() => {
    const items = [];
    courses.forEach((c, ci) => c.weeks.forEach((w, wi) => {
      const range = parseRange(w.period);
      w.lectures.forEach((l, li) => {
        items.push({ 
          type: 'lecture', id: `l-${ci}-${wi}-${li}`, ci, wi, li, 
          title: l.title, cname: c.courseName, week: w.week, 
          start: range.start, end: range.end, dl: range.end, 
          completed: l.completed, col: COURSE_COLORS[ci] 
        });
      });
    }));
    certs.forEach(cert => {
      const d = cert.date.includes('T') ? new Date(cert.date) : new Date(cert.date + 'T23:59:59');
      const timeString = d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
      items.push({ 
        type: 'cert', id: cert.id, title: cert.name, cname: '일정/자격증', 
        time: timeString !== '23:59' ? timeString : '', 
        dl: d, completed: cert.completed, col: { text: '#059669', light: '#D1FAE5' } 
      });
    });
    return items;
  }, [courses, certs]);

  // 대시보드 하단: 선택 날짜 기준 "진행 중인" 주차의 강의들
  const selWeekLectures = useMemo(() => {
    const dObj = new Date(selDate.getFullYear(), selDate.getMonth(), selDate.getDate());
    return allTasks.filter(t => t.type === 'lecture' && t.start && t.end && dObj >= t.start && dObj <= t.end);
  }, [selDate, allTasks]);

  // 사이드바: 선택 날짜 "당일" 마감 항목들 (D-day 순 정렬)
  const selDayDeadlineTasks = useMemo(() => {
    return allTasks.filter(t => t.dl && t.dl.toDateString() === selDate.toDateString())
                   .sort((a,b) => (getDday(a.dl) ?? 999) - (getDday(b.dl) ?? 999));
  }, [selDate, allTasks]);

  const sidebarTodo = useMemo(() => selDayDeadlineTasks.filter(t => !t.completed), [selDayDeadlineTasks]);
  const sidebarDone = useMemo(() => selDayDeadlineTasks.filter(t => t.completed), [selDayDeadlineTasks]);

  // 과목별 진도: 현재 주차 상단 고정 및 나머지 역순 정렬
  const sortedWeeks = useMemo(() => {
    if (!courses[selCourse]) return [];
    const today = new Date();
    const weeks = courses[selCourse].weeks.map((w, idx) => {
      const r = parseRange(w.period);
      return { ...w, origIndex: idx, isCurrent: r.start && r.end && today >= r.start && today <= r.end };
    });
    
    const current = weeks.filter(w => w.isCurrent);
    const others = weeks.filter(w => !w.isCurrent).reverse();
    return [...current, ...others];
  }, [courses, selCourse]);

  const handleAddCert = (e) => {
    e.preventDefault();
    if (!newCertName || !newCertDate) return alert('이름과 날짜를 입력해주세요.');
    const fullDateTime = `${newCertDate}T${newCertTime || '23:59'}:00`;
    if (addCert) addCert({ id: 'cert-' + Date.now(), name: newCertName, date: fullDateTime, completed: false, note: '' });
    setNewCertName(''); setNewCertDate(''); setNewCertTime('23:59'); setShowCertModal(false);
  };

  if (!loaded) return <div className="loading">로딩중...</div>;

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="header-inner">
          <h1 onClick={() => setTab('dash')}>📝 학점은행제 플래너</h1>
          <nav>
            <button className={tab === 'dash' ? 'active' : ''} onClick={() => setTab('dash')}>대시보드</button>
            <button className={tab === 'course' ? 'active' : ''} onClick={() => setTab('course')}>과목별 진도</button>
            <button className="add-btn" onClick={() => setShowCertModal(true)}>+ 일정/자격증 추가</button>
          </nav>
        </div>
      </header>

      <main className="content">
        {tab === 'dash' ? (
          <div className="dashboard-grid">
            <div className="left-col">
              <section className="card calendar-sec">
                <div className="cal-header">
                  <h2>{currMonth.getFullYear()}년 {currMonth.getMonth() + 1}월</h2>
                  <div className="cal-nav">
                    <button onClick={() => setCurrMonth(new Date(currMonth.getFullYear(), currMonth.getMonth() - 1, 1))}>&lt;</button>
                    <button onClick={() => setCurrMonth(new Date())}>오늘</button>
                    <button onClick={() => setCurrMonth(new Date(currMonth.getFullYear(), currMonth.getMonth() + 1, 1))}>&gt;</button>
                  </div>
                </div>
                <div className="cal-grid">
                  {['일', '월', '화', '수', '목', '금', '토'].map(d => <div key={d} className="cal-head">{d}</div>)}
                  {calendarDays.map((day, i) => {
                    const dObj = new Date(day.y, day.m, day.d);
                    const isSel = selDate.toDateString() === dObj.toDateString();
                    const isToday = new Date().toDateString() === dObj.toDateString();
                    const dayLecs = allTasks.filter(t => t.type === 'lecture' && !t.completed && t.dl?.toDateString() === dObj.toDateString());
                    const dayCerts = allTasks.filter(t => t.type === 'cert' && t.dl?.toDateString() === dObj.toDateString()); 

                    return (
                      <div key={i} className={`cal-day ${day.current ? '' : 'dim'} ${isSel ? 'selected' : ''}`} onClick={() => setSelDate(dObj)}>
                        <div className={`day-num ${isToday ? 'today' : ''}`}>{day.d}</div>
                        <div className="cal-events">
                          {dayCerts.map(c => <div key={c.id} className={`cal-bar cert ${c.completed ? 'done' : ''}`}>{c.title}</div>)}
                          {dayLecs.length > 0 && <div className="cal-pill">마감 +{dayLecs.length}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* 하단: 선택 날짜 기준 "진행 중인 주차" 할 일 (진도표 아님) */}
              <section className="card date-detail-sec">
                <h3>📅 {selDate.getMonth() + 1}월 {selDate.getDate()}일 수강 가능 강의</h3>
                <div className="detail-task-list">
                  {selWeekLectures.length > 0 ? selWeekLectures.map(t => (
                    <label key={t.id} className={`detail-task-item ${t.completed ? 'completed' : ''}`}>
                      <input type="checkbox" checked={t.completed} onChange={() => toggleLecture(t.ci, t.wi, t.li)} />
                      <span className="badge" style={{ background: t.col.light, color: t.col.text }}>{t.cname} {t.week}주차</span>
                      <span className="title">{t.title}</span>
                    </label>
                  )) : <div className="empty-msg">진행 중인 주차의 강의가 없습니다.</div>}
                </div>
              </section>
            </div>

            <aside className="right-col card">
              <div className="sidebar-header"><h3>⏰ {selDate.getDate()}일 마감 일정</h3></div>
              <div className="task-tabs">
                <button className={taskMode === 'todo' ? 'active' : ''} onClick={() => setTaskMode('todo')}>📌 해야 할 일</button>
                <button className={taskMode === 'done' ? 'active' : ''} onClick={() => setTaskMode('done')}>✅ 한 일</button>
              </div>
              <div className="task-list">
                {(taskMode === 'todo' ? sidebarTodo : sidebarDone).map(t => (
                  <label key={t.id} className="task-card">
                    <input type="checkbox" checked={t.completed} onChange={() => t.type === 'lecture' ? toggleLecture(t.ci, t.wi, t.li) : toggleCert(t.id)} />
                    <div className="info">
                      <span className="cname" style={{ color: t.col.text, background: t.col.light }}>{t.cname}</span>
                      <p className={`title ${t.completed ? 'strike' : ''}`}>{t.time && <small>[{t.time}] </small>}{t.title}</p>
                    </div>
                    <div className={`dday-badge ${getDday(t.dl) <= 3 && !t.completed ? 'urgent' : ''}`}>{ddayText(getDday(t.dl))}</div>
                  </label>
                ))}
                {(taskMode === 'todo' ? sidebarTodo : sidebarDone).length === 0 && <div className="empty-msg">마감 일정이 없습니다.</div>}
              </div>
            </aside>
          </div>
        ) : (
          <div className="course-view card">
            <div className="course-nav">
              {courses.map((c, i) => (
                <button key={c.id} className={selCourse === i ? 'active' : ''} onClick={() => setSelCourse(i)}>{c.courseName}</button>
              ))}
            </div>
            <div className="week-list">
              {sortedWeeks.map((w) => (
                <div key={w.origIndex} className={`week-card ${w.isCurrent ? 'active-week' : ''} ${w.lectures.every(l => l.completed) ? 'done' : ''}`}>
                  <div className="week-info">
                    <h3>{w.isCurrent && '🔥 '}{w.week}주차</h3>
                    <span className="period">{w.period}</span>
                  </div>
                  <div className="lec-list">
                    {w.lectures.map((l, li) => (
                      <label key={li} className="lec-item">
                        <input type="checkbox" checked={l.completed} onChange={() => toggleLecture(selCourse, w.origIndex, li)} />
                        <span className={l.completed ? 'strike' : ''}>{l.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showCertModal && (
          <div className="modal-overlay" onClick={() => setShowCertModal(false)}>
            <div className="modal-content card" onClick={e => e.stopPropagation()}>
              <h3>일정 / 자격증 추가</h3>
              <form onSubmit={handleAddCert}>
                <div className="input-group"><label>이름</label><input type="text" value={newCertName} onChange={e => setNewCertName(e.target.value)} required /></div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div className="input-group" style={{ flex: 1 }}><label>날짜</label><input type="date" value={newCertDate} onChange={e => setNewCertDate(e.target.value)} required /></div>
                  <div className="input-group" style={{ width: '120px' }}><label>시간</label><input type="time" value={newCertTime} onChange={e => setNewCertTime(e.target.value)} /></div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowCertModal(false)}>취소</button>
                  <button type="submit" className="btn-submit">추가</button>
                </div>
              </form>
              {certs.length > 0 && (
                <div className="cert-manage-list">
                  {certs.map(c => <div key={c.id} className="cert-manage-item"><span>{c.name} ({c.date.split('T')[0]})</span><button onClick={() => deleteCert(c.id)}>삭제</button></div>)}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}