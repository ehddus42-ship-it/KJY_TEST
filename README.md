# 반응속도 측정기

버튼을 눌러 게임을 시작하면 화면이 파란색으로 대기하다가 1~12초 사이 무작위 시점에 빨간색으로 바뀝니다.
빨간색이 된 순간부터 클릭까지 걸린 시간을 ms 단위로 측정해 보여주고(초록 화면), 닉네임을 입력하면 Firebase에 기록이 저장됩니다.
빨간색이 되기 전에 클릭하면 실패 처리 후 재시작할 수 있습니다.

## 구조

- `index.html`, `style.css`: 화면 마크업과 스타일
- `js/game.js`: 게임 상태 머신 (idle → waiting → red → result / fail)
- `js/db.js`: Firebase Firestore 연동, `saveScore(ms, nickname)` / `getTop(n)` 두 함수만 노출
- `js/firebaseConfig.js`: Firebase 프로젝트 설정값 (직접 채워야 함)
- `firestore.rules`: Firestore 보안 규칙
- `.github/workflows/deploy-pages.yml`: main 브랜치 push 시 GitHub Pages 자동 배포

빌드 도구 없이 순수 HTML/CSS/JS로 동작하며, Firebase SDK는 CDN(ES 모듈)에서 불러옵니다.
Firebase 로딩은 지연 로딩(dynamic import) 방식이라 네트워크 문제로 Firebase를 불러오지 못해도 게임 자체(파란/빨간/실패 화면)는 정상 동작하고, 저장·랭킹 조회만 실패 메시지를 보여줍니다.

## Firebase 설정 방법

1. [Firebase 콘솔](https://console.firebase.google.com/)에서 새 프로젝트를 만듭니다.
2. 프로젝트 설정 > 일반 > 내 앱에서 "웹 앱 추가"를 선택하고, 발급된 설정값을 확인합니다.
3. `js/firebaseConfig.js` 파일의 `YOUR_...` 값들을 실제 설정값으로 교체합니다. (이 값은 공개 config로, 커밋해도 안전합니다)
4. Firestore Database를 생성합니다 (프로덕션 모드 권장).
5. `firestore.rules` 내용을 Firebase 콘솔의 Firestore 규칙 탭에 붙여넣고 게시합니다.

## GitHub Pages 배포

1. 저장소 Settings > Pages에서 Source를 "GitHub Actions"로 설정합니다.
2. `main` 브랜치에 push하면 `.github/workflows/deploy-pages.yml`이 자동으로 사이트를 배포합니다.

## 로컬 실행

빌드 없이 정적 파일을 서빙하면 됩니다.

```bash
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 접속
```
