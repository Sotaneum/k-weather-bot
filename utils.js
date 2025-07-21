import { LVL_NAME, WRN_NAME } from "./kma-constants.js";

export function toMessage(
  title,
  groups = {},
  regionNames = {},
  iconMap = [],
  descMap = []
) {
  const messages = Object.entries(groups)
    .sort(([keyA], [keyB]) => {
      const [LVLA] = keyA.split("_");
      const [LVLB] = keyB.split("_");
      return +LVLB - +LVLA;
    })
    .map(([key, value]) => {
      const [LVL, WRN] = key.split("_");
      const icon = iconMap[LVL] ?? "";
      const desc = descMap[LVL] ?? "";
      return `${icon} [${WRN_NAME[WRN]} ${LVL_NAME[LVL]}] ${desc}
• 지역: ${value.map((code) => regionNames[code].REG_NAME).join(", ")}`;
    });
  return `${title}




${messages.join(`

  
`)}


여러분들의 안전을 기원합니다!
API 제공: 기상청 OpenAPI
https://kko.kakao.com/kma-w`;
}
