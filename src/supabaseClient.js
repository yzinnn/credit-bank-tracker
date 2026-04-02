import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const key = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.warn(
    '⚠️ Supabase 환경변수 미설정. localStorage fallback 모드로 동작합니다.\n' +
    '.env 에 REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY 추가 필요.'
  );
}

export const supabase = (url && key) ? createClient(url, key) : null;
export const isSupabaseReady = !!supabase;
