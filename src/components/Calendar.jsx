import { useState } from 'react'

import './Calendar.css'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const EVENTS_BY_DAY = {
  4: ['atcoder'],
  5: ['codechef'],
  6: ['codeforces'],
  8: ['codeforces'],
  9: ['leetcode'],
  10: ['atcoder'],
  11: ['codeforces', 'codechef'],
  12: ['leetcode'],
  13: ['atcoder'],
  14: ['codeforces', 'codechef', 'atcoder'],
  16: ['atcoder'],
  17: ['codeforces'],
  20: ['leetcode'],
  22: ['codeforces', 'atcoder'],
  23: ['codechef'],
  25: ['codechef'],
  26: ['codeforces', 'atcoder'],
  28: ['leetcode'],
  30: ['codeforces'],
}

const PLATFORMS = {
  codeforces: {
    label: 'Codeforces',
    shortLabel: 'CF',
  },
  codechef: {
    label: 'CodeChef',
    shortLabel: 'CC',
  },
  atcoder: {
    label: 'AtCoder',
    shortLabel: 'AC',
  },
  leetcode: {
    label: 'LeetCode',
    shortLabel: 'LC',
  },
}

const PLATFORM_OPTIONS = Object.entries(PLATFORMS)

const today= new Date()

export default function Calendar() {

  // selected platforms handling

  const [selectedPlatforms, setSelectedPlatforms] = useState(
    PLATFORM_OPTIONS.map(([id]) => id),
  )

  const selectedPlatformSet = new Set(selectedPlatforms)
  const visiblePlatforms = PLATFORM_OPTIONS.filter(([id]) =>
    selectedPlatformSet.has(id),
  )
  const selectedLabel =
    selectedPlatforms.length === 0
      ? 'No platforms'
      : selectedPlatforms.length === PLATFORM_OPTIONS.length
      ? 'All platforms'
      : `${selectedPlatforms.length} selected`

  const togglePlatform = (id) => {
    setSelectedPlatforms((currentPlatforms) =>
      currentPlatforms.includes(id)
        ? currentPlatforms.filter((platformId) => platformId !== id)
        : [...currentPlatforms, id],
    )
  }

  //calendar handling

  const [firstDate,setFirstDate] = useState(new Date(today.getFullYear(),today.getMonth(),1))

  const days_before= (firstDate.getDay()+6)%7
  const startDate= new Date(firstDate.getFullYear(),firstDate.getMonth(),1-days_before)

  const total_days= days_before + (new Date(firstDate.getFullYear(),firstDate.getMonth()+1,0).getDate())

  return (
    <div className="calendar">
      <header className="calendar__header">
        <button
          type="button"
          className="calendar__nav"
          aria-label="Previous month"
          onClick={()=>{
            setFirstDate((prevDate)=> new Date(prevDate.getFullYear(),prevDate.getMonth()-1,1))
          }}
        >
          ‹
        </button>

        <h1 className="calendar__title">{`${firstDate.toLocaleString("en-us",{month:"long"})}, ${firstDate.getFullYear()}`}</h1>

        <button
          type="button"
          className="calendar__nav"
          aria-label="Next month"
          onClick={()=>{
            setFirstDate((prevDate)=> new Date(prevDate.getFullYear(),prevDate.getMonth()+1,1))
          }}
        >
          ›
        </button>
      </header>

      <div className="calendar__filters">
        <button type="button" className="calendar__export-button">
          Export ICS
        </button>

        <span className="calendar__filter-label">Platforms</span>

        <details className="calendar__select">
          <summary className="calendar__select-trigger">
            {selectedLabel}
          </summary>

          <div className="calendar__select-menu">
            {PLATFORM_OPTIONS.map(([id, { label, shortLabel }]) => (
              <label key={id} className="calendar__select-option">
                <input
                  type="checkbox"
                  checked={selectedPlatformSet.has(id)}
                  onChange={() => togglePlatform(id)}
                />
                <span
                  className="calendar__legend-dot"
                  style={{ backgroundColor: `var(--${id})` }}
                />
                <span className="calendar__select-name">{label}</span>
                <span
                  className="calendar__event calendar__select-code"
                  style={{ color: `var(--${id})` }}
                >
                  {shortLabel}
                </span>
              </label>
            ))}
          </div>
        </details>
      </div>

      <div className="calendar__weekdays">
        {WEEKDAYS.map((weekday) => (
          <span key={weekday} className="calendar__weekday">
            {weekday}
          </span>
        ))}
      </div>

      <div className="calendar__grid">
        {Array.from({length:(total_days<=35)?35:42},(_,index)=>{
          const currentDate=new Date(startDate.getFullYear(),startDate.getMonth(),startDate.getDate()+index)
          const inMonth= currentDate.getMonth()==firstDate.getMonth()
          const events = inMonth ? EVENTS_BY_DAY[currentDate.getDate()] ?? [] : []
          const visibleEvents = events.filter((event) =>
            selectedPlatformSet.has(event),
          )

          return (
            <div
              key={`${currentDate.getDate()}-${inMonth ? 'yes' : 'no'}`}
              className={[
                'calendar__cell',
                !inMonth ? 'calendar__cell--outside' : '',
              ].join(' ')}
            >
              <span className="calendar__day">{currentDate.getDate()}</span>

              {visibleEvents.length > 0 && (
                <div className="calendar__events">
                  {visibleEvents.map((event) => (
                    <span
                      key={event}
                      className="calendar__event"
                      style={{ color: `var(--${event})` }}
                      title={PLATFORMS[event].label}
                    >
                      {PLATFORMS[event].shortLabel}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <footer className="calendar__legend">
        {visiblePlatforms.map(
          ([id, { label }], index) => (
            <div key={id} className="calendar__legend-item">
              {index > 0 && (
                <span
                  className="calendar__legend-divider"
                  aria-hidden="true"
                />
              )}

              <span
                className="calendar__legend-dot"
                style={{ backgroundColor: `var(--${id})` }}
                title={label}
              />

              <span>{label}</span>
            </div>
          )
        )}
      </footer>
    </div>
  )
}
