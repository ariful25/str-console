# STR Operations Console V2

Enterprise-grade property management operations console for STR operators.

## Features

- **Unified Inbox**: Manage all guest messages across properties
- **AI Analysis**: Automatic intent, risk, and urgency detection
- **Smart Templates**: Intent-based reply suggestions
- **Approval Workflow**: Manual review queue for high-risk messages
- **Auto Rules**: Configurable automation with safety gates
- **Knowledge Base**: Searchable property facts and procedures
- **Analytics**: SLA tracking, response metrics, volume analysis
- **Audit Trail**: Complete action history and compliance logs

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Clerk
- **Theme**: Dark mode support

## Getting Started

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env
# Edit .env with your credentials
```

Required variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk auth public key
- `CLERK_SECRET_KEY`: Clerk auth secret key
- `OPENAI_API_KEY`: OpenAI API key for AI analysis (get from https://platform.openai.com/api-keys)

**Note**: The app works without OpenAI, but AI features (message analysis, risk assessment, KB-enhanced suggestions) require a paid OpenAI API account.

3. **Set up database**:
```bash
npm run db:push
```

4. **Run development server**:
```bash
npm run dev
```

5. **Open** [http://localhost:3000](http://localhost:3000)

## Project Structure

