# KOREA WEATHER ALERT TO SLACK WORKFLOW BOT

- 한국 기상청 API를 활용한 슬랙 워크플로우 기상 특보 알림봇

## 환경 설정 방법

### API 키 발급

1. https://apihub.kma.go.kr/ 페이지 접속 후 로그인 합니다. (계정이 없다면 회원 가입)
2. 좌측 예특보를 선택합니다.
3. 기상특보를 선택합니다.
4. `1. 특.정보 자료 조회`의 `특보구역` 우측에 있는 `API 활용신청` 버튼을 눌러 활용신청합니다.
5. `1. 특.정보 자료 조회`의 `특보자료` 우측에 있는 `API 활용신청` 버튼을 눌러 활용신청합니다.
6. 페이지 맨 위에 있는 URL 발생 버튼을 통해 `authKey`를 복사합니다.

### 슬랙 워크 플로우 생성

1. 슬랙 워크 플로우 생성하기를 선택합니다.
2. 웹후크 이벤트로 시작 선택합니다.
3. 데이터 변수에 아래 값 추가합니다.
   - message: 텍스트
   - id: Slack 채널 ID
4. 채널에 메시지 보내기 선택합니다.
   - 채널 선택 : {} id
   - 메시지 추가
     ```
     {} message
     {} 워크플로가 시작된 시간 기준
     ```
5. 게시 이후, 웹 요청 URL 복사합니다.

### 환경 변수 설정

```
# 아래는 필수 사항입니다.
API_KEY={apihub.kma.go.kr authKey}
SLACK_CHANNEL_ID={슬랙 채널 ID}
SLACK_HOOK_URL={슬랙 워크플로우 웹 요청 URL}

# 아래는 선택 사항입니다.
PERIOD_DAYS={데이터 참고 기간}
ICONS={기상 특보 아이콘}
DESCS={기상 특보 설명}
FILTERED_WRN={필터링 기상 특보}
TITLE={제목}
```

- `PERIOD_DAYS` : 데이터 참고 기간 (기본값 : 14일)
- `ICONS` : 기상 특보 아이콘 (기본값 : [])
    - 예비특보, 주의보, 경보 순서대로 입력하세요.
- `DESCS` : 기상 특보 설명 (기본값 : [])
    - 예비특보, 주의보, 경보 순서대로 입력하세요.
- `FILTERED_WRN` : 필터링 기상 특보 (기본값 : [])
  - 입력하지 않으면 모두 표시합니다.
  - 입력하는 경우 입력한 항목만 표시합니다.
    - 지원 기상 특보 : `강풍`, `호우`, `한파`, `건조`, `해일`, `지진해일`, `풍랑`, `태풍`, `대설`, `황사`, `폭염`, `안개`
- `TITLE` : 제목 (기본값 : `📢 기상 특보 안내`)

```
API_KEY=...
SLACK_CHANNEL_ID=...
SLACK_HOOK_URL=...
PERIOD_DAYS=14
ICONS=🟡,⚠️,🚨
DESCS=→ 아직은 살만 하죠,→ 조금 힘들죠?,→ 조심하세요!
FILTERED_WRN=강풍,호우,풍랑,태풍,대설,황사,폭염,안개
TITLE=📢 생존 일기 📢
```

## 실행 방법

### 로컬 실행

1. 이전 단계에서 생성한 환경 변수를 .env 파일을 생성하고 내용을 넣습니다.

```
# ./.env
API_KEY=...
SLACK_CHANNEL_ID=...
SLACK_HOOK_URL=...
PERIOD_DAYS=14
ICONS=🟡,⚠️,🚨
DESCS=→ 아직은 살만 하죠,→ 조금 힘들죠?,→ 조심하세요!
FILTERED_WRN=강풍,호우,풍랑,태풍,대설,황사,폭염,안개
TITLE=📢 생존 일기 📢
```

2. node로 실행합니다.

```bash
node index.js
```

3. http://localhost:8080/api/slack/weather API를 POST로 호출합니다.

### Docker 실행

1. 이미지를 가져옵니다.

```bash
docker pull sotaneum/k-weather-alert:latest
```

2. 컨테이너를 실행합니다.

```bash
docker run -d --name k-weather-alert -p 8080:8080 sotaneum/k-weather-alert:latest \
-e API_KEY=... \
-e SLACK_CHANNEL_ID=... \
-e SLACK_HOOK_URL=... \
-e PERIOD_DAYS=14 \
-e ICONS=🟡,⚠️,🚨 \
-e DESCS=→ 아직은 살만 하죠,→ 조금 힘들죠?,→ 조심하세요! \
-e FILTERED_WRN=강풍,호우,풍랑,태풍,대설,황사,폭염,안개 \
-e TITLE=📢 생존 일기 📢
```

3. http://localhost:8080/api/slack/weather API를 POST로 호출합니다.