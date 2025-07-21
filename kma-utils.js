import { config } from "dotenv";
import { WRN_NAME } from "./kma-constants.js";

config(); // .env 불러오기

export function getConfig() {
  const apiKey = process.env.API_KEY;
  const slackChannelId = process.env.SLACK_CHANNEL_ID;
  const slackHookUrl = process.env.SLACK_HOOK_URL;

  if (!apiKey || !slackChannelId || !slackHookUrl) {
    throw new Error(
      "API_KEY, SLACK_CHANNEL_ID and SLACK_HOOK_URL must be set in .env file"
    );
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

function remove(acc, targetId) {
  Object.keys(acc).forEach((key) => {
    if (acc[key].includes(targetId)) {
      acc[key] = acc[key].filter((id) => id !== targetId);
      if (acc[key].length === 0) {
        delete acc[key];
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

    if (CMD === "6" || CMD === "7") {
      return acc;
    }

    if (CMD === "3" || CMD === "4") {
      return remove(acc, REG_ID);
    }

    if (CMD === "2") {
      acc = remove(acc, REG_ID);
    }

    const name = `${LVL}_${WRN}`;
    if (!acc[name]) {
      acc[name] = [];
    }

    if (!acc[name].includes(REG_ID)) {
      acc[name].push(REG_ID);
    }
    return acc;
  }, {});
}
