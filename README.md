# Bill Tracker

A simple web application to track monthly bills and take notes. Built with Next.js, Prisma, and SQLite.

## Features

- Track bills with due dates and amounts
- Support for recurring bills (monthly, quarterly, yearly)
- Add notes to bills
- Attach files to bills
- Take and manage notes
- Local SQLite database for data persistence

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the database:
   ```bash
   npx prisma migrate dev
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Technology Stack

- Next.js 13+ with App Router
- TypeScript
- Prisma ORM
- SQLite
- Tailwind CSS
- React
- date-fns

## Project Structure

```
src/
  ├── app/                 # Next.js app directory
  │   ├── api/            # API routes
  │   ├── bills/          # Bill pages
  │   ├── notes/          # Notes pages
  │   └── layout.tsx      # Root layout
  ├── lib/                # Shared utilities
  └── components/         # React components
prisma/
  └── schema.prisma       # Database schema
```

## Database Schema

### Bill
- id: Int (Primary Key)
- name: String
- amount: Float
- dueDate: DateTime
- isPaid: Boolean
- isRecurring: Boolean
- frequency: Int (1=monthly, 3=quarterly, 12=yearly)
- notes: String (optional)
- attachmentPath: String (optional)
- createdAt: DateTime
- updatedAt: DateTime

### Note
- id: Int (Primary Key)
- title: String
- content: String
- createdAt: DateTime
- updatedAt: DateTime 