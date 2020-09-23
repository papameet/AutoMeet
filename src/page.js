const CAPTIONS_SELECTOR = "I98jWb";

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
    console.log("left meeting");
  } else {
    console.error("leave button not found");
  }
  state.leaveTimerOn = false;
}

export function joinCall() {
  const joinButton = getJoinButton();
  console.log(joinButton);
  if (joinButton !== undefined) {
    console.log("joined meeting.");
    joinButton.click();
    return 1;
  }
  console.error("join button not found");
  return 0;
}

function getPeopleCount() {
  let count;
  try {
    count = document.querySelector("span.wnPUne.N0PJ8e").innerHTML;
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
    currentCaptions.toLowerCase().includes(alertWord)
  );
}

function captionsTurnedOff() {
  return (
    document.getElementsByClassName(CAPTIONS_SELECTOR)[0].textContent ===
    "Turn on captions"
  );
}

function turnOnCaptions() {
  document.getElementsByClassName(CAPTIONS_SELECTOR)[0].click();
}

export function startSubtitleTimers(state) {
  if (state.subtitleTimerId) clearInterval(state.subtitleTimerId);
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
      console.log("leaving now. people count:", peopleCountNow);
      clearInterval(state.leaveId);
      leaveCall(state);
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
  // change setTimeout to setTimer ?
}
