# FitForge

A comprehensive fitness app with workout tracking, macro counting, and progress visualization.

## Features

- Custom gym program builder
- Macro and calorie tracking
- Barcode scanner for food items
- Progress visualization
- Workout library

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up the database (PostgreSQL):
   ```
   npm run db:push
   ```

## Running the Application

### Unix/Linux/Mac
```
npm run dev
```

### Windows

Option 1: Use the provided batch files
```
start-dev.bat
```
or
```
start-dev-crossenv.bat
```

Option 2: Set environment variables manually in command prompt
```
set NODE_ENV=development
npx tsx server/index.ts
```

Option 3: Run with cross-env directly
```
npx cross-env NODE_ENV=development npx tsx server/index.ts
```

## Tech Stack

- Frontend: React, TailwindCSS, shadcn/ui
- Backend: Express.js
- Database: PostgreSQL with Drizzle ORM
- State Management: React Query