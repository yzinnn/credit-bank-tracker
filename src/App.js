import React, { useState, useMemo } from 'react';
import './App.css';
import { useStorage } from './useStorage';
import { ACADEMIC_SCHEDULE, COURSE_COLORS } from './data';

/* ─── 유틸 ─── */
function parseDeadline(p) {
  const parts = p.split(' ~ ');
  if (parts.length < 2) return null;
  const [mm, dd] = parts[1].trim().split('-').map(Number);
  return new Date(2026, mm - 1, dd, 23, 59, 59);
}
function getDday(dl) {
  if (!dl) return null;
  const now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(dl.getFullYear(), dl.getMonth(), dl.getDate());
  return Math.ceil((target - today) / 864e5);
}
function ddayLabel(d) { return d === null ? null : d === 0 ? 'D-Day' : d > 0 ? `D-${d}` : `D+${Math.abs(d)}`; }
function ddayColor(d) {
  if (d === null) return { bg:'#F3F4F6', fg:'#6B7280', bd:'#E5E7EB' };
  if (d <= 0) return { bg:'#FEE2E2', fg:'#DC2626', bd:'#FECACA' };
  if (d <= 3) return { bg:'#FEF3C7', fg:'#D97706', bd:'#FDE68A' };
  if (d <= 7) return { bg:'#DBEAFE', fg:'#2563EB', bd:'#BFDBFE' };
  return { bg:'#F3F4F6', fg:'#6B7280', bd:'#E5E7EB' };
}

/* ─── 소 컴포넌트 ─── */
function Badge({ deadline }) {
  const d = getDday(deadline);
  const l = ddayLabel(d);
  if (!l) return null;
  const c = ddayColor(d);
  return <span style={{ background:c.bg, color:c.fg, border:`1px solid ${c.bd}`, padding:'2px 8px', borderRadius:999, fontSize:11, fontWeight:700, whiteSpace:'nowrap', flexShrink:0, lineHeight:'18px' }}>{l}</span>;
}

function Bar({ done, total, color }) {
  const p = total ? Math.round(done/total*100) : 0;
  return <div style={{ display:'flex', alignItems:'center', gap:8, width:'100%' }}>
    <div style={{ flex:1, height:6, background:'#E5E7EB', borderRadius:99, overflow:'hidden' }}>
      <div style={{ width:`${p}%`, height:'100%', background:color||'#6366F1', borderRadius:99, transition:'width .3s' }}/>
    </div>
    <span style={{ fontSize:11, fontWeight:600, color:'#6B7280', minWidth:32, textAlign:'right' }}>{p}%</span>
  </div>;
}

function CertModal({ onClose, onSave, edit }) {
  const [name, setName] = useState(edit?.name||'');
  const [date, setDate] = useState(edit?.date||'');
  const [note, setNote] = useState(edit?.note||'');
  const inp = { width:'100%', padding:'10px 14px', border:'1px solid #D1D5DB', borderRadius:10, fontSize:14, outline:'none', fontFamily:'inherit', boxSizing:'border-box', background:'#FAFAFA' };
  return <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }} onClick={onClose}>
    <div style={{ background:'#fff', borderRadius:20, padding:24, width:'100%', maxWidth:380, boxShadow:'0 20px 40px rgba(0,0,0,.15)' }} onClick={e=>e.stopPropagation()}>
      <h3 style={{ fontSize:17, fontWeight:700, marginBottom:16 }}>{edit?'자격증 일정 수정':'자격증 일정 추가'}</h3>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        <input style={inp} placeholder="자격증명 (예: 정보처리기사)" value={name} onChange={e=>setName(e.target.value)}/>
        <input style={inp} type="date" value={date} onChange={e=>setDate(e.target.value)}/>
        <input style={inp} placeholder="메모 (예: 필기시험)" value={note} onChange={e=>setNote(e.target.value)}/>
      </div>
      <div style={{ display:'flex', gap:8, marginTop:18 }}>
        <button onClick={onClose} style={{ flex:1, padding:'10px 0', borderRadius:10, border:'1px solid #D1D5DB', background:'#fff', fontWeight:600, fontSize:14, fontFamily:'inherit' }}>취소</button>
        <button onClick={()=>{ if(!name||!date)return; onSave({ id:edit?.id||Date.now().toString(), name, date, note, completed:edit?.completed||false }); onClose(); }} style={{ flex:1, padding:'10px 0', borderRadius:10, border:'none', background:'#4F46E5', color:'#fff', fontWeight:600, fontSize:14, fontFamily:'inherit' }}>저장</button>
      </div>
    </div>
  </div>;
}

