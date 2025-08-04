import { config } from "dotenv";
import { LVL_NAME, WRN_NAME, CMD_NAME, isTest } from "./kma-constants.js";

config(); // .env 불러오기

export function getConfig() {
  const apiKey = process.env.API_KEY;
  const slackChannelId = process.env.SLACK_CHANNEL_ID;
  const slackHookUrl = process.env.SLACK_HOOK_URL;

  if (!isTest) {
    if (!apiKey || !slackChannelId || !slackHookUrl) {
      throw new Error(
        "API_KEY, SLACK_CHANNEL_ID and SLACK_HOOK_URL must be set in .env file"
      );
    }
  }

  const periodDays = parseInt(process.env.PERIOD_DAYS, 10) || 14;
  const icons = process.env.ICONS
    ? [""].concat(process.env.ICONS.split(",").map((icon) => icon.trim()))
    : [];
  const descs = process.env.DESCS
    ? [""].concat(process.env.DESCS.split(",").map((desc) => desc.trim()))
    : [];
  const filteredWrn = process.env.FILTERED_WRN
    ? process.env.FILTERED_WRN.split(",")
        .map((wrn) => wrn.trim().toUpperCase())
        .filter((wrn) => Object.keys(WRN_NAME).includes(wrn))
        .map((wrn) => (/[A-Z]+/.test(wrn) ? wrn : WRN_NAME[wrn]))
    : [];
  const title = process.env.TITLE || "📢 기상 특보 안내";

  console.log({ periodDays, slackChannelId, filteredWrn });

  return {
    apiKey,
    slackChannelId,
    slackHookUrl,
    periodDays,
    icons,
    descs,
    filteredWrn,
    title,
  };
}

export function KMAParser(data = "", splitter = ",") {
  return data
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) =>
      line
        .replace(/=+$/, "")
        .trim()
        .replaceAll(new RegExp(`\\s*${splitter}\\s*`, "g"), splitter)
        .split(splitter)
        .map((s) => s.trim())
    );
}

export function toKMAFlat(date = new Date()) {
  return (
    date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, "0") +
    date.getDate().toString().padStart(2, "0")
  );
}

export function toDate(KMAFlat = "") {
  return new Date(
    KMAFlat.slice(0, 4),
    parseInt(KMAFlat.slice(4, 6), 10) - 1,
    KMAFlat.slice(6, 8)
  );
}

function get(acc, wrn, targetId) {
  if (!acc[wrn]) {
    return null;
  }
  return Object.entries(acc[wrn]).find(([lvl, value]) =>
    value.includes(targetId)
  );
}

function remove(acc, wrn, targetId) {
  if (!acc[wrn]) {
    return acc;
  }
  Object.keys(acc[wrn]).forEach((lvl) => {
    if (acc[wrn][lvl].includes(targetId)) {
      acc[wrn][lvl] = acc[wrn][lvl].filter((id) => id !== targetId);
      if (acc[wrn][lvl].length === 0) {
        delete acc[wrn][lvl];
      }
      if (Object.keys(acc[wrn]).length === 0) {
        delete acc[wrn];
      }
    }
  });
  return acc;
}

export function getKSTDate() {
  const now = new Date();
  const kstTime = now.getTime() + 9 * 60 * 60 * 1000; // KST is UTC+9
  return new Date(kstTime);
}

export function toWeatherGroups(data = [], supportWrn = []) {
  return data.reduce((acc, data) => {
    const { WRN, LVL, REG_ID, CMD } = data;
    if (supportWrn.length > 0 && !supportWrn.includes(WRN)) {
      return acc;
    }

    if (CMD === "5") {
      return acc;
    }

    acc = remove(acc, WRN, REG_ID);

    if (isTest) {
      console.log(
        REG_ID,
        LVL_NAME[LVL],
        WRN_NAME[WRN],
        CMD_NAME[CMD],
        get(acc, WRN, REG_ID)?.[0]
      );
    }

    if (CMD === "3" || CMD === "4" || CMD === "7") {
      return acc;
    }

    if (!acc[WRN]) {
      acc[WRN] = {};
    }

    if (!acc[WRN][LVL]) {
      acc[WRN][LVL] = [];
    }

    if (!acc[WRN][LVL].includes(REG_ID)) {
      acc[WRN][LVL].push(REG_ID);
    }
    return acc;
  }, {});
}
