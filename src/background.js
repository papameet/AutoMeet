const audio = new Audio("./audio.mp3");
function PlayAudio() {
  audio.play();
}

function notify(word) {
  browser.notifications.create({
    iconUrl: "./index.jpg",
    type: "basic",
    title: "AutoMeet",
    message: `The word '${word}' has appeared!`,
  });
}

browser.runtime.onMessage.addListener((message) => {
  if (message.notify) {
    PlayAudio();
    notify(message.alertWord);
  }
});

browser.notifications.onClosed.addListener(() => {
  audio.pause();
  audio.currentTime = 0;
});
