import { useState, useEffect, useMemo, useCallback } from "react";

/* ───────────────────────── 초기 데이터 ───────────────────────── */
const INITIAL_COURSES = [
  {
    id: "c1", courseName: "기계공작법",
    weeks: [
      { week:1, period:"03-03 ~ 03-16", lectures:[{title:"제조와 생산의 이해",completed:true},{title:"공업 재료의 성질",completed:true},{title:"치수, 공차 및 표면",completed:true}]},
      { week:2, period:"03-10 ~ 03-23", lectures:[{title:"금속 재료의 표면",completed:true},{title:"세라믹 재료의 특성",completed:true},{title:"고분자 재료와 복합 재료의 특성",completed:true}]},
      { week:3, period:"03-17 ~ 03-30", lectures:[{title:"주조의 기초",completed:true},{title:"사형주조",completed:true},{title:"특수주조",completed:true}]},
      { week:4, period:"03-24 ~ 04-06", lectures:[{title:"유리 성형",completed:true},{title:"플라스틱 가공 공정",completed:true},{title:"응고 공정",completed:true}]},
      { week:5, period:"03-31 ~ 04-13", lectures:[{title:"분말 야금-압축 및 소결",completed:false},{title:"분말 야금-가압법 및 소결법 대체 기술",completed:false},{title:"세라믹 및 서멧의 가공",completed:false}]},
      { week:6, period:"04-07 ~ 04-20", lectures:[{title:"금속 성형의 기초",completed:false},{title:"금속의 용적 변형공정",completed:false},{title:"금속 박판 가공",completed:false}]},
      { week:7, period:"04-17 ~ 04-20", lectures:[{title:"시험 (중간고사)",completed:false}]},
      { week:8, period:"04-21 ~ 05-04", lectures:[{title:"절삭 가공의 이론",completed:false},{title:"절삭 공정과 공작기계 - 선삭, 드릴링, 밀링",completed:false},{title:"절삭 공정과 공작기계 - 기타공정",completed:false}]},
      { week:9, period:"04-28 ~ 05-11", lectures:[{title:"절삭 공구 기술",completed:false},{title:"연삭과 기타 연마 공정",completed:false},{title:"특수가공과 열적 절삭 공정",completed:false}]},
      { week:10, period:"05-05 ~ 05-18", lectures:[{title:"금속의 열처리",completed:false},{title:"청정법과 표면 처리",completed:false},{title:"코팅 및 도포기술",completed:false}]},
      { week:11, period:"05-12 ~ 05-25", lectures:[{title:"용접의 기초",completed:false},{title:"아크 용접 및 저항 용접",completed:false},{title:"산소 용접 및 기타 용접",completed:false}]},
      { week:12, period:"05-19 ~ 06-01", lectures:[{title:"강의 내용 없음",completed:false}]},
      { week:13, period:"05-26 ~ 06-08", lectures:[{title:"강의 내용 없음",completed:false}]},
      { week:14, period:"06-02 ~ 06-15", lectures:[{title:"실리콘 공정 및 리소그래피",completed:false},{title:"적층 및 집적 회로(IC) 패키징",completed:false},{title:"전자조립과 패키징",completed:false}]},
      { week:15, period:"06-12 ~ 06-15", lectures:[{title:"시험 (기말고사)",completed:false}]}
    ]
  },
  {
    id: "c2", courseName: "평생교육방법론",
    weeks: [
      { week:1, period:"03-02 ~ 03-15", lectures:[{title:"평생교육이란?",completed:true},{title:"평생교육방법이란?",completed:true},{title:"포스트코로나와 평생교육방법",completed:true}]},
      { week:2, period:"03-09 ~ 03-22", lectures:[{title:"인지적 특성",completed:true},{title:"신체적, 정서적 특성",completed:true},{title:"성인학습의 특성과 학습",completed:true}]},
      { week:3, period:"03-16 ~ 03-29", lectures:[{title:"행동주의",completed:true},{title:"인지주의",completed:true},{title:"구성주의",completed:true},{title:"과제 제출 (~05-24)",completed:false}]},
      { week:4, period:"03-23 ~ 04-05", lectures:[{title:"주요이론1",completed:true},{title:"주요이론2",completed:true},{title:"주요이론3",completed:true}]},
      { week:5, period:"03-30 ~ 04-12", lectures:[{title:"교수학습 체제",completed:false},{title:"교수학습과정1",completed:false},{title:"교수학습 과정2",completed:false},{title:"자유토론(1)",completed:false}]},
      { week:6, period:"04-06 ~ 04-19", lectures:[{title:"개인중심1",completed:false},{title:"개인중심 2",completed:false},{title:"개인중심 3",completed:false}]},
      { week:7, period:"04-13 ~ 04-26", lectures:[{title:"집단중심 1",completed:false},{title:"집단중심 2",completed:false},{title:"집단중심3",completed:false}]},
      { week:8, period:"04-20 ~ 04-26", lectures:[{title:"중간고사",completed:false}]},
      { week:9, period:"04-27 ~ 05-10", lectures:[{title:"집단/체험1",completed:false},{title:"집단/체험2",completed:false},{title:"집단/체험3",completed:false}]},
      { week:10, period:"05-04 ~ 05-17", lectures:[{title:"웹기반형1",completed:false},{title:"웹기반형2",completed:false},{title:"웹기반형3",completed:false},{title:"퀴즈 (~05-31)",completed:false}]},
      { week:11, period:"05-11 ~ 05-24", lectures:[{title:"창의력개발1",completed:false},{title:"창의력개발2",completed:false},{title:"창의력개발3",completed:false},{title:"자유토론(2)",completed:false}]},
      { week:12, period:"05-18 ~ 05-31", lectures:[{title:"평생교육 자료유형 및 개발",completed:false},{title:"평생교육 자료개발의 과정",completed:false},{title:"평생교육 자료개발의 방법 및 활용",completed:false}]},
      { week:13, period:"05-25 ~ 06-07", lectures:[{title:"프로그램 운영 개념과 원리",completed:false},{title:"프로그램 운영 실행",completed:false},{title:"평생교육사의 전문성",completed:false}]},
      { week:14, period:"06-01 ~ 06-14", lectures:[{title:"프로그램 평가 개념과 모델",completed:false},{title:"프로그램 평가 절차",completed:false},{title:"주요 평생교육프로그램",completed:false}]},
      { week:15, period:"06-08 ~ 06-14", lectures:[{title:"기말고사",completed:false}]}
    ]
  },
  {
    id: "c3", courseName: "디지털경제론",
    weeks: [
      { week:1, period:"02-23 ~ 03-08", lectures:[{title:"1-1~1-4 강의 수강",completed:true},{title:"QUIZ",completed:true}]},
      { week:2, period:"03-02 ~ 03-15", lectures:[{title:"2-1~2-4 강의 수강",completed:true},{title:"QUIZ",completed:true}]},
      { week:3, period:"03-09 ~ 03-22", lectures:[{title:"3-1~3-4 강의 수강",completed:true},{title:"QUIZ",completed:true}]},
      { week:4, period:"03-16 ~ 03-31", lectures:[{title:"4-1~4-4 강의 수강",completed:true},{title:"QUIZ",completed:true}]},
      { week:5, period:"03-23 ~ 04-07", lectures:[{title:"5-1~5-4 강의 수강",completed:false},{title:"QUIZ",completed:false}]},
      { week:6, period:"03-30 ~ 04-12", lectures:[{title:"6-1~6-4 강의 수강",completed:false},{title:"QUIZ",completed:false}]},
      { week:7, period:"04-06 ~ 04-19", lectures:[{title:"7-1~7-4 강의 수강",completed:false},{title:"QUIZ",completed:false}]},
      { week:8, period:"04-13 ~ 04-19", lectures:[{title:"중간고사",completed:false}]},
      { week:9, period:"04-20 ~ 05-03", lectures:[{title:"9-1~9-4 강의 수강",completed:false},{title:"QUIZ",completed:false}]},
      { week:10, period:"04-27 ~ 05-10", lectures:[{title:"10-1~10-4 강의 수강",completed:false},{title:"QUIZ",completed:false}]},
      { week:11, period:"05-04 ~ 05-17", lectures:[{title:"11-1~11-4 강의 수강",completed:false},{title:"QUIZ",completed:false}]},
      { week:12, period:"05-11 ~ 05-24", lectures:[{title:"12-1~12-4 강의 수강",completed:false},{title:"QUIZ",completed:false}]},
      { week:13, period:"05-18 ~ 05-31", lectures:[{title:"13-1~13-4 강의 수강",completed:false},{title:"QUIZ",completed:false}]},
      { week:14, period:"05-25 ~ 06-07", lectures:[{title:"14-1~14-4 강의 수강",completed:false},{title:"QUIZ",completed:false}]},
      { week:15, period:"06-01 ~ 06-07", lectures:[{title:"기말고사",completed:false}]}
    ]
  },
  {
    id: "c4", courseName: "설득커뮤니케이션",
    weeks: [
      { week:1, period:"02-23 ~ 03-08", lectures:[{title:"1-1~1-3 강의 수강",completed:true},{title:"QUIZ 1",completed:true},{title:"1-4~1-6 강의 수강",completed:true},{title:"QUIZ 2",completed:true}]},
      { week:2, period:"03-02 ~ 03-15", lectures:[{title:"2-1~2-3 강의 수강",completed:true},{title:"QUIZ 1",completed:true},{title:"2-4~2-6 강의 수강",completed:true},{title:"QUIZ 2",completed:true}]},
      { week:3, period:"03-09 ~ 03-22", lectures:[{title:"3-1~3-3 강의 수강",completed:true},{title:"QUIZ 1",completed:true},{title:"3-4~3-6 강의 수강",completed:true},{title:"QUIZ 2",completed:true}]},
      { week:4, period:"03-16 ~ 03-31", lectures:[{title:"4-1~4-3 강의 수강",completed:true},{title:"QUIZ 1",completed:true},{title:"4-4~4-6 강의 수강",completed:true},{title:"QUIZ 2",completed:true}]},
      { week:5, period:"03-23 ~ 04-07", lectures:[{title:"5-1~5-3 강의 수강",completed:true},{title:"QUIZ 1",completed:true},{title:"5-4~5-6 강의 수강",completed:true},{title:"QUIZ 2",completed:true}]},
      { week:6, period:"03-30 ~ 04-12", lectures:[{title:"6-1~6-3 강의 수강",completed:false},{title:"QUIZ 1",completed:false},{title:"6-4~6-6 강의 수강",completed:false},{title:"QUIZ 2",completed:false}]},
      { week:7, period:"04-06 ~ 04-19", lectures:[{title:"7-1~7-3 강의 수강",completed:false},{title:"QUIZ 1",completed:false},{title:"7-4~7-6 강의 수강",completed:false},{title:"QUIZ 2",completed:false}]},
      { week:8, period:"04-13 ~ 04-19", lectures:[{title:"중간고사",completed:false}]},
      { week:9, period:"04-20 ~ 05-03", lectures:[{title:"9-1~9-3 강의 수강",completed:false},{title:"QUIZ 1",completed:false},{title:"9-4~9-6 강의 수강",completed:false},{title:"QUIZ 2",completed:false}]},
      { week:10, period:"04-27 ~ 05-10", lectures:[{title:"10-1~10-3 강의 수강",completed:false},{title:"QUIZ 1",completed:false},{title:"10-4~10-6 강의 수강",completed:false},{title:"QUIZ 2",completed:false}]},
      { week:11, period:"05-04 ~ 05-17", lectures:[{title:"11-1~11-3 강의 수강",completed:false},{title:"QUIZ 1",completed:false},{title:"11-4~11-6 강의 수강",completed:false},{title:"QUIZ 2",completed:false}]},
      { week:12, period:"05-11 ~ 05-24", lectures:[{title:"12-1~12-3 강의 수강",completed:false},{title:"QUIZ 1",completed:false},{title:"12-4~12-6 강의 수강",completed:false},{title:"QUIZ 2",completed:false}]},
      { week:13, period:"05-18 ~ 05-31", lectures:[{title:"13-1~13-3 강의 수강",completed:false},{title:"QUIZ 1",completed:false},{title:"13-4~13-6 강의 수강",completed:false},{title:"QUIZ 2",completed:false}]},
      { week:14, period:"05-25 ~ 06-07", lectures:[{title:"14-1~14-2 강의 수강",completed:false},{title:"QUIZ",completed:false}]},
      { week:15, period:"06-01 ~ 06-07", lectures:[{title:"기말고사",completed:false}]}
    ]
  },
  {
    id: "c5", courseName: "기업과 사회",
    weeks: [
      { week:1, period:"02-23 ~ 03-08", lectures:[{title:"1-1~1-3 강의 수강",completed:true},{title:"퀴즈",completed:true}]},
      { week:2, period:"03-02 ~ 03-15", lectures:[{title:"2-1~2-3 강의 수강",completed:true},{title:"퀴즈",completed:true}]},
      { week:3, period:"03-09 ~ 03-22", lectures:[{title:"3-1~3-3 강의 수강",completed:true},{title:"퀴즈",completed:true}]},
      { week:4, period:"03-16 ~ 03-31", lectures:[{title:"4-1~4-3 강의 수강",completed:true},{title:"퀴즈",completed:true}]},
      { week:5, period:"03-23 ~ 04-07", lectures:[{title:"5-1~5-3 강의 수강",completed:true},{title:"퀴즈",completed:true}]},
      { week:6, period:"03-30 ~ 04-12", lectures:[{title:"6-1~6-3 강의 수강",completed:true},{title:"퀴즈",completed:true}]},
      { week:7, period:"04-06 ~ 04-19", lectures:[{title:"7-1~7-3 강의 수강",completed:false},{title:"퀴즈",completed:false}]},
      { week:8, period:"04-13 ~ 04-19", lectures:[{title:"중간고사",completed:false}]},
      { week:9, period:"04-20 ~ 05-03", lectures:[{title:"9-1~9-3 강의 수강",completed:false},{title:"퀴즈",completed:false}]},
      { week:10, period:"04-27 ~ 05-10", lectures:[{title:"10-1~10-3 강의 수강",completed:false},{title:"퀴즈",completed:false}]},
      { week:11, period:"05-04 ~ 05-17", lectures:[{title:"11-1~11-3 강의 수강",completed:false},{title:"퀴즈",completed:false}]},
      { week:12, period:"05-11 ~ 05-24", lectures:[{title:"12-1~12-3 강의 수강",completed:false},{title:"퀴즈",completed:false}]},
      { week:13, period:"05-18 ~ 05-31", lectures:[{title:"13-1~13-3 강의 수강",completed:false},{title:"퀴즈",completed:false}]},
      { week:14, period:"05-25 ~ 06-07", lectures:[{title:"14-1~14-3 강의 수강",completed:false},{title:"퀴즈",completed:false}]},
      { week:15, period:"06-01 ~ 06-07", lectures:[{title:"기말고사",completed:false}]}
    ]
  },
  {
    id: "c6", courseName: "경영혁신",
    weeks: [
      { week:1, period:"02-23 ~ 03-08", lectures:[{title:"1-1~1-6 강의 수강",completed:true},{title:"퀴즈",completed:true}]},
      { week:2, period:"03-02 ~ 03-15", lectures:[{title:"2-1~2-6 강의 수강",completed:true},{title:"퀴즈",completed:true}]},
      { week:3, period:"03-09 ~ 03-22", lectures:[{title:"3-1~3-6 강의 수강",completed:true},{title:"퀴즈",completed:true}]},
      { week:4, period:"03-16 ~ 03-31", lectures:[{title:"4-1~4-6 강의 수강",completed:true},{title:"퀴즈",completed:true}]},
      { week:5, period:"03-23 ~ 04-07", lectures:[{title:"5-1 강의 수강",completed:true},{title:"퀴즈",completed:true}]},
      { week:6, period:"03-30 ~ 04-12", lectures:[{title:"6-1~6-4 강의 수강",completed:true},{title:"6-5~6-7 강의 수강",completed:false},{title:"퀴즈",completed:false}]},
      { week:7, period:"04-06 ~ 04-19", lectures:[{title:"7-1~7-5 강의 수강",completed:false},{title:"퀴즈",completed:false}]},
      { week:8, period:"04-13 ~ 04-19", lectures:[{title:"중간고사",completed:false}]},
      { week:9, period:"04-20 ~ 05-03", lectures:[{title:"9-1~9-7 강의 수강",completed:false},{title:"퀴즈",completed:false}]},
      { week:10, period:"04-27 ~ 05-10", lectures:[{title:"10-1~10-5 강의 수강",completed:false},{title:"퀴즈",completed:false}]},
      { week:11, period:"05-04 ~ 05-17", lectures:[{title:"11-1~11-6 강의 수강",completed:false},{title:"퀴즈",completed:false}]},
      { week:12, period:"05-11 ~ 05-24", lectures:[{title:"12-1~12-4 강의 수강",completed:false},{title:"퀴즈",completed:false}]},
      { week:13, period:"05-18 ~ 05-31", lectures:[{title:"13-1~13-6 강의 수강",completed:false},{title:"퀴즈",completed:false}]},
      { week:14, period:"05-25 ~ 06-07", lectures:[{title:"14-1~14-4 강의 수강",completed:false},{title:"퀴즈",completed:false}]},
      { week:15, period:"06-01 ~ 06-07", lectures:[{title:"기말고사",completed:false}]}
    ]
  },
  {
    id: "c7", courseName: "실용한문",
    weeks: [
      { week:1, period:"02-23 ~ 03-08", lectures:[{title:"1-1~1-6 강의 수강",completed:true},{title:"퀴즈",completed:true}]},
      { week:2, period:"03-02 ~ 03-15", lectures:[{title:"2-1~2-6 강의 수강",completed:true},{title:"퀴즈",completed:true}]},
      { week:3, period:"03-09 ~ 03-22", lectures:[{title:"3-1~3-6 강의 수강",completed:true},{title:"퀴즈",completed:true}]},
      { week:4, period:"03-16 ~ 03-31", lectures:[{title:"4-1~4-6 강의 수강",completed:true},{title:"퀴즈",completed:true}]},
      { week:5, period:"03-23 ~ 04-07", lectures:[{title:"5-1~5-4 강의 수강",completed:true},{title:"5-5 강의 수강",completed:false},{title:"퀴즈",completed:false}]},
      { week:6, period:"03-30 ~ 04-12", lectures:[{title:"6-1~6-5 강의 수강",completed:false},{title:"퀴즈",completed:false}]},
      { week:7, period:"04-06 ~ 04-19", lectures:[{title:"7-1~7-5 강의 수강",completed:false},{title:"퀴즈",completed:false}]},
      { week:8, period:"04-13 ~ 04-19", lectures:[{title:"중간고사",completed:false}]},
      { week:9, period:"04-20 ~ 05-03", lectures:[{title:"9-1~9-7 강의 수강",completed:false},{title:"퀴즈",completed:false}]},
      { week:10, period:"04-27 ~ 05-10", lectures:[{title:"10-1~10-6 강의 수강",completed:false},{title:"퀴즈",completed:false}]},
      { week:11, period:"05-04 ~ 05-17", lectures:[{title:"11-1~11-6 강의 수강",completed:false},{title:"퀴즈",completed:false}]},
      { week:12, period:"05-11 ~ 05-24", lectures:[{title:"12-1~12-7 강의 수강",completed:false},{title:"퀴즈",completed:false}]},
      { week:13, period:"05-18 ~ 05-31", lectures:[{title:"13-1~13-6 강의 수강",completed:false},{title:"퀴즈",completed:false}]},
      { week:14, period:"05-25 ~ 06-07", lectures:[{title:"14-1~14-5 강의 수강",completed:false},{title:"퀴즈",completed:false}]},
      { week:15, period:"06-01 ~ 06-07", lectures:[{title:"기말고사",completed:false}]}
    ]
  },
  {
    id: "c8", courseName: "현대인의 정신건강",
    weeks: [
      { week:1, period:"02-23 ~ 03-08", lectures:[{title:"1-1~1-4 강의 수강",completed:true},{title:"퀴즈",completed:true}]},
      { week:2, period:"03-02 ~ 03-15", lectures:[{title:"2-1~2-3 강의 수강",completed:true},{title:"퀴즈",completed:true}]},
      { week:3, period:"03-09 ~ 03-22", lectures:[{title:"3-1~3-3 강의 수강",completed:true},{title:"퀴즈",completed:true}]},
      { week:4, period:"03-16 ~ 03-31", lectures:[{title:"4-1~4-3 강의 수강",completed:true},{title:"퀴즈",completed:true}]},
      { week:5, period:"03-23 ~ 04-07", lectures:[{title:"5-1~5-3 강의 수강",completed:true},{title:"퀴즈",completed:true}]},
      { week:6, period:"03-30 ~ 04-12", lectures:[{title:"6-1~6-3 강의 수강",completed:true},{title:"퀴즈",completed:true}]},
      { week:7, period:"04-06 ~ 04-19", lectures:[{title:"7-1~7-3 강의 수강",completed:false},{title:"퀴즈",completed:false}]},
      { week:8, period:"04-13 ~ 04-19", lectures:[{title:"중간고사",completed:false}]},
      { week:9, period:"04-20 ~ 05-03", lectures:[{title:"9-1~9-3 강의 수강",completed:false},{title:"퀴즈",completed:false}]},
      { week:10, period:"04-27 ~ 05-10", lectures:[{title:"10-1~10-2 강의 수강",completed:false},{title:"퀴즈",completed:false}]},
      { week:11, period:"05-04 ~ 05-17", lectures:[{title:"11-1~11-2 강의 수강",completed:false},{title:"퀴즈",completed:false}]},
      { week:12, period:"05-11 ~ 05-24", lectures:[{title:"12-1~12-3 강의 수강",completed:false},{title:"개인 과제",completed:false},{title:"퀴즈",completed:false}]},
      { week:13, period:"05-18 ~ 05-31", lectures:[{title:"13-1~13-3 강의 수강",completed:false},{title:"퀴즈",completed:false}]},
      { week:14, period:"05-25 ~ 06-07", lectures:[{title:"14-1~14-4 강의 수강",completed:false},{title:"퀴즈",completed:false}]},
      { week:15, period:"06-01 ~ 06-07", lectures:[{title:"기말고사",completed:false}]}
    ]
  }
];

