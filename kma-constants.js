import { config } from "dotenv";

config();

export const LVL_NAME = ["", "예비특보", "주의보", "경보"];
export const CMD_NAME = [
  "",
  "발표",
  "대치",
  "해제",
  "대치해제",
  "연장",
  "변경",
  "변경해제",
];

export const WRN_NAME = {
  W: "강풍",
  R: "호우",
  C: "한파",
  D: "건조",
  O: "해일",
  N: "지진해일",
  V: "풍랑",
  T: "태풍",
  S: "대설",
  Y: "황사",
  H: "폭염",
  F: "안개",
  강풍: "W",
  호우: "R",
  한파: "C",
  건조: "D",
  해일: "O",
  지진해일: "N",
  풍랑: "V",
  태풍: "T",
  대설: "S",
  황사: "Y",
  폭염: "H",
  안개: "F",
};

export const isTest = process.env.IS_TEST === "true";
