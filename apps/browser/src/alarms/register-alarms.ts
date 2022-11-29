const NUMBER_OF_ALARMS = 6;

export function registerAlarms() {
  alarmsToBeCreated(NUMBER_OF_ALARMS);
}

/**
 * Creates staggered alarms that periodically (1min) raise OnAlarm events. The staggering is calculated based on the numnber of alarms passed in.
 * @param numberOfAlarms Number of named alarms, that shall be registered
 * @example
 * // alarmsToBeCreated(2) results in 2 alarms separated by 30 seconds
 * @example
 * // alarmsToBeCreated(4) results in 4 alarms separated by 15 seconds
 * @example
 * // alarmsToBeCreated(6) results in 6 alarms separated by 10 seconds
 * @example
 * // alarmsToBeCreated(60) results in 60 alarms separated by 1 second
 */
function alarmsToBeCreated(numberOfAlarms: number): void {
  const oneMinuteInMs = 60 * 1000;
  const offset = oneMinuteInMs / numberOfAlarms;

  let calculatedWhen: number = Date.now() + offset;

  for (let index = 0; index < numberOfAlarms; index++) {
    chrome.alarms.create(`bw_alarm${index}`, { periodInMinutes: 1, when: calculatedWhen });
    calculatedWhen += offset;
  }
}
