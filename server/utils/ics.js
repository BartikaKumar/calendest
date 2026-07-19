const platforms={
    cc:"Codechef",
    cf:"Codeforces",
    lc:"Leetcode",
    ac:"Atcoder"
}

function formatIcsDate(timestamp) {
    return new Date(timestamp)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z")
}
  
  function escapeIcs(value = "") {
    return String(value)
      .replace(/\\/g, "\\\\")
      .replace(/\r?\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;")
  }
  
  function createAlarm(minutesBefore) {
    return [
      "BEGIN:VALARM",
      `TRIGGER:-PT${minutesBefore}M`,
      "ACTION:DISPLAY",
      "DESCRIPTION:Contest reminder",
      "END:VALARM"
    ].join("\r\n")
  }
  
  export function createIcs(contests, reminders = []) {
    const generatedAt = formatIcsDate(Date.now())
  
    const events = contests.map(contest => {
      const startTime = Number(contest.startTime) * 1000
      const endTime = startTime + Number(contest.duration) * 1000
  
      const alarms = reminders
        .map(createAlarm)
        .join("\r\n")
  
      return [
        "BEGIN:VEVENT",
        `UID:${escapeIcs(`${contest.platform}-${contest.contestId}@calendest`)}`,
        `DTSTAMP:${generatedAt}`,
        `DTSTART:${formatIcsDate(startTime)}`,
        `DTEND:${formatIcsDate(endTime)}`,
        `SUMMARY:${escapeIcs(contest.name)}`,
        `DESCRIPTION:${escapeIcs(
          `Contest on ${platforms[contest.platform]}`
        )}`,
        contest.url ? `URL:${contest.url}` : null,
        alarms,
        "END:VEVENT"
      ]
        .filter(Boolean)
        .join("\r\n")
    })
  
    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "PRODID:-//Calendest//Contest Calendar//EN",
      "X-WR-CALNAME:Calendest",
      ...events,
      "END:VCALENDAR",
      ""
    ].join("\r\n")
  }