# Amason Car Sales

Kenya car-import and cruise-package website for **Amason Car Sales**. Stock and sailings priced in **KES**. Sales line **+254 722 906978**.

## Run

```bash
cd web
npm install
npm run dev
```

Open `http://localhost:5173`. The API runs on `http://localhost:8787`.

Copy `.env.example` to `.env` (gitignored) and put MongoDB + Cloudinary keys there. The running desk uses `.env`. Without those keys it stays on local JSON + resized WebP.

## Stock desk (`/admin`)

- **Dashboard** — cars, cruises, 8-year flags, new leads, storage/media mode
- **Stock desk** — Japan/UK listings, KES/CIF/FOB/CRSP, gallery, auction-sheet PDF, export certificate
- **Cruise desk** — packages from world ports to Thailand, Bali, USA, South Africa, Zanzibar
- **Enquiries** — car and cruise leads, WhatsApp, KES quote notes. SMTP / WhatsApp Cloud / webhook ping when env is set
- **Sales settings** — phone, WhatsApp, Mombasa, USD/KES

Default login: `amason` / `KenyaDoor2026`

## Public extras

- `/cruises` itineraries
- `/import` KRA duty calculator (CIF, CRSP, duty, excise, VAT, IDF 3.5%, RDL 2%)
- `/sitemap.xml` and `/robots.txt`

## Stack

Vite + React + Express. Optional MongoDB (mongoose) and Cloudinary. Sharp resizes uploads either way.

## Vercel

Root Directory in the Vercel project must be **`web`**. Node.js version is **26.x** (`engines` in `package.json`).

Do **not** set `PORT` on Vercel. Locally the API is `8787` and Vite is `5173`. On Vercel HTTPS is port 443.

Set these Environment Variables for Production (and Preview if you want the desk to work on preview URLs):

| Name | Value |
| --- | --- |
| `PUBLIC_URL` | `https://web-theta-sepia-99.vercel.app` |
| `ADMIN_USER` | `amason` |
| `ADMIN_PASS` | your admin password (used only if Mongo is empty) |
| `ADMIN_SECRET` | a long random string (cookie signing) |
| `MONGODB_URI` | Atlas `mongodb+srv://…` URI, database name `amason` |
| `CLOUDINARY_CLOUD_NAME` | your cloud name |
| `CLOUDINARY_API_KEY` | key |
| `CLOUDINARY_API_SECRET` | secret |
| `SMTP_HOST` `SMTP_PORT` `SMTP_USER` `SMTP_PASS` `SMTP_FROM` `SMTP_TO` | optional, enquiry email ping |

In MongoDB Atlas → Network Access, allow `0.0.0.0/0` so Vercel functions can connect.
