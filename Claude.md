# Messagine Bot - Developer Documentation

## Project Overview

**Messagine Bot** is a Telegram-based anonymous chat bot that connects random users from around the world for private conversations without requiring them to share personal information.

- **Bot Link:** <https://t.me/MessagineBot>
- **Repository:** <https://github.com/messagine/messagine-bot>
- **Purpose:** Enable anonymous, language-matched conversations between strangers

### Key Features

- Random user matching through lobby system
- Language-based matching (60+ languages supported)
- Anonymous messaging (text, photos, videos, stickers, voice, documents)
- Automated chat creation via daily cron jobs
- Chat reminder system to re-engage users
- Multi-language support with i18n
- Admin capabilities for moderation

## Architecture

### Technology Stack

**Core Technologies:**

- **Language:** TypeScript (ES5 target, strict mode)
- **Runtime:** Node.js 18
- **Web Framework:** Express.js 5.2.1
- **Bot Framework:** Telegraf 3.38.0
- **Database:** MongoDB with Mongoose 5.12.13

**Key Libraries:**

- `telegraf-i18n` - Internationalization support
- `telegraf-mixpanel` - Analytics tracking
- `telegraf-ratelimit` - Rate limiting protection
- `@sentry/node` - Error tracking and monitoring
- `node-cron` - Scheduled job execution
- `lodash` - Utility functions

**Development Tools:**

- TypeScript 5.9.3
- TSLint (deprecated, migration to ESLint recommended)
- Ava - Testing framework
- Sinon - Mocking library
- NYC - Code coverage (30% minimum)
- Prettier - Code formatting
- Nodemon - Development auto-reload

### Directory Structure

```
messagine-bot/
├── src/
│   ├── commands/          # Bot command handlers
│   │   ├── startCommand.ts       # /start - Initial user registration
│   │   ├── changeLanguageCommand.ts
│   │   ├── settingsCommand.ts
│   │   └── ... (14 total)
│   │
│   ├── message/           # Message type handlers
│   │   ├── onTextMessage.ts      # Text message forwarding
│   │   ├── onPhotoMessage.ts
│   │   ├── onVideoMessage.ts
│   │   └── ... (13 total)
│   │
│   ├── middlewares/       # Telegraf middleware
│   │   ├── dbMiddleware.ts       # MongoDB session injection
│   │   ├── catcherMiddleware.ts  # Error handling
│   │   ├── i18nMiddleware.ts     # Language detection
│   │   └── ... (8 total)
│   │
│   ├── lib/               # Core business logic
│   │   ├── models/        # Mongoose database models
│   │   │   ├── User.ts           # User schema
│   │   │   ├── Lobby.ts          # Lobby/matching schema
│   │   │   ├── Chat.ts           # Chat session schema
│   │   │   └── ... (6 total)
│   │   │
│   │   ├── telegram.ts           # Bot initialization
│   │   ├── dataHandler.ts        # Database operations
│   │   ├── common.ts             # Shared utilities
│   │   ├── enums.ts              # Constants and enums
│   │   └── responses.ts          # Response helpers
│   │
│   ├── error/             # Custom error classes
│   │   ├── DuplicateChatError.ts
│   │   ├── NoMatchFoundError.ts
│   │   └── ... (12 total)
│   │
│   ├── reply/             # Reply keyboard templates
│   ├── locales/           # i18n translations (en, de, tr)
│   ├── config.ts          # Environment configuration
│   ├── index.ts           # Application entry point
│   └── resource.ts        # Resource strings
│
├── test/                  # Test files
│   ├── telegraf.ts
│   ├── createChat.ts
│   ├── chatReminder.ts
│   └── fakes/            # Mock implementations
│
├── dist/                  # Compiled JavaScript (build output)
├── Dockerfile            # Docker containerization
├── languages.json        # Supported languages configuration
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── .nycrc               # Test coverage configuration
```

## Setup Instructions

### Prerequisites

- Node.js 18 or higher
- MongoDB instance (local or cloud)
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))
- Public webhook URL (for production)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Required
BOT_TOKEN=<your_telegram_bot_token>
DB_URL=<mongodb_connection_string>
ENDPOINT_URL=<public_webhook_url>

# Optional
WEBHOOK_PATH=/api                    # Webhook endpoint path (default: /api)
MIXPANEL_TOKEN=<mixpanel_token>      # Analytics (optional)
SENTRY_DSN=<sentry_dsn>             # Error tracking (optional)
NODE_ENV=production                  # Environment (development/production)
DEV=false                           # Development mode (true/false)
NEXT_REMINDER_DAYS=1                # Days until chat reminder
CREATE_CHAT_SCHEDULE="0 10 * * *"   # Cron: daily at 10:00 AM
CHAT_REMINDER_SCHEDULE="0 18 * * *" # Cron: daily at 6:00 PM
PORT=3000                           # Server port
```

See `.env.example` for a complete reference.

### Local Development

```bash
# Install dependencies
npm install

