export function intervalTimer(callback, delay) {
  var timerId,
    start,
    remaining = delay;
  this.isResumed = false;
  this.time = 0;

  this.pause = function () {
    this.isResumed = false;
    window.clearTimeout(timerId);
    remaining -= new Date() - start;
  };

  // resume loop automatically
  var resumeLoop = function () {
    start = new Date();
    timerId = window.setTimeout(function () {
      remaining = delay;
      resumeLoop();
      callback();
    }, remaining);
  };

  this.resume = function () {
    this.isResumed = true;
    resumeLoop();
  };

  this.isResumed = true;
  resumeLoop();
}
