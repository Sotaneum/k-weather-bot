import { getRegionNames, getWeatherData } from "./kma-api.js";
import { getConfig, getKSTDate, toWeatherGroups } from "./kma-utils.js";
import { sendMessage } from "./slack-api.js";
import { toMessage } from "./utils.js";
import express from "express";
import cors from "cors";
import { isTest } from "./kma-constants.js";

const {
  apiKey,
  slackChannelId,
  slackHookUrl,
  periodDays,
  icons,
  descs,
  filteredWrn,
  title,
} = getConfig();

let regionNamesCache = null;

async function getWeather() {
  const start = getKSTDate();
  start.setDate(start.getDate() - periodDays);
  const weatherData = await getWeatherData(apiKey, start, getKSTDate());

  return toWeatherGroups(weatherData, filteredWrn);
}

async function send(groups, regionNames) {
  const message = toMessage(title, groups, regionNames, icons, descs);
  if (isTest) {
    console.log(message);
  } else {
    sendMessage(slackHookUrl, slackChannelId, message);
  }
}

const app = express();
const port = 8080;

// JSON 파싱 미들웨어
app.use(cors()); // 기본: 모두 허용
app.use(express.json());

// 기본 라우트
app.post("/api/slack/weather", async (req, res) => {
  try {
    const groups = await getWeather();
    if (!regionNamesCache) {
      regionNamesCache = await getRegionNames(apiKey);
    }

    if (Object.keys(groups).length > 0) {
      await send(groups, regionNamesCache);
    } else {
      console.log("오늘은 기상 특보가 없습니다.");
    }
  } catch (error) {
    console.error("Error fetching or sending weather data:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch or send weather data.", error });
  }
  res.json({ message: "Weather data sent successfully." });
});

// 예시 API
app.get("/", (req, res) => {
  res.json({ message: "Hi" });
});

// 서버 시작
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running at http://localhost:${port}`);
});
