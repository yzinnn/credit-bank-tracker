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

// 이번 주에 해당하는 주차 인덱스 찾기
function getCurrentWeekIdx(weeks) {
  const today = new Date();
  for (let i = 0; i < weeks.length; i++) {
    const r = parseRange(weeks[i].period);
    if (r.start && r.end && today >= r.start && today <= r.end) return i;
  }
  for (let i = 0; i < weeks.length; i++) {
    const r = parseRange(weeks[i].period);
    if (r.start && r.start > today) return i;
  }
  return 0;
}

export default function App() {
  const { courses, certs, loaded, toggleLecture, saveCert, toggleCert, deleteCert } = useStorage();
  
  const [tab, setTab] = useState('dash');
  const [selCourse, setSelCourse] = useState(0);
  const [taskMode, setTaskMode] = useState('todo'); 
  const [courseFilter, setCourseFilter] = useState('all');
  const [currMonth, setCurrMonth] = useState(new Date());
  const [selDate, setSelDate] = useState(new Date());
  const [summaryOpen, setSummaryOpen] = useState(true);
  
  // 자격증/일정 모달
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

  // 과목별 통계
  const courseStats = useMemo(() => {
    let totalAll = 0, doneAll = 0;
    const perCourse = courses.map((c, i) => {
      let t = 0, d = 0;
      c.weeks.forEach(w => w.lectures.forEach(l => { t++; totalAll++; if (l.completed) { d++; doneAll++; } }));
      return { name: c.courseName, total: t, done: d, pct: t ? Math.round(d / t * 100) : 0, color: COURSE_COLORS[i] };
    });
    return { totalAll, doneAll, pctAll: totalAll ? Math.round(doneAll / totalAll * 100) : 0, perCourse };
  }, [courses]);

  const allTasks = useMemo(() => {
    const items = [];
    courses.forEach((c, ci) => c.weeks.forEach((w, wi) => {
      const range = parseRange(w.period);
      w.lectures.forEach((l, li) => {
        items.push({ 
          type: 'lecture', id: `l-${ci}-${wi}-${li}`, ci, wi, li, cid: c.id,
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

  const todoTasks = useMemo(() => {
    let items = allTasks.filter(t => !t.completed);
    if (courseFilter !== 'all') {
      items = items.filter(t => {
        if (t.type === 'cert') return courseFilter === 'cert';
        return t.cid === courseFilter;
      });
    }
    return items.sort((a, b) => (getDday(a.dl) ?? 9999) - (getDday(b.dl) ?? 9999));
  }, [allTasks, courseFilter]);

  const doneTasks = useMemo(() => {
    let items = allTasks.filter(t => t.completed);
    if (courseFilter !== 'all') {
      items = items.filter(t => {
        if (t.type === 'cert') return courseFilter === 'cert';
        return t.cid === courseFilter;
      });
    }
    return items.sort((a, b) => (getDday(b.dl) ?? 0) - (getDday(a.dl) ?? 0));
  }, [allTasks, courseFilter]);

  const selDayTasks = useMemo(() => {
    const dObj = new Date(selDate.getFullYear(), selDate.getMonth(), selDate.getDate());
    return allTasks.filter(t => {
      if (t.type === 'lecture') {
        if (!t.start || !t.end) return false;
        const s = new Date(t.start.getFullYear(), t.start.getMonth(), t.start.getDate());
        const e = new Date(t.end.getFullYear(), t.end.getMonth(), t.end.getDate());
        return dObj >= s && dObj <= e;
      } else {
        if (!t.dl) return false;
        const dl = new Date(t.dl.getFullYear(), t.dl.getMonth(), t.dl.getDate());
        return dObj.getTime() === dl.getTime();
      }
    });
  }, [selDate, allTasks]);

  const handleAddCert = (e) => {
    e.preventDefault();
    if (!newCertName || !newCertDate) return alert('이름과 날짜를 입력해주세요.');
    const timeStr = newCertTime || '23:59';
    const fullDateTime = `${newCertDate}T${timeStr}:00`;
    saveCert({ id: 'cert-' + Date.now(), name: newCertName, date: fullDateTime, completed: false, note: '' });
    setNewCertName('');
    setNewCertDate('');
    setNewCertTime('23:59');
    setShowCertModal(false);
  };

  if (!loaded) return <div className="loading"><div><div className="spinner"></div><p style={{color:'#9CA3AF',fontSize:13}}>불러오는 중...</p></div></div>;

  return (
    <div className="app-container">
      {/* ─── 헤더 ─── */}
      <header className="main-header">
        <div className="header-inner">
          <h1 onClick={() => setTab('dash')}>2026-1 학점은행제 <span style={{fontSize:13,fontWeight:500,color:'#9CA3AF',marginLeft:6}}>{courseStats.doneAll}/{courseStats.totalAll} ({courseStats.pctAll}%)</span></h1>
          <nav>
            <button className={tab === 'dash' ? 'active' : ''} onClick={() => setTab('dash')}>대시보드</button>
            <button className={tab === 'course' ? 'active' : ''} onClick={() => setTab('course')}>과목별 진도</button>
            <button className="add-btn" onClick={() => setShowCertModal(true)}>+ 일정/자격증</button>
          </nav>
        </div>
      </header>

      <main className="content">
        {/* ═══════════ 대시보드 ═══════════ */}
        {tab === 'dash' ? (
          <div className="dashboard-grid">
            <div className="left-col">
              {/* 과목별 진도 요약 카드 */}
              <section className="card" style={{padding:0}}>
                <div style={{padding:'16px 20px',borderBottom:'1px solid #E5E7EB',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}} onClick={()=>setSummaryOpen(v=>!v)}>
                  <h2 style={{fontSize:15,fontWeight:800}}>과목별 진도 현황</h2>
                  <span style={{fontSize:13,color:'#6B7280',transition:'.2s',transform:summaryOpen?'rotate(180deg)':''}}>▼</span>
                </div>
                {summaryOpen && <div style={{padding:'14px 20px',display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:8}}>
                  {courseStats.perCourse.map((p,i) => <div key={i} style={{padding:'10px 12px',borderRadius:10,border:'1px solid #E5E7EB',borderLeft:`3px solid ${p.color.border}`,cursor:'pointer'}} onClick={()=>{setSelCourse(i);setTab('course');}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                      <span style={{fontSize:12,fontWeight:700,color:p.color.text}}>{p.name}</span>
                      <span style={{fontSize:10,fontWeight:600,color:'#9CA3AF'}}>{p.done}/{p.total}</span>
                    </div>
                    <div style={{height:5,background:'#E5E7EB',borderRadius:99,overflow:'hidden'}}>
                      <div style={{width:`${p.pct}%`,height:'100%',background:p.color.border,borderRadius:99,transition:'width .3s'}}/>
                    </div>
                  </div>)}
                </div>}
              </section>

              {/* 달력 */}
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
                  {['일','월','화','수','목','금','토'].map(d => <div key={d} className="cal-head">{d}</div>)}
                  {calendarDays.map((day, i) => {
                    const dObj = new Date(day.y, day.m, day.d);
                    const isSel = selDate.toDateString() === dObj.toDateString();
                    const isToday = new Date().toDateString() === dObj.toDateString();
                    const dayLecs = todoTasks.filter(t => t.type === 'lecture' && t.dl?.toDateString() === dObj.toDateString());
                    const dayCerts = allTasks.filter(t => t.type === 'cert' && t.dl?.toDateString() === dObj.toDateString());
                    return (
                      <div key={i} className={`cal-day ${day.current?'':'dim'} ${isSel?'selected':''}`} onClick={() => setSelDate(dObj)}>
                        <div className={`day-num ${isToday?'today':''}`}>{day.d}</div>
                        <div className="cal-events">
                          {dayCerts.map(c => <div key={c.id} className={`cal-bar cert ${c.completed?'done':''}`}>{c.time?`[${c.time}] `:''}{c.title}</div>)}
                          {dayLecs.length > 0 && <div className="cal-pill">마감 +{dayLecs.length}건</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* 날짜별 할 일 */}
              <section className="card date-detail-sec">
                <h3>{selDate.getMonth()+1}월 {selDate.getDate()}일 할 일</h3>
                <div className="detail-task-list">
                  {selDayTasks.length > 0 ? selDayTasks.map(t => (
                    <label key={t.id} className={`detail-task-item ${t.completed?'completed':''}`}>
                      <input type="checkbox" checked={t.completed} onChange={() => t.type === 'lecture' ? toggleLecture(t.ci, t.wi, t.li) : toggleCert(t.id)} />
                      <span className="badge" style={{background:t.col.light,color:t.col.text}}>{t.cname}</span>
                      <span className="title">{t.time && <span style={{color:'#059669',marginRight:6,fontWeight:800}}>{t.time}</span>}{t.title}</span>
                      {!t.completed && <span className={`dday-badge ${(getDday(t.dl)??99)<=3?'urgent':''}`}>{ddayText(getDday(t.dl))}</span>}
                    </label>
                  )) : <div className="empty-msg">이 날짜에 할 일이 없습니다.</div>}
                </div>
              </section>
            </div>

            {/* ─── 사이드바 ─── */}
            <aside className="right-col card">
              <div className="task-tabs">
                <button className={taskMode === 'todo' ? 'active' : ''} onClick={() => setTaskMode('todo')}>할 일 ({allTasks.filter(t=>!t.completed).length})</button>
                <button className={taskMode === 'done' ? 'active' : ''} onClick={() => setTaskMode('done')}>한 일 ({allTasks.filter(t=>t.completed).length})</button>
              </div>
              {/* 과목 필터 */}
              <div style={{display:'flex',gap:4,padding:'8px 12px',borderBottom:'1px solid #E5E7EB',overflowX:'auto',flexShrink:0}}>
                <button onClick={()=>setCourseFilter('all')} style={{padding:'4px 10px',borderRadius:6,fontSize:11,fontWeight:700,border:'1px solid #E5E7EB',whiteSpace:'nowrap',background:courseFilter==='all'?'#1F2937':'#fff',color:courseFilter==='all'?'#fff':'#6B7280'}}>전체</button>
                {courses.map(c=><button key={c.id} onClick={()=>setCourseFilter(c.id)} style={{padding:'4px 10px',borderRadius:6,fontSize:11,fontWeight:700,border:'1px solid #E5E7EB',whiteSpace:'nowrap',background:courseFilter===c.id?'#1F2937':'#fff',color:courseFilter===c.id?'#fff':'#6B7280'}}>{c.courseName}</button>)}
              </div>
              <div className="task-list">
                {(taskMode === 'todo' ? todoTasks : doneTasks).map(t => {
                  const d = getDday(t.dl);
                  const isUrgent = d !== null && d <= 3 && !t.completed;
                  return (
                    <label key={t.id} className="task-card">
                      <input type="checkbox" checked={t.completed} onChange={() => t.type === 'lecture' ? toggleLecture(t.ci, t.wi, t.li) : toggleCert(t.id)} />
                      <div className="info">
                        <span className="cname" style={{color:t.col.text,background:t.col.light}}>{t.cname} {t.week ? `${t.week}주차`:''}</span>
                        <p className={`title ${t.completed?'strike':''}`}>{t.time && <span style={{color:'#059669',marginRight:6,fontWeight:800}}>{t.time}</span>}{t.title}</p>
                      </div>
                      <div className={`dday-badge ${isUrgent?'urgent':''}`}>{ddayText(d)}</div>
                    </label>
                  );
                })}
                {(taskMode === 'todo' ? todoTasks : doneTasks).length === 0 && <div className="empty-msg">목록이 비어있습니다.</div>}
              </div>
            </aside>
          </div>
        ) : (
          /* ═══════════ 과목별 진도 ═══════════ */
          <div className="course-view card">
            {/* 전과목 진도 요약 (접기/펴기) */}
            <div style={{padding:'16px 20px',borderBottom:'1px solid #E5E7EB'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}} onClick={()=>setSummaryOpen(v=>!v)}>
                <h2 style={{fontSize:15,fontWeight:800}}>전과목 진도 현황 ({courseStats.doneAll}/{courseStats.totalAll})</h2>
                <span style={{fontSize:13,color:'#6B7280',transition:'.2s',transform:summaryOpen?'rotate(180deg)':''}}>▼</span>
              </div>
              {summaryOpen && <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:8,marginTop:14}}>
                {courseStats.perCourse.map((p,i) => <div key={i} style={{padding:'10px 12px',borderRadius:10,border:'1px solid #E5E7EB',borderLeft:`3px solid ${p.color.border}`,cursor:'pointer',transition:'.12s'}} onClick={()=>setSelCourse(i)}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                    <span style={{fontSize:12,fontWeight:700,color:p.color.text}}>{p.name}</span>
                    <span style={{fontSize:10,fontWeight:600,color:'#9CA3AF'}}>{p.pct}%</span>
                  </div>
                  <div style={{height:5,background:'#E5E7EB',borderRadius:99,overflow:'hidden'}}>
                    <div style={{width:`${p.pct}%`,height:'100%',background:p.color.border,borderRadius:99,transition:'width .3s'}}/>
                  </div>
                </div>)}
              </div>}
            </div>

            {/* 과목 탭 */}
            <div className="course-nav">
              {courses.map((c, i) => <button key={c.id} className={selCourse === i ? 'active' : ''} onClick={() => setSelCourse(i)}>{c.courseName}</button>)}
            </div>

            {/* 주차별 (이번 주부터 → 다음 주 → ... → 지난 주 역순) */}
            <div className="week-list">
              {(() => {
                const weeks = courses[selCourse].weeks;
                const curIdx = getCurrentWeekIdx(weeks);
                // 이번 주부터 끝까지 + 이번 주 전은 역순
                const future = weeks.slice(curIdx).map((w, i) => ({ w, origIdx: curIdx + i }));
                const past = weeks.slice(0, curIdx).reverse().map((w, i) => ({ w, origIdx: curIdx - 1 - i }));
                const sorted = [...future, ...past];

                return sorted.map(({ w, origIdx }) => {
                  const allDone = w.lectures.every(l => l.completed);
                  const someDone = w.lectures.some(l => l.completed);
                  const isCurrent = origIdx === curIdx;
                  const range = parseRange(w.period);
                  const dl = range.end;
                  const d = getDday(dl);
                  const ld = w.lectures.filter(l => l.completed).length;
                  return (
                    <div key={origIdx} className={`week-card ${allDone ? 'done' : ''}`} style={isCurrent ? {border:'2px solid #3B82F6',boxShadow:'0 0 0 3px rgba(59,130,246,.12)'} : {}}>
                      <div className="week-info" style={{background: allDone ? '#DCFCE7' : someDone ? '#FFFBEB' : '#F8FAFC'}}>
                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                          <span style={{width:32,height:32,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#fff',background:allDone?'#22C55E':COURSE_COLORS[selCourse].border,flexShrink:0}}>{allDone?'✓':w.week}</span>
                          <div>
                            <span style={{fontSize:15,fontWeight:800}}>{w.week}주차{isCurrent?' (이번 주)':''}</span>
                            <span className="period" style={{marginLeft:8}}>{w.period}</span>
                          </div>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <span style={{fontSize:12,fontWeight:600,color:'#6B7280'}}>{ld}/{w.lectures.length}</span>
                          {d !== null && <span className={`dday-badge ${d<=3?'urgent':''}`}>{ddayText(d)}</span>}
                        </div>
                      </div>
                      <div className="lec-list">
                        {w.lectures.map((l, li) => (
                          <label key={li} className="lec-item">
                            <input type="checkbox" checked={l.completed} onChange={() => toggleLecture(selCourse, origIdx, li)} />
                            <span className={l.completed ? 'strike' : ''}>{l.title}</span>
                            {l.completed && <span style={{fontSize:10,fontWeight:700,color:'#16A34A',background:'#DCFCE7',padding:'2px 7px',borderRadius:5,marginLeft:'auto',flexShrink:0}}>완료</span>}
                            {!l.completed && d !== null && <span className={`dday-badge ${d<=3?'urgent':''}`} style={{marginLeft:'auto',flexShrink:0}}>{ddayText(d)}</span>}
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* 자격증/일정 모달 */}
        {showCertModal && (
          <div className="modal-overlay" onClick={() => setShowCertModal(false)}>
            <div className="modal-content card" onClick={e => e.stopPropagation()}>
              <h3>일정/자격증 추가</h3>
              <form onSubmit={handleAddCert}>
                <div className="input-group">
                  <label>일정 이름</label>
                  <input type="text" value={newCertName} onChange={e => setNewCertName(e.target.value)} placeholder="예: 정보처리기사 필기" required />
                </div>
                <div style={{display:'flex',gap:10}}>
                  <div className="input-group" style={{flex:1}}>
                    <label>날짜</label>
                    <input type="date" value={newCertDate} onChange={e => setNewCertDate(e.target.value)} required />
                  </div>
                  <div className="input-group" style={{width:130}}>
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
                    const fmt = `${d.getFullYear()}.${d.getMonth()+1}.${d.getDate()} ${d.toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit',hour12:false})}`;
                    return <div key={c.id} className="cert-manage-item">
                      <span>{c.name}<br/><small style={{color:'#9CA3AF'}}>{fmt}</small></span>
                      <button onClick={() => deleteCert(c.id)}>삭제</button>
                    </div>;
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