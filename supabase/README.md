# Supabase Database Migrations

This directory contains SQL migration files for the Lasu Financial database.

## Running Migrations

### Prerequisites

1. Install Supabase CLI (if not already installed):

   ```bash
   brew install supabase/tap/supabase
   ```

2. Link your project to Supabase:
   ```bash
   supabase link --project-ref <your-project-ref>
   ```

### Apply Migrations

To apply all pending migrations to your Supabase project:

```bash
supabase db push
```

Or apply migrations individually using the Supabase Dashboard SQL Editor.

### Migration Files

#### 1. `20260214000001_create_user_balances_table.sql`

Creates the `user_balances` table to store user wallet balances.

**Features:**

- Stores balance in USD as base currency
- Automatic balance creation on user signup (via trigger)
- Row Level Security (RLS) policies for user data isolation
- Unique constraint to ensure one balance per user

**Schema:**

- `id`: UUID primary key
- `user_id`: Foreign key to auth.users
- `amount_usd`: Balance in USD (NUMERIC, default 0.00)
- `last_updated`: Timestamp of last balance update
- `created_at`: Timestamp of record creation

#### 2. `20260214000002_create_transactions_table.sql`

Creates the `transactions` table to store deposit/withdrawal history.

**Features:**

- Supports both USD and ARS currencies
- Automatic balance updates on transaction completion (via trigger)
- Tracks exchange rate used for ARS transactions
- Transaction status tracking (pending, completed, failed)

**Schema:**

- `id`: UUID primary key
- `user_id`: Foreign key to auth.users
- `type`: 'deposit' or 'withdrawal'
- `amount`: Transaction amount (NUMERIC)
- `currency`: 'USD' or 'ARS'
- `exchange_rate`: Rate used if currency was ARS
- `status`: 'pending', 'completed', or 'failed'
- `description`: Optional transaction description
- `created_at`: Timestamp of transaction creation
- `completed_at`: Timestamp when status changed to completed
- `metadata`: JSONB for additional data

## Database Triggers

### `on_auth_user_created`

Automatically creates an initial balance record (0.00 USD) when a new user signs up.

### `on_transaction_status_change`

When a transaction status changes to 'completed':

1. Converts amount to USD if currency is ARS
2. Updates user's balance (add for deposit, subtract for withdrawal)
3. Sets the `completed_at` timestamp

## Row Level Security (RLS)

Both tables have RLS enabled with policies ensuring:

- Users can only view their own records
- Users can only create/update their own records
- No user can access another user's balance or transactions

## Testing Migrations Locally

For local development with Supabase:

```bash
# Start local Supabase
supabase start

# Apply migrations
supabase db reset

# Stop local Supabase
supabase stop
```

## Manual SQL Execution

If you prefer to run migrations manually via the Supabase Dashboard:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of each migration file in order
4. Execute each migration

## Notes

- Migrations are numbered with timestamps to ensure correct execution order
- Always test migrations on a staging environment before applying to production
- Keep migration files immutable once applied to production
- Use new migration files for schema changes, don't modify existing ones
