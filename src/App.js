import React, { useState, useEffect } from 'react';
import './App.css';

const initialData = [
  {
    courseName: "기계공작법",
    weeks: [
      { week: 1, period: "2026-03-03 ~ 2026-03-16", lectures: [{ title: "1차시: 제조와 생산의 이해", completed: true }, { title: "2차시: 공업 재료의 성질", completed: true }, { title: "3차시: 치수, 공차 및 표면", completed: true }] },
      { week: 2, period: "2026-03-10 ~ 2026-03-23", lectures: [{ title: "1차시: 금속 재료의 표면", completed: true }, { title: "2차시: 세라믹 재료의 특성", completed: true }, { title: "3차시: 고분자 재료와 복합 재료의 특성", completed: true }] },
      { week: 3, period: "2026-03-17 ~ 2026-03-30", lectures: [{ title: "1차시: 주조의 기초", completed: true }, { title: "2차시: 사형주조", completed: true }, { title: "3차시: 특수주조", completed: true }] },
      { week: 4, period: "2026-03-24 ~ 2026-04-06", lectures: [{ title: "1차시: 유리 성형", completed: true }, { title: "2차시: 플라스틱 가공 공정", completed: true }, { title: "3차시: 응고 공정", completed: true }] },
      { week: 5, period: "2026-03-31 ~ 2026-04-13", lectures: [{ title: "1차시: 분말 야금-압축 및 소결", completed: false }, { title: "2차시: 분말 야금-가압법 및 소결법 대체 기술", completed: false }, { title: "3차시: 세라믹 및 서멧의 가공", completed: false }, { title: "쪽지시험 응시", completed: false }] },
      { week: 6, period: "2026-04-07 ~ 2026-04-20", lectures: [{ title: "1차시: 금속 성형의 기초", completed: false }, { title: "2차시: 금속의 용적 변형공정", completed: false }, { title: "3차시: 금속 박판 가공", completed: false }] },
      { week: 7, period: "2026-04-17 ~ 2026-04-20", lectures: [{ title: "중간고사 응시", completed: false }] },
      { week: 8, period: "2026-04-21 ~ 2026-05-04", lectures: [{ title: "1차시: 절삭 가공의 이론", completed: false }, { title: "2차시: 절삭 공정과 공작기계 - 선삭, 드릴링, 밀링", completed: false }, { title: "3차시: 절삭 공정과 공작기계 - 기타공정", completed: false }] },
      { week: 9, period: "2026-04-28 ~ 2026-05-11", lectures: [{ title: "1차시: 절삭 공구 기술", completed: false }, { title: "2차시: 연삭과 기타 연마 공정", completed: false }, { title: "3차시: 특수 가공과 열적 절삭 공정", completed: false }] },
      { week: 10, period: "2026-05-05 ~ 2026-05-18", lectures: [{ title: "1차시: 금속의 열처리", completed: false }, { title: "2차시: 청정법과 표면 처리", completed: false }, { title: "3차시: 코팅 및 도포기술", completed: false }, { title: "과제 제출 시작", completed: false }] },
      { week: 11, period: "2026-05-12 ~ 2026-05-25", lectures: [{ title: "1차시: 용접의 기초", completed: false }, { title: "2차시: 아크 용접 및 저항 용접", completed: false }, { title: "3차시: 산소 용접 및 기타 용접", completed: false }] },
      { week: 14, period: "2026-06-02 ~ 2026-06-15", lectures: [{ title: "1차시: 실리콘 공정 및 리소그래피", completed: false }, { title: "2차시: 적층 및 집적 회로(IC) 패키징", completed: false }, { title: "3차시: 전자조립과 패키징", completed: false }] },
      { week: 15, period: "2026-06-12 ~ 2026-06-15", lectures: [{ title: "기말고사 응시", completed: false }] }
    ]
  },
  {
    courseName: "평생교육방법론",
    weeks: [
      { week: 1, period: "2026-03-02 ~ 03-15", lectures: [{ title: "평생교육이란?", completed: true }, { title: "평생교육방법이란?", completed: true }, { title: "포스트코로나와 평생교육방법", completed: true }] },
      { week: 2, period: "2026-03-09 ~ 03-22", lectures: [{ title: "인지적 특성", completed: true }, { title: "신체적, 정서적 특성", completed: true }, { title: "성인학습의 특성과 학습", completed: true }] },
      { week: 3, period: "2026-03-16 ~ 03-29", lectures: [{ title: "행동주의", completed: true }, { title: "인지주의", completed: true }, { title: "구성주의", completed: true }, { title: "과제 제출 시작(3~11주차)", completed: false }] },
      { week: 4, period: "2026-03-23 ~ 04-05", lectures: [{ title: "주요이론1 (안드라고지, 자기주도적학습)", completed: true }, { title: "주요이론2 (전환학습, 문제제기식 교육)", completed: true }, { title: "주요이론3 (경험학습, 마진이론, 3차원학습)", completed: true }] },
      { week: 5, period: "2026-03-30 ~ 04-12", lectures: [{ title: "교수학습 체제", completed: false }, { title: "교수학습과정1 (목표, 출발점행동, 학습내용)", completed: false }, { title: "교수학습 과정2 (학습활동, 평가)", completed: false }, { title: "자유토론(1) 참여", completed: false }] },
      { week: 6, period: "2026-04-06 ~ 04-19", lectures: [{ title: "개인중심1 (멘토링)", completed: false }, { title: "개인중심 2 (코칭)", completed: false }, { title: "개인중심 3 (학습계약, 도제법)", completed: false }] },
      { week: 7, period: "2026-04-13 ~ 04-26", lectures: [{ title: "집단중심 1 (강의, 강연)", completed: false }, { title: "집단중심 2 (질문, 프리젠테이션, 발표)", completed: false }, { title: "집단중심3 (토의, 포럼, 패널, 심포지엄 등)", completed: false }] },
      { week: 8, period: "2026-04-20 ~ 04-26", lectures: [{ title: "8주차 중간고사 퀴즈", completed: false }] },
      { week: 9, period: "2026-04-27 ~ 05-10", lectures: [{ title: "집단/체험1 (아이스브레이킹 등)", completed: false }, { title: "집단/체험2 (역할극 액션러닝 등)", completed: false }, { title: "집단/체험3 (시범, 시뮬레이션 등)", completed: false }] },
      { week: 10, period: "2026-05-04 ~ 05-17", lectures: [{ title: "웹기반형1", completed: false }, { title: "웹기반형2", completed: false }, { title: "웹기반형3", completed: false }, { title: "10-12주차 퀴즈 응시", completed: false }] },
      { week: 11, period: "2026-05-11 ~ 05-24", lectures: [{ title: "창의력개발1", completed: false }, { title: "창의력개발2", completed: false }, { title: "창의력개발3", completed: false }, { title: "자유토론(2) 참여", completed: false }] },
      { week: 12, period: "2026-05-18 ~ 05-31", lectures: [{ title: "평생교육 자료유형 및 개발", completed: false }, { title: "평생교육 자료개발의 과정", completed: false }, { title: "평생교육 자료개발의 방법 및 활용", completed: false }] },
      { week: 13, period: "2026-05-25 ~ 06-07", lectures: [{ title: "프로그램 운영 개념과 원리", completed: false }, { title: "프로그램 운영 실행", completed: false }, { title: "평생교육사의 전문성", completed: false }] },
      { week: 14, period: "2026-06-01 ~ 06-14", lectures: [{ title: "프로그램 평가 개념과 모델", completed: false }, { title: "프로그램 평가 절차", completed: false }, { title: "주요 평생교육프로그램", completed: false }] },
      { week: 15, period: "2026-06-08 ~ 06-14", lectures: [{ title: "15주차 기말고사 퀴즈", completed: false }] }
    ]
  },
  {
    courseName: "디지털경제론",
    weeks: [
      { week: 1, period: "02-23 ~ 03-08", lectures: [{ title: "1-1~1-4 강의 수강", completed: true }, { title: "1-5 QUIZ", completed: true }] },
      { week: 2, period: "03-02 ~ 03-15", lectures: [{ title: "2-1~2-4 강의 수강", completed: true }, { title: "2-5 QUIZ", completed: true }] },
      { week: 3, period: "03-09 ~ 03-22", lectures: [{ title: "3-1~3-4 강의 수강", completed: true }, { title: "3-5 QUIZ", completed: true }] },
      { week: 4, period: "03-16 ~ 03-31", lectures: [{ title: "4-1~4-4 강의 수강", completed: true }, { title: "4-5 QUIZ", completed: true }] },
      { week: 5, period: "03-23 ~ 04-07", lectures: [{ title: "5-1~5-4 강의 수강", completed: false }, { title: "5-5 QUIZ", completed: false }] },
      { week: 6, period: "03-30 ~ 04-12", lectures: [{ title: "6-1~6-4 강의 수강", completed: false }, { title: "6-5 QUIZ", completed: false }] },
      { week: 7, period: "04-06 ~ 04-19", lectures: [{ title: "7-1~7-4 강의 수강", completed: false }, { title: "7-5 QUIZ", completed: false }] },
      { week: 8, period: "04-13 ~ 04-19", lectures: [{ title: "8주차 중간고사", completed: false }] },
      { week: 9, period: "04-20 ~ 05-03", lectures: [{ title: "9-1~9-4 강의 수강", completed: false }, { title: "9-5 QUIZ", completed: false }] },
      { week: 10, period: "04-27 ~ 05-10", lectures: [{ title: "10-1~10-4 강의 수강", completed: false }, { title: "10-5 QUIZ", completed: false }] },
      { week: 11, period: "05-04 ~ 05-17", lectures: [{ title: "11-1~11-4 강의 수강", completed: false }, { title: "11-5 QUIZ", completed: false }] },
      { week: 12, period: "05-11 ~ 05-24", lectures: [{ title: "12-1~12-4 강의 수강", completed: false }, { title: "12-5 QUIZ", completed: false }] },
      { week: 13, period: "05-18 ~ 05-31", lectures: [{ title: "13-1~13-4 강의 수강", completed: false }, { title: "13-5 QUIZ", completed: false }] },
      { week: 14, period: "05-25 ~ 06-07", lectures: [{ title: "14-1~14-4 강의 수강", completed: false }, { title: "14-5 QUIZ", completed: false }] },
      { week: 15, period: "06-01 ~ 06-07", lectures: [{ title: "15주차 기말고사", completed: false }] }
    ]
  },
  {
    courseName: "설득커뮤니케이션",
    weeks: [
      { week: 1, period: "02-23 ~ 03-08", lectures: [{ title: "1-1~1-3 강의 수강", completed: true }, { title: "1주차 QUIZ 1", completed: true }, { title: "1-4~1-6 강의 수강", completed: true }, { title: "1주차 QUIZ 2", completed: true }] },
      { week: 2, period: "03-02 ~ 03-15", lectures: [{ title: "2-1~2-3 강의 수강", completed: true }, { title: "2주차 QUIZ 1", completed: true }, { title: "2-4~2-6 강의 수강", completed: true }, { title: "2주차 QUIZ 2", completed: true }] },
      { week: 3, period: "03-09 ~ 03-22", lectures: [{ title: "3-1~3-3 강의 수강", completed: true }, { title: "3주차 QUIZ 1", completed: true }, { title: "3-4~3-6 강의 수강", completed: true }, { title: "3주차 QUIZ 2", completed: true }] },
      { week: 4, period: "03-16 ~ 03-31", lectures: [{ title: "4-1~4-3 강의 수강", completed: true }, { title: "4주차 QUIZ 1", completed: true }, { title: "4-4~4-6 강의 수강", completed: true }, { title: "4주차 QUIZ 2", completed: true }] },
      { week: 5, period: "03-23 ~ 04-07", lectures: [{ title: "5-1~5-3 강의 수강", completed: true }, { title: "5주차 QUIZ 1", completed: true }, { title: "5-4~5-6 강의 수강", completed: true }, { title: "5주차 QUIZ 2", completed: true }] },
      { week: 6, period: "03-30 ~ 04-12", lectures: [{ title: "6-1~6-3 강의 수강", completed: false }, { title: "6주차 QUIZ 1", completed: false }, { title: "6-4~6-6 강의 수강", completed: false }, { title: "6주차 QUIZ 2", completed: false }] },
      { week: 7, period: "04-06 ~ 04-19", lectures: [{ title: "7-1~7-3 강의 수강", completed: false }, { title: "7주차 QUIZ 1", completed: false }, { title: "7-4~7-6 강의 수강", completed: false }, { title: "7주차 QUIZ 2", completed: false }] },
      { week: 8, period: "04-13 ~ 04-19", lectures: [{ title: "8주차 중간고사 응시", completed: false }] },
      { week: 9, period: "04-20 ~ 05-03", lectures: [{ title: "9-1~9-3 강의 수강", completed: false }, { title: "9주차 QUIZ 1", completed: false }, { title: "9-4~9-6 강의 수강", completed: false }, { title: "9주차 QUIZ 2", completed: false }] },
      { week: 10, period: "04-27 ~ 05-10", lectures: [{ title: "10-1~10-3 강의 수강", completed: false }, { title: "10주차 QUIZ 1", completed: false }, { title: "10-4~10-6 강의 수강", completed: false }, { title: "10주차 QUIZ 2", completed: false }] },
      { week: 11, period: "05-04 ~ 05-17", lectures: [{ title: "11-1~11-3 강의 수강", completed: false }, { title: "11주차 QUIZ 1", completed: false }, { title: "11-4~11-6 강의 수강", completed: false }, { title: "11주차 QUIZ 2", completed: false }] },
      { week: 12, period: "05-11 ~ 05-24", lectures: [{ title: "12-1~12-3 강의 수강", completed: false }, { title: "12주차 QUIZ 1", completed: false }, { title: "12-4~12-6 강의 수강", completed: false }, { title: "12주차 QUIZ 2", completed: false }] },
      { week: 13, period: "05-18 ~ 05-31", lectures: [{ title: "13-1~13-3 강의 수강", completed: false }, { title: "13주차 QUIZ 1", completed: false }, { title: "13-4~13-6 강의 수강", completed: false }, { title: "13주차 QUIZ 2", completed: false }] },
      { week: 14, period: "05-25 ~ 06-07", lectures: [{ title: "14-1~14-2 강의 수강", completed: false }, { title: "14주차 QUIZ", completed: false }] },
      { week: 15, period: "06-01 ~ 06-07", lectures: [{ title: "15주차 기말고사 응시", completed: false }] }
    ]
  },
  {
    courseName: "기업과 사회",
    weeks: [
      { week: 1, period: "02-23 ~ 03-08", lectures: [{ title: "1-1~1-3 강의 수강", completed: true }, { title: "1주차 퀴즈", completed: true }] },
      { week: 2, period: "03-02 ~ 03-15", lectures: [{ title: "2-1~2-3 강의 수강", completed: true }, { title: "2주차 퀴즈", completed: true }] },
      { week: 3, period: "03-09 ~ 03-22", lectures: [{ title: "3-1~3-3 강의 수강", completed: true }, { title: "3주차 퀴즈", completed: true }] },
      { week: 4, period: "03-16 ~ 03-31", lectures: [{ title: "4-1~4-3 강의 수강", completed: true }, { title: "4주차 퀴즈", completed: true }] },
      { week: 5, period: "03-23 ~ 04-07", lectures: [{ title: "5-1~5-3 강의 수강", completed: true }, { title: "5주차 퀴즈", completed: true }] },
      { week: 6, period: "03-30 ~ 04-12", lectures: [{ title: "6-1~6-3 강의 수강", completed: true }, { title: "6주차 퀴즈", completed: true }] },
      { week: 7, period: "04-06 ~ 04-19", lectures: [{ title: "7-1~7-3 강의 수강", completed: false }, { title: "7주차 퀴즈", completed: false }] },
      { week: 8, period: "04-13 ~ 04-19", lectures: [{ title: "8주차 중간고사 응시", completed: false }] },
      { week: 9, period: "04-20 ~ 05-03", lectures: [{ title: "9-1~9-3 강의 수강", completed: false }, { title: "9주차 퀴즈", completed: false }] },
      { week: 10, period: "04-27 ~ 05-10", lectures: [{ title: "10-1~10-3 강의 수강", completed: false }, { title: "10주차 퀴즈", completed: false }] },
      { week: 11, period: "05-04 ~ 05-17", lectures: [{ title: "11-1~11-3 강의 수강", completed: false }, { title: "11주차 퀴즈", completed: false }] },
      { week: 12, period: "05-11 ~ 05-24", lectures: [{ title: "12-1~12-3 강의 수강", completed: false }, { title: "12주차 퀴즈", completed: false }] },
      { week: 13, period: "05-18 ~ 05-31", lectures: [{ title: "13-1~13-3 강의 수강", completed: false }, { title: "13주차 퀴즈", completed: false }] },
      { week: 14, period: "05-25 ~ 06-07", lectures: [{ title: "14-1~14-3 강의 수강", completed: false }, { title: "14주차 퀴즈", completed: false }] },
      { week: 15, period: "06-01 ~ 06-07", lectures: [{ title: "15주차 기말고사 응시", completed: false }] }
    ]
  },
  {
    courseName: "경영혁신",
    weeks: [
      { week: 1, period: "02-23 ~ 03-08", lectures: [{ title: "1-1~1-6 강의 수강", completed: true }, { title: "1주차 퀴즈", completed: true }] },
      { week: 2, period: "03-02 ~ 03-15", lectures: [{ title: "2-1~2-6 강의 수강", completed: true }, { title: "2주차 퀴즈", completed: true }] },
      { week: 3, period: "03-09 ~ 03-22", lectures: [{ title: "3-1~3-6 강의 수강", completed: true }, { title: "3주차 퀴즈", completed: true }] },
      { week: 4, period: "03-16 ~ 03-31", lectures: [{ title: "4-1~4-6 강의 수강", completed: true }, { title: "4주차 퀴즈", completed: true }] },
      { week: 5, period: "03-23 ~ 04-07", lectures: [{ title: "5-1 오프라인 특강 영상 수강", completed: true }, { title: "5주차 퀴즈", completed: true }] },
      { week: 6, period: "03-30 ~ 04-12", lectures: [{ title: "6-1~6-4 강의 수강", completed: true }, { title: "6-5~6-7 강의 수강", completed: false }, { title: "6주차 퀴즈", completed: true }] },
      { week: 7, period: "04-06 ~ 04-19", lectures: [{ title: "7-1~7-5 강의 수강", completed: false }, { title: "7주차 퀴즈", completed: false }] },
      { week: 8, period: "04-13 ~ 04-19", lectures: [{ title: "8주차 중간고사 응시", completed: false }] },
      { week: 9, period: "04-20 ~ 05-03", lectures: [{ title: "9-1~9-7 강의 수강", completed: false }, { title: "9주차 퀴즈", completed: false }] },
      { week: 10, period: "04-27 ~ 05-10", lectures: [{ title: "10-1~10-5 강의 수강", completed: false }, { title: "10주차 퀴즈", completed: false }] },
      { week: 11, period: "05-04 ~ 05-17", lectures: [{ title: "11-1~11-6 강의 수강", completed: false }, { title: "11주차 퀴즈", completed: false }] },
      { week: 12, period: "05-11 ~ 05-24", lectures: [{ title: "12-1~12-4 강의 수강", completed: false }, { title: "12주차 퀴즈", completed: false }] },
      { week: 13, period: "05-18 ~ 05-31", lectures: [{ title: "13-1~13-6 강의 수강", completed: false }, { title: "13주차 퀴즈", completed: false }] },
      { week: 14, period: "05-25 ~ 06-07", lectures: [{ title: "14-1~14-4 강의 수강", completed: false }, { title: "14주차 퀴즈", completed: false }] },
      { week: 15, period: "06-01 ~ 06-07", lectures: [{ title: "15주차 기말고사 응시", completed: false }] }
    ]
  },
  {
    courseName: "실용한문",
    weeks: [
      { week: 1, period: "02-23 ~ 03-08", lectures: [{ title: "1-1~1-6 강의 수강", completed: true }, { title: "1주차 퀴즈", completed: true }] },
      { week: 2, period: "03-02 ~ 03-15", lectures: [{ title: "2-1~2-6 강의 수강", completed: true }, { title: "2주차 퀴즈", completed: true }] },
      { week: 3, period: "03-09 ~ 03-22", lectures: [{ title: "3-1~3-6 강의 수강", completed: true }, { title: "3주차 퀴즈", completed: true }] },
      { week: 4, period: "03-16 ~ 03-31", lectures: [{ title: "4-1~4-6 강의 수강", completed: true }, { title: "4주차 퀴즈", completed: true }] },
      { week: 5, period: "03-23 ~ 04-07", lectures: [{ title: "5-1~5-4 강의 수강", completed: true }, { title: "5-5 강의 수강", completed: false }, { title: "5주차 퀴즈", completed: true }] },
      { week: 6, period: "03-30 ~ 04-12", lectures: [{ title: "6-1~6-5 강의 수강", completed: false }, { title: "6주차 퀴즈", completed: false }] },
      { week: 7, period: "04-06 ~ 04-19", lectures: [{ title: "7-1~7-5 강의 수강", completed: false }, { title: "7주차 퀴즈", completed: false }] },
      { week: 8, period: "04-13 ~ 04-19", lectures: [{ title: "8주차 중간고사 응시", completed: false }] },
      { week: 9, period: "04-20 ~ 05-03", lectures: [{ title: "9-1~9-7 강의 수강", completed: false }, { title: "9주차 퀴즈", completed: false }] },
      { week: 10, period: "04-27 ~ 05-10", lectures: [{ title: "10-1~10-6 강의 수강", completed: false }, { title: "10주차 퀴즈", completed: false }] },
      { week: 11, period: "05-04 ~ 05-17", lectures: [{ title: "11-1~11-6 강의 수강", completed: false }, { title: "11주차 퀴즈", completed: false }] },
      { week: 12, period: "05-11 ~ 05-24", lectures: [{ title: "12-1~12-7 강의 수강", completed: false }, { title: "12주차 퀴즈", completed: false }] },
      { week: 13, period: "05-18 ~ 05-31", lectures: [{ title: "13-1~13-6 강의 수강", completed: false }, { title: "13주차 퀴즈", completed: false }] },
      { week: 14, period: "05-25 ~ 06-07", lectures: [{ title: "14-1~14-5 강의 수강", completed: false }, { title: "14주차 퀴즈", completed: false }] },
      { week: 15, period: "06-01 ~ 06-07", lectures: [{ title: "15주차 기말고사 응시", completed: false }] }
    ]
  },
  {
    courseName: "현대인의 정신건강",
    weeks: [
      { week: 1, period: "02-23 ~ 03-08", lectures: [{ title: "1-1~1-4 강의 수강", completed: true }, { title: "1-5 QUIZ", completed: true }] },
      { week: 2, period: "03-02 ~ 03-15", lectures: [{ title: "2-1~2-3 강의 수강", completed: true }, { title: "2-4 QUIZ", completed: true }] },
      { week: 3, period: "03-09 ~ 03-22", lectures: [{ title: "3-1~3-3 강의 수강", completed: true }, { title: "3-4 QUIZ", completed: true }] },
      { week: 4, period: "03-16 ~ 03-31", lectures: [{ title: "4-1~4-3 강의 수강", completed: true }, { title: "4-4 QUIZ", completed: true }] },
      { week: 5, period: "03-23 ~ 04-07", lectures: [{ title: "5-1~5-3 강의 수강", completed: true }, { title: "5-4 QUIZ", completed: true }] },
      { week: 6, period: "03-30 ~ 04-12", lectures: [{ title: "6-1~6-3 강의 수강", completed: true }, { title: "6-4 QUIZ", completed: true }] },
      { week: 7, period: "04-06 ~ 04-19", lectures: [{ title: "7-1~7-3 강의 수강", completed: false }, { title: "7-4 QUIZ", completed: false }] },
      { week: 8, period: "04-13 ~ 04-19", lectures: [{ title: "8주차 중간고사 응시", completed: false }] },
      { week: 9, period: "04-20 ~ 05-03", lectures: [{ title: "9-1~9-3 강의 수강", completed: false }, { title: "9-4 QUIZ", completed: false }] },
      { week: 10, period: "04-27 ~ 05-10", lectures: [{ title: "10-1~10-2 강의 수강", completed: false }, { title: "10-3 QUIZ", completed: false }] },
      { week: 11, period: "05-04 ~ 05-17", lectures: [{ title: "11-1~11-2 강의 수강", completed: false }, { title: "11-3 QUIZ", completed: false }] },
      { week: 12, period: "05-11 ~ 05-24", lectures: [{ title: "12-1~12-3 강의 수강", completed: false }, { title: "12-4 QUIZ", completed: false }, { title: "개인 과제 제출", completed: false }] },
      { week: 13, period: "05-18 ~ 05-31", lectures: [{ title: "13-1~13-3 강의 수강", completed: false }, { title: "13-4 QUIZ", completed: false }] },
      { week: 14, period: "05-25 ~ 06-07", lectures: [{ title: "14-1~14-4 강의 수강", completed: false }, { title: "14-5 QUIZ", completed: false }] },
      { week: 15, period: "06-01 ~ 06-07", lectures: [{ title: "15주차 기말고사 응시", completed: false }] }
    ]
  }
];

