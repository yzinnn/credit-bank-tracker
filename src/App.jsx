import React, { useState, useMemo } from 'react';
import './App.css';
import { useStorage } from './useStorage';
import { COURSE_COLORS } from './data';

/* ─── 유틸 ─── */
// 멍청하게 날려먹었던 시작일~종료일 추출 로직 복구
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
  
  // 자격증/일정 추가 모달 상태
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
      const range = parseRange(w.period); // 시작일과 마감일 모두 가져옴
      w.lectures.forEach((l, li) => {
        items.push({ 
          type: 'lecture', id: `l-${ci}-${wi}-${li}`, ci, wi, li, 
          title: l.title, cname: c.courseName, week: w.week, 
          start: range.start, end: range.end, dl: range.end, // start, end 정보 부활
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

  const todoTasks = useMemo(() => allTasks.filter(t => !t.completed).sort((a, b) => (getDday(a.dl) ?? 9999) - (getDday(b.dl) ?? 9999)), [allTasks]);
  const doneTasks = useMemo(() => allTasks.filter(t => t.completed).sort((a, b) => (getDday(b.dl) ?? 0) - (getDday(a.dl) ?? 0)), [allTasks]);

  // 해당 일자 '할 일 목록' (마감뿐만 아니라 수강 기간 내에 포함되면 무조건 표시)
  const selDayTasks = useMemo(() => {
    const dObj = new Date(selDate.getFullYear(), selDate.getMonth(), selDate.getDate());
    return allTasks.filter(t => {
      if (t.type === 'lecture') {
        if (!t.start || !t.end) return false;
        const s = new Date(t.start.getFullYear(), t.start.getMonth(), t.start.getDate());
        const e = new Date(t.end.getFullYear(), t.end.getMonth(), t.end.getDate());
        return dObj >= s && dObj <= e; // 선택한 날짜가 수강 기간 안에 있으면 전부 노출
      } else {
        if (!t.dl) return false;
        const dl = new Date(t.dl.getFullYear(), t.dl.getMonth(), t.dl.getDate());
        return dObj.getTime() === dl.getTime(); // 자격증/일정은 해당 날짜에만 노출
      }
    });
  }, [selDate, allTasks]);

  const handleAddCert = (e) => {
    e.preventDefault();
    if (!newCertName || !newCertDate) return alert('이름과 날짜를 입력해주세요.');
    const timeStr = newCertTime || '23:59';
    const fullDateTime = `${newCertDate}T${timeStr}:00`;

    if (addCert) {
      addCert({ id: 'cert-' + Date.now(), name: newCertName, date: fullDateTime, completed: false, note: '' });
    } else {
      alert('useStorage.js에 addCert 함수가 필요합니다.');
    }
    setNewCertName('');
    setNewCertDate('');
    setNewCertTime('23:59');
    setShowCertModal(false);
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
                    
                    // 달력 셀 안에는 '마감'인 것만 +N건으로 지저분하지 않게 표시
                    const dayLecs = todoTasks.filter(t => t.type === 'lecture' && t.dl?.toDateString() === dObj.toDateString());
                    const dayCerts = allTasks.filter(t => t.type === 'cert' && t.dl?.toDateString() === dObj.toDateString()); 

                    return (
                      <div key={i} className={`cal-day ${day.current ? '' : 'dim'} ${isSel ? 'selected' : ''}`} onClick={() => setSelDate(dObj)}>
                        <div className={`day-num ${isToday ? 'today' : ''}`}>{day.d}</div>
                        <div className="cal-events">
                          {dayCerts.map(c => (
                            <div key={c.id} className={`cal-bar cert ${c.completed ? 'done' : ''}`} title={c.title}>
                              {c.time ? `[${c.time}] ` : ''}{c.title}
                            </div>
                          ))}
                          {dayLecs.length > 0 && (
                            <div className="cal-pill">마감 +{dayLecs.length}건</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* 하단: 마감 목록 -> '할 일 목록'으로 수정 */}
              <section className="card date-detail-sec">
                <h3>📅 {selDate.getMonth() + 1}월 {selDate.getDate()}일 할 일 목록</h3>
                <div className="detail-task-list">
                  {selDayTasks.length > 0 ? selDayTasks.map(t => (
                    <label key={t.id} className={`detail-task-item ${t.completed ? 'completed' : ''}`}>
                      <input 
                        type="checkbox" 
                        checked={t.completed} 
                        onChange={() => t.type === 'lecture' ? toggleLecture(t.ci, t.wi, t.li) : toggleCert(t.id)} 
                      />
                      <span className="badge" style={{ background: t.col.light, color: t.col.text }}>{t.cname}</span>
                      <span className="title">
                        {t.time && <span style={{ color: '#059669', marginRight: '6px', fontWeight: '800' }}>{t.time}</span>}
                        {t.title}
                      </span>
                    </label>
                  )) : (
                    <div className="empty-msg">해당 날짜에 할 일이나 마감 일정이 없습니다.</div>
                  )}
                </div>
              </section>
            </div>

            <aside className="right-col card">
              <div className="task-tabs">
                <button className={taskMode === 'todo' ? 'active' : ''} onClick={() => setTaskMode('todo')}>📌 해야 할 일</button>
                <button className={taskMode === 'done' ? 'active' : ''} onClick={() => setTaskMode('done')}>✅ 한 일</button>
              </div>
              <div className="task-list">
                {(taskMode === 'todo' ? todoTasks : doneTasks).map(t => {
                  const d = getDday(t.dl);
                  const isUrgent = d !== null && d <= 3 && !t.completed;
                  return (
                    <label key={t.id} className="task-card">
                      <input 
                        type="checkbox" 
                        checked={t.completed} 
                        onChange={() => t.type === 'lecture' ? toggleLecture(t.ci, t.wi, t.li) : toggleCert(t.id)} 
                      />
                      <div className="info">
                        <span className="cname" style={{ color: t.col.text, background: t.col.light }}>{t.cname} {t.week ? `${t.week}주차` : ''}</span>
                        <p className={`title ${t.completed ? 'strike' : ''}`}>
                          {t.time && <span style={{ color: '#059669', marginRight: '6px', fontWeight: '800' }}>{t.time}</span>}
                          {t.title}
                        </p>
                      </div>
                      <div className={`dday-badge ${isUrgent ? 'urgent' : ''}`}>{ddayText(d)}</div>
                    </label>
                  );
                })}
                {(taskMode === 'todo' ? todoTasks : doneTasks).length === 0 && (
                  <div className="empty-msg">목록이 비어있습니다.</div>
                )}
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
              {courses[selCourse].weeks.slice().reverse().map((w, wi) => {
                const origIndex = courses[selCourse].weeks.length - 1 - wi; 
                return (
                  <div key={wi} className={`week-card ${w.lectures.every(l => l.completed) ? 'done' : ''}`}>
                    <div className="week-info">
                      <h3>{w.week}주차</h3>
                      <span className="period">{w.period}</span>
                    </div>
                    <div className="lec-list">
                      {w.lectures.map((l, li) => (
                        <label key={li} className="lec-item">
                          <input type="checkbox" checked={l.completed} onChange={() => toggleLecture(selCourse, origIndex, li)} />
                          <span className={l.completed ? 'strike' : ''}>{l.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {showCertModal && (
          <div className="modal-overlay" onClick={() => setShowCertModal(false)}>
            <div className="modal-content card" onClick={e => e.stopPropagation()}>
              <h3>새로운 일정 / 자격증 추가</h3>
              <form onSubmit={handleAddCert}>
                <div className="input-group">
                  <label>일정 이름</label>
                  <input type="text" value={newCertName} onChange={e => setNewCertName(e.target.value)} placeholder="예: 정보처리기사 필기" required />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>날짜 (마감일)</label>
                    <input type="date" value={newCertDate} onChange={e => setNewCertDate(e.target.value)} required />
                  </div>
                  <div className="input-group" style={{ width: '130px' }}>
                    <label>시간</label>
                    <input type="time" value={newCertTime} onChange={e => setNewCertTime(e.target.value)} required />
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowCertModal(false)}>취소</button>
                  <button type="submit" className="btn-submit">추가하기</button>
                </div>
              </form>
              
              {certs.length > 0 && (
                <div className="cert-manage-list">
                  <h4>등록된 일정 관리</h4>
                  {certs.map(c => {
                    const d = c.date.includes('T') ? new Date(c.date) : new Date(c.date + 'T23:59:59');
                    const formatDt = `${d.getFullYear()}.${d.getMonth()+1}.${d.getDate()} ${d.toLocaleTimeString('ko-KR', {hour:'2-digit', minute:'2-digit', hour12:false})}`;
                    return (
                      <div key={c.id} className="cert-manage-item">
                        <span>{c.name} <br/><small style={{color: '#9CA3AF'}}>{formatDt}</small></span>
                        <button onClick={() => deleteCert(c.id)}>삭제</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}