import './App.css'

import { useEffect, useRef, useState } from 'react'

import Calendar from './components/Calendar.jsx'

export default function App() {
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const returnButtonRef = useRef(null)

  useEffect(() => {
    if (!isHelpOpen) return undefined

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsHelpOpen(false)
    }

    document.addEventListener('keydown', closeOnEscape)
    returnButtonRef.current?.focus()

    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [isHelpOpen])

  return (
    <div className="page">
      <button
        type="button"
        className="page__help-button"
        aria-haspopup="dialog"
        onClick={() => setIsHelpOpen(true)}
      >
        <span className="page__help-icon" aria-hidden="true">
          ?
        </span>
        <span className="page__help-text">Help</span>
      </button>
      <main className="page__content">
        <h1 className="page__title">Calendest</h1>
        <Calendar />
      </main>

      <footer className="page__footer">
        <p>
          Made with ❤️ by <a href="https://github.com/BartikaKumar" target="_blank" rel="noopener noreferrer">Bartika</a>
        </p>
      </footer>

      {isHelpOpen && (
        <div
          className="help-modal__backdrop"
        >
          <section
            className="help-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-modal-title"
          >
            <div className="help-modal__content">
              <span className="help-modal__eyebrow">Quick guide</span>
              <h2 id="help-modal-title">How to use Calendest URL</h2>
              <p className="help-modal__intro">
                Keep track of upcoming contests and add the ones that matter to your own calendar in a few simple steps.
              </p>

              <ol className="help-modal__list">
                <li>
                  <strong>Copy your calendar URL</strong>
                  <span>Choose your platforms and reminders, and then copy the generated URL.</span>
                </li>
                <li>
                  <strong>Google Calendar</strong>
                  <span>Open Google Calendar (web) → In the left sidebar, next to <em>Other calendars</em>, click <strong>+</strong> → <em>From URL</em> → Paste the URL → <em>Add calendar</em><br/><br/>
                  <i>If the calendar doesn't appear in the Google Calendar mobile app, open the app → Settings → Calendest → Enable <em>Sync</em></i></span>
                </li>
                <li>
                  <strong>Outlook Calendar</strong>
                  <span>Open Outlook Calendar (web) → In the left sidebar, click <em>Add calendar</em> → <em>Subscribe from web</em> → Paste the URL → <em>Import</em><br/><br/>
                  <i>If the calendar doesn't appear in Outlook, make sure Calendest is checked in the left sidebar.</i></span>
                </li>
                <li>
                  <strong>Other calendar apps</strong>
                  <span>Many calendar apps support adding calendars through URLs. Feel free to check it out!</span>
                </li>
                <li>
                  <strong>Reminders</strong>
                  <span>Support varies by calendar app. For example, Google Calendar subscriptions use calendar-level notifications. To receive reminders, open <em>Google Calendar</em> → <em>Settings</em> → <em>Calendest</em> → <em>Event notifications</em></span>
                </li>
                <li>
                  <strong>Stay up to date</strong>
                  <span>Your subscribed calendar will automatically reflect future contest updates.</span>
                </li>
              </ol>
            </div>

            <div className="help-modal__footer">
              <button
                ref={returnButtonRef}
                type="button"
                className="help-modal__return"
                onClick={() => setIsHelpOpen(false)}
              >
                Return to calendar
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
