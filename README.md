## Setup

```bash
git clone <repo>
cd pc-node-api
npm install
cp .env.example .env # edit DB credentials
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts
npm run dev
```

## Running the Project

1. Clone the repository and navigate to the project directory.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env` and update your database credentials.
4. Run database migrations: `npx prisma migrate dev --name init`
5. Seed the database: `npx ts-node prisma/seed.ts`
6. Start the development server: `npm run dev`

## Libraries Used

- express: ^5.1.0
- @prisma/client: ^6.9.0
- prisma: ^6.9.0
- dotenv: ^16.5.0
- mysql2: ^3.14.1
- zod: ^3.25.51
- typescript: ^5.8.3
- ts-node-dev: ^2.0.0
- jest: ^29.7.0
- supertest: ^7.1.1
- @types/express: ^5.0.2
- @types/node: ^22.15.29
- @types/jest: ^29.5.14
- @types/supertest: ^6.0.3
- ts-jest: ^29.3.4
