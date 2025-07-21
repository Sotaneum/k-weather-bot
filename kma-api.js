import { KMAParser, toDate, toKMAFlat } from "./kma-utils.js";
import axios from "axios";
import iconv from "iconv-lite";

export async function getRegionNames(apiKey) {
  // 날씨 데이터를 가져오는 로직
  const { data } = await axios.get(
    `https://apihub.kma.go.kr/api/typ01/url/wrn_reg.php?tmfc=0&authKey=${apiKey}`,
    {
      responseType: "arraybuffer",
    }
  );
  return KMAParser(iconv.decode(data, "euc-kr"), " ")
    .map(([REG_ID, TM_ST, TM_ED, REG_SP, REG_UP, REG_KO, REG_NAME]) => ({
      REG_ID,
      TM_ST,
      TM_ED,
      REG_SP,
      REG_UP,
      REG_KO,
      REG_NAME,
    }))
    .reduce((acc, { REG_ID, ...data }) => ({ ...acc, [REG_ID]: data }), {});
}

export async function getWeatherData(apiKey, start, end) {
  // 날씨 데이터를 가져오는 로직
  const { data } = await axios.get(
    `https://apihub.kma.go.kr/api/typ01/url/wrn_met_data.php?reg=0&tmfc1=${toKMAFlat(
      start
    )}&tmfc2=${toKMAFlat(end)}&disp=1&help=1&authKey=${apiKey}`,
    {
      responseType: "arraybuffer",
    }
  );
  return KMAParser(iconv.decode(data, "euc-kr"))
    .map(([TM_FC, TM_EF, TM_IN, STN, REG_ID, WRN, LVL, CMD]) => ({
      TM_FC,
      TM_EF,
      TM_IN,
      STN,
      REG_ID,
      WRN,
      LVL,
      CMD,
    }))
    .sort(({ TM_IN: a }, { TM_IN: b }) => toDate(a) - toDate(b));
}
