export function getDateObject(timeObjectFromPicker) {
  let { hours } = timeObjectFromPicker;
  const { minutes } = timeObjectFromPicker;
  const date = new Date();

  if (hours !== 12) {
    hours += timeObjectFromPicker.amOrPm === "PM" ? 12 : 0;
  } else if (timeObjectFromPicker.amOrPm === "AM") hours = 0;

  date.setHours(hours, minutes, 0);
  return date;
}

export function to24hours(time) {
  let str24hr = "",
    { hours } = time;

  if (hours !== 12) hours += time.amOrPm === "PM" ? 12 : 0;
  else if (time.amOrPm === "AM") hours = 0;

  if (hours < 10) hours = `0${hours}`;
  const minutes = time.minutes < 10 ? `0${time.minutes}` : time.minutes;
  str24hr += `${hours}:${minutes}`;
  return str24hr;
}

export function convertToChipsData(dataArray) {
  const chipsData = [];
  dataArray.forEach((word) => chipsData.push({ tag: word }));
  return chipsData;
}

export function convertChipsData(chipsDataArray) {
  const data = [];
  chipsDataArray.forEach((dataObj) => data.push(dataObj.tag));
  return data;
}

export function getPageURL() {
  return browser.tabs
    .query({ currentWindow: true, active: true })
    .then((tabs) => {
      return tabs[0].url;
    });
}
