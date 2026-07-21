import { useEffect, useRef, useState } from 'react'

import './Calendar.css'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const PLATFORMS = {
  cf: {
    label: 'Codeforces',
    shortLabel: 'CF',
    color: 'codeforces',
  },
  cc: {
    label: 'CodeChef',
    shortLabel: 'CC',
    color: 'codechef',
  },
  ac: {
    label: 'AtCoder',
    shortLabel: 'AC',
    color: 'atcoder',
  },
  lc: {
    label: 'LeetCode',
    shortLabel: 'LC',
    color: 'leetcode',
  },
}

const PLATFORM_OPTIONS = Object.entries(PLATFORMS)

const REMINDER_OPTIONS = [
  { id: '1-week', label: '1 week before', value: 10080, selected: false },
  { id: '3-days', label: '3 days before', value: 4320, selected: false },
  { id: '1-day', label: '1 day before', value: 1440, selected: true },
  { id: '1-hour', label: '1 hour before', value: 60, selected: true },
  { id: '10-mins', label: '10 mins before', value: 10, selected: false },
]

const today= new Date()

const formatDuration = (duration) => {
  const days = Math.floor(duration / 86400)
  const hours = Math.floor((duration % 86400) / 3600)
  const minutes = Math.floor((duration % 3600) / 60)

  return [
    days && `${days}d`,
    hours && `${hours}h`,
    minutes && `${minutes}m`,
  ].filter(Boolean).join(' ') || `${duration}s`
}

const formatStartTime = (startTime) => new Date(startTime * 1000).toLocaleTimeString(
  [],
  { hour: '2-digit', minute: '2-digit' },
)

