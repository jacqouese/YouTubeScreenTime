export function checkTimeRemaining(category) {
  chrome.runtime.sendMessage(
    {
      for: 'background',
      type: 'checkTimeRemaining',
      body: {
        category: category,
        timeframe: 'day',
      },
    },
    (res) => {
      console.log(`${res.data.timeRemaining} seconds left`);
      if (res.data.isTimeLeft === false) {
        console.log('%cRestriction trigger!!!', 'color: red');
        mainNotification.createSimpleNotification(
          `Time for ${category} has run out`,
          `The time limit you set for ${category} has run out. Check YouTube ScreenTime extension for more details.`
        );
      } else if (
        res.data.timeRemaining !== null &&
        res.data.timeRemaining < 300
      ) {
        mainNotification.createSimpleNotification(
          `Less than 5 min for ${category}`,
          `The time limit you set for ${category} has almost run out.`
        );
      }
    }
  );
}
