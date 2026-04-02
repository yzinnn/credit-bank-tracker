import React, { useState, useMemo, useEffect, useRef } from 'react';
import './App.css';
import { useStorage } from './useStorage';
import { ACADEMIC_SCHEDULE, COURSE_COLORS } from './data';

/* ════════════════════ 유틸 ════════════════════ */
const YEAR = 2026;
function parseDeadline(p) {
  const parts = p.split(' ~ ');
  if (parts.length < 2) return null;
  const [mm, dd] = parts[1].trim().split('-').map(Number);
  return new Date(YEAR, mm - 1, dd, 23, 59, 59);
}
function parseStart(p) {
  const parts = p.split(' ~ ');
  const [mm, dd] = parts[0].trim().split('-').map(Number);
  return new Date(YEAR, mm - 1, dd);
}
function getDday(dl) {
  if (!dl) return null;
  const now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(dl.getFullYear(), dl.getMonth(), dl.getDate());
  return Math.ceil((target - today) / 864e5);
}
function ddayLabel(d) { return d === null ? null : d === 0 ? 'D-Day' : d > 0 ? `D-${d}` : `D+${Math.abs(d)}`; }
function ddayCls(d) {
  if (d === null) return 'far';
  if (d <= 0) return 'hot';
  if (d <= 3) return 'warn';
  if (d <= 7) return 'soon';
  return 'far';
}
function fmtDate(y, m, d) { return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`; }
function isSameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function isInRange(date, start, end) { return date >= start && date <= end; }

// 현재 주차 판별
function getCurrentWeekIdx(weeks) {
  const today = new Date();
  for (let i = 0; i < weeks.length; i++) {
    const s = parseStart(weeks[i].period);
    const e = parseDeadline(weeks[i].period);
    if (s && e && today >= s && today <= e) return i;
  }
  // 못 찾으면 가장 가까운 미래 주차
  for (let i = 0; i < weeks.length; i++) {
    const s = parseStart(weeks[i].period);
    if (s && s > today) return i;
  }
  return 0;
}

// 이번 주차부터 정렬
function sortWeeksFromCurrent(weeks) {
  const ci = getCurrentWeekIdx(weeks);
  const future = weeks.slice(ci);
  const past = weeks.slice(0, ci).reverse();
  return { sorted: [...future, ...past], currentOrigIdx: ci };
}

/* ════════════════════ D-day 배지 ════════════════════ */
function Dday({ deadline }) {
  const d = getDday(deadline);
  const l = ddayLabel(d);
  if (!l) return null;
  return <span className={`dday ${ddayCls(d)}`}>{l}</span>;
}

function DdaySmall({ deadline }) {
  const d = getDday(deadline);
  const l = ddayLabel(d);
  if (!l) return null;
  return <span className={`dd-badge`} style={{
    background: d <= 0 ? '#FEE2E2' : d <= 3 ? '#FEF3C7' : d <= 7 ? '#DBEAFE' : '#F3F4F6',
    color: d <= 0 ? '#DC2626' : d <= 3 ? '#D97706' : d <= 7 ? '#2563EB' : '#6B7280',
  }}>{l}</span>;
}

/* ════════════════════ 달력 ════════════════════ */
function Calendar({ month, setMonth, selDate, setSelDate, events }) {
  const year = YEAR;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const today = new Date();

  const cells = [];
  // prev month
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ d: prevDays - i, dim: true, date: new Date(year, month - 1, prevDays - i) });
  // this month
  for (let i = 1; i <= daysInMonth; i++) cells.push({ d: i, dim: false, date: new Date(year, month, i) });
  // next month
  const rem = 42 - cells.length;
  for (let i = 1; i <= rem; i++) cells.push({ d: i, dim: true, date: new Date(year, month + 1, i) });

  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  return <>
    <div className="cal-hdr">
      <h2>{year}년 {monthNames[month]}</h2>
      <div>
        <button className="cal-nav-btn" onClick={() => setMonth(m => Math.max(0, m - 1))}>◀</button>
        <button className="cal-nav-btn" onClick={() => setMonth(m => Math.min(11, m + 1))}>▶</button>
      </div>
    </div>
    <div className="cal-grid">
      {['일', '월', '화', '수', '목', '금', '토'].map(d => <div key={d} className="cal-head">{d}</div>)}
      {cells.map((c, i) => {
        const dateStr = fmtDate(c.date.getFullYear(), c.date.getMonth(), c.date.getDate());
        const isToday = !c.dim && isSameDay(c.date, today);
        const isSel = selDate && isSameDay(c.date, selDate);
        const dayEvents = events.filter(ev => {
          const s = new Date(ev.start), e = new Date(ev.end);
          return isInRange(c.date, new Date(s.getFullYear(), s.getMonth(), s.getDate()), new Date(e.getFullYear(), e.getMonth(), e.getDate()));
        });
        // 최대 2개 표시, 나머지 +n
        const show = dayEvents.slice(0, 2);
        const more = dayEvents.length - 2;

        return <div key={i} className={`cal-cell${c.dim ? ' dim' : ''}${isSel ? ' sel' : ''}${isToday ? ' today' : ''}`}
          onClick={() => !c.dim && setSelDate(c.date)}>
          <div className="day-n">{c.d}</div>
          <div className="cal-events">
            {show.map((ev, j) => <div key={j} className={`cal-ev ${ev.type}`}>{ev.label}</div>)}
            {more > 0 && <span className="cal-more">+{more}</span>}
          </div>
        </div>;
      })}
    </div>
  </>;
}

/* ════════════════════ 자격증 모달 ════════════════════ */
function CertModal({ onClose, onSave, onDelete, edit, certs }) {
  const [name, setName] = useState(edit?.name || '');
  const [date, setDate] = useState(edit?.date || '');
  const [note, setNote] = useState(edit?.note || '');
  return <div className="modal-bg" onClick={onClose}>
    <div className="modal" onClick={e => e.stopPropagation()}>
      <h3>{edit ? '자격증 수정' : '자격증 추가'}</h3>
      <input className="modal-inp" placeholder="자격증명 (예: 정보처리기사)" value={name} onChange={e => setName(e.target.value)} />
      <input className="modal-inp" type="date" value={date} onChange={e => setDate(e.target.value)} />
      <input className="modal-inp" placeholder="메모 (선택)" value={note} onChange={e => setNote(e.target.value)} />
      <div className="modal-btns">
        <button className="btn-cancel" onClick={onClose}>취소</button>
        <button className="btn-ok" onClick={() => { if (!name || !date) return; onSave({ id: edit?.id || Date.now().toString(), name, date, note, completed: edit?.completed || false }); onClose(); }}>저장</button>
      </div>
      {!edit && certs.length > 0 && <div className="cert-list-manage">
        <h4>등록된 자격증 ({certs.length})</h4>
        {certs.map(c => <div key={c.id} className="cert-mg-item">
          <span>{c.name} · {c.date.replace(/-/g, '.')}</span>
          <button className="cert-mg-del" onClick={() => onDelete(c.id)}>삭제</button>
        </div>)}
      </div>}
    </div>
  </div>;
}

/* ════════════════════ 과목별 진도 Bar ════════════════════ */
function ProgressBar({ done, total, color }) {
  const p = total ? Math.round(done / total * 100) : 0;
  return <div className="cv-bar-track">
    <div className="cv-bar-fill" style={{ width: `${p}%`, background: color }} />
  </div>;
}

/* ════════════════════ 메인 App ════════════════════ */
export default function App() {
  const { courses, certs, loaded, syncStatus, toggleLecture, saveCert, toggleCert, deleteCert } = useStorage();
  const [tab, setTab] = useState('dash');
  const [month, setMonth] = useState(new Date().getMonth());
  const [selDate, setSelDate] = useState(new Date());
  const [sideTab, setSideTab] = useState('todo');
  const [courseFilter, setCourseFilter] = useState('all');
  const [selCourse, setSelCourse] = useState(0);
  const [showCert, setShowCert] = useState(false);
  const [editCert, setEditCert] = useState(null);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const weekRefs = useRef({});

  // 과목별 통계
  const stats = useMemo(() => {
    let t = 0, d = 0;
    const pc = courses.map((c, i) => {
      let ct = 0, cd = 0;
      c.weeks.forEach(w => w.lectures.forEach(l => { ct++; t++; if (l.completed) { cd++; d++; } }));
      return { name: c.courseName, total: ct, done: cd, color: COURSE_COLORS[i] };
    });
    return { t, d, pc };
  }, [courses]);

  // 캘린더 이벤트 생성
  const calEvents = useMemo(() => {
    const evs = [];
    // 학사일정
    ACADEMIC_SCHEDULE.forEach(s => {
      evs.push({ label: s.title, start: s.startDate, end: s.endDate, type: s.type === 'exam' ? 'exam' : 'task' });
    });
    // 자격증
    certs.forEach(c => {
      if (!c.completed) evs.push({ label: c.name, start: c.date, end: c.date, type: 'cert' });
    });
    return evs;
  }, [certs]);

  // 선택 날짜에 해당하는 할 일 (해당 주차 강의들)
  const dateItems = useMemo(() => {
    if (!selDate) return [];
    const items = [];
    courses.forEach((c, ci) => {
      c.weeks.forEach((w, wi) => {
        const s = parseStart(w.period);
        const e = parseDeadline(w.period);
        if (s && e && isInRange(selDate, s, e)) {
          w.lectures.forEach((l, li) => {
            items.push({ ci, wi, li, cname: c.courseName, wk: w.week, title: l.title, completed: l.completed, dl: e, col: COURSE_COLORS[ci] });
          });
        }
      });
    });
    items.sort((a, b) => (a.completed ? 1 : 0) - (b.completed ? 1 : 0));
    return items;
  }, [selDate, courses]);

  // 사이드바: 전체 미완료 (D-day 급한 순)
  const allTodo = useMemo(() => {
    const items = [];
    courses.forEach((c, ci) => c.weeks.forEach((w, wi) => {
      const dl = parseDeadline(w.period);
      const dd = getDday(dl);
      w.lectures.forEach((l, li) => {
        if (!l.completed) items.push({ ci, wi, li, cname: c.courseName, cid: c.id, wk: w.week, title: l.title, dl, dd, col: COURSE_COLORS[ci] });
      });
    }));
    items.sort((a, b) => (a.dd ?? 999) - (b.dd ?? 999));
    return items;
  }, [courses]);

  // 자격증 리스트 (사이드바용)
  const certList = useMemo(() => {
    return [...certs].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [certs]);

  // 사이드바 필터 적용
  const filteredTodo = useMemo(() => {
    if (courseFilter === 'all') return allTodo;
    return allTodo.filter(it => it.cid === courseFilter);
  }, [allTodo, courseFilter]);

  // 로딩
  if (!loaded) return <div className="loading">
    <div><div className="spinner" /><p style={{ color: '#9CA3AF', fontSize: 13 }}>불러오는 중...</p></div>
  </div>;

  const tabs = [
    { id: 'dash', label: '대시보드' },
    { id: 'course', label: '과목별 진도' },
  ];

  return <div>
    {/* ─── 헤더 ─── */}
    <header className="hdr">
      <div className="hdr-in">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="hdr-title" onClick={() => setTab('dash')}>2026-1 학점은행제</span>
          <span className="hdr-sub">{stats.d}/{stats.t} ({stats.t ? Math.round(stats.d / stats.t * 100) : 0}%)</span>
          <span className={`sync-badge ${syncStatus}`} style={{ marginLeft: 8 }}>
            {syncStatus === 'synced' ? '동기화됨' : syncStatus === 'local' ? '로컬' : syncStatus === 'error' ? '오프라인' : '...'}
          </span>
        </div>
        <div className="hdr-right hdr-tabs-desktop">
          <div className="hdr-tabs">
            {tabs.map(t => <button key={t.id} className={`hdr-tab${tab === t.id ? ' on' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>)}
          </div>
          <button className="btn-add" onClick={() => { setEditCert(null); setShowCert(true); }}>+ 자격증</button>
        </div>
      </div>
    </header>

    {/* 모바일 하단 탭 */}
    <nav className="mob-tabs" style={{ display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(0,0,0,.06)', padding: '6px 0 env(safe-area-inset-bottom, 8px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        {[...tabs, { id: 'cert-add', label: '자격증' }].map(t => <button key={t.id} onClick={() => t.id === 'cert-add' ? setShowCert(true) : setTab(t.id)} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'none', border: 'none', padding: '4px 12px', fontFamily: 'inherit',
          color: (t.id !== 'cert-add' && tab === t.id) ? '#4F46E5' : '#9CA3AF', fontSize: 10, fontWeight: 600,
        }}>
          <span style={{ fontSize: 16 }}>{t.id === 'dash' ? '◉' : t.id === 'course' ? '◈' : '◆'}</span>{t.label}
        </button>)}
      </div>
    </nav>

    <div className="content">

      {/* ═══════════════ 대시보드 ═══════════════ */}
      {tab === 'dash' && <div className="dash" style={{ animation: 'fadeUp .3s ease' }}>
        <div className="dash-main">
          {/* 달력 */}
          <div className="card">
            <Calendar month={month} setMonth={setMonth} selDate={selDate} setSelDate={setSelDate} events={calEvents} />
            {/* 날짜 선택 시 상세 */}
            {selDate && <div className="date-detail">
              <h3>{selDate.getMonth() + 1}월 {selDate.getDate()}일 할 일</h3>
              {dateItems.length === 0 ? <p className="empty">이 날짜에 해당하는 할 일이 없습니다</p> :
                <div className="dd-list">
                  {dateItems.map((it, i) => <div key={`${it.ci}-${it.wi}-${it.li}`}
                    className={`dd-item${it.completed ? ' done' : ''}`}
                    onClick={() => toggleLecture(it.ci, it.wi, it.li)}>
                    <input type="checkbox" checked={it.completed} readOnly />
                    <span className="dd-badge" style={{ background: it.col.light, color: it.col.text }}>{it.cname}</span>
                    <span className="dd-title">{it.title}</span>
                    {!it.completed && <DdaySmall deadline={it.dl} />}
                  </div>)}
                </div>}
            </div>}
          </div>
        </div>

        {/* 사이드바 */}
        <div className="dash-side card">
          <div className="side-tabs">
            <button className={`side-tab${sideTab === 'todo' ? ' on' : ''}`} onClick={() => setSideTab('todo')}>할 일 ({filteredTodo.length})</button>
            <button className={`side-tab${sideTab === 'cert' ? ' on' : ''}`} onClick={() => setSideTab('cert')}>자격증 ({certs.length})</button>
          </div>

          {sideTab === 'todo' && <>
            <div className="side-filter">
              <button className={`side-filter-btn${courseFilter === 'all' ? ' on' : ''}`} onClick={() => setCourseFilter('all')}>전체</button>
              {courses.map(c => <button key={c.id} className={`side-filter-btn${courseFilter === c.id ? ' on' : ''}`} onClick={() => setCourseFilter(c.id)}>{c.courseName}</button>)}
            </div>
            <div className="side-list">
              {filteredTodo.length === 0 ? <p className="empty">모든 할 일 완료!</p> :
                filteredTodo.slice(0, 50).map((it, i) => <div key={`${it.ci}-${it.wi}-${it.li}`} className="side-card"
                  onClick={() => toggleLecture(it.ci, it.wi, it.li)}>
                  <input type="checkbox" checked={false} readOnly />
                  <div className="side-info">
                    <span className="side-cname" style={{ background: it.col.light, color: it.col.text }}>{it.cname}</span>
                    <div className="side-title">{it.wk}주 · {it.title}</div>
                  </div>
                  <Dday deadline={it.dl} />
                </div>)}
            </div>
          </>}

          {sideTab === 'cert' && <div className="side-list">
            <div style={{ padding: '6px 4px 10px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-add" onClick={() => { setEditCert(null); setShowCert(true); }}>+ 추가</button>
            </div>
            {certList.length === 0 ? <p className="empty">등록된 자격증이 없습니다</p> :
              certList.map(c => <div key={c.id} className={`side-card${c.completed ? ' done' : ''}`} onClick={() => toggleCert(c.id)}>
                <input type="checkbox" checked={c.completed} readOnly />
                <div className="side-info">
                  <div style={{ fontSize: 13, fontWeight: 700, textDecoration: c.completed ? 'line-through' : '' }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{c.date.replace(/-/g, '.')}{c.note ? ` · ${c.note}` : ''}</div>
                </div>
                <Dday deadline={new Date(c.date + 'T23:59:59')} />
              </div>)}
          </div>}
        </div>
      </div>}

      {/* ═══════════════ 과목별 진도 ═══════════════ */}
      {tab === 'course' && <div className="card cv" style={{ animation: 'fadeUp .3s ease' }}>
        {/* 전과목 요약 (접기/펴기) */}
        <div className="cv-summary">
          <div className="cv-summary-toggle" onClick={() => setSummaryOpen(v => !v)}>
            <h2>전과목 진도 현황 ({stats.d}/{stats.t})</h2>
            <span className={`arrow${summaryOpen ? ' open' : ''}`}>▼</span>
          </div>
          {summaryOpen && <div className="cv-summary-grid">
            {stats.pc.map((p, i) => <div key={i} className="cv-sum-card" style={{ borderLeft: `3px solid ${p.color.border}` }}
              onClick={() => setSelCourse(i)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: p.color.text }}>{p.name}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF' }}>{p.done}/{p.total} ({p.total ? Math.round(p.done / p.total * 100) : 0}%)</span>
              </div>
              <ProgressBar done={p.done} total={p.total} color={p.color.border} />
            </div>)}
          </div>}
        </div>

        {/* 과목 탭 */}
        <div className="cv-tabs">
          {courses.map((c, i) => <button key={c.id} className={`cv-tab${selCourse === i ? ' on' : ''}`} onClick={() => setSelCourse(i)}>{c.courseName}</button>)}
        </div>

        {/* 주차별 (이번 주부터 정렬) */}
        <div className="cv-weeks">
          {(() => {
            const { sorted, currentOrigIdx } = sortWeeksFromCurrent(courses[selCourse].weeks);
            return sorted.map((w, si) => {
              const origIdx = courses[selCourse].weeks.indexOf(w);
              const allDone = w.lectures.every(l => l.completed);
              const someDone = w.lectures.some(l => l.completed);
              const dl = parseDeadline(w.period);
              const ld = w.lectures.filter(l => l.completed).length;
              const isCurrent = origIdx === currentOrigIdx;

              return <div key={origIdx} className={`wk${allDone ? ' all-done' : ''}${isCurrent ? ' wk-current' : ''}`}>
                <div className={`wk-hdr${allDone ? ' complete' : someDone ? ' partial' : ''}`}>
                  <div className="wk-meta">
                    <span className="wk-num" style={{ background: allDone ? '#22C55E' : COURSE_COLORS[selCourse].border }}>
                      {allDone ? '✓' : w.week}
                    </span>
                    <div>
                      <span className="wk-label">{w.week}주차{isCurrent ? ' (이번 주)' : ''}</span>
                      <span className="wk-period" style={{ marginLeft: 8 }}>{w.period}</span>
                    </div>
                  </div>
                  <div className="wk-right">
                    <span className="wk-count">{ld}/{w.lectures.length}</span>
                    <Dday deadline={dl} />
                  </div>
                </div>
                {w.lectures.map((l, li) => <div key={li} className="lec" onClick={() => toggleLecture(selCourse, origIdx, li)}>
                  <input type="checkbox" checked={l.completed} readOnly />
                  <span className={`lec-title${l.completed ? ' done' : ''}`}>{l.title}</span>
                  {l.completed && <span className="lec-done-tag">완료</span>}
                  {!l.completed && <Dday deadline={dl} />}
                </div>)}
              </div>;
            });
          })()}
        </div>
      </div>}
    </div>

    {/* 자격증 모달 */}
    {showCert && <CertModal
      onClose={() => { setShowCert(false); setEditCert(null); }}
      onSave={saveCert}
      onDelete={deleteCert}
      edit={editCert}
      certs={certs}
    />}
  </div>;
}