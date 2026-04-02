import React, { useState, useMemo } from 'react';
import './App.css';
import { useStorage } from './useStorage';
import { COURSE_COLORS } from './data';

/* ─── 유틸 ─── */
function parseDeadline(periodStr, year = 2026) {
  if (!periodStr) return null;
  const parts = periodStr.split('~').map(s => s.trim());
  if (parts.length < 2) return null;
  const [em, ed] = parts[1].split('-').map(Number);
  return new Date(year, em - 1, ed, 23, 59, 59);
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
  // useStorage에서 addCert, deleteCert 등 자격증 관련 함수를 가져옵니다.
  const { courses, certs, loaded, toggleLecture, toggleCert, addCert, deleteCert } = useStorage();
  
  const [tab, setTab] = useState('dash');
  const [selCourse, setSelCourse] = useState(0);
  const [taskMode, setTaskMode] = useState('todo'); 
  const [currMonth, setCurrMonth] = useState(new Date());
  const [selDate, setSelDate] = useState(new Date());
  
  // 자격증 추가 모달 상태
  const [showCertModal, setShowCertModal] = useState(false);
  const [newCertName, setNewCertName] = useState('');
  const [newCertDate, setNewCertDate] = useState('');

  // 달력 배열 생성
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

  // 전체 할 일 목록
  const allTasks = useMemo(() => {
    const items = [];
    courses.forEach((c, ci) => c.weeks.forEach((w, wi) => {
      const dl = parseDeadline(w.period);
      w.lectures.forEach((l, li) => {
        items.push({ type: 'lecture', id: `l-${ci}-${wi}-${li}`, ci, wi, li, title: l.title, cname: c.courseName, week: w.week, dl, completed: l.completed, col: COURSE_COLORS[ci] });
      });
    }));
    certs.forEach(cert => {
      const d = new Date(cert.date + 'T23:59:59');
      items.push({ type: 'cert', id: cert.id, title: cert.name, cname: '일정/자격증', dl: d, completed: cert.completed, col: { text: '#059669', light: '#D1FAE5' } });
    });
    return items;
  }, [courses, certs]);

  // D-day 오름차순 (가장 급한 것부터)
  const todoTasks = useMemo(() => allTasks.filter(t => !t.completed).sort((a, b) => (getDday(a.dl) ?? 9999) - (getDday(b.dl) ?? 9999)), [allTasks]);
  const doneTasks = useMemo(() => allTasks.filter(t => t.completed).sort((a, b) => (getDday(b.dl) ?? 0) - (getDday(a.dl) ?? 0)), [allTasks]);

  // 선택된 날짜의 할 일 추출 (해야 할 일 + 한 일 모두 표시)
  const selDayTasks = useMemo(() => {
    return allTasks.filter(t => t.dl && t.dl.toDateString() === selDate.toDateString());
  }, [selDate, allTasks]);

  // 자격증 추가 핸들러
  const handleAddCert = (e) => {
    e.preventDefault();
    if (!newCertName || !newCertDate) return alert('이름과 날짜를 입력해주세요.');
    // addCert 함수가 없는 구버전 useStorage를 대비한 방어 코드
    if (addCert) {
      addCert({ id: 'cert-' + Date.now(), name: newCertName, date: newCertDate, completed: false, note: '' });
    } else {
      alert('useStorage.js에 addCert 함수가 필요합니다.');
    }
    setNewCertName('');
    setNewCertDate('');
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
            
            {/* 좌측: 달력 + 선택 날짜 액션 리스트 */}
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
                    
                    // 해당 날짜의 마감 항목 찾기
                    const dayLecs = todoTasks.filter(t => t.type === 'lecture' && t.dl?.toDateString() === dObj.toDateString());
                    const dayCerts = allTasks.filter(t => t.type === 'cert' && t.dl?.toDateString() === dObj.toDateString()); // 자격증은 완료돼도 달력에 표시

                    return (
                      <div key={i} className={`cal-day ${day.current ? '' : 'dim'} ${isSel ? 'selected' : ''}`} onClick={() => setSelDate(dObj)}>
                        <div className={`day-num ${isToday ? 'today' : ''}`}>{day.d}</div>
                        <div className="cal-events">
                          {/* 자격증/일정은 이름을 그대로 띄움 */}
                          {dayCerts.map(c => (
                            <div key={c.id} className={`cal-bar cert ${c.completed ? 'done' : ''}`} title={c.title}>
                              {c.title}
                            </div>
                          ))}
                          {/* 강의는 숫자로만 심플하게 표시 */}
                          {dayLecs.length > 0 && (
                            <div className="cal-pill">마감 +{dayLecs.length}건</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* 하단: 선택한 날짜의 할 일 (체크박스 연동) */}
              <section className="card date-detail-sec">
                <h3>📅 {selDate.getMonth() + 1}월 {selDate.getDate()}일 마감 항목</h3>
                <div className="detail-task-list">
                  {selDayTasks.length > 0 ? selDayTasks.map(t => (
                    <label key={t.id} className={`detail-task-item ${t.completed ? 'completed' : ''}`}>
                      <input 
                        type="checkbox" 
                        checked={t.completed} 
                        onChange={() => t.type === 'lecture' ? toggleLecture(t.ci, t.wi, t.li) : toggleCert(t.id)} 
                      />
                      <span className="badge" style={{ background: t.col.light, color: t.col.text }}>{t.cname}</span>
                      <span className="title">{t.title}</span>
                    </label>
                  )) : (
                    <div className="empty-msg">해당 날짜에 마감되는 항목이 없습니다.</div>
                  )}
                </div>
              </section>
            </div>

            {/* 우측: 사이드바 할일 (D-Day 급한 순 정렬) */}
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
                        <p className={`title ${t.completed ? 'strike' : ''}`}>{t.title}</p>
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
          
          /* ══ 과목별 진도 페이지 (최신 주차 상단) ══ */
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

        {/* 자격증/일정 추가 모달 */}
        {showCertModal && (
          <div className="modal-overlay" onClick={() => setShowCertModal(false)}>
            <div className="modal-content card" onClick={e => e.stopPropagation()}>
              <h3>새로운 일정 / 자격증 추가</h3>
              <form onSubmit={handleAddCert}>
                <div className="input-group">
                  <label>일정 이름</label>
                  <input type="text" value={newCertName} onChange={e => setNewCertName(e.target.value)} placeholder="예: 정보처리기사 필기" required />
                </div>
                <div className="input-group">
                  <label>날짜 (마감일)</label>
                  <input type="date" value={newCertDate} onChange={e => setNewCertDate(e.target.value)} required />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowCertModal(false)}>취소</button>
                  <button type="submit" className="btn-submit">추가하기</button>
                </div>
              </form>
              
              {/* 기존 등록된 일정 삭제 영역 */}
              {certs.length > 0 && (
                <div className="cert-manage-list">
                  <h4>등록된 일정 관리</h4>
                  {certs.map(c => (
                    <div key={c.id} className="cert-manage-item">
                      <span>{c.name} ({c.date})</span>
                      <button onClick={() => deleteCert(c.id)}>삭제</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}