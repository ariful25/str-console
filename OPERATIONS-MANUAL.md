# STR Operations Console - Operations Manual

## System Overview

The STR Operations Console is a comprehensive property management and guest communication platform designed to streamline short-term rental operations, automate guest message handling, and ensure quality control through an approval workflow.

### Core Features

1. **Multi-Client Property Management** - Manage multiple clients and their properties
2. **Guest Message Threading** - Organize conversations by property and guest
3. **AI-Powered Analysis** - Automatic intent detection, risk assessment, and reply suggestions
4. **Approval Workflow** - Review and approve/reject message responses before sending
5. **Response Templates** - Reusable message templates for common scenarios
6. **Auto Rules** - Automated message routing based on intent and risk
7. **Knowledge Base** - Searchable repository of property information
8. **Audit Logging** - Complete activity tracking for compliance
9. **User Management** - Role-based access control (Admin, Manager, Staff)
10. **Admin Analytics** - Dashboard with system metrics and insights

---

## User Roles

### Admin
**Permissions**: Full system access
**Responsibilities**:
- User management (create, edit, delete users)
- System configuration
- View all audit logs
- Monitor system health
- Manage all clients and properties

### Manager
**Permissions**: Client and property management
**Responsibilities**:
- Manage assigned clients and properties
- Create and edit templates
- Configure auto rules
- Review and approve messages
- Add KB entries

### Staff
**Permissions**: Day-to-day operations
**Responsibilities**:
- View and respond to messages
- Submit responses for approval
- Search knowledge base
- Basic property viewing

---

## Daily Operations

### Morning Routine

1. **Check Inbox** (`/inbox`)
   - Review new guest messages (status: pending)
   - Prioritize by urgency and risk level
   - Respond to high-priority items first

2. **Review Approvals** (`/approvals`)
   - Check pending approvals queue
   - Review AI-suggested replies
   - Approve, modify, or reject responses
   - Add notes for rejected items

3. **Check Analytics** (`/admin`)
   - Review system health
   - Monitor message volume
   - Check approval turnaround time

### Message Handling Workflow

**Step 1: New Message Arrives**
- Guest sends message through PMS integration
- System creates Thread and Message records
- AI automatically analyzes message:
  - **Intent**: checkin, checkout, question, complaint, etc.
  - **Risk**: low, medium, high (based on sentiment/urgency)
  - **Urgency**: normal, high, critical
  - **Suggested Reply**: AI-generated response

**Step 2: Auto Rule Processing**
- System checks if any Auto Rules match:
  - Property-specific rules
  - Client-wide rules
  - Intent + Risk matching
- Actions triggered:
  - **Queue**: Flag for review (appear in Inbox)
  - **Template**: Suggest specific template
  - **Auto-Send**: Create approval automatically

**Step 3: Staff Review**
- Staff logs into Inbox
- Views message with full context:
  - Thread history
  - Property details
  - KB suggestions (if any)
- Options:
  - Use AI-suggested reply
  - Use template
  - Write custom response
  - Request approval

**Step 4: Approval Process**
- Manager/Admin reviews in Approvals page
- Reviews:
  - Original guest message
  - Proposed reply
  - AI analysis (intent, risk, urgency)
  - Thread history
- Actions:
  - **Approve**: Send message to guest
  - **Reject**: Return to staff with notes
  - **Edit**: Modify reply before sending

**Step 5: Send & Log**
- Approved message sent to guest
- SendLog created with timestamp
- Thread marked as "resolved" or "open"
- AuditLog entry created for compliance

---

## Page-by-Page Guide

### Dashboard (`/dashboard`)
**Purpose**: Quick overview of system activity

**Key Metrics**:
- Total properties
- Active threads
- Pending approvals
- Recent messages

**Actions**:
- Quick navigation to main features
- View recent activity

---

### Inbox (`/inbox`)
**Purpose**: Centralized message management

**Features**:
- Search by guest name or email
- Filter by status (pending, open, resolved, closed)
- View message threads
- Property association
- Message count per thread
- Last received timestamp

**Actions**:
- Click thread to view conversation
- Send new message
- View property details
- Refresh thread list

**Best Practices**:
- Check inbox at least 3x daily (morning, afternoon, evening)
- Prioritize high-risk or urgent messages
- Keep threads organized by status
- Use search for quick guest lookup

---

### Thread Detail (`/inbox/[threadId]`)
**Purpose**: Detailed message thread view

**Features**:
- Full conversation history
- Guest information panel
- Property details
- AI analysis for each message
- Message form for replies
- Similar knowledge base entries

**Actions**:
- View AI analysis (intent, risk, urgency, summary)
- See suggested reply
- Send new message
- View property info
- Search similar KB entries

