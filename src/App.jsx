import React, { useState, useMemo } from 'react';
import './App.css';
import { useStorage } from './useStorage';
import { ACADEMIC_SCHEDULE, COURSE_COLORS } from './data';

/* ─── 유틸 ─── */
function parseDate(dStr) { return new Date(dStr + 'T00:00:00'); }
function getDday(targetDate) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  return Math.ceil((target - today) / 864e5);
}

export default function App() {
  const { courses, certs, loaded, toggleLecture, toggleCert } = useStorage();
  const [tab, setTab] = useState('dash');
  const [selCourse, setSelCourse] = useState(0);
  const [taskMode, setTaskMode] = useState('todo'); // todo | done
  const [currMonth, setCurrMonth] = useState(new Date());
  const [selDate, setSelDate] = useState(new Date());

  // 1. 달력 생성 로직
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

  // 2. 전체 할 일 목록 (D-Day 정렬)
  const allTasks = useMemo(() => {
    const items = [];
    courses.forEach((c, ci) => c.weeks.forEach((w, wi) => {
      const dl = w.period.split(' ~ ')[1] ? parseDate(`2026-${w.period.split(' ~ ')[1]}`) : null;
      w.lectures.forEach((l, li) => {
        items.push({ type: 'lecture', id: `${ci}-${wi}-${li}`, ci, wi, li, title: l.title, cname: c.courseName, dl, completed: l.completed, col: COURSE_COLORS[ci] });
      });
    }));
    certs.forEach(cert => {
      items.push({ type: 'cert', id: cert.id, title: cert.name, dl: parseDate(cert.date), completed: cert.completed, col: { text: '#10B981', light: '#ECFDF5' } });
    });
    return items;
  }, [courses, certs]);

  const todoTasks = useMemo(() => allTasks.filter(t => !t.completed).sort((a, b) => (getDday(a.dl) || 999) - (getDday(b.dl) || 999)), [allTasks]);
  const doneTasks = useMemo(() => allTasks.filter(t => t.completed).sort((a, b) => (getDday(b.dl) || 0) - (getDday(a.dl) || 0)), [allTasks]);

  // 3. 선택한 날짜의 할 일
  const dateTasks = useMemo(() => {
    const dStr = selDate.toISOString().split('T')[0];
    return allTasks.filter(t => t.dl && t.dl.toISOString().split('T')[0] === dStr);
  }, [selDate, allTasks]);

  if (!loaded) return <div className="loading">로딩중...</div>;

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="header-inner">
          <h1 onClick={() => setTab('dash')}>학점은행제 플래너</h1>
          <nav>
            <button className={tab === 'dash' ? 'active' : ''} onClick={() => setTab('dash')}>대시보드</button>
            <button className={tab === 'course' ? 'active' : ''} onClick={() => setTab('course')}>과목별 진도</button>
          </nav>
        </div>
      </header>

      <main className="content">
        {tab === 'dash' ? (
          <div className="dashboard-grid">
            {/* 왼쪽: 달력 */}
            <section className="calendar-sec card">
              <div className="cal-header">
                <h2>{currMonth.getFullYear()}년 {currMonth.getMonth() + 1}월</h2>
                <div className="cal-nav">
                  <button onClick={() => setCurrMonth(new Date(currMonth.setMonth(currMonth.getMonth() - 1)))}>이전</button>
                  <button onClick={() => setCurrMonth(new Date(currMonth.setMonth(currMonth.getMonth() + 1)))}>다음</button>
                </div>
              </div>
              <div className="cal-grid">
                {['일', '월', '화', '수', '목', '금', '토'].map(d => <div key={d} className="cal-head">{d}</div>)}
                {calendarDays.map((day, i) => {
                  const dObj = new Date(day.y, day.m, day.d);
                  const isSel = selDate.toDateString() === dObj.toDateString();
                  const dayTasks = allTasks.filter(t => t.dl && t.dl.toDateString() === dObj.toDateString());
                  const daySched = ACADEMIC_SCHEDULE.filter(s => parseDate(s.endDate).toDateString() === dObj.toDateString());
                  
                  return (
                    <div key={i} className={`cal-day ${day.current ? '' : 'dim'} ${isSel ? 'selected' : ''}`} onClick={() => setSelDate(dObj)}>
                      <span className="day-num">{day.d}</span>
                      <div className="day-dots">
                        {dayTasks.length > 0 && <span className="task-count">+{dayTasks.length}</span>}
                        {daySched.map((s, si) => <div key={si} className="sched-dot" title={s.title}></div>)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="sel-date-tasks">
                <h3>{selDate.getMonth() + 1}월 {selDate.getDate()}일 마감 항목</h3>
                {dateTasks.length > 0 ? dateTasks.map(t => (
                  <div key={t.id} className="mini-task-card">
                    <span className="dot" style={{ background: t.col.text }}></span>
                    <span className="title">{t.title}</span>
                  </div>
                )) : <p className="empty-text">마감 일정이 없습니다.</p>}
              </div>
            </section>

            {/* 오른쪽: 사이드바 할 일 목록 */}
            <aside className="task-sidebar card">
              <div className="task-tabs">
                <button className={taskMode === 'todo' ? 'active' : ''} onClick={() => setTaskMode('todo')}>해야 할 일</button>
                <button className={taskMode === 'done' ? 'active' : ''} onClick={() => setTaskMode('done')}>한 일</button>
              </div>
              <div className="task-list">
                {(taskMode === 'todo' ? todoTasks : doneTasks).map(t => (
                  <div key={t.id} className="task-card" onClick={() => t.type === 'lecture' ? toggleLecture(t.ci, t.wi, t.li) : toggleCert(t.id)}>
                    <input type="checkbox" checked={t.completed} readOnly />
                    <div className="info">
                      <span className="cname" style={{ color: t.col.text }}>{t.cname || '자격증'}</span>
                      <p className="title">{t.title}</p>
                    </div>
                    {t.dl && <span className={`dday ${getDday(t.dl) <= 3 ? 'urgent' : ''}`}>D-{getDday(t.dl)}</span>}
                  </div>
                ))}
              </div>
            </aside>
          </div>
        ) : (
          /* 과목별 진도 페이지 */
          <div className="course-view">
            <div className="course-nav">
              {courses.map((c, i) => (
                <button key={c.id} className={selCourse === i ? 'active' : ''} onClick={() => setSelCourse(i)}>{c.courseName}</button>
              ))}
            </div>
            <div className="week-list">
              {courses[selCourse].weeks.slice().reverse().map((w, wi) => (
                <div key={wi} className={`week-card ${w.lectures.every(l => l.completed) ? 'done' : ''}`}>
                  <div className="week-info">
                    <h3>{w.week}주차</h3>
                    <span className="period">{w.period}</span>
                  </div>
                  <div className="lec-list">
                    {w.lectures.map((l, li) => (
                      <div key={li} className="lec-item" onClick={() => toggleLecture(selCourse, courses[selCourse].weeks.length - 1 - wi, li)}>
                        <input type="checkbox" checked={l.completed} readOnly />
                        <span>{l.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}