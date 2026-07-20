# Calendest

Check it out here!
https://calendest.onrender.com/

Calendest is a competitive programming contest calendar that brings upcoming contests from multiple competitive programming platforms into one place. Filter the platforms you care about, generate a personalized URL, and keep your preferred calendar app automatically updated.

## Features

* 📅 Unified contest calendar
* 🎯 Filter by platform
  * Codeforces
  * CodeChef
  * AtCoder
  * LeetCode
* 🔔 Configurable reminder times
* 🔗 Generate a calendar URL
* 📥 Subscribe from Google Calendar, Outlook, Apple Calendar, and other calendar apps
* ♻️ Automatic updates through an iCalendar (ICS) feed
* ⚡ Backend caching with SQLite for faster responses and reduced external API requests

## Tech Stack

### Frontend

* React

### Backend

* Node.js
* Express
* SQLite

## Calendar Subscription

Instead of downloading an `.ics` file, subscribe using the generated URL in your calendar application to automatically receive future contest updates.

### Google Calendar

On desktop:

**Other calendars → + → From URL → Paste the Calendest URL → Add calendar**

### Outlook

**Add calendar → Subscribe from web → Paste the Calendest URL → Import**

## Supported Platforms

* Codeforces
* CodeChef
* AtCoder
* LeetCode

## Data Sources

Calendest aggregates contests from:

- Codeforces API
- CodeChef API
- LeetCode GraphQL API
- AtCoder (scraped using Cheerio)