**Best Practices**:
- Read full thread before responding
- Check KB for property-specific information
- Use suggested replies as starting point
- Personalize responses with guest name

---

### Approvals (`/approvals`)
**Purpose**: Review and approve outgoing messages

**Features**:
- Filter by status (pending, approved, rejected)
- View original message
- See proposed reply
- AI analysis display
- Thread context
- Approval notes

**Actions**:
- Approve reply (sends to guest)
- Reject with notes (returns to staff)
- Edit reply before approving
- View full thread

**Best Practices**:
- Review approvals within 1 hour of submission
- Check for tone and professionalism
- Verify accuracy of information
- Add rejection notes for staff learning
- Aim for <2 hour turnaround time

---

### Properties (`/properties`)
**Purpose**: Manage property inventory

**Features**:
- Client-based filtering
- Property list view
- CRUD operations (Create, Read, Update, Delete)
- PMS integration details
- Property metadata

**Actions**:
- Select client to view properties
- Create new property
- Edit property details
- Delete property (with safeguards)
- View associated threads

**Best Practices**:
- Keep property info up-to-date
- Verify PMS Account ID and Listing Map ID
- Include accurate address
- Regular audit of active/inactive properties

---

### Templates (`/templates`)
**Purpose**: Manage reusable message templates

**Features**:
- Client-specific templates
- Intent-based categorization
- Variable substitution
- Active/Inactive toggle
- Template versioning

**Variables Available**:
- `{guestName}` - Guest's name
- `{propertyName}` - Property name
- `{checkInDate}` - Check-in date
- `{checkOutDate}` - Check-out date
- `{confirmationNumber}` - Booking confirmation

**Actions**:
- Create new template
- Edit existing template
- Toggle active/inactive
- Delete template
- Filter by client
- Group by intent

**Best Practices**:
- Create templates for common scenarios
- Use clear, concise labels
- Test variable substitution
- Maintain 3-5 templates per intent
- Review and update quarterly
- Mark outdated templates inactive

---

### Auto Rules (`/auto-rules`)
**Purpose**: Automate message routing and handling

**Features**:
- Property-scoped rules
- Intent-based triggers
- Risk level thresholds
- Action configuration
- Enable/Disable toggle

**Rule Components**:
- **Property**: Specific property or all properties
- **Intent**: Message type (checkin, complaint, etc.)
- **Risk Max**: Maximum risk level to trigger
- **Action**: What happens when triggered
  - Queue: Add to review queue
  - Template: Suggest template
  - Auto-Send: Create approval automatically

**Actions**:
- Create new rule
- Edit existing rule
- Toggle enabled/disabled
- Delete rule
- View rule statistics

**Best Practices**:
- Start with manual queue rules
- Test rules on single property first
- Monitor auto-send rules closely
- Review rule performance weekly
- Keep rules simple and specific
- Document rule purpose

**Example Rules**:
```
Rule 1: Maintenance Queue
- Property: All
- Intent: maintenance
- Risk Max: low
- Action: queue
Purpose: Flag all maintenance requests for review

Rule 2: Check-in Auto-Suggest
- Property: Sunset Beach Villa
- Intent: checkin
- Risk Max: low
- Action: template
- Template: "Check-in Instructions - Sunset Villa"
Purpose: Auto-suggest check-in template for low-risk requests

Rule 3: High-Risk Escalation
- Property: All
- Intent: complaint
- Risk Max: high
- Action: queue
Purpose: Ensure all high-risk complaints get manager review
```

---

### KB Learning (`/kb-learning`)
**Purpose**: Searchable knowledge base

**Features**:
- Semantic search
- Property-specific entries
- Tag-based filtering
- Usage statistics
- Recent entries tracking

**Actions**:
- Search by keyword
- View entry details
- Create new entry
- Edit existing entry
- Tag management

**Best Practices**:
- Add entries for common questions (WiFi, parking, checkout)
- Include property-specific information
- Use clear, searchable titles
- Tag entries for easy filtering
- Update outdated information
- Review and prune quarterly

---

### Users (`/users`)
**Purpose**: Team member management

**Features**:
- Role-based access control
- User CRUD operations
- Activity tracking
- Approval counts
- Audit log integration

**Actions**:
- Create new user
- Edit user role
- Delete user (with safeguards)
- View user activity

**Best Practices**:
- Use Clerk for authentication
- Assign appropriate roles
- Regular user audit (quarterly)
- Remove inactive users
- Document role changes in notes

---

### Audit Logs (`/audit-logs`)
**Purpose**: Compliance and activity tracking

**Features**:
- Comprehensive activity log
- Filter by action type
- Filter by entity type
- Date range filtering
- User attribution
- Detailed metadata

