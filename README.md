# Field Record – Setup Guide

Field Record is an installable phone app (PWA) for diesel filling, energy readings, operator channel readings and WhatsApp diesel requests across 15 telecom sites. It works offline and syncs between phones through Firebase.

## Files
| File | Purpose |
|---|---|
| `index.html` | The whole app |
| `sw.js` | Offline support |
| `manifest.json`, `icon-192.png`, `icon-512.png` | Install as app on Android |

## Step 1 – Put it on GitHub Pages (free)
1. Create a new **public** repository on github.com, for example `field-record`.
2. Click **Add file → Upload files**, upload all 5 files above, then **Commit**.
3. Open **Settings → Pages**. Under *Branch* choose `main` and `/ (root)`, then **Save**.
4. After about 1 minute the app is live at `https://YOUR-USERNAME.github.io/field-record/`.

## Step 2 – Install on the phone
1. Open the link in **Chrome** on Android.
2. Tap the **⋮ menu → Add to Home screen → Install**.
3. It now opens full-screen like a normal app, and works without internet.

> The app works fully on one phone without Firebase. Do Step 3 only if records must be shared across phones or backed up to the cloud.

## Step 3 – Firebase cloud sync (free Spark plan is enough)
1. Go to <https://console.firebase.google.com> → **Add project** (Google Analytics not needed).
2. **Build → Authentication → Get started → Sign-in method → Anonymous → Enable.**
3. **Build → Firestore Database → Create database** → choose region `asia-south1 (Mumbai)` → **Production mode**.
4. Open the **Rules** tab, paste this, then **Publish**:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /records/{id} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
5. **Project settings (⚙) → General → Your apps → Web (`</>`)** → register app (no hosting) → copy the `firebaseConfig = { ... }` block.
6. In the app: **Settings → Cloud Sync** → paste the `{ ... }` block → **Connect**. Do the same on every phone that should share records.

The chip in the top bar shows the status: *Synced*, *N pending*, *Offline* or *Local only*. Records entered offline are saved on the phone and upload automatically when internet returns.

Usage is tiny (one write per saved record), so it stays far inside the free daily limit.

## Using the app
- **Diesel Filling**: pick a site, then enter EB kWh, DG HMR, PIU HMR and diesel filled. Opening balance is taken from the last closing balance (60 L for the very first record). Closing = Opening + Filled − (DG hours × 3.5). A negative result shows a red warning and needs confirmation.
- **Energy Reading**: enter EB kWh and kVAh, then use the Airtel / Vodafone / BSNL / Jio tabs for CH1–CH4 kW and Amp. Values are kept while switching tabs, and one Save stores all of them.
- **Camera button**: takes a photo of the meter and reads the digits. Always check the number before tapping *Use Reading*. Values from the camera are tagged **OCR**.
- **Estimate button**: projects the reading from the site's past average daily use. Estimated values are shown in orange and tagged **ESTIMATE** everywhere, including the WhatsApp message (as "(Est.)"). They are never treated as actual readings for future estimates.
- **Make Diesel Request**: pick a site. The app takes the latest readings and the readings from about 30 days earlier (the closest record on or before that date). It also adds up the diesel filled between those dates. Missing values appear as red boxes to fill in. Then tap *Generate Message → WhatsApp*.
  - Diesel requirement = (DG hours × 3.5) − current fuel balance.
- **Duplicates**: saving the same site and type on the same date asks before replacing the earlier record.
- **History**: filter by site, type and date, tap a record to see details or delete it, and export the filtered list to Excel.
- **Excel export** (History, Dashboard or Settings): one workbook with the sheets *Diesel Filling Records, Energy Readings, Airtel / Vodafone / BSNL / Jio Records, Diesel Request History, Site Master, Previous Readings*. It opens in Excel or Google Sheets.
- **Settings**: user name (saved on every record), default WhatsApp number, 60 L opening default, 3.5 L/hr rate, low-fuel alert, and the site list (rename or add sites). It also has JSON backup and restore, and **Load sample data**, which adds the Palliyadi 26/09 → 29/10 test case and produces the 42.5 L request.

## Notes
- Camera OCR works best on clear LCD or digital meters, photographed straight-on and close. Seven-segment displays with glare may need manual correction. The first OCR use needs internet to download the reading engine; after that it is cached.
- Meter photos are not stored, only the readings, to keep the app fast and free.
- To update the app later, upload the new `index.html` to GitHub. Phones pick it up on their next online launch.