const ACADEMIC_SCHEDULE = [
  { title: "쪽지시험", startDate: "2026-03-31", endDate: "2026-04-13", type: "exam" },
  { title: "중간고사", startDate: "2026-04-17", endDate: "2026-04-20", type: "exam" },
  { title: "토론", startDate: "2026-04-21", endDate: "2026-05-11", type: "task" },
  { title: "과제", startDate: "2026-05-05", endDate: "2026-06-01", type: "task" },
  { title: "기말고사", startDate: "2026-06-12", endDate: "2026-06-15", type: "exam" }
];

const COURSE_COLORS = [
  { bg: "#EEF2FF", border: "#6366F1", text: "#4338CA", light: "#C7D2FE" },
  { bg: "#FFF7ED", border: "#F97316", text: "#C2410C", light: "#FED7AA" },
  { bg: "#F0FDF4", border: "#22C55E", text: "#15803D", light: "#BBF7D0" },
  { bg: "#FDF2F8", border: "#EC4899", text: "#BE185D", light: "#FBCFE8" },
  { bg: "#FFFBEB", border: "#EAB308", text: "#A16207", light: "#FDE68A" },
  { bg: "#F0F9FF", border: "#0EA5E9", text: "#0369A1", light: "#BAE6FD" },
  { bg: "#FAF5FF", border: "#A855F7", text: "#7E22CE", light: "#E9D5FF" },
  { bg: "#FFF1F2", border: "#F43F5E", text: "#BE123C", light: "#FECDD3" },
];