# Run in development mode (with auto-reload)
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Build TypeScript
npm run build

# Run production build
npm start
```

### Docker Deployment

```bash
# Build Docker image
docker build -t messagine-bot .

# Run container
docker run -d \
  --name messagine-bot \
  -p 3000:3000 \
  --env-file .env \
  messagine-bot

# View logs
docker logs -f messagine-bot

# Stop container
docker stop messagine-bot
```

## Application Flow

### Startup Sequence

1. **Load Configuration** (`src/config.ts`)
   - Reads environment variables
   - Validates critical configuration

2. **Initialize Express** (`src/index.ts`)
   - Create Express app on port 3000
   - Setup health check endpoint (`GET /`)

3. **Setup Bot** (`src/lib/telegram.ts`)
   - Initialize Telegraf bot instance
   - Apply middleware chain (DB, i18n, rate limiting, etc.)
   - Register command handlers
   - Register action handlers
   - Register message handlers

4. **Sync Webhook** (`src/index.ts`)
   - Synchronize bot commands with Telegram
   - Set webhook URL for receiving updates

5. **Configure Webhook Endpoint**
   - `POST /api` (or custom path) - Receives Telegram updates

6. **Schedule Cron Jobs**
   - **Create Chat Job** - Daily at 10:00 AM
     - Matches users in lobby
     - Creates chat sessions
   - **Chat Reminder Job** - Daily at 6:00 PM
     - Sends reminders to inactive chats

### User Interaction Flow

#### New User Registration

```
User → /start → startCommand.ts
  ↓
Check if user exists in DB
  ↓
Create new User document
  ↓
Send welcome message with language selection
  ↓
Track signup event in Mixpanel
```

#### Finding a Chat Partner

```
User → /findpartner → findPartnerCommand.ts
  ↓
Check user's language preference
  ↓
Add user to Lobby collection
  ↓
Wait for cron job or manual matching
  ↓
Match with user of same language
  ↓
Create Chat document linking two users
  ↓
Notify both users
```

#### Sending Messages

```
User sends message → onTextMessage.ts
  ↓
dbMiddleware injects User from DB
  ↓
Find active Chat for user
  ↓
Get opponent's chat ID
  ↓
Forward message to opponent
  ↓
Track message event (metadata only)
```

## Database Models

### User Model (`src/lib/models/User.ts`)

```typescript
{
  chatId: number           // Telegram chat ID (unique)
  language: string         // Preferred language code
  isActive: boolean        // Account status
  createdAt: Date
  updatedAt: Date
}
```

### Lobby Model (`src/lib/models/Lobby.ts`)

```typescript
{
  chatId: number           // User waiting for match
  language: string         // Preferred language
  createdAt: Date
}
```

### Chat Model (`src/lib/models/Chat.ts`)

```typescript
{
  chatId1: number          // First user's chat ID
  chatId2: number          // Second user's chat ID
  isActive: boolean        // Chat session status
  reminderSentAt: Date     // Last reminder timestamp
  createdAt: Date
  updatedAt: Date
}
```

## Bot Commands

| Command | Description | File |
|---------|-------------|------|
| `/start` | Initialize bot, register user | `startCommand.ts` |
| `/findpartner` | Join lobby to find chat partner | `findPartnerCommand.ts` |
| `/leavelobby` | Leave the matching lobby | `leaveLobbyCommand.ts` |
| `/endchat` | End current chat session | `endChatCommand.ts` |
| `/changelanguage` | Change language preference | `changeLanguageCommand.ts` |
| `/settings` | View/update settings | `settingsCommand.ts` |
| `/help` | Show help message | `helpCommand.ts` |
| `/admin` | Admin commands (restricted) | `adminCommand.ts` |

## Middleware Chain

The bot applies middleware in this order (see `src/lib/telegram.ts`):

1. **dbMiddleware** - Injects user data from MongoDB
2. **i18nMiddleware** - Sets user's language for responses
3. **mixpanelMiddleware** - Initializes analytics tracking
4. **rateLimitMiddleware** - Prevents spam (2 requests/second)
5. **catcherMiddleware** - Catches and handles errors
6. **Command/Action/Message handlers** - Process user input

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test test/telegraf.ts

# Run with coverage
nyc npm test
```

### Test Structure

- **Unit Tests** - Test individual functions and commands
- **Mocking** - Uses Sinon for stubbing external dependencies
- **Coverage** - Minimum 30% line coverage required

### Test Files

- `test/telegraf.ts` - Bot command tests
- `test/createChat.ts` - Chat creation logic
- `test/chatReminder.ts` - Reminder system
- `test/fakes/` - Mock implementations

## Code Patterns

### Error Handling

**Custom Error Classes** (`src/error/`)

```typescript
import { TelegrafContextMessageUpdate } from '../lib/telegram';

export default class DuplicateChatError extends Error {
  public ctx: TelegrafContextMessageUpdate;
  public extra?: object;

  constructor(ctx: TelegrafContextMessageUpdate, extra?: object) {
    super('Duplicate chat');
    this.ctx = ctx;
    this.extra = extra;
  }
}
```

**Error Middleware** (`src/middlewares/catcherMiddleware.ts`)

- Catches errors from handlers
- Sends user-friendly messages
- Logs to console (should use Sentry)

### Database Operations

**Pattern** (`src/lib/dataHandler.ts`)

```typescript
export const findUserByChatId = async (chatId: number) => {
  return await User.findOne({ chatId });
};

export const createUser = async (userData: IUser) => {
  const user = new User(userData);
  return await user.save();
};
```

### Internationalization

**Usage**

```typescript
ctx.i18n.t('welcome_message')  // Returns translated string
```

**Translation Files** (`src/locales/`)

- `en.yaml` - English
- `de.yaml` - German
- `tr.yaml` - Turkish

## Known Issues and TODOs

### Security & Privacy

- Message content should NOT be tracked in analytics (privacy violation)
- User PII (first_name, last_name, username) should NOT be sent to Mixpanel
- Missing webhook signature validation
- Raw error messages exposed to users
- No input sanitization for user messages

### Code Quality

- Using deprecated TSLint (should migrate to ESLint)
- Deprecated Mongoose connection options
- Sentry integration not initialized
- Low test coverage (30%)
- Missing integration tests

### Deployment

- No graceful shutdown handling
- Basic health check (doesn't verify DB status)
- Cron job errors only logged to console

### Dependencies

- Mongoose 4 major versions behind
- Telegraf major version behind
- Multiple outdated dependencies

## Contributing

### Development Workflow

1. Create feature branch from `master`
2. Make changes with proper TypeScript types
3. Add tests for new functionality
4. Run linter and fix issues
5. Ensure tests pass
6. Build and verify locally
7. Submit pull request

### Code Style

- Use TypeScript strict mode
- Follow existing patterns and structure
- Add JSDoc comments for public functions
- Use Prettier for formatting
- Use meaningful variable names
- Keep functions small and focused

### Commit Messages

Follow conventional commit format:

```
feat: Add new command for user profile
fix: Resolve duplicate chat creation bug
docs: Update setup instructions
refactor: Simplify lobby matching logic
test: Add tests for chat reminder job
```

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB URL
- [ ] Set valid webhook URL (HTTPS required)
- [ ] Configure Sentry DSN for error tracking
- [ ] Set appropriate cron schedules
- [ ] Review and set rate limiting rules
- [ ] Verify all environment variables
- [ ] Test health check endpoint
- [ ] Monitor logs for errors
- [ ] Set up database backups

### Migration History

**Previous Architecture:** AWS Lambda + Serverless Framework
**Current Architecture:** Dockerized Express application

The migration (commit: fe22771) moved from event-driven Lambda functions to a persistent Express server with cron-based job scheduling.

## Monitoring & Analytics

### Mixpanel Events Tracked

- User signup
- Chat creation
- Message events (by type)
- Command usage
- User actions (leave lobby, end chat, etc.)

### Error Tracking

- Sentry integration available but not initialized
- Configure `SENTRY_DSN` environment variable
- Errors automatically captured in middleware

### Logs

- Console logging (development)
- Should integrate structured logging for production

## API Endpoints

### Health Check

```
GET /
Returns: "Messagine Bot is running"
```

### Webhook Endpoint

```
POST /api (or custom WEBHOOK_PATH)
Receives: Telegram update events
Returns: 200 OK or 500 Error
```

## Resources

- [Telegraf Documentation](https://telegraf.js.org/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Express.js Guide](https://expressjs.com/)
- [Node-cron Documentation](https://www.npmjs.com/package/node-cron)

## License

See repository for license information.

## Support

For issues and feature requests, please use the [GitHub issue tracker](https://github.com/messagine/messagine-bot/issues).

---

**Last Updated:** 2026-01-09
**Bot Version:** 1.0.1
