import React, { useState } from 'react';
import './App.css';

const initialData = [
  {
    courseName: "기계공작법",
    weeks: [
      { week: 1, period: "03-03 ~ 03-16", lectures: [{ title: "제조와 생산의 이해", completed: true }, { title: "공업 재료의 성질", completed: true }, { title: "치수, 공차 및 표면", completed: true }] },
      { week: 2, period: "03-10 ~ 03-23", lectures: [{ title: "금속 재료의 표면", completed: true }, { title: "세라믹 재료의 특성", completed: true }, { title: "고분자 재료와 복합 재료의 특성", completed: true }] },
      { week: 3, period: "03-17 ~ 03-30", lectures: [{ title: "주조의 기초", completed: true }, { title: "사형주조", completed: true }, { title: "특수주조", completed: true }] },
      { week: 4, period: "03-24 ~ 04-06", lectures: [{ title: "유리 성형", completed: true }, { title: "플라스틱 가공 공정", completed: true }, { title: "응고 공정", completed: true }] },
      { week: 5, period: "03-31 ~ 04-13", lectures: [{ title: "분말 야금-압축 및 소결", completed: false }, { title: "분말 야금-가압법 및 소결법 대체 기술", completed: false }, { title: "세라믹 및 서멧의 가공", completed: false }] },
      { week: 6, period: "04-07 ~ 04-20", lectures: [{ title: "금속 성형의 기초", completed: false }, { title: "금속의 용적 변형공정", completed: false }, { title: "금속 박판 가공", completed: false }] },
      { week: 7, period: "04-17 ~ 04-20", lectures: [{ title: "시험 (중간고사)", completed: false }] },
      { week: 8, period: "04-21 ~ 05-04", lectures: [{ title: "절삭 가공의 이론", completed: false }, { title: "절삭 공정과 공작기계 - 선삭, 드릴링, 밀링", completed: false }, { title: "절삭 공정과 공작기계 - 기타공정", completed: false }] },
      { week: 9, period: "04-28 ~ 05-11", lectures: [{ title: "절삭 공구 기술", completed: false }, { title: "연삭과 기타 연마 공정", completed: false }, { title: "특수가공과 열적 절삭 공정", completed: false }] },
      { week: 10, period: "05-05 ~ 05-18", lectures: [{ title: "금속의 열처리", completed: false }, { title: "청정법과 표면 처리", completed: false }, { title: "코팅 및 도포기술", completed: false }] },
      { week: 11, period: "05-12 ~ 05-25", lectures: [{ title: "용접의 기초", completed: false }, { title: "아크 용접 및 저항 용접", completed: false }, { title: "산소 용접 및 기타 용접", completed: false }] },
      { week: 12, period: "05-19 ~ 06-01", lectures: [{ title: "강의 내용 없음", completed: false }] },
      { week: 13, period: "05-26 ~ 06-08", lectures: [{ title: "강의 내용 없음", completed: false }] },
      { week: 14, period: "06-02 ~ 06-15", lectures: [{ title: "실리콘 공정 및 리소그래피", completed: false }, { title: "적층 및 집적 회로(IC) 패키징", completed: false }, { title: "전자조립과 패키징", completed: false }] },
      { week: 15, period: "06-12 ~ 06-15", lectures: [{ title: "시험 (기말고사)", completed: false }] }
    ]
  },
  {
    courseName: "평생교육방법론",
    weeks: [
      { week: 1, period: "03-02 ~ 03-15", lectures: [{ title: "평생교육이란?", completed: true }, { title: "평생교육방법이란?", completed: true }, { title: "포스트코로나와 평생교육방법", completed: true }] },
      { week: 2, period: "03-09 ~ 03-22", lectures: [{ title: "인지적 특성", completed: true }, { title: "신체적, 정서적 특성", completed: true }, { title: "성인학습의 특성과 학습", completed: true }] },
      { week: 3, period: "03-16 ~ 03-29", lectures: [{ title: "행동주의", completed: true }, { title: "인지주의", completed: true }, { title: "구성주의", completed: true }, { title: "과제 제출 (~05-24)", completed: false }] },
      { week: 4, period: "03-23 ~ 04-05", lectures: [{ title: "주요이론1", completed: true }, { title: "주요이론2", completed: true }, { title: "주요이론3", completed: true }] },
      { week: 5, period: "03-30 ~ 04-12", lectures: [{ title: "교수학습 체제", completed: false }, { title: "교수학습과정1", completed: false }, { title: "교수학습 과정2", completed: false }, { title: "자유토론(1)", completed: false }] },
      { week: 6, period: "04-06 ~ 04-19", lectures: [{ title: "개인중심1", completed: false }, { title: "개인중심 2", completed: false }, { title: "개인중심 3", completed: false }] },
      { week: 7, period: "04-13 ~ 04-26", lectures: [{ title: "집단중심 1", completed: false }, { title: "집단중심 2", completed: false }, { title: "집단중심3", completed: false }] },
      { week: 8, period: "04-20 ~ 04-26", lectures: [{ title: "중간고사", completed: false }] },
      { week: 9, period: "04-27 ~ 05-10", lectures: [{ title: "집단/체험1", completed: false }, { title: "집단/체험2", completed: false }, { title: "집단/체험3", completed: false }] },
      { week: 10, period: "05-04 ~ 05-17", lectures: [{ title: "웹기반형1", completed: false }, { title: "웹기반형2", completed: false }, { title: "웹기반형3", completed: false }, { title: "퀴즈 (~05-31)", completed: false }] },
      { week: 11, period: "05-11 ~ 05-24", lectures: [{ title: "창의력개발1", completed: false }, { title: "창의력개발2", completed: false }, { title: "창의력개발3", completed: false }, { title: "자유토론(2)", completed: false }] },
      { week: 12, period: "05-18 ~ 05-31", lectures: [{ title: "평생교육 자료유형 및 개발", completed: false }, { title: "평생교육 자료개발의 과정", completed: false }, { title: "평생교육 자료개발의 방법 및 활용", completed: false }] },
      { week: 13, period: "05-25 ~ 06-07", lectures: [{ title: "프로그램 운영 개념과 원리", completed: false }, { title: "프로그램 운영 실행", completed: false }, { title: "평생교육사의 전문성", completed: false }] },
      { week: 14, period: "06-01 ~ 06-14", lectures: [{ title: "프로그램 평가 개념과 모델", completed: false }, { title: "프로그램 평가 절차", completed: false }, { title: "주요 평생교육프로그램", completed: false }] },
      { week: 15, period: "06-08 ~ 06-14", lectures: [{ title: "기말고사", completed: false }] }
    ]
  },
  {
    courseName: "디지털경제론",
    weeks: [
      { week: 1, period: "02-23 ~ 03-08", lectures: [{ title: "1-1~1-4 강의 수강", completed: true }, { title: "QUIZ", completed: true }] },
      { week: 2, period: "03-02 ~ 03-15", lectures: [{ title: "2-1~2-4 강의 수강", completed: true }, { title: "QUIZ", completed: true }] },
      { week: 3, period: "03-09 ~ 03-22", lectures: [{ title: "3-1~3-4 강의 수강", completed: true }, { title: "QUIZ", completed: true }] },
      { week: 4, period: "03-16 ~ 03-31", lectures: [{ title: "4-1~4-4 강의 수강", completed: true }, { title: "QUIZ", completed: true }] },
      { week: 5, period: "03-23 ~ 04-07", lectures: [{ title: "5-1~5-4 강의 수강", completed: false }, { title: "QUIZ", completed: false }] },
      { week: 6, period: "03-30 ~ 04-12", lectures: [{ title: "6-1~6-4 강의 수강", completed: false }, { title: "QUIZ", completed: false }] },
      { week: 7, period: "04-06 ~ 04-19", lectures: [{ title: "7-1~7-4 강의 수강", completed: false }, { title: "QUIZ", completed: false }] },
      { week: 8, period: "04-13 ~ 04-19", lectures: [{ title: "중간고사", completed: false }] },
      { week: 9, period: "04-20 ~ 05-03", lectures: [{ title: "9-1~9-4 강의 수강", completed: false }, { title: "QUIZ", completed: false }] },
      { week: 10, period: "04-27 ~ 05-10", lectures: [{ title: "10-1~10-4 강의 수강", completed: false }, { title: "QUIZ", completed: false }] },
      { week: 11, period: "05-04 ~ 05-17", lectures: [{ title: "11-1~11-4 강의 수강", completed: false }, { title: "QUIZ", completed: false }] },
      { week: 12, period: "05-11 ~ 05-24", lectures: [{ title: "12-1~12-4 강의 수강", completed: false }, { title: "QUIZ", completed: false }] },
      { week: 13, period: "05-18 ~ 05-31", lectures: [{ title: "13-1~13-4 강의 수강", completed: false }, { title: "QUIZ", completed: false }] },
      { week: 14, period: "05-25 ~ 06-07", lectures: [{ title: "14-1~14-4 강의 수강", completed: false }, { title: "QUIZ", completed: false }] },
      { week: 15, period: "06-01 ~ 06-07", lectures: [{ title: "기말고사", completed: false }] }
    ]
  },
  {
    courseName: "설득커뮤니케이션",
    weeks: [
      { week: 1, period: "02-23 ~ 03-08", lectures: [{ title: "1-1~1-3 강의 수강", completed: true }, { title: "QUIZ 1", completed: true }, { title: "1-4~1-6 강의 수강", completed: true }, { title: "QUIZ 2", completed: true }] },
      { week: 2, period: "03-02 ~ 03-15", lectures: [{ title: "2-1~2-3 강의 수강", completed: true }, { title: "QUIZ 1", completed: true }, { title: "2-4~2-6 강의 수강", completed: true }, { title: "QUIZ 2", completed: true }] },
      { week: 3, period: "03-09 ~ 03-22", lectures: [{ title: "3-1~3-3 강의 수강", completed: true }, { title: "QUIZ 1", completed: true }, { title: "3-4~3-6 강의 수강", completed: true }, { title: "QUIZ 2", completed: true }] },
      { week: 4, period: "03-16 ~ 03-31", lectures: [{ title: "4-1~4-3 강의 수강", completed: true }, { title: "QUIZ 1", completed: true }, { title: "4-4~4-6 강의 수강", completed: true }, { title: "QUIZ 2", completed: true }] },
      { week: 5, period: "03-23 ~ 04-07", lectures: [{ title: "5-1~5-3 강의 수강", completed: true }, { title: "QUIZ 1", completed: true }, { title: "5-4~5-6 강의 수강", completed: true }, { title: "QUIZ 2", completed: true }] },
      { week: 6, period: "03-30 ~ 04-12", lectures: [{ title: "6-1~6-3 강의 수강", completed: false }, { title: "QUIZ 1", completed: false }, { title: "6-4~6-6 강의 수강", completed: false }, { title: "QUIZ 2", completed: false }] },
      { week: 7, period: "04-06 ~ 04-19", lectures: [{ title: "7-1~7-3 강의 수강", completed: false }, { title: "QUIZ 1", completed: false }, { title: "7-4~7-6 강의 수강", completed: false }, { title: "QUIZ 2", completed: false }] },
      { week: 8, period: "04-13 ~ 04-19", lectures: [{ title: "중간고사", completed: false }] },
      { week: 9, period: "04-20 ~ 05-03", lectures: [{ title: "9-1~9-3 강의 수강", completed: false }, { title: "QUIZ 1", completed: false }, { title: "9-4~9-6 강의 수강", completed: false }, { title: "QUIZ 2", completed: false }] },
      { week: 10, period: "04-27 ~ 05-10", lectures: [{ title: "10-1~10-3 강의 수강", completed: false }, { title: "QUIZ 1", completed: false }, { title: "10-4~10-6 강의 수강", completed: false }, { title: "QUIZ 2", completed: false }] },
      { week: 11, period: "05-04 ~ 05-17", lectures: [{ title: "11-1~11-3 강의 수강", completed: false }, { title: "QUIZ 1", completed: false }, { title: "11-4~11-6 강의 수강", completed: false }, { title: "QUIZ 2", completed: false }] },
      { week: 12, period: "05-11 ~ 05-24", lectures: [{ title: "12-1~12-3 강의 수강", completed: false }, { title: "QUIZ 1", completed: false }, { title: "12-4~12-6 강의 수강", completed: false }, { title: "QUIZ 2", completed: false }] },
      { week: 13, period: "05-18 ~ 05-31", lectures: [{ title: "13-1~13-3 강의 수강", completed: false }, { title: "QUIZ 1", completed: false }, { title: "13-4~13-6 강의 수강", completed: false }, { title: "QUIZ 2", completed: false }] },
      { week: 14, period: "05-25 ~ 06-07", lectures: [{ title: "14-1~14-2 강의 수강", completed: false }, { title: "QUIZ", completed: false }] },
      { week: 15, period: "06-01 ~ 06-07", lectures: [{ title: "기말고사", completed: false }] }
    ]
  },
  {
    courseName: "기업과 사회",
    weeks: [
      { week: 1, period: "02-23 ~ 03-08", lectures: [{ title: "1-1~1-3 강의 수강", completed: true }, { title: "퀴즈", completed: true }] },
      { week: 2, period: "03-02 ~ 03-15", lectures: [{ title: "2-1~2-3 강의 수강", completed: true }, { title: "퀴즈", completed: true }] },
      { week: 3, period: "03-09 ~ 03-22", lectures: [{ title: "3-1~3-3 강의 수강", completed: true }, { title: "퀴즈", completed: true }] },
      { week: 4, period: "03-16 ~ 03-31", lectures: [{ title: "4-1~4-3 강의 수강", completed: true }, { title: "퀴즈", completed: true }] },
      { week: 5, period: "03-23 ~ 04-07", lectures: [{ title: "5-1~5-3 강의 수강", completed: true }, { title: "퀴즈", completed: true }] },
      { week: 6, period: "03-30 ~ 04-12", lectures: [{ title: "6-1~6-3 강의 수강", completed: true }, { title: "퀴즈", completed: true }] },
      { week: 7, period: "04-06 ~ 04-19", lectures: [{ title: "7-1~7-3 강의 수강", completed: false }, { title: "퀴즈", completed: false }] },
      { week: 8, period: "04-13 ~ 04-19", lectures: [{ title: "중간고사", completed: false }] },
      { week: 9, period: "04-20 ~ 05-03", lectures: [{ title: "9-1~9-3 강의 수강", completed: false }, { title: "퀴즈", completed: false }] },
      { week: 10, period: "04-27 ~ 05-10", lectures: [{ title: "10-1~10-3 강의 수강", completed: false }, { title: "퀴즈", completed: false }] },
      { week: 11, period: "05-04 ~ 05-17", lectures: [{ title: "11-1~11-3 강의 수강", completed: false }, { title: "퀴즈", completed: false }] },
      { week: 12, period: "05-11 ~ 05-24", lectures: [{ title: "12-1~12-3 강의 수강", completed: false }, { title: "퀴즈", completed: false }] },
      { week: 13, period: "05-18 ~ 05-31", lectures: [{ title: "13-1~13-3 강의 수강", completed: false }, { title: "퀴즈", completed: false }] },
      { week: 14, period: "05-25 ~ 06-07", lectures: [{ title: "14-1~14-3 강의 수강", completed: false }, { title: "퀴즈", completed: false }] },
      { week: 15, period: "06-01 ~ 06-07", lectures: [{ title: "기말고사", completed: false }] }
    ]
  },
  {
    courseName: "경영혁신",
    weeks: [
      { week: 1, period: "02-23 ~ 03-08", lectures: [{ title: "1-1~1-6 강의 수강", completed: true }, { title: "퀴즈", completed: true }] },
      { week: 2, period: "03-02 ~ 03-15", lectures: [{ title: "2-1~2-6 강의 수강", completed: true }, { title: "퀴즈", completed: true }] },
      { week: 3, period: "03-09 ~ 03-22", lectures: [{ title: "3-1~3-6 강의 수강", completed: true }, { title: "퀴즈", completed: true }] },
      { week: 4, period: "03-16 ~ 03-31", lectures: [{ title: "4-1~4-6 강의 수강", completed: true }, { title: "퀴즈", completed: true }] },
      { week: 5, period: "03-23 ~ 04-07", lectures: [{ title: "5-1 강의 수강", completed: true }, { title: "퀴즈", completed: true }] },
      { week: 6, period: "03-30 ~ 04-12", lectures: [{ title: "6-1~6-4 강의 수강", completed: true }, { title: "6-5~6-7 강의 수강", completed: false }, { title: "퀴즈", completed: false }] },
      { week: 7, period: "04-06 ~ 04-19", lectures: [{ title: "7-1~7-5 강의 수강", completed: false }, { title: "퀴즈", completed: false }] },
      { week: 8, period: "04-13 ~ 04-19", lectures: [{ title: "중간고사", completed: false }] },
      { week: 9, period: "04-20 ~ 05-03", lectures: [{ title: "9-1~9-7 강의 수강", completed: false }, { title: "퀴즈", completed: false }] },
      { week: 10, period: "04-27 ~ 05-10", lectures: [{ title: "10-1~10-5 강의 수강", completed: false }, { title: "퀴즈", completed: false }] },
      { week: 11, period: "05-04 ~ 05-17", lectures: [{ title: "11-1~11-6 강의 수강", completed: false }, { title: "퀴즈", completed: false }] },
      { week: 12, period: "05-11 ~ 05-24", lectures: [{ title: "12-1~12-4 강의 수강", completed: false }, { title: "퀴즈", completed: false }] },
      { week: 13, period: "05-18 ~ 05-31", lectures: [{ title: "13-1~13-6 강의 수강", completed: false }, { title: "퀴즈", completed: false }] },
      { week: 14, period: "05-25 ~ 06-07", lectures: [{ title: "14-1~14-4 강의 수강", completed: false }, { title: "퀴즈", completed: false }] },
      { week: 15, period: "06-01 ~ 06-07", lectures: [{ title: "기말고사", completed: false }] }
    ]
  },
  {
    courseName: "실용한문",
    weeks: [
      { week: 1, period: "02-23 ~ 03-08", lectures: [{ title: "1-1~1-6 강의 수강", completed: true }, { title: "퀴즈", completed: true }] },
      { week: 2, period: "03-02 ~ 03-15", lectures: [{ title: "2-1~2-6 강의 수강", completed: true }, { title: "퀴즈", completed: true }] },
      { week: 3, period: "03-09 ~ 03-22", lectures: [{ title: "3-1~3-6 강의 수강", completed: true }, { title: "퀴즈", completed: true }] },
      { week: 4, period: "03-16 ~ 03-31", lectures: [{ title: "4-1~4-6 강의 수강", completed: true }, { title: "퀴즈", completed: true }] },
      { week: 5, period: "03-23 ~ 04-07", lectures: [{ title: "5-1~5-4 강의 수강", completed: true }, { title: "5-5 강의 수강", completed: false }, { title: "퀴즈", completed: false }] },
      { week: 6, period: "03-30 ~ 04-12", lectures: [{ title: "6-1~6-5 강의 수강", completed: false }, { title: "퀴즈", completed: false }] },
      { week: 7, period: "04-06 ~ 04-19", lectures: [{ title: "7-1~7-5 강의 수강", completed: false }, { title: "퀴즈", completed: false }] },
      { week: 8, period: "04-13 ~ 04-19", lectures: [{ title: "중간고사", completed: false }] },
      { week: 9, period: "04-20 ~ 05-03", lectures: [{ title: "9-1~9-7 강의 수강", completed: false }, { title: "퀴즈", completed: false }] },
      { week: 10, period: "04-27 ~ 05-10", lectures: [{ title: "10-1~10-6 강의 수강", completed: false }, { title: "퀴즈", completed: false }] },
      { week: 11, period: "05-04 ~ 05-17", lectures: [{ title: "11-1~11-6 강의 수강", completed: false }, { title: "퀴즈", completed: false }] },
      { week: 12, period: "05-11 ~ 05-24", lectures: [{ title: "12-1~12-7 강의 수강", completed: false }, { title: "퀴즈", completed: false }] },
      { week: 13, period: "05-18 ~ 05-31", lectures: [{ title: "13-1~13-6 강의 수강", completed: false }, { title: "퀴즈", completed: false }] },
      { week: 14, period: "05-25 ~ 06-07", lectures: [{ title: "14-1~14-5 강의 수강", completed: false }, { title: "퀴즈", completed: false }] },
      { week: 15, period: "06-01 ~ 06-07", lectures: [{ title: "기말고사", completed: false }] }
    ]
  },
  {
    courseName: "현대인의 정신건강",
    weeks: [
      { week: 1, period: "02-23 ~ 03-08", lectures: [{ title: "1-1~1-4 강의 수강", completed: true }, { title: "퀴즈", completed: true }] },
      { week: 2, period: "03-02 ~ 03-15", lectures: [{ title: "2-1~2-3 강의 수강", completed: true }, { title: "퀴즈", completed: true }] },
      { week: 3, period: "03-09 ~ 03-22", lectures: [{ title: "3-1~3-3 강의 수강", completed: true }, { title: "퀴즈", completed: true }] },
      { week: 4, period: "03-16 ~ 03-31", lectures: [{ title: "4-1~4-3 강의 수강", completed: true }, { title: "퀴즈", completed: true }] },
      { week: 5, period: "03-23 ~ 04-07", lectures: [{ title: "5-1~5-3 강의 수강", completed: true }, { title: "퀴즈", completed: true }] },
      { week: 6, period: "03-30 ~ 04-12", lectures: [{ title: "6-1~6-3 강의 수강", completed: true }, { title: "퀴즈", completed: true }] },
      { week: 7, period: "04-06 ~ 04-19", lectures: [{ title: "7-1~7-3 강의 수강", completed: false }, { title: "퀴즈", completed: false }] },
      { week: 8, period: "04-13 ~ 04-19", lectures: [{ title: "중간고사", completed: false }] },
      { week: 9, period: "04-20 ~ 05-03", lectures: [{ title: "9-1~9-3 강의 수강", completed: false }, { title: "퀴즈", completed: false }] },
      { week: 10, period: "04-27 ~ 05-10", lectures: [{ title: "10-1~10-2 강의 수강", completed: false }, { title: "퀴즈", completed: false }] },
      { week: 11, period: "05-04 ~ 05-17", lectures: [{ title: "11-1~11-2 강의 수강", completed: false }, { title: "퀴즈", completed: false }] },
      { week: 12, period: "05-11 ~ 05-24", lectures: [{ title: "12-1~12-3 강의 수강", completed: false }, { title: "개인 과제", completed: false }, { title: "퀴즈", completed: false }] },
      { week: 13, period: "05-18 ~ 05-31", lectures: [{ title: "13-1~13-3 강의 수강", completed: false }, { title: "퀴즈", completed: false }] },
      { week: 14, period: "05-25 ~ 06-07", lectures: [{ title: "14-1~14-4 강의 수강", completed: false }, { title: "퀴즈", completed: false }] },
      { week: 15, period: "06-01 ~ 06-07", lectures: [{ title: "기말고사", completed: false }] }
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
  const [courses, setCourses] = useState(initialData);
  const [selectedCourseIdx, setSelectedCourseIdx] = useState(0);

  const toggleCompletion = (courseIdx, weekIdx, lectureIdx) => {
    const updatedCourses = [...courses];
    const isCompleted = updatedCourses[courseIdx].weeks[weekIdx].lectures[lectureIdx].completed;
    updatedCourses[courseIdx].weeks[weekIdx].lectures[lectureIdx].completed = !isCompleted;
    setCourses(updatedCourses);
  };

  const selectedCourse = courses[selectedCourseIdx];

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-600">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">2026년 1학기 학점은행제 종합 진도표</h1>
          <h2 className="text-lg font-semibold text-blue-600 mb-3">| 주요 학사 일정 안내</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generalSchedule.map((item, idx) => (
              <div key={idx} className="flex justify-between p-3 bg-gray-50 border rounded text-sm">
                <span className="font-bold text-gray-700">{item.title}</span>
                <span className="text-gray-600">{item.date}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex space-x-2 overflow-x-auto pb-4 mb-4 border-b">
            {courses.map((course, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCourseIdx(idx)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  selectedCourseIdx === idx
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {course.courseName}
              </button>
            ))}
          </div>

          <h2 className="text-xl font-bold mb-4 text-gray-800">
            {selectedCourse.courseName} 진도 체크
          </h2>

          <div className="space-y-6">
            {selectedCourse.weeks.map((weekData, wIdx) => (
              <div key={wIdx} className="border rounded-md p-4 bg-gray-50">
                <div className="flex justify-between items-center border-b pb-2 mb-3">
                  <h3 className="font-bold text-lg text-blue-800">{weekData.week}주차</h3>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    출석인정기간: {weekData.period}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {weekData.lectures.map((lecture, lIdx) => (
                    <label
                      key={lIdx}
                      className={`flex items-center p-3 rounded cursor-pointer transition-colors ${
                        lecture.completed ? 'bg-green-100 text-gray-500 line-through' : 'bg-white border hover:bg-blue-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={lecture.completed}
                        onChange={() => toggleCompletion(selectedCourseIdx, wIdx, lIdx)}
                        className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-3 cursor-pointer"
                      />
                      <span className="text-sm font-medium">{lecture.title}</span>
                      {lecture.completed && (
                        <span className="ml-auto text-xs font-bold text-green-600 bg-green-200 px-2 py-1 rounded">완료함</span>
                      )}
                    </label>
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