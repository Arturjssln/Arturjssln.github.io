# Privacy Policy

**Last updated: March 17, 2026**

## Overview

Pathly is a personal activity visualization app. This policy explains what data is accessed, how it is used, and your rights regarding that data.

**Short version:** All your data stays on your device. Pathly does not collect, transmit, or sell any personal information.

---

## Data We Access

### 1. Apple Health (HealthKit)
- **What:** Workout routes and activity data (type, date, distance).
- **How it's used:** To display your activities on the map inside the app.
- **Where it stays:** On your device. This data is never sent to any server.
- **Your control:** You can revoke Health access at any time in *Settings → Privacy & Security → Health → Pathly*.

### 2. Strava
- **What:** Workout activities and GPS routes from your Strava account, accessed via OAuth 2.0.
- **How it's used:** To import and display your Strava activities on the map.
- **Where it stays:** Fetched data is stored locally on your device via CoreData. Your Strava credentials are never stored — only a short-lived OAuth token is kept locally to make API requests.
- **Your control:** You can disconnect Strava at any time from within the app, which deletes the stored token. You can also revoke access directly in your [Strava settings](https://www.strava.com/settings/apps).

### 3. GPX Files
- **What:** GPS track files you choose to import manually.
- **How it's used:** Parsed and stored locally to display tracks on the map.
- **Where it stays:** On your device only.

---

## Data Storage

All activity data is stored locally on your device using CoreData. Nothing is uploaded to external servers, cloud services, or third parties by Pathly itself.

---

## Third-Party Services

| Service | Purpose | Their Privacy Policy |
|---|---|---|
| Strava | Activity import | [strava.com/legal/privacy](https ://www.strava.com/legal/privacy) |
| Apple HealthKit | Activity import | [apple.com/legal/privacy](https://www.apple.com/legal/privacy/) |

Pathly does not use any analytics SDKs, advertising networks, or crash reporting services.

---

## Data Sharing

Pathly does **not** share, sell, or transmit your data to any third party. No data leaves your device except for the OAuth requests made directly to Strava's API on your behalf.

---

## Children's Privacy

Pathly does not knowingly collect any data from children under 13.

---

## Changes to This Policy

If this policy changes, the updated version will be published here with a new "Last updated" date.

---

## Contact

If you have questions about this privacy policy, please open an issue on the project repository.
