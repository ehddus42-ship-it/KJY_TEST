const MIN_DELAY_MS = 1000;
const MAX_DELAY_MS = 12000;

const STATE = {
  IDLE: "idle",
  WAITING: "waiting",
  RED: "red",
  FAIL: "fail",
  RESULT: "result",
};

export function createGame({ onStateChange }) {
  let state = STATE.IDLE;
  let timerId = null;
  let redAt = 0;
  let lastReactionMs = 0;

  function setState(next, payload) {
    state = next;
    onStateChange(state, payload);
  }

  function start() {
    clearTimeout(timerId);
    setState(STATE.WAITING);
    const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
    timerId = setTimeout(() => {
      redAt = performance.now();
      setState(STATE.RED);
    }, delay);
  }

  function handleScreenClick() {
    if (state === STATE.WAITING) {
      clearTimeout(timerId);
      setState(STATE.FAIL);
      return;
    }
    if (state === STATE.RED) {
      lastReactionMs = Math.round(performance.now() - redAt);
      setState(STATE.RESULT, { ms: lastReactionMs });
    }
  }

  function reset() {
    clearTimeout(timerId);
    setState(STATE.IDLE);
  }

  return {
    STATE,
    start,
    handleScreenClick,
    reset,
    getState: () => state,
  };
}
