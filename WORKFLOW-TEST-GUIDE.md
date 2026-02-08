# End-to-End Approval Workflow Test Guide

## Test Data Overview
The seed script has created:
- **Client**: Sunset Properties Group
- **User**: Sarah Johnson (manager@sunsetproperties.com, Clerk ID: test-user-001)
- **Properties**: 
  - Sunset Beach Villa (Malibu, CA)
  - Alpine Mountain Retreat (Aspen, CO)
- **Threads**: 3 guest conversations
- **Messages**: 3 guest messages with AI analysis
- **Approvals**: 
  - 1 Pending approval
  - 1 Approved approval
  - 1 Rejected approval
- **Templates**: 4 response templates
- **Auto Rules**: 2 automation rules

---

## Test Workflow Steps

### Step 1: View Properties
**URL**: http://localhost:3001/(dashboard)/properties

**Expected Results**:
- ✅ See 2 properties listed:
  - Sunset Beach Villa (Malibu, CA)
  - Alpine Mountain Retreat (Aspen, CO)
- ✅ Each property should show thread count and auto-rule count
- ✅ Click "Add Property" to test the form (should require pmsAccountId and listingMapId)

**Test Actions**:
1. Verify both properties are displayed with correct addresses
2. Check that property cards show metadata (threads, rules)
3. Click on a property to view details (if detail view exists)

---

### Step 2: View Inbox
**URL**: http://localhost:3001/(dashboard)/inbox

**Expected Results**:
- ✅ See 3 threads from:
  - Alice Chen (Sunset Beach Villa)
  - Robert Martinez (Sunset Beach Villa)
  - Emma Thompson (Alpine Mountain Retreat)
- ✅ Each thread shows guest name, property, and status
- ✅ Messages are grouped by thread
- ✅ Click on a thread to view conversation

**Test Actions**:
1. Verify all 3 threads are visible
2. Check thread status indicators (pending/open/sent)
3. View message contents:
   - WiFi password request
   - Shower issue report
   - Early check-in request

---

### Step 3: View Approvals (Pending Tab)
**URL**: http://localhost:3001/(dashboard)/approvals

**Expected Results**:
- ✅ See 1 pending approval
- ✅ Approval shows:
  - Guest: Alice Chen
  - Property: Sunset Beach Villa
  - Message: "Hi, I noticed the wifi password changed. Can you provide the new one?"
  - AI Analysis:
    - Intent: maintenance
    - Risk level: low
    - Urgency: normal
    - AI Summary: "Guest Alice Chen reported an issue. Response needed within 24 hours."
    - Suggested Reply: "Thank you for reaching out. I will send you the WiFi password via email shortly."

**Test Actions**:
1. Click "Review & Take Action" button
2. Verify the suggested reply appears
3. Test custom reply textarea (optional override)
4. **DO NOT APPROVE YET** - Save this for Step 5

---

### Step 4: View Approvals (Approved/Rejected Tabs)
**Switch to "Approved" tab**:
- ✅ See 1 approved message from Robert Martinez
- ✅ Shows reviewer: Sarah Johnson
- ✅ Shows approval notes: "Approved with suggested template response"
- ✅ Shows approval timestamp

**Switch to "Rejected" tab**:
- ✅ See 1 rejected message from Emma Thompson
- ✅ Shows reviewer: Sarah Johnson
- ✅ Shows rejection notes: "Needs revision - response too informal"

**Test Actions**:
1. Switch between tabs to verify filtering works
2. Verify reviewer information is displayed correctly
3. Check that processed approvals show status badges (green for approved, red for rejected)

---

### Step 5: Test Approval Action (CRITICAL TEST)
**Back to "Pending" tab**:

**Approve with AI Suggestion**:
1. Click "Review & Take Action" on the pending approval
2. Leave custom reply empty (use AI suggestion)
3. Click "✓ Approve & Send" button
4. Wait for success toast notification

**Expected Results**:
- ✅ Toast shows "Approved" message
- ✅ Approval disappears from pending list (moves to approved tab)
- ✅ Thread status updates to "sent"
- ✅ Send log is created in database
- ✅ Audit log records the action

**Verification Steps**:
1. Switch to "Approved" tab - should now see 2 approvals
2. Go to Audit Logs page to verify action was logged
3. Check inbox - thread status should update

---

### Step 6: Test Rejection Action (If you want to test rejection)
**You would need to create a new test approval**:

1. Back on approvals page
2. Click "Review & Take Action"
3. Enter rejection notes: "Message requires more context before responding"
4. Click "✗ Reject" button

**Expected Results**:
- ✅ Toast shows "Rejected" message
- ✅ Thread status updates to "declined"
- ✅ Audit log records rejection

---

### Step 7: Verify Audit Logs
**URL**: http://localhost:3001/(dashboard)/audit-logs

