import './App.css'

import Calendar from './components/Calendar.jsx'

export default function App() {
  return (
    <div className="page">
      <button type="button" className="page__help-button">
        <span className="page__help-icon" aria-hidden="true">
          ?
        </span>
        <span className="page__help-text">Help</span>
      </button>
      <h1 className="page__title">Calendest</h1>
      <Calendar />
    </div>
  )
}
