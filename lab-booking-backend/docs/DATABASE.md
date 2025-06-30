# Database Setup Guide

## Prerequisites
- MySQL 8.0 or higher
- Node.js 18 or higher

## Setup Steps

1. **Create Database**

2. **Run Migrations**

3. **Seed Sample Data**

## Default Users

After seeding, you can login with these accounts:

- **Admin (Lecture in Charge)**
- Email: admin@labbook.com
- Password: Password123!

- **Technical Officer**
- Email: tech@labbook.com
- Password: Password123!

- **Instructor**
- Email: instructor@labbook.com
- Password: Password123!

- **Student**
- Email: student@labbook.com
- Password: Password123!

## Database Commands

- `npm run db:reset` - Reset database with fresh migrations and seeds
- `npm run db:fresh` - Drop, create, migrate, and seed database
- `npm run db:migrate:undo` - Undo last migration
- `npm run db:seed:undo` - Undo all seeds

## Environment Variables

Make sure to set these in your `.env` file:

