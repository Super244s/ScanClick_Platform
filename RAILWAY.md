# Railway deployment

This project is configured for Railway with `railway.json`.

- Start command: `npm start`
- Health check: `/health`
- Required variable: `ADMIN_KEY`
- Optional variables: `CORS_ORIGIN`, `DATA_FILE`

For persistent JSON storage, attach a Railway Volume and set `DATA_FILE=/app/data/store.json`.
