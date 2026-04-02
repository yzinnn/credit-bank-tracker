import { createClient } from '@supabase/supabase-js';

// REACT_APP을 VITE_로 바꾸고, 빠진 .env.도 채워 넣었습니다.
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.warn(
    '⚠️ Supabase 환경변수 미설정. localStorage fallback 모드로 동작합니다.\n' +
    '.env 에 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY 추가 필요.'
  );
}

export const supabase = (url && key) ? createClient(url, key) : null;
export const isSupabaseReady = !!supabase;