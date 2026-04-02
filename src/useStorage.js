import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseReady } from './supabaseClient';
import { INITIAL_COURSES } from './data';

const LS_COURSES = 'st_courses_v2';
const LS_CERTS = 'st_certs_v2';

function lsGet(key, fb) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fb; } catch { return fb; }
}
function lsSet(key, v) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
}

function applyProgress(courses, rows) {
  const map = {};
  rows.forEach(r => { map[`${r.course_id}:${r.week}:${r.lecture_idx}`] = r.completed; });
  return courses.map(c => ({
    ...c,
    weeks: c.weeks.map(w => ({
      ...w,
      lectures: w.lectures.map((l, li) => ({
        ...l, completed: map[`${c.id}:${w.week}:${li}`] ?? l.completed
      }))
    }))
  }));
}

export function useStorage() {
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [certs, setCerts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState('loading');

  useEffect(() => {
    (async () => {
      if (isSupabaseReady) {
        try {
          const { data: rows, error } = await supabase.from('lecture_progress').select('course_id, week, lecture_idx, completed');
          if (error) throw error;
          if (rows && rows.length > 0) setCourses(applyProgress(INITIAL_COURSES, rows));
          const { data: cr, error: ce } = await supabase.from('certs').select('*').order('date');
          if (ce) throw ce;
          if (cr) setCerts(cr.map(r => ({ id: r.id, name: r.name, date: r.date, note: r.note || '', completed: r.completed })));
          setSyncStatus('synced');
        } catch (e) {
          console.error('Supabase load failed:', e);
          setCourses(lsGet(LS_COURSES, INITIAL_COURSES));
          setCerts(lsGet(LS_CERTS, []));
          setSyncStatus('error');
        }
      } else {
        setCourses(lsGet(LS_COURSES, INITIAL_COURSES));
        setCerts(lsGet(LS_CERTS, []));
        setSyncStatus('local');
      }
      setLoaded(true);
    })();
  }, []);

  const toggleLecture = useCallback((ci, wi, li) => {
    setCourses(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const lec = next[ci].weeks[wi].lectures[li];
      lec.completed = !lec.completed;
      const c = next[ci], w = next[ci].weeks[wi];
      if (isSupabaseReady) {
        supabase.from('lecture_progress').upsert({
          course_id: c.id, week: w.week, lecture_idx: li,
          completed: lec.completed, updated_at: new Date().toISOString()
        }, { onConflict: 'course_id,week,lecture_idx' }).then(({ error }) => {
          if (error) console.error('Upsert error:', error);
        });
      }
      lsSet(LS_COURSES, next);
      return next;
    });
  }, []);

  const saveCert = useCallback((cert) => {
    setCerts(prev => {
      const exists = prev.find(c => c.id === cert.id);
      const next = exists ? prev.map(c => c.id === cert.id ? cert : c) : [...prev, cert];
      lsSet(LS_CERTS, next);
      if (isSupabaseReady) {
        supabase.from('certs').upsert({
          id: cert.id, name: cert.name, date: cert.date,
          note: cert.note, completed: cert.completed, updated_at: new Date().toISOString()
        }).then(({ error }) => { if (error) console.error(error); });
      }
      return next;
    });
  }, []);

  const toggleCert = useCallback((id) => {
    setCerts(prev => {
      const next = prev.map(c => c.id === id ? { ...c, completed: !c.completed } : c);
      lsSet(LS_CERTS, next);
      const cert = next.find(c => c.id === id);
      if (isSupabaseReady && cert) {
        supabase.from('certs').upsert({
          id: cert.id, name: cert.name, date: cert.date,
          note: cert.note, completed: cert.completed, updated_at: new Date().toISOString()
        }).then(({ error }) => { if (error) console.error(error); });
      }
      return next;
    });
  }, []);

  const deleteCert = useCallback((id) => {
    setCerts(prev => {
      const next = prev.filter(c => c.id !== id);
      lsSet(LS_CERTS, next);
      if (isSupabaseReady) {
        supabase.from('certs').delete().eq('id', id).then(({ error }) => { if (error) console.error(error); });
      }
      return next;
    });
  }, []);

  return { courses, certs, loaded, syncStatus, toggleLecture, saveCert, toggleCert, deleteCert };
}