**Expected Results**:
- ✅ See audit log entries for:
  - message_created (Alice Chen's message)
  - message_approved_and_sent (Robert Martinez approval)
  - kb_entry_created (WiFi guide creation)
  - Your new approval action (if you completed Step 5)
- ✅ Each log shows:
  - Action type
  - Actor (Sarah Johnson)
  - Timestamp
  - Entity details

**Test Actions**:
1. Verify all historical actions are recorded
2. Test filter by action type (if available)
3. Test search functionality (if available)
4. Check timestamp ordering (most recent first)

---

### Step 8: Verify KB Learning
**URL**: http://localhost:3001/(dashboard)/kb-learning

**Expected Results**:
- ✅ See 1 KB entry: "WiFi Connectivity Guide"
- ✅ Entry shows:
  - Title: WiFi Connectivity Guide
  - Tags: wifi, connectivity, technical
  - Content: Instructions for connecting to WiFi at Sunset Beach Villa
  - Source count: 1 (manual entry)
- ✅ Search works for "wifi" or "connectivity"

**Test Actions**:
1. Verify KB entry displays correctly
2. Test search functionality
3. Check that tags are shown
4. Verify source information

---

## API Endpoints Involved

### GET /api/approvals
**Query Params**: `?status=pending|approved|rejected`
**Auth**: Clerk authentication required
**Response**: Array of approval requests with nested message, thread, analysis, and reviewer data

### PATCH /api/approvals
**Body**:
```json
{
  "approvalId": "string",
  "action": "approve" | "reject",
  "notes": "string (optional)",
  "finalReply": "string (required for approve)"
}
```
**Auth**: Clerk authentication required
**Side Effects**:
- Creates SendLog entry
- Updates Thread status
- Creates AuditLog entry
- Updates ApprovalRequest status and reviewer

### GET /api/inbox
**Query Params**: `?status=pending&propertyId=...`
**Auth**: Clerk authentication required
**Response**: Array of threads with messages

### GET /api/audit-logs
**Query Params**: `?action=...&userId=...&startDate=...&endDate=...`
**Auth**: Clerk authentication required
**Response**: Array of audit log entries

---

## Expected Database State After Tests

### After Approval (Step 5):
```
ApprovalRequest:
- status: 'approved'
- reviewerId: <user.id>
- notes: 'Approved via workflow'
- updatedAt: <current timestamp>

SendLog:
- messageId: <message.id>
- threadId: <thread.id>
- finalReply: <AI suggested reply>
- sentByUserId: <user.id>
- channel: 'pms'

Thread:
- status: 'sent'

AuditLog:
- action: 'message_approved_and_sent'
- actorUserId: <user.id>
- entityType: 'approval'
- entityId: <approval.id>
```

---

## Common Issues & Troubleshooting

### Issue: No pending approvals showing
**Cause**: Seed data didn't run completely
**Fix**: Run `npm.cmd run db:seed` again

### Issue: 401/404 errors on API calls
**Cause**: Not authenticated with Clerk
**Fix**: Ensure you're signed in via Clerk UI. The test user is `test-user-001` but you need to sign in with your own Clerk account that exists in the database.

### Issue: Approval action doesn't work
**Cause**: 
1. User record doesn't exist in database
2. Message/thread relationships broken
3. API validation errors
**Fix**: Check browser console for errors, verify database relationships

### Issue: Can't see properties/threads/approvals
**Cause**: Clerk user ID doesn't match database user
**Fix**: The seed creates user with clerkId `test-user-001`. You need to either:
1. Update your Clerk ID in the database to match your actual Clerk account
2. Create a user record with your actual Clerk ID

---

## Success Criteria

- ✅ All seed data is visible in UI
- ✅ Pending approval shows with correct AI analysis
- ✅ Approve action completes without errors
- ✅ Approval moves from pending to approved status
- ✅ Send log is created
- ✅ Audit log records the action
- ✅ Thread status updates correctly
- ✅ UI updates reflect database changes
- ✅ Toast notifications work
- ✅ No console errors
- ✅ No TypeScript errors
- ✅ Dark mode works on all pages
- ✅ Navigation between pages works smoothly

---

## Test Report Template

After completing the tests, document your findings:

### Test Summary
- **Date**: [Date]
- **Tester**: [Your name]
- **Environment**: Development (localhost:3001)
- **Browser**: [Browser name/version]

### Results
| Test Step | Status | Notes |
|-----------|--------|-------|
| View Properties | ✅ PASS / ❌ FAIL | |
| View Inbox | ✅ PASS / ❌ FAIL | |
| View Pending Approvals | ✅ PASS / ❌ FAIL | |
| View Processed Approvals | ✅ PASS / ❌ FAIL | |
| Approve Message | ✅ PASS / ❌ FAIL | |
| Verify Audit Logs | ✅ PASS / ❌ FAIL | |
| Verify KB Learning | ✅ PASS / ❌ FAIL | |

### Issues Found
1. [Issue description]
   - **Severity**: Critical / High / Medium / Low
   - **Steps to reproduce**: [Steps]
   - **Expected**: [What should happen]
   - **Actual**: [What actually happened]
   - **Screenshot**: [If applicable]

### Recommendations
- [Any suggestions for improvement]

---

## Next Steps After Testing

Once the workflow is confirmed working:
1. ✅ Mark Task #2 complete
2. Move to Task #3: Build Templates UI (CRUD)
3. Move to Task #4: Build Auto Rules UI (CRUD)
4. Continue with remaining tasks

---

**Good luck with testing! Report any issues you find and I'll fix them immediately.** 🚀