export default function Calendar() {

  const calendarRef = useRef(null)
  const toastTimerRef = useRef(null)
  const [events, setEvents] = useState([])
  const [calendarPlatforms, setCalendarPlatforms] = useState(
    PLATFORM_OPTIONS.map(([id]) => id),
  )
  const [selectedReminders, setSelectedReminders] = useState(
    REMINDER_OPTIONS.filter(({ selected }) => selected).map(({ value }) => value),
  )
  const [toast, setToast] = useState(null)

  useEffect(() => {
    Promise.allSettled(
      PLATFORM_OPTIONS.map(async ([platform]) => {
        const response = await fetch(`/api/contests/${platform}`)
        if (!response.ok) throw new Error(`Failed to fetch ${platform} contests`)

        return response.json()
      }),
    )
      .then((results) => {
        const contests = []

        results.forEach((result) => {
          if (result.status === 'fulfilled') contests.push(...result.value)
          else console.error(result.reason)
        })

        setEvents(contests)
      })
  }, [])

  useEffect(() => () => clearTimeout(toastTimerRef.current), [])

  useEffect(() => {
    const closeDetailsOnOutsideClick = (event) => {
      calendarRef.current?.querySelectorAll('details[open]').forEach((details) => {
        if (!details.contains(event.target)) {
          details.open = false
          details.querySelector(':scope > summary')?.blur()
        }
      })
    }

    document.addEventListener('click', closeDetailsOnOutsideClick)
    return () => document.removeEventListener('click', closeDetailsOnOutsideClick)
  }, [])

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

  const toggleCalendarPlatform = (id) => {
    setCalendarPlatforms((platforms) =>
      platforms.includes(id)
        ? platforms.filter((platform) => platform !== id)
        : [...platforms, id],
    )
  }

  const toggleReminder = (value) => {
    setSelectedReminders((reminders) =>
      reminders.includes(value)
        ? reminders.filter((reminder) => reminder !== value)
        : [...reminders, value],
    )
  }

  const showToast = (message, type) => {
    clearTimeout(toastTimerRef.current)
    setToast({ message, type })
    toastTimerRef.current = setTimeout(() => setToast(null), 3000)
  }

  const copyCalendarUrl = async () => {
    const calendarUrl = `${window.location.origin}/api/calendar/ics?platforms=${calendarPlatforms.join(',')}&reminders=${selectedReminders.join(',')}`

    try {
      await navigator.clipboard.writeText(calendarUrl)
      showToast('URL copied successfully', 'success')
    } catch (error) {
      console.error('Failed to copy calendar URL:', error)
      showToast('Failed to copy URL', 'error')
    }
  }

  //calendar handling

  const [firstDate,setFirstDate] = useState(new Date(today.getFullYear(),today.getMonth(),1))

  const days_before= (firstDate.getDay()+6)%7
  const startDate= new Date(firstDate.getFullYear(),firstDate.getMonth(),1-days_before)

  const total_days= days_before + (new Date(firstDate.getFullYear(),firstDate.getMonth()+1,0).getDate())

  //dom elements

  return (
    <div ref={calendarRef} className="calendar">
      <header className="calendar__header">
        <button
          type="button"
          className="calendar__nav"
          aria-label="Previous month"
          onClick={()=>{
            setFirstDate((prevDate)=> new Date(prevDate.getFullYear(),prevDate.getMonth()-1,1))
          }}
          disabled={(((today.getFullYear()-firstDate.getFullYear())*12+(today.getMonth()-firstDate.getMonth()))>=1)}
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
        <details className="calendar__select calendar__url-select">
          <summary className="calendar__select-trigger">
            Calendar URL
          </summary>

          <div className="calendar__select-menu calendar__url-menu">
            <details className="calendar__url-section" open>
              <summary className="calendar__url-section-title">
                Platforms
              </summary>

              <div className="calendar__url-section-options">
                {PLATFORM_OPTIONS.map(([id, { label, shortLabel, color }]) => (
                  <label key={id} className="calendar__select-option">
                    <input
                      type="checkbox"
                      checked={calendarPlatforms.includes(id)}
                      onChange={() => toggleCalendarPlatform(id)}
                    />
                    <span
                      className="calendar__legend-dot"
                      style={{ backgroundColor: `var(--${color})` }}
                    />
                    <span className="calendar__select-name">{label}</span>
                    <span
                      className="calendar__event calendar__select-code"
                      style={{ color: `var(--${color})` }}
                    >
                      {shortLabel}
                    </span>
                  </label>
                ))}
              </div>
            </details>

            <details className="calendar__url-section" open>
              <summary className="calendar__url-section-title">
                Reminders
              </summary>

              <div className="calendar__url-section-options">
                {REMINDER_OPTIONS.map(({ id, label, value }) => (
                  <label
                    key={id}
                    className="calendar__select-option calendar__reminder-option"
                  >
                    <input
                      type="checkbox"
                      checked={selectedReminders.includes(value)}
                      onChange={() => toggleReminder(value)}
                    />
                    <span className="calendar__select-name">{label}</span>
                  </label>
                ))}
              </div>
            </details>

            <button
              type="button"
              className="calendar__export-button"
              title="Copy Calendar URL for the selected options"
              onClick={copyCalendarUrl}
            >
              Copy Calendar URL
            </button>
          </div>
        </details>

        <span className="calendar__filter-label">Platforms</span>

        <details className="calendar__select calendar__platforms-select">
          <summary className="calendar__select-trigger">
            {selectedLabel}
          </summary>

          <div className="calendar__select-menu">
            {PLATFORM_OPTIONS.map(([id, { label, shortLabel, color }]) => (
              <label key={id} className="calendar__select-option">
                <input
                  type="checkbox"
                  checked={selectedPlatformSet.has(id)}
                  onChange={() => togglePlatform(id)}
                />
                <span
                  className="calendar__legend-dot"
                  style={{ backgroundColor: `var(--${color})` }}
                />
                <span className="calendar__select-name">{label}</span>
                <span
                  className="calendar__event calendar__select-code"
                  style={{ color: `var(--${color})` }}
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
          const visibleEvents = inMonth ? events.filter((event) => {
            const eventDate = new Date(event.startTime * 1000)
            return selectedPlatformSet.has(event.platform)
              && eventDate.getFullYear() === currentDate.getFullYear()
              && eventDate.getMonth() === currentDate.getMonth()
              && eventDate.getDate() === currentDate.getDate()
          }) : []
          const eventsByPlatform = visibleEvents.reduce((groups, event) => {
            if (!groups[event.platform]) groups[event.platform] = []
            groups[event.platform].push(event)
            return groups
          }, {})

          return (
            <div
              key={`${currentDate.getDate()}-${inMonth ? 'yes' : 'no'}`}
              className={[
                'calendar__cell',
                (today.toDateString()===currentDate.toDateString()) ? 'calendar__cell--today' : '',
                !inMonth ? 'calendar__cell--outside' : '',
              ].join(' ')}
            >
              <span className="calendar__day">{currentDate.getDate()}</span>

              {visibleEvents.length > 0 && (
                <div className="calendar__events">
                  {PLATFORM_OPTIONS.map(([platform, platformDetails]) => {
                    const platformEvents = eventsByPlatform[platform]
                    if (!platformEvents) return null

                    return (
                      <details key={platform} className="calendar__event-details">
                        <summary
                          className="calendar__event"
                          style={{ color: `var(--${platformDetails.color})` }}
                          title={`${platformDetails.label} contests`}
                        >
                          {platformDetails.shortLabel}
                        </summary>

                        <div className="calendar__select-menu calendar__event-menu">
                          <div className="calendar__event-menu-title">
                            {platformDetails.label}
                          </div>

                          {platformEvents.map((event) => (
                            <a
                              key={event.contestId}
                              className="calendar__contest-link"
                              href={event.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <span className="calendar__contest-name">{event.name}</span>
                              <span className="calendar__contest-meta">
                                {formatStartTime(event.startTime)} · {formatDuration(event.duration)}
                              </span>
                            </a>
                          ))}
                        </div>
                      </details>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <footer className="calendar__legend">
        {visiblePlatforms.map(
          ([id, { label, color }], index) => (
            <div key={id} className="calendar__legend-item">
              {index > 0 && (
                <span
                  className="calendar__legend-divider"
                  aria-hidden="true"
                />
              )}

              <span
                className="calendar__legend-dot"
                style={{ backgroundColor: `var(--${color})` }}
                title={label}
              />

              <span>{label}</span>
            </div>
          )
        )}
      </footer>

      {toast && (
        <div
          className={`calendar__toast calendar__toast--${toast.type}`}
          role={toast.type === 'error' ? 'alert' : 'status'}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}
