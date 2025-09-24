# EV Motor Market Intelligence Dashboard

자동 업데이트되는 전기차 모터 시장 인텔리전스 대시보드입니다. 매일 오전 6시(KST)에 최신 뉴스와 시장 동향이 자동으로 업데이트됩니다.

## 주요 기능

- 🔄 매일 자동 업데이트 (오전 6시 KST)
- 📰 실시간 뉴스 수집 (NewsAPI / Google News RSS)
- 📊 시장 동향 및 통계
- 🔍 카테고리별 필터링 (속보/기술/시장/국내)
- 📱 반응형 디자인

## 기술 스택

- Frontend: HTML5, CSS3, JavaScript
- Backend: Node.js, Express
- Database: SQLite
- 자동화: GitHub Actions

## 설정 방법

1. 저장소 클론:
```bash
git clone https://github.com/Jay-Why-Pee/Jay-Why-Pee.git
cd Jay-Why-Pee
```

2. 의존성 설치:
```bash
npm install
```

3. 환경 변수 설정:
- GitHub repository secrets에 `NEWSAPI_KEY` 추가
  - NewsAPI 키가 없는 경우 자동으로 Google News RSS로 대체됨

4. 자동 업데이트:
- GitHub Actions가 매일 오전 6시(KST)에 자동으로 뉴스를 수집
- `scripts/collect-news.js`를 통해 수동으로도 실행 가능

## 개발 환경에서 실행

1. 뉴스 수집 실행:
```bash
node scripts/collect-news.js
```

2. 웹서버 실행:
```bash
# src/backend 디렉토리에서
node server.js
```

## 주의사항

1. **URL 검증**: 모든 뉴스 링크는 유효성 검사를 거침
2. **데이터 보관**: 뉴스는 SQLite DB와 static JSON 파일로 저장
3. **에러 처리**: NewsAPI 실패시 자동으로 RSS로 대체

## 라이선스

MIT License<!--
**Jay-Why-Pee/Jay-Why-Pee** is a ✨ _special_ ✨ repository because its `README.md` (this file) appears on your GitHub profile.

Here are some ideas to get you started:

- 🔭 I’m currently working on ...
- 🌱 I’m currently learning ...
- 👯 I’m looking to collaborate on ...
- 🤔 I’m looking for help with ...
- 💬 Ask me about ...
- 📫 How to reach me: ...
- 😄 Pronouns: ...
- ⚡ Fun fact: ...
-->
