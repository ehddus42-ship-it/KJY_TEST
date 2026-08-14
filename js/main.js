import { createGame } from "./game.js";

let dbModulePromise = null;
function loadDb() {
  if (!dbModulePromise) {
    dbModulePromise = import("./db.js").catch((err) => {
      dbModulePromise = null;
      throw err;
    });
  }
  return dbModulePromise;
}

const screen = document.getElementById("screen");
const message = document.getElementById("message");
const startBtn = document.getElementById("start-btn");
const retryBtn = document.getElementById("retry-btn");
const resultPanel = document.getElementById("result-panel");
const resultMs = document.getElementById("result-ms");
const nicknameForm = document.getElementById("nickname-form");
const nicknameInput = document.getElementById("nickname-input");
const saveStatus = document.getElementById("save-status");
const rankingList = document.getElementById("ranking-list");

function setScreenClass(className) {
  screen.className = `screen ${className}`;
}

async function renderRanking() {
  rankingList.innerHTML = "<li>불러오는 중...</li>";
  try {
    const { getTop } = await loadDb();
    const top = await getTop(10);
    if (top.length === 0) {
      rankingList.innerHTML = "<li>아직 기록이 없습니다</li>";
      return;
    }
    rankingList.innerHTML = top
      .map((record) => `<li>${escapeHtml(record.nickname)} - ${record.ms}ms</li>`)
      .join("");
  } catch (err) {
    rankingList.innerHTML = "<li>랭킹을 불러오지 못했습니다 (Firebase 설정을 확인하세요)</li>";
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

const game = createGame({
  onStateChange(state, payload) {
    switch (state) {
      case game.STATE.IDLE:
        setScreenClass("state-idle");
        message.textContent = "버튼을 눌러 게임을 시작하세요";
        startBtn.classList.remove("hidden");
        retryBtn.classList.add("hidden");
        resultPanel.classList.add("hidden");
        nicknameForm.classList.remove("hidden");
        saveStatus.textContent = "";
        nicknameInput.value = "";
        break;

      case game.STATE.WAITING:
        setScreenClass("state-waiting");
        message.textContent = "빨간색으로 바뀌면 클릭하세요...";
        startBtn.classList.add("hidden");
        retryBtn.classList.add("hidden");
        resultPanel.classList.add("hidden");
        break;

      case game.STATE.RED:
        setScreenClass("state-red");
        message.textContent = "지금 클릭!";
        break;

      case game.STATE.FAIL:
        setScreenClass("state-fail");
        message.textContent = "너무 빨랐습니다! 빨간색이 되기 전에 클릭했어요.";
        retryBtn.classList.remove("hidden");
        break;

      case game.STATE.RESULT:
        setScreenClass("state-result");
        message.textContent = "성공!";
        resultMs.textContent = `${payload.ms} ms`;
        resultPanel.classList.remove("hidden");
        retryBtn.classList.remove("hidden");
        renderRanking();
        break;
    }
  },
});

startBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  game.start();
});

retryBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  game.reset();
});

nicknameForm.addEventListener("click", (e) => e.stopPropagation());
resultPanel.addEventListener("click", (e) => e.stopPropagation());

nicknameForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nickname = nicknameInput.value.trim();
  if (!nickname) return;

  const currentMs = parseInt(resultMs.textContent, 10);
  saveStatus.textContent = "저장 중...";
  try {
    const { saveScore } = await loadDb();
    await saveScore(currentMs, nickname);
    saveStatus.textContent = "기록이 저장되었습니다!";
    nicknameForm.classList.add("hidden");
    renderRanking();
  } catch (err) {
    saveStatus.textContent = "저장에 실패했습니다. Firebase 설정을 확인해주세요.";
  }
});

screen.addEventListener("click", () => {
  game.handleScreenClick();
});

game.reset();