/* ───────────────────────── 유틸리티 ───────────────────────── */
function parseDeadline(periodStr) {
  const parts = periodStr.split(" ~ ");
  if (parts.length < 2) return null;
  const end = parts[1].trim();
  const [mm, dd] = end.split("-").map(Number);
  return new Date(2026, mm - 1, dd, 23, 59, 59);
}

function getDday(deadline) {
  if (!deadline) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  return diff;
}

function getDdayLabel(dday) {
  if (dday === null) return null;
  if (dday === 0) return "D-Day";
  if (dday > 0) return `D-${dday}`;
  return `D+${Math.abs(dday)}`;
}

function getDdayStyle(dday) {
  if (dday === null) return {};
  if (dday <= 0) return { background: "#FEE2E2", color: "#DC2626", border: "1px solid #FECACA" };
  if (dday <= 3) return { background: "#FEF3C7", color: "#D97706", border: "1px solid #FDE68A" };
  if (dday <= 7) return { background: "#DBEAFE", color: "#2563EB", border: "1px solid #BFDBFE" };
  return { background: "#F3F4F6", color: "#6B7280", border: "1px solid #E5E7EB" };
}

/* ───────────────────────── Storage ───────────────────────── */
const STORAGE_KEY = "study-tracker-v2";

async function loadData() {
  try {
    const result = await window.storage.get(STORAGE_KEY);
    return result ? JSON.parse(result.value) : null;
  } catch {
    return null;
  }
}