**Actions**:
- Search logs
- Filter by criteria
- View log details
- Export (future feature)

**Best Practices**:
- Review logs weekly for anomalies
- Use for compliance reporting
- Track user actions
- Monitor system changes
- Investigate rejected approvals

---

### Admin Dashboard (`/admin`)
**Purpose**: System health and metrics

**Features**:
- User statistics by role
- Message volume
- Approval metrics
- System health indicators
- Recent activity feed
- Quick action links

**Actions**:
- View system stats
- Navigate to management pages
- Monitor health status
- Review recent activity

**Best Practices**:
- Check daily for system health
- Monitor approval backlog
- Track user activity
- Review error rates
- Escalate issues promptly

---

## Performance Metrics & KPIs

### Message Response Time
- **Target**: < 2 hours for all messages
- **Critical**: < 30 minutes for high-urgency
- **Measurement**: Time from message received to reply sent

### Approval Turnaround
- **Target**: < 1 hour for approval review
- **Critical**: < 15 minutes for urgent approvals
- **Measurement**: Time from approval request to decision

### Template Usage Rate
- **Target**: 70% of messages use templates
- **Measurement**: Template replies / Total replies

### Auto Rule Accuracy
- **Target**: > 90% correct routing
- **Measurement**: Properly routed / Total auto-routed

### Guest Satisfaction
- **Target**: > 4.5/5 stars
- **Measurement**: Post-stay survey responses

---

## Troubleshooting

### Message Not Appearing in Inbox
1. Check Thread status (may be marked resolved/closed)
2. Verify PMS integration is working
3. Check property is assigned to correct client
4. Review auto rules (may have been auto-sent)
5. Check audit logs for error messages

### AI Analysis Not Generating
1. Verify OPENAI_API_KEY is set
2. Check OpenAI API usage limits
3. Review error logs for API errors
4. Verify message has sufficient text
5. Check network connectivity

### Approval Not Sending
1. Verify user has approval permissions
2. Check message status (must be pending)
3. Review error logs
4. Verify database connectivity
5. Check SendLog for delivery status

### Template Variables Not Substituting
1. Verify variable names match exactly
2. Check guest/property data is complete
3. Review template syntax
4. Test with sample data first

### Auto Rule Not Triggering
1. Verify rule is enabled
2. Check intent matches exactly
3. Verify risk level is within threshold
4. Test property scope (specific vs. all)
5. Review rule priority/order

---

## Security & Compliance

### Data Protection
- All passwords managed by Clerk (never stored locally)
- Database uses SSL encryption
- API keys stored in environment variables
- Regular security audits

### Access Control
- Role-based permissions enforced at API level
- Clerk middleware on all protected routes
- Session timeout after 24 hours of inactivity
- Failed login attempt tracking

### Audit Trail
- All user actions logged
- Message approval history maintained
- Database changes tracked
- Export capability for compliance reporting

### GDPR Compliance
- Guest data deletion on request
- Data export capability
- Consent tracking (future feature)
- Right to be forgotten support

---

## Maintenance Schedule

### Daily
- [ ] Check system health (Admin Dashboard)
- [ ] Review pending approvals
- [ ] Monitor error logs
- [ ] Respond to all urgent messages

### Weekly
- [ ] Review audit logs
- [ ] Check auto rule performance
- [ ] Update or create new templates
- [ ] Clean up resolved threads

### Monthly
- [ ] Update dependencies (`npm update`)
- [ ] Security audit (`npm audit`)
- [ ] Review and optimize KB entries
- [ ] User access review
- [ ] Performance analysis

### Quarterly
- [ ] Rotate API keys
- [ ] Deep clean database (archive old data)
- [ ] Review and optimize auto rules
- [ ] User training/onboarding review
- [ ] Template library audit

### Annually
- [ ] Full security audit
- [ ] Disaster recovery test
- [ ] Performance optimization
- [ ] System architecture review

---

## Getting Help

### Documentation
- README.md - Project overview
- DEPLOYMENT-GUIDE.md - Deployment instructions
- DEPLOYMENT-CHECKLIST.md - Pre-flight checklist
- WORKFLOW-TEST-GUIDE.md - Testing procedures

### Support Channels
- **Technical Issues**: infrastructure@yourcompany.com
- **User Training**: support@yourcompany.com
- **Feature Requests**: product@yourcompany.com

### External Resources
- Clerk Documentation: https://clerk.com/docs
- Next.js Documentation: https://nextjs.org/docs
- Prisma Documentation: https://www.prisma.io/docs
- OpenAI API Documentation: https://platform.openai.com/docs

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintained By**: Development Team