/* ─── 스타일 상수 ─── */
const S = {
  secTitle: { fontSize:14, fontWeight:700, color:'#374151', marginBottom:10 },
  card: { background:'#fff', borderRadius:12, border:'1px solid #E5E7EB', boxShadow:'0 1px 2px rgba(0,0,0,.03)' },
  smallBtn: { padding:'5px 10px', borderRadius:7, border:'1px solid #D1D5DB', background:'#fff', fontSize:11, fontWeight:500, fontFamily:'inherit', color:'#6B7280' },
};

/* ─── 메인 App ─── */
export default function App() {
  const { courses, certs, loaded, syncStatus, toggleLecture, saveCert, toggleCert, deleteCert } = useStorage();
  const [tab, setTab] = useState('dash');
  const [selCourse, setSelCourse] = useState(0);
  const [showCert, setShowCert] = useState(false);
  const [editCert, setEditCert] = useState(null);
  const [filter, setFilter] = useState('all');

  const stats = useMemo(() => {
    let t=0, d=0;
    const pc = courses.map((c,i) => {
      let ct=0, cd=0;
      c.weeks.forEach(w=>w.lectures.forEach(l=>{ ct++; t++; if(l.completed){cd++;d++;} }));
      return { name:c.courseName, total:ct, done:cd, color:COURSE_COLORS[i] };
    });
    return { t, d, pc };
  }, [courses]);

  const upcoming = useMemo(() => {
    const items = [];
    courses.forEach((c,ci)=>c.weeks.forEach((w,wi)=>{
      const dl = parseDeadline(w.period);
      const dd = getDday(dl);
      w.lectures.forEach((l,li)=>{
        if(!l.completed) items.push({ ci, wi, li, cname:c.courseName, wk:w.week, title:l.title, dl, dd, col:COURSE_COLORS[ci] });
      });
    }));
    items.sort((a,b)=>(a.dd??999)-(b.dd??999));
    return items;
  }, [courses]);

  if (!loaded) return <div style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F0F2F8' }}>
    <div style={{ textAlign:'center' }}>
      <div style={{ width:36, height:36, border:'3px solid #E5E7EB', borderTopColor:'#6366F1', borderRadius:'50%', animation:'spin .7s linear infinite', margin:'0 auto 14px' }}/>
      <p style={{ color:'#9CA3AF', fontSize:13 }}>불러오는 중...</p>
    </div>
  </div>;

  const tabs = [
    { id:'dash', label:'대시보드', ico:'◉' },
    { id:'course', label:'과목별', ico:'◈' },
    { id:'cert', label:'자격증', ico:'◆' },
  ];

  return <div style={{ minHeight:'100dvh', background:'linear-gradient(145deg,#ECEFFE 0%,#F6F7FB 50%,#F0ECFE 100%)' }}>
    <style>{`
      @media(max-width:639px){.dt{display:none!important}.mb{display:block!important}}
      @media(min-width:640px){.mb{display:none!important}}
    `}</style>

    {/* 헤더 */}
    <header style={{ background:'rgba(255,255,255,.88)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', borderBottom:'1px solid rgba(0,0,0,.05)', position:'sticky', top:0, zIndex:100 }}>
      <div style={{ maxWidth:960, margin:'0 auto', padding:'12px 16px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, flexWrap:'wrap' }}>
          <div style={{ minWidth:0 }}>
            <h1 style={{ fontSize:18, fontWeight:800, color:'#1E1B4B', letterSpacing:'-.02em' }}>2026-1 학점은행제</h1>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:2 }}>
              <span style={{ fontSize:11, color:'#9CA3AF' }}>{stats.d}/{stats.t} ({stats.t?Math.round(stats.d/stats.t*100):0}%)</span>
              <span style={{ fontSize:10, fontWeight:600, padding:'1px 6px', borderRadius:4,
                background: syncStatus==='synced'?'#DCFCE7':syncStatus==='local'?'#FEF3C7':'#FEE2E2',
                color: syncStatus==='synced'?'#16A34A':syncStatus==='local'?'#D97706':'#DC2626',
              }}>{syncStatus==='synced'?'서버 동기화':syncStatus==='local'?'로컬 저장':syncStatus==='error'?'오프라인':'...'}</span>
            </div>
          </div>
          <div className="dt" style={{ display:'flex', gap:3, background:'#F1F5F9', borderRadius:10, padding:3 }}>
            {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{
              padding:'7px 14px', borderRadius:8, border:'none', fontSize:12, fontWeight:600,
              background:tab===t.id?'#fff':'transparent', color:tab===t.id?'#4F46E5':'#64748B',
              boxShadow:tab===t.id?'0 1px 3px rgba(0,0,0,.06)':'none', transition:'all .15s', fontFamily:'inherit',
            }}><span style={{ marginRight:3 }}>{t.ico}</span>{t.label}</button>)}
          </div>
        </div>
      </div>
    </header>

    {/* 모바일 하단 탭 */}
    <nav className="mb" style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:100, background:'rgba(255,255,255,.92)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', borderTop:'1px solid rgba(0,0,0,.06)', display:'none', padding:'6px 0 env(safe-area-inset-bottom,8px)' }}>
      <div style={{ display:'flex', justifyContent:'space-around' }}>
        {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, background:'none', border:'none', padding:'4px 16px', fontFamily:'inherit', color:tab===t.id?'#4F46E5':'#9CA3AF', fontSize:10, fontWeight:600 }}>
          <span style={{ fontSize:18 }}>{t.ico}</span>{t.label}
        </button>)}
      </div>
    </nav>

    {/* 메인 콘텐츠 */}
    <main style={{ maxWidth:960, margin:'0 auto', padding:'20px 16px 100px' }}>

      {/* ═══ 대시보드 ═══ */}
      {tab==='dash' && <div style={{ animation:'fadeUp .35s ease' }}>
        <section style={{ marginBottom:24 }}>
          <h2 style={S.secTitle}>주요 학사일정</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))', gap:8 }}>
            {ACADEMIC_SCHEDULE.map((s,i)=>{
              const dl=new Date(s.endDate+'T23:59:59');
              return <div key={i} style={{ ...S.card, padding:'12px 14px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:s.type==='exam'?'#DC2626':'#2563EB' }}>{s.title}</span>
                  <Badge deadline={dl}/>
                </div>
                <span style={{ fontSize:11, color:'#9CA3AF' }}>{s.startDate.slice(5).replace('-','.')} ~ {s.endDate.slice(5).replace('-','.')}</span>
              </div>;
            })}
          </div>
        </section>

        <section style={{ marginBottom:24 }}>
          <h2 style={S.secTitle}>과목별 진도</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:8 }}>
            {stats.pc.map((p,i)=><div key={i} style={{ ...S.card, padding:'14px 16px', borderLeft:`3px solid ${p.color.border}`, cursor:'pointer', transition:'transform .12s' }}
              onClick={()=>{setSelCourse(i);setTab('course');}}
              onMouseEnter={e=>e.currentTarget.style.transform='translateY(-1px)'}
              onMouseLeave={e=>e.currentTarget.style.transform=''}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <span style={{ fontSize:13, fontWeight:700, color:p.color.text }}>{p.name}</span>
                <span style={{ fontSize:11, fontWeight:600, color:'#9CA3AF' }}>{p.done}/{p.total}</span>
              </div>
              <Bar done={p.done} total={p.total} color={p.color.border}/>
            </div>)}
          </div>
        </section>

        {certs.length>0 && <section style={{ marginBottom:24 }}>
          <h2 style={S.secTitle}>자격증 일정</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:8 }}>
            {certs.map(c=><div key={c.id} style={{ ...S.card, padding:'12px 14px', opacity:c.completed?.5:1, border:c.completed?'1px solid #BBF7D0':'1px solid #E5E7EB' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:2 }}>
                <span style={{ fontSize:13, fontWeight:700, textDecoration:c.completed?'line-through':'' }}>{c.name}</span>
                <Badge deadline={new Date(c.date+'T23:59:59')}/>
              </div>
              {c.note && <p style={{ fontSize:11, color:'#9CA3AF' }}>{c.note}</p>}
            </div>)}
          </div>
        </section>}

        <section>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, flexWrap:'wrap', gap:8 }}>
            <h2 style={{ ...S.secTitle, margin:0 }}>해야 할 일 <span style={{ fontSize:12, fontWeight:400, color:'#9CA3AF' }}>({upcoming.length})</span></h2>
            <select value={filter} onChange={e=>setFilter(e.target.value)} style={{ padding:'5px 10px', borderRadius:7, border:'1px solid #D1D5DB', fontSize:12, fontFamily:'inherit', background:'#fff' }}>
              <option value="all">전체</option>
              <option value="7">7일 이내</option>
              <option value="14">14일 이내</option>
            </select>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            {upcoming
              .filter(it=>filter==='all'||(it.dd!==null&&it.dd<=Number(filter)&&it.dd>=0))
              .slice(0,40)
              .map((it,i)=><div key={`${it.ci}-${it.wi}-${it.li}`} style={{
                ...S.card, padding:'10px 14px', display:'flex', alignItems:'center', gap:10,
                animation:`fadeUp .25s ease ${i*.015}s both`, cursor:'pointer',
              }} onClick={()=>toggleLecture(it.ci,it.wi,it.li)}>
                <input type="checkbox" checked={false} readOnly style={{ width:17, height:17, flexShrink:0 }}/>
                <span style={{ fontSize:10, fontWeight:700, color:it.col.text, background:it.col.light, padding:'2px 7px', borderRadius:5, flexShrink:0, lineHeight:'16px' }}>{it.cname}</span>
                <span style={{ fontSize:11, color:'#9CA3AF', flexShrink:0 }}>{it.wk}주</span>
                <span style={{ fontSize:13, fontWeight:500, flex:1, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{it.title}</span>
                <Badge deadline={it.dl}/>
              </div>)}
            {upcoming.length===0 && <div style={{ textAlign:'center', padding:40, color:'#9CA3AF', fontSize:14 }}>모든 할 일 완료!</div>}
          </div>
        </section>
      </div>}

      {/* ═══ 과목별 ═══ */}
      {tab==='course' && <div style={{ animation:'fadeUp .35s ease' }}>
        <div style={{ display:'flex', gap:5, overflowX:'auto', paddingBottom:10, marginBottom:16, WebkitOverflowScrolling:'touch' }}>
          {courses.map((c,i)=><button key={c.id} onClick={()=>setSelCourse(i)} style={{
            padding:'7px 14px', borderRadius:9, border:'none', fontSize:12, fontWeight:600, whiteSpace:'nowrap',
            background:selCourse===i?COURSE_COLORS[i].border:'#fff',
            color:selCourse===i?'#fff':COURSE_COLORS[i].text,
            boxShadow:selCourse===i?`0 2px 8px ${COURSE_COLORS[i].border}44`:'0 1px 2px rgba(0,0,0,.05)',
            transition:'all .15s', fontFamily:'inherit',
          }}>{c.courseName}</button>)}
        </div>

        <div style={{ ...S.card, padding:'16px 18px', marginBottom:16, borderLeft:`4px solid ${COURSE_COLORS[selCourse].border}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <h2 style={{ fontSize:17, fontWeight:800, color:COURSE_COLORS[selCourse].text }}>{courses[selCourse].courseName}</h2>
            <span style={{ fontSize:12, fontWeight:600, color:'#6B7280' }}>{stats.pc[selCourse].done}/{stats.pc[selCourse].total}</span>
          </div>
          <Bar done={stats.pc[selCourse].done} total={stats.pc[selCourse].total} color={COURSE_COLORS[selCourse].border}/>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {courses[selCourse].weeks.map((w,wi)=>{
            const all=w.lectures.every(l=>l.completed);
            const some=w.lectures.some(l=>l.completed);
            const dl=parseDeadline(w.period);
            const ld=w.lectures.filter(l=>l.completed).length;
            return <div key={wi} style={{ ...S.card, overflow:'hidden', padding:0, border:all?'1px solid #BBF7D0':'1px solid #E5E7EB' }}>
              <div style={{ padding:'10px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #F3F4F6', flexWrap:'wrap', gap:6, background:all?'#DCFCE7':some?'#FFFBEB':'transparent' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ width:28, height:28, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'#fff', background:all?'#22C55E':COURSE_COLORS[selCourse].border }}>{all?'✓':w.week}</span>
                  <span style={{ fontSize:13, fontWeight:700 }}>{w.week}주차</span>
                  <span style={{ fontSize:11, color:'#9CA3AF' }}>{w.period}</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontSize:11, fontWeight:600, color:'#6B7280' }}>{ld}/{w.lectures.length}</span>
                  <Badge deadline={dl}/>
                </div>
              </div>
              <div style={{ padding:'6px 10px' }}>
                {w.lectures.map((l,li)=><div key={li} style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 6px', borderRadius:7, cursor:'pointer', transition:'background .12s' }}
                  onClick={()=>toggleLecture(selCourse,wi,li)}
                  onMouseEnter={e=>e.currentTarget.style.background='#F9FAFB'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <input type="checkbox" checked={l.completed} readOnly style={{ width:17, height:17, flexShrink:0 }}/>
                  <span style={{ fontSize:13, fontWeight:500, flex:1, color:l.completed?'#9CA3AF':'#374151', textDecoration:l.completed?'line-through':'' }}>{l.title}</span>
                  {l.completed && <span style={{ fontSize:10, fontWeight:700, color:'#16A34A', background:'#DCFCE7', padding:'2px 7px', borderRadius:5 }}>완료</span>}
                  {!l.completed && <Badge deadline={dl}/>}
                </div>)}
              </div>
            </div>;
          })}
        </div>
      </div>}

      {/* ═══ 자격증 ═══ */}
      {tab==='cert' && <div style={{ animation:'fadeUp .35s ease' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <h2 style={{ fontSize:17, fontWeight:800, color:'#1E1B4B' }}>자격증 일정</h2>
          <button onClick={()=>{setEditCert(null);setShowCert(true);}} style={{ padding:'8px 16px', borderRadius:9, border:'none', background:'#4F46E5', color:'#fff', fontWeight:600, fontSize:13, fontFamily:'inherit', boxShadow:'0 2px 8px rgba(79,70,229,.3)' }}>+ 추가</button>
        </div>
        {certs.length===0?<div style={{ ...S.card, padding:'50px 20px', textAlign:'center', border:'1px dashed #D1D5DB' }}>
          <p style={{ fontSize:32, marginBottom:10 }}>📋</p>
          <p style={{ fontSize:13, color:'#9CA3AF' }}>등록된 자격증 일정이 없습니다</p>
        </div>:<div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {[...certs].sort((a,b)=>new Date(a.date)-new Date(b.date)).map(c=>{
            const dl=new Date(c.date+'T23:59:59');
            return <div key={c.id} style={{ ...S.card, padding:'14px 16px', display:'flex', alignItems:'center', gap:10, opacity:c.completed?.5:1, border:c.completed?'1px solid #BBF7D0':'1px solid #E5E7EB' }}>
              <input type="checkbox" checked={c.completed} onChange={()=>toggleCert(c.id)} style={{ width:19, height:19, flexShrink:0 }}/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                  <span style={{ fontSize:14, fontWeight:700, textDecoration:c.completed?'line-through':'' }}>{c.name}</span>
                  <Badge deadline={dl}/>
                </div>
                <div style={{ fontSize:11, color:'#9CA3AF', marginTop:3 }}>{c.date.replace(/-/g,'.')}{c.note?` · ${c.note}`:''}</div>
              </div>
              <div style={{ display:'flex', gap:4, flexShrink:0 }}>
                <button onClick={()=>{setEditCert(c);setShowCert(true);}} style={S.smallBtn}>수정</button>
                <button onClick={()=>deleteCert(c.id)} style={{ ...S.smallBtn, borderColor:'#FECACA', background:'#FEF2F2', color:'#DC2626' }}>삭제</button>
              </div>
            </div>;
          })}
        </div>}
      </div>}
    </main>

    {showCert && <CertModal onClose={()=>{setShowCert(false);setEditCert(null);}} onSave={saveCert} edit={editCert}/>}
  </div>;
}
