// convert hours, minutes, seconds to seconds
export function hmsToSeconds(h, m, s) {
  const seconds = +h * 60 * 60 + +m * 60 + +s;
  return seconds;
}