async function saveData(data) {
  try {
    await window.storage.set(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Save failed:", e);
  }
}

/* ───────────────────────── 컴포넌트들 ───────────────────────── */

function DdayBadge({ deadline }) {
  const dday = getDday(deadline);
  const label = getDdayLabel(dday);
  if (!label) return null;
  const style = getDdayStyle(dday);
  return (
    <span style={{
      ...style,
      padding: "2px 10px",
      borderRadius: "999px",
      fontSize: "11px",
      fontWeight: 700,
      letterSpacing: "-0.02em",
      whiteSpace: "nowrap",
      flexShrink: 0,
    }}>{label}</span>
  );
}

function ProgressBar({ completed, total, color }) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
      <div style={{
        flex: 1, height: 6, background: "#E5E7EB", borderRadius: 99, overflow: "hidden",
      }}>
        <div style={{
          width: `${pct}%`, height: "100%", background: color || "#6366F1",
          borderRadius: 99, transition: "width 0.4s ease",
        }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", minWidth: 36, textAlign: "right" }}>
        {pct}%
      </span>
    </div>
  );
}

function CertModal({ onClose, onSave, editItem }) {
  const [name, setName] = useState(editItem?.name || "");
  const [date, setDate] = useState(editItem?.date || "");
  const [note, setNote] = useState(editItem?.note || "");
  const inputStyle = {
    width: "100%", padding: "10px 14px", border: "1px solid #D1D5DB", borderRadius: 10,
    fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
    background: "#FAFAFA",
  };
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)",
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: 28, width: "90%", maxWidth: 400,
        boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
      }} onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700, color: "#111" }}>
          {editItem ? "자격증 일정 수정" : "자격증 일정 추가"}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input style={inputStyle} placeholder="자격증명 (예: 정보처리기사)" value={name}
            onChange={e => setName(e.target.value)} />
          <input style={inputStyle} type="date" value={date} onChange={e => setDate(e.target.value)} />
          <input style={inputStyle} placeholder="메모 (예: 필기시험)" value={note}
            onChange={e => setNote(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid #D1D5DB",
            background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14, fontFamily: "inherit",
          }}>취소</button>
          <button onClick={() => {
            if (!name || !date) return;
            onSave({ id: editItem?.id || Date.now().toString(), name, date, note, completed: editItem?.completed || false });
            onClose();
          }} style={{
            flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
            background: "#4F46E5", color: "#fff", cursor: "pointer", fontWeight: 600,
            fontSize: 14, fontFamily: "inherit",
          }}>저장</button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── 메인 App ───────────────────────── */
