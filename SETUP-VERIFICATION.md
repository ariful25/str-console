# Setup Verification Checklist

## Before Adding OpenAI API Key

### ✅ Core Features Working
- [x] Authentication (Clerk)
- [x] Database connection (PostgreSQL + Prisma)
- [x] Inbox - View threads and messages
- [x] Knowledge Base - Create/edit/view entries
- [x] Templates - Create/edit/view templates
- [x] Auto-Rules - Configure rules (won't trigger without AI)
- [x] Approvals - View approval queue

### ✅ Code Complete
- [x] OpenAI integration with error handling
- [x] KB context fetching for AI analysis
- [x] Auto-rules evaluation engine
- [x] Property-specific rule matching
- [x] Fallback analysis when AI unavailable
- [x] All API routes with proper auth

## After Adding OpenAI API Key

### Setup Steps
1. Get OpenAI API key from https://platform.openai.com/api-keys
2. Add to `.env.local`:
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   ```
3. Restart dev server:
   ```bash
   npm run dev
   ```

### Test Workflow

#### 1. Create Knowledge Base Entry
- Go to `/knowledge-base`
- Click "Add Entry"
- Fill in:
  - Title: "WiFi Password"
  - Content: "Network: BeachHouse_Guest\nPassword: BlueOcean2026"
  - Tags: wifi, guest-info
  - Property: Select target property
- Save

#### 2. Send Test Message
- Go to `/ai-test`
- Select a thread for the same property
- Enter message: "Hi! What's the WiFi password?"
- Click "Send & Analyze Message"
- Wait 3 seconds

#### 3. Verify AI Analysis
Expected results:
- **Intent**: question
- **Risk**: low or medium
- **Urgency**: normal or low
- **Suggested Reply**: Should include WiFi details from KB entry
  - Look for "BeachHouse_Guest" and "BlueOcean2026" in the reply

#### 4. Check Auto-Rules
- Go to `/auto-rules`
- Create a test rule:
  - Property: Same as test thread
  - Intent: question
  - Risk Max: medium
  - Action: queue
  - Enable rule
- Send another test message
- Go to `/approvals`
- Verify new approval request appears

### Expected Behavior

#### With OpenAI API Key (Paid Account)
- ✅ Messages analyzed automatically
- ✅ Intent/risk/urgency detected
- ✅ KB context included in suggested replies
- ✅ Auto-rules trigger based on AI analysis
- ✅ Approvals created when rules match

#### Without OpenAI API Key
- ❌ No automatic analysis
- ❌ Auto-rules won't trigger (no intent/risk data)
- ✅ Manual operations still work (KB, templates, approvals)
- ✅ System remains stable (fallback values used)

## Error Scenarios Handled

### 1. Missing API Key
- Code checks: `if (senderType === 'guest' && process.env.OPENAI_API_KEY)`
- **Result**: Analysis skipped, no error thrown

### 2. API Rate Limit
- Try-catch in `analyzeMessage()`
- **Result**: Returns fallback analysis with confidence 0.0

### 3. Invalid Response
- JSON parsing with validation
- **Result**: Returns defaults (intent: 'other', risk: 'medium')

### 4. Network Timeout
- Async error catch in messages route
- **Result**: Message saved, analysis logged as error

## Database Schema Ready

### New Columns Added
- ✅ `AutoRule.propertyId` - Property-specific rules
- ✅ `KbEntry.propertyId` - Property-specific KB entries
- ✅ `KbEntry.tags` - Tag array for categorization

### Relationships Verified
- ✅ Thread → Property → Client
- ✅ Message → Analysis (one-to-one)
- ✅ Message → ApprovalRequest (one-to-one)
- ✅ KbEntry → Property (optional)
- ✅ AutoRule → Property (optional)

## API Routes Complete

### Authenticated Routes
- ✅ `/api/inbox` - Get threads with analysis
- ✅ `/api/messages` - Create message + trigger AI analysis
- ✅ `/api/knowledge-base` - CRUD operations
- ✅ `/api/templates` - CRUD operations
- ✅ `/api/approvals` - CRUD + approve/reject actions
- ✅ `/api/auto-rules` - CRUD operations

### Error Handling
- ✅ 401 for unauthorized requests
- ✅ 400 for validation errors
- ✅ 404 for not found
- ✅ 500 for server errors with logging

## Final Checklist

Before deploying or upgrading OpenAI:
- [ ] All environment variables set in `.env.local`
- [ ] Database migrations run (`npm run db:push`)
- [ ] Dev server running without errors
- [ ] Can log in via Clerk
- [ ] Inbox loads threads
- [ ] Can create KB entries
- [ ] Can create templates
- [ ] Can configure auto-rules

After adding OpenAI API key:
- [ ] Restart dev server
- [ ] Test message analysis on `/ai-test`
- [ ] Verify KB context in suggested replies
- [ ] Confirm auto-rules trigger
- [ ] Check approvals page for queued items

## Support

If AI features don't work after adding key:
1. Check dev server console for OpenAI errors
2. Verify key format: `sk-proj-...` or `sk-...`
3. Confirm account has credits: https://platform.openai.com/usage
4. Check rate limits (free tier is very limited)
5. Test with curl:
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"
   ```

## What Works Now (Without OpenAI)

✅ **Full System Access**
- View all threads and messages
- Manage knowledge base entries
- Create and organize templates
- Configure auto-rules (ready to activate)
- Manual approval review and actions

❌ **Requires OpenAI** (Future)
- Automatic message analysis
- AI-powered suggested replies
- Auto-rule triggering
- Risk/intent classification

The entire infrastructure is ready. When you add your OpenAI key, everything will activate automatically!