const generalSchedule = [
  { title: "쪽지시험", date: "2026.03.31 ~ 2026.04.13" },
  { title: "중간고사", date: "2026.04.17 ~ 2026.04.20" },
  { title: "토론", date: "2026.04.21 ~ 2026.05.11" },
  { title: "과제", date: "2026.05.05 ~ 2026.06.01" },
  { title: "기말고사", date: "2026.06.12 ~ 2026.06.15" }
];

export default function App() {
  const [courses, setCourses] = useState(() => {
    const saved = localStorage.getItem('courseProgress');
    return saved ? JSON.parse(saved) : initialData;
  });
  const [selectedCourseIdx, setSelectedCourseIdx] = useState(0);

  useEffect(() => {
    localStorage.setItem('courseProgress', JSON.stringify(courses));
  }, [courses]);

  const toggleCompletion = (courseIdx, weekIdx, lectureIdx) => {
    const updatedCourses = JSON.parse(JSON.stringify(courses));
    const isCompleted = updatedCourses[courseIdx].weeks[weekIdx].lectures[lectureIdx].completed;
    updatedCourses[courseIdx].weeks[weekIdx].lectures[lectureIdx].completed = !isCompleted;
    setCourses(updatedCourses);
  };

  const selectedCourse = courses[selectedCourseIdx];

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* 학사 일정 대시보드 */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-t-8 border-blue-600">
          <h1 className="text-2xl md:text-3xl font-black mb-6 text-gray-900 tracking-tight">학점은행제 학습 대시보드</h1>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {generalSchedule.map((item, idx) => (
              <div key={idx} className="p-3 bg-blue-50 rounded-lg text-center border border-blue-100">
                <p className="text-xs font-bold text-blue-500 uppercase">{item.title}</p>
                <p className="text-[10px] md:text-xs text-blue-800 font-medium mt-1 leading-tight">{item.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 과목 선택 네비게이션 */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {courses.map((course, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCourseIdx(idx)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${
                selectedCourseIdx === idx
                  ? 'bg-blue-600 text-white transform scale-105'
                  : 'bg-white text-gray-500 hover:bg-gray-200'
              }`}
            >
              {course.courseName}
            </button>
          ))}
        </div>

        {/* 선택 과목 상세 진도표 */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-gray-800">{selectedCourse.courseName}</h2>
            <div className="text-right">
              <span className="text-xs font-bold text-gray-400">PROGRESS</span>
              <p className="text-lg font-black text-blue-600 leading-none">
                {Math.round((selectedCourse.weeks.reduce((acc, week) => acc + week.lectures.filter(l => l.completed).length, 0) / 
                selectedCourse.weeks.reduce((acc, week) => acc + week.lectures.length, 0)) * 100)}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {selectedCourse.weeks.map((weekData, wIdx) => (
              <div key={wIdx} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex flex-wrap justify-between items-center mb-3">
                  <h3 className="font-black text-blue-700 text-sm">{weekData.week}주차 일정</h3>
                  <span className="text-[10px] md:text-xs font-bold text-gray-400 bg-white px-2 py-1 rounded-full border border-gray-100">
                    수강 인정: {weekData.period}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {weekData.lectures.map((lecture, lIdx) => (
                    <div 
                      key={lIdx} 
                      onClick={() => toggleCompletion(selectedCourseIdx, wIdx, lIdx)}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                        lecture.completed 
                        ? 'bg-white border-blue-200 shadow-sm opacity-60' 
                        : 'bg-white border-transparent shadow hover:border-blue-400'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center mr-3 border-2 transition-colors ${
                        lecture.completed ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'
                      }`}>
                        {lecture.completed && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>}
                      </div>
                      <span className={`text-sm font-bold flex-grow ${lecture.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                        {lecture.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}