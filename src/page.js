import { removeCurrentURLfromStorage } from "./storage";

const CAPTIONS_ON_SELECTOR = "[aria-label='Turn on captions (c)']";
const CAPTIONS_OFF_SELECTOR = "[aria-label='Turn off captions (c)']";

export function getJoinButton() {
  const spans = document.getElementsByTagName("span");
  // eslint-disable-next-line no-restricted-syntax
  for (const span of spans) {
    // console.log(span.textContent)
    if (span.textContent === "Join now" || span.textContent === "Ask to join")
      return span;
  }
  return 0;
}

function getLeaveButton() {
  return document.querySelector("[aria-label='Leave call']");
}

export function leaveCall(state) {
  const leaveButton = getLeaveButton();
  if (leaveButton !== undefined) {
    leaveButton.click();
  } else {
    console.error("leave button not found");
  }
  state.leaveTimerOn = false;
}

export function joinCall() {
  const joinButton = getJoinButton();
  if (joinButton) {
    joinButton.click();
    return 1;
  }
  console.error("join button not found");
  return 0;
}

function getPeopleCount() {
  let count;
  try {
    count = document.querySelector("div.uGOf1d").innerHTML;
  } catch (e) {
    count = "0";
  }
  return parseInt(count, 10);
}

function getSubtitlesContent() {
  const selector = ".iTTPOb.VbkSUe",
    content = document.querySelector(selector);
  if (!content) return "";
  return content.textContent;
}

let previousContent = "";
function previousContinuesCurrentCaption(current) {
  return previousContent && current.startsWith(previousContent);
}

function canNotifyCaptions(currentCaptions, alertWord) {
  return (
    !previousContinuesCurrentCaption(currentCaptions) &&
    currentCaptions
      .replace(/\.|,/g, "")
      .toLowerCase()
      .split(" ")
      .includes(alertWord)
  );
}

export function captionsTurnedOff() {
  return document.querySelector(CAPTIONS_ON_SELECTOR) !== null;
}

function turnOnCaptions() {
  const sel = document.querySelector(CAPTIONS_ON_SELECTOR);
  if (sel) sel.click();
  else console.warn("Cannot turn on captions. Captions on selector not found.");
}

export function turnOffCaptions() {
  const sel = document.querySelector(CAPTIONS_OFF_SELECTOR);
  if (sel) sel.click();
  else
    console.warn("Cannot turn off captions. Captions off selector not found.");
}

export function startSubtitleTimers(state) {
  if (state.subtitleTimerId) clearTimeout(state.subtitleTimerId);
  if (captionsTurnedOff()) turnOnCaptions();

  state.subtitleTimerId = setTimeout(function checkAndNotify() {
    let time = 500;
    const captions = getSubtitlesContent();
    for (let i = 0; i < state.alertWords.length; i += 1) {
      const alertWord = state.alertWords[i];
      if (canNotifyCaptions(captions, alertWord)) {
        time = 15000;
        browser.runtime.sendMessage({ notify: true, alertWord });
      }
    }
    previousContent = captions;
    state.subtitleTimerId = setTimeout(checkAndNotify, time);
  }, 1000);
}

export function leaveWhenPeopleLessThan(state) {
  const count = state.leaveThreshold;
  state.leaveTimerOn = true;
  if (state.leaveInitId) clearInterval(state.leaveInitId);
  if (state.leaveId) clearInterval(state.leaveId);

  function leave() {
    const peopleCountNow = getPeopleCount();
    if (count > peopleCountNow) {
      clearInterval(state.leaveId);
      leaveCall(state);
      removeCurrentURLfromStorage();
      browser.storage.local.remove("joinTime");
    }
  }

  function runInit() {
    if (getPeopleCount() > count + 2) {
      clearInterval(state.leaveInitId);
      state.leaveInitId = 0;
      state.leaveId = setInterval(leave, 1000);
    }
  }
  state.leaveInitId = setInterval(runInit, 1000);
}