export default function App() {
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [certs, setCerts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedCourse, setSelectedCourse] = useState(0);
  const [showCertModal, setShowCertModal] = useState(false);
  const [editCert, setEditCert] = useState(null);
  const [weekFilter, setWeekFilter] = useState("all");

  // Load from storage
  useEffect(() => {
    (async () => {
      const saved = await loadData();
      if (saved) {
        if (saved.courses) setCourses(saved.courses);
        if (saved.certs) setCerts(saved.certs);
      }
      setLoaded(true);
    })();
  }, []);

  // Save on change
  useEffect(() => {
    if (!loaded) return;
    saveData({ courses, certs });
  }, [courses, certs, loaded]);

  const toggleLecture = useCallback((cIdx, wIdx, lIdx) => {
    setCourses(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[cIdx].weeks[wIdx].lectures[lIdx].completed = !next[cIdx].weeks[wIdx].lectures[lIdx].completed;
      return next;
    });
  }, []);

  const toggleCert = useCallback((id) => {
    setCerts(prev => prev.map(c => c.id === id ? { ...c, completed: !c.completed } : c));
  }, []);

  const deleteCert = useCallback((id) => {
    setCerts(prev => prev.filter(c => c.id !== id));
  }, []);

  const saveCert = useCallback((cert) => {
    setCerts(prev => {
      const exists = prev.find(c => c.id === cert.id);
      if (exists) return prev.map(c => c.id === cert.id ? cert : c);
      return [...prev, cert];
    });
  }, []);

  // Stats
  const stats = useMemo(() => {
    let total = 0, done = 0;
    const perCourse = courses.map((c, ci) => {
      let ct = 0, cd = 0;
      c.weeks.forEach(w => w.lectures.forEach(l => {
        ct++; total++;
        if (l.completed) { cd++; done++; }
      }));
      return { name: c.courseName, total: ct, done: cd, color: COURSE_COLORS[ci] };
    });
    return { total, done, perCourse };
  }, [courses]);

  // Upcoming items (incomplete, sorted by deadline)
  const upcomingItems = useMemo(() => {
    const items = [];
    courses.forEach((c, ci) => {
      c.weeks.forEach((w, wi) => {
        const deadline = parseDeadline(w.period);
        const dday = getDday(deadline);
        w.lectures.forEach((l, li) => {
          if (!l.completed) {
            items.push({
              courseIdx: ci, weekIdx: wi, lectureIdx: li,
              courseName: c.courseName, week: w.week, title: l.title,
              period: w.period, deadline, dday, color: COURSE_COLORS[ci],
            });
          }
        });
      });
    });
    items.sort((a, b) => (a.dday ?? 999) - (b.dday ?? 999));
    return items;
  }, [courses]);

  if (!loaded) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#F8FAFC", fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 40, height: 40, border: "3px solid #E5E7EB", borderTopColor: "#6366F1",
            borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
          }} />
          <p style={{ color: "#6B7280", fontSize: 14 }}>데이터를 불러오는 중...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  const tabs = [
    { id: "dashboard", label: "대시보드", icon: "◉" },
    { id: "courses", label: "과목별 진도", icon: "◈" },
    { id: "certs", label: "자격증", icon: "◆" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #F0F4FF 0%, #FAFBFF 50%, #F5F0FF 100%)",
      fontFamily: "'Pretendard', 'Apple SD Gothic Neo', -apple-system, sans-serif",
      color: "#111827",
    }}>
      <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin { to { transform: rotate(360deg) } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 99px; }
        input[type="checkbox"] { accent-color: #6366F1; }
      `}</style>

      {/* Header */}
      <header style={{
        background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1E1B4B", letterSpacing: "-0.03em" }}>
                2026-1 학점은행제
              </h1>
              <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2, fontWeight: 500 }}>
                전체 진도 {stats.done}/{stats.total} ({stats.total ? Math.round(stats.done/stats.total*100) : 0}%)
              </p>
            </div>
            <div style={{ display: "flex", gap: 4, background: "#F1F5F9", borderRadius: 12, padding: 4 }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                  padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer",
                  fontFamily: "inherit", fontSize: 13, fontWeight: 600,
                  background: activeTab === t.id ? "#fff" : "transparent",
                  color: activeTab === t.id ? "#4F46E5" : "#64748B",
                  boxShadow: activeTab === t.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.2s",
                }}>
                  <span style={{ marginRight: 4 }}>{t.icon}</span>{t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px 80px" }}>

        {/* ====== DASHBOARD ====== */}
        {activeTab === "dashboard" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            {/* 학사일정 */}
            <section style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#374151", marginBottom: 12 }}>
                주요 학사일정
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
                {ACADEMIC_SCHEDULE.map((s, i) => {
                  const dl = new Date(s.endDate + "T23:59:59");
                  const dday = getDday(dl);
                  return (
                    <div key={i} style={{
                      background: "#fff", borderRadius: 14, padding: "14px 16px",
                      border: "1px solid #E5E7EB",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{
                          fontSize: 13, fontWeight: 700,
                          color: s.type === "exam" ? "#DC2626" : "#2563EB",
                        }}>{s.title}</span>
                        <DdayBadge deadline={dl} />
                      </div>
                      <span style={{ fontSize: 11, color: "#9CA3AF" }}>
                        {s.startDate.replace(/-/g, ".")} ~ {s.endDate.replace(/-/g, ".")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 과목별 요약 */}
            <section style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#374151", marginBottom: 12 }}>과목별 진도 현황</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
                {stats.perCourse.map((pc, i) => (
                  <div key={i} style={{
                    background: "#fff", borderRadius: 14, padding: "16px 18px",
                    borderLeft: `4px solid ${pc.color.border}`,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                    cursor: "pointer", transition: "transform 0.15s",
                  }} onClick={() => { setSelectedCourse(i); setActiveTab("courses"); }}
                    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: pc.color.text }}>{pc.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#6B7280" }}>{pc.done}/{pc.total}</span>
                    </div>
                    <ProgressBar completed={pc.done} total={pc.total} color={pc.color.border} />
                  </div>
                ))}
              </div>
            </section>

            {/* 자격증 D-day */}
            {certs.length > 0 && (
              <section style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "#374151", marginBottom: 12 }}>자격증 일정</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
                  {certs.map(cert => {
                    const dl = new Date(cert.date + "T23:59:59");
                    return (
                      <div key={cert.id} style={{
                        background: "#fff", borderRadius: 14, padding: "14px 16px",
                        border: cert.completed ? "1px solid #BBF7D0" : "1px solid #E5E7EB",
                        opacity: cert.completed ? 0.6 : 1,
                        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#111",
                            textDecoration: cert.completed ? "line-through" : "none" }}>{cert.name}</span>
                          <DdayBadge deadline={dl} />
                        </div>
                        {cert.note && <p style={{ fontSize: 11, color: "#9CA3AF", margin: "2px 0" }}>{cert.note}</p>}
                        <span style={{ fontSize: 11, color: "#9CA3AF" }}>{cert.date.replace(/-/g, ".")}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 할 일 목록 (미완료, 마감 임박순) */}
            <section>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "#374151" }}>
                  해야 할 일 <span style={{ fontSize: 12, fontWeight: 500, color: "#9CA3AF" }}>({upcomingItems.length}건)</span>
                </h2>
                <select value={weekFilter} onChange={e => setWeekFilter(e.target.value)} style={{
                  padding: "6px 12px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 12,
                  fontFamily: "inherit", background: "#fff", color: "#374151", cursor: "pointer",
                }}>
                  <option value="all">전체</option>
                  <option value="urgent">마감 임박 (7일 이내)</option>
                  <option value="thisweek">이번 주</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {upcomingItems
                  .filter(item => {
                    if (weekFilter === "urgent") return item.dday !== null && item.dday <= 7;
                    if (weekFilter === "thisweek") return item.dday !== null && item.dday >= 0 && item.dday <= 7;
                    return true;
                  })
                  .slice(0, 30)
                  .map((item, i) => (
                  <div key={`${item.courseIdx}-${item.weekIdx}-${item.lectureIdx}`} style={{
                    background: "#fff", borderRadius: 12, padding: "12px 16px",
                    border: "1px solid #E5E7EB",
                    display: "flex", alignItems: "center", gap: 12,
                    animation: `fadeUp 0.3s ease ${i * 0.02}s both`,
                    transition: "background 0.15s",
                    cursor: "pointer",
                  }}
                    onClick={() => toggleLecture(item.courseIdx, item.weekIdx, item.lectureIdx)}
                    onMouseEnter={e => e.currentTarget.style.background = "#FAFAFE"}
                    onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                    <input type="checkbox" checked={false} readOnly style={{ width: 18, height: 18, flexShrink: 0, cursor: "pointer" }} />
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: item.color.text,
                      background: item.color.light, padding: "2px 8px", borderRadius: 6,
                      flexShrink: 0,
                    }}>{item.courseName}</span>
                    <span style={{ fontSize: 11, color: "#9CA3AF", flexShrink: 0 }}>{item.week}주차</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#374151", flex: 1, minWidth: 0,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</span>
                    <DdayBadge deadline={item.deadline} />
                  </div>
                ))}
                {upcomingItems.length === 0 && (
                  <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF", fontSize: 14 }}>
                    모든 할 일을 완료했습니다!
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* ====== COURSES ====== */}
        {activeTab === "courses" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            {/* Course selector */}
            <div style={{
              display: "flex", gap: 6, overflowX: "auto", paddingBottom: 12, marginBottom: 20,
              WebkitOverflowScrolling: "touch",
            }}>
              {courses.map((c, i) => (
                <button key={c.id} onClick={() => setSelectedCourse(i)} style={{
                  padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer",
                  fontFamily: "inherit", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
                  background: selectedCourse === i ? COURSE_COLORS[i].border : "#fff",
                  color: selectedCourse === i ? "#fff" : COURSE_COLORS[i].text,
                  boxShadow: selectedCourse === i ? `0 2px 8px ${COURSE_COLORS[i].border}44` : "0 1px 2px rgba(0,0,0,0.06)",
                  transition: "all 0.2s",
                }}>{c.courseName}</button>
              ))}
            </div>

            {/* Course progress */}
            <div style={{
              background: "#fff", borderRadius: 16, padding: 20, marginBottom: 20,
              borderLeft: `4px solid ${COURSE_COLORS[selectedCourse].border}`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: COURSE_COLORS[selectedCourse].text }}>
                  {courses[selectedCourse].courseName}
                </h2>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#6B7280" }}>
                  {stats.perCourse[selectedCourse].done}/{stats.perCourse[selectedCourse].total} 완료
                </span>
              </div>
              <ProgressBar
                completed={stats.perCourse[selectedCourse].done}
                total={stats.perCourse[selectedCourse].total}
                color={COURSE_COLORS[selectedCourse].border}
              />
            </div>

            {/* Weeks */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {courses[selectedCourse].weeks.map((w, wIdx) => {
                const allDone = w.lectures.every(l => l.completed);
                const someDone = w.lectures.some(l => l.completed);
                const deadline = parseDeadline(w.period);
                const lecDone = w.lectures.filter(l => l.completed).length;
                return (
                  <div key={wIdx} style={{
                    background: allDone ? "#F0FDF4" : "#fff",
                    borderRadius: 14, overflow: "hidden",
                    border: allDone ? "1px solid #BBF7D0" : "1px solid #E5E7EB",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                  }}>
                    {/* Week header */}
                    <div style={{
                      padding: "12px 16px", display: "flex", alignItems: "center",
                      justifyContent: "space-between", borderBottom: "1px solid #F3F4F6",
                      background: allDone ? "#DCFCE7" : someDone ? "#FFFBEB" : "transparent",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{
                          width: 32, height: 32, borderRadius: 8, display: "flex",
                          alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800,
                          background: allDone ? "#22C55E" : COURSE_COLORS[selectedCourse].border,
                          color: "#fff",
                        }}>
                          {allDone ? "✓" : w.week}
                        </span>
                        <div>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{w.week}주차</span>
                          <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 8 }}>{w.period}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#6B7280" }}>{lecDone}/{w.lectures.length}</span>
                        <DdayBadge deadline={deadline} />
                      </div>
                    </div>
                    {/* Lectures */}
                    <div style={{ padding: "8px 12px" }}>
                      {w.lectures.map((l, lIdx) => (
                        <div key={lIdx} style={{
                          display: "flex", alignItems: "center", gap: 10, padding: "10px 8px",
                          borderRadius: 8, cursor: "pointer", transition: "background 0.15s",
                        }}
                          onClick={() => toggleLecture(selectedCourse, wIdx, lIdx)}
                          onMouseEnter={e => e.currentTarget.style.background = "#F9FAFB"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <input type="checkbox" checked={l.completed} readOnly
                            style={{ width: 18, height: 18, cursor: "pointer", flexShrink: 0 }} />
                          <span style={{
                            fontSize: 13, fontWeight: 500, flex: 1,
                            color: l.completed ? "#9CA3AF" : "#374151",
                            textDecoration: l.completed ? "line-through" : "none",
                          }}>{l.title}</span>
                          {l.completed && (
                            <span style={{
                              fontSize: 10, fontWeight: 700, color: "#16A34A", background: "#DCFCE7",
                              padding: "2px 8px", borderRadius: 6,
                            }}>완료</span>
                          )}
                          {!l.completed && <DdayBadge deadline={deadline} />}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ====== CERTS ====== */}
        {activeTab === "certs" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1E1B4B" }}>자격증 일정 관리</h2>
              <button onClick={() => { setEditCert(null); setShowCertModal(true); }} style={{
                padding: "8px 18px", borderRadius: 10, border: "none", cursor: "pointer",
                background: "#4F46E5", color: "#fff", fontWeight: 600, fontSize: 13,
                fontFamily: "inherit", boxShadow: "0 2px 8px rgba(79,70,229,0.3)",
              }}>+ 일정 추가</button>
            </div>

            {certs.length === 0 ? (
              <div style={{
                background: "#fff", borderRadius: 16, padding: "60px 20px", textAlign: "center",
                border: "1px dashed #D1D5DB",
              }}>
                <p style={{ fontSize: 36, marginBottom: 12 }}>📋</p>
                <p style={{ fontSize: 14, color: "#9CA3AF", fontWeight: 500 }}>등록된 자격증 일정이 없습니다</p>
                <p style={{ fontSize: 12, color: "#D1D5DB", marginTop: 4 }}>위의 '+ 일정 추가' 버튼을 눌러 추가해 보세요</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[...certs].sort((a, b) => new Date(a.date) - new Date(b.date)).map(cert => {
                  const dl = new Date(cert.date + "T23:59:59");
                  return (
                    <div key={cert.id} style={{
                      background: "#fff", borderRadius: 14, padding: "16px 20px",
                      border: cert.completed ? "1px solid #BBF7D0" : "1px solid #E5E7EB",
                      display: "flex", alignItems: "center", gap: 12,
                      opacity: cert.completed ? 0.6 : 1,
                      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                    }}>
                      <input type="checkbox" checked={cert.completed}
                        onChange={() => toggleCert(cert.id)}
                        style={{ width: 20, height: 20, cursor: "pointer", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{
                            fontSize: 15, fontWeight: 700, color: "#111",
                            textDecoration: cert.completed ? "line-through" : "none",
                          }}>{cert.name}</span>
                          <DdayBadge deadline={dl} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                          <span style={{ fontSize: 12, color: "#9CA3AF" }}>{cert.date.replace(/-/g, ".")}</span>
                          {cert.note && <span style={{ fontSize: 12, color: "#6B7280" }}>· {cert.note}</span>}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button onClick={() => { setEditCert(cert); setShowCertModal(true); }} style={{
                          padding: "6px 12px", borderRadius: 8, border: "1px solid #D1D5DB",
                          background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 500,
                          fontFamily: "inherit", color: "#6B7280",
                        }}>수정</button>
                        <button onClick={() => deleteCert(cert.id)} style={{
                          padding: "6px 12px", borderRadius: 8, border: "1px solid #FECACA",
                          background: "#FEF2F2", cursor: "pointer", fontSize: 12, fontWeight: 500,
                          fontFamily: "inherit", color: "#DC2626",
                        }}>삭제</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {showCertModal && (
        <CertModal
          onClose={() => { setShowCertModal(false); setEditCert(null); }}
          onSave={saveCert}
          editItem={editCert}
        />
      )}
    </div>
  );
}