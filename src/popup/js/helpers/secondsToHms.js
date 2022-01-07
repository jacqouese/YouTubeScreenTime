export function secondsToHms(d) {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor((d % 3600) / 60);
  var s = Math.floor((d % 3600) % 60);

  if (h > 0) {
    return `${h}<span class="smaller">h</span> ${m}<span class="smaller">m</span>`;
  } else if (m > 0) {
    return `${m}<span class="smaller">min</span>`;
  } else {
    return `0<span class="smaller">min</span>`;
  }
}
