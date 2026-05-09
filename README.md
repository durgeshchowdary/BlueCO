# PlayGrid AI

PlayGrid AI is a premium sports academy management MVP built with a Next.js frontend and an Express/MongoDB backend. All dashboard values are computed from real MongoDB data, and the app includes full CRUD support for students, coaches, batches, attendance, payments, and events.

## Backend

```bash
cd backend
npm install
copy .env.example .env
npm run seed
npm run dev
```

## Frontend

```bash
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

## Notes

- Backend runs on port `5000` by default.
- Frontend reads backend API URL from `NEXT_PUBLIC_API_URL`.
- Use the seed script to populate demo data for the dashboard.
