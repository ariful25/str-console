# 🚀 Property-Specific Auto-Rules Demo Guide

## What We're Building

Two properties with **different automation strategies**:

### 🏖️ Beach House (Vacation Rental)
**Strategy:** Friendly, automated responses
- ✅ **Rule 1:** Checkin questions → Auto-queue for quick response
- ✅ **Rule 2:** Complaints → High-priority queue

### 🏙️ City Loft (Business Property)
**Strategy:** Professional, manual review
- ✅ **Rule 3:** All questions → Queue for careful review
- ✅ **Rule 4:** Checkout requests → Template suggestion

---

## 📝 Step-by-Step Instructions

### Step 1: Navigate to Auto-Rules
1. Go to: `http://localhost:3000/auto-rules?clientId=YOUR_CLIENT_ID`
   - Replace YOUR_CLIENT_ID with the actual ID from the Clients page
   - The clientId will be saved automatically

### Step 2: Create Rule for Beach House - Checkin

Click **"+ New Rule"** button and fill in:

```
┌─────────────────────────────────────────┐
│ Property (Optional)                     │
│ ▼ Beach House - 456 Sandy Lane...      │ ⬅️ SELECT THIS
├─────────────────────────────────────────┤
│ Intent (Trigger)                        │
│ ▼ Checkin                               │ ⬅️ SELECT THIS
├─────────────────────────────────────────┤
│ Max Risk Level                          │
│ ▼ Low                                   │ ⬅️ KEEP DEFAULT
├─────────────────────────────────────────┤
│ Action                                  │
│ ▼ Queue for Review                      │ ⬅️ SELECT THIS
└─────────────────────────────────────────┘
```

Click **"Create Rule"**

### Step 3: Create Rule for Beach House - Complaints

Click **"+ New Rule"** again:

```
┌─────────────────────────────────────────┐
│ Property (Optional)                     │
│ ▼ Beach House - 456 Sandy Lane...      │ ⬅️ SELECT THIS
├─────────────────────────────────────────┤
│ Intent (Trigger)                        │
│ ▼ Complaint                             │ ⬅️ SELECT THIS
├─────────────────────────────────────────┤
│ Max Risk Level                          │
│ ▼ High                                  │ ⬅️ CHANGE TO HIGH
├─────────────────────────────────────────┤
│ Action                                  │
│ ▼ Queue for Review                      │ ⬅️ SELECT THIS
└─────────────────────────────────────────┘
```

Click **"Create Rule"**

### Step 4: Create Rule for City Loft - Questions

Click **"+ New Rule"** again:

```
┌─────────────────────────────────────────┐
│ Property (Optional)                     │
│ ▼ City Loft - 321 Urban Ave...         │ ⬅️ SELECT THIS
├─────────────────────────────────────────┤
│ Intent (Trigger)                        │
│ ▼ Question                              │ ⬅️ SELECT THIS
├─────────────────────────────────────────┤
│ Max Risk Level                          │
│ ▼ Medium                                │ ⬅️ CHANGE TO MEDIUM
├─────────────────────────────────────────┤
│ Action                                  │
│ ▼ Queue for Review                      │ ⬅️ SELECT THIS
└─────────────────────────────────────────┘
```

Click **"Create Rule"**

### Step 5: Create Client-Wide Rule - Cancellations

Click **"+ New Rule"** one more time:

```
┌─────────────────────────────────────────┐
│ Property (Optional)                     │
│ ▼ All Properties (Client-Wide)         │ ⬅️ LEAVE EMPTY!
├─────────────────────────────────────────┤
│ Intent (Trigger)                        │
│ ▼ Cancellation                          │ ⬅️ SELECT THIS
├─────────────────────────────────────────┤
│ Max Risk Level                          │
│ ▼ Critical                              │ ⬅️ CHANGE TO CRITICAL
├─────────────────────────────────────────┤
│ Action                                  │
│ ▼ Queue for Review                      │ ⬅️ SELECT THIS
└─────────────────────────────────────────┘
```

Click **"Create Rule"**

---

## ✅ What You Should See

After creating all rules, you should see **4 rules** in the list:

```
┌──────────────────────────────────────────────────────┐
│ ✓ CHECKIN  📋 Queue for Review  Risk: LOW            │
│ 📍 Beach House                                  [ON] │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ ✓ COMPLAINT  📋 Queue for Review  Risk: HIGH         │
│ 📍 Beach House                                  [ON] │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ ✓ QUESTION  📋 Queue for Review  Risk: MEDIUM        │
│ 📍 City Loft                                    [ON] │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ ✓ CANCELLATION  📋 Queue for Review  Risk: CRITICAL  │
│ 📍 All Properties                               [ON] │
└──────────────────────────────────────────────────────┘
```

---

## 🧪 Testing the Rules

### Test Scenario 1: Beach House Checkin
1. Go to **Inbox** → Find a thread for **Beach House**
2. If guest asks about checkin → Rule 1 triggers
3. ✅ Rule from Beach House applies
4. ❌ Rules from City Loft DON'T apply

### Test Scenario 2: City Loft Question
1. Go to **Inbox** → Find a thread for **City Loft**
2. If guest asks a question → Rule 3 triggers
3. ✅ Rule from City Loft applies
4. ❌ Rules from Beach House DON'T apply

### Test Scenario 3: Any Property Cancellation
1. Go to **Inbox** → Pick ANY property
2. If guest requests cancellation → Rule 4 triggers
3. ✅ Client-wide rule applies to ALL properties

---

## 🎉 Key Takeaways

### ✅ Independence
- Beach House rules DON'T affect City Loft
- City Loft rules DON'T affect Beach House
- No conflicts, no crashes!

### ✅ Flexibility
- Each property can have unique automation
- Client-wide rules apply everywhere
- Mix and match as needed

### ✅ Scalability
- Add 100 properties? No problem!
- Each gets its own rule set
- Performance stays fast

---

## 🔍 Verification Checklist

- [ ] Can you see all 4 rules in the list?
- [ ] Do Beach House rules show "📍 Beach House"?
- [ ] Do City Loft rules show "📍 City Loft"?
- [ ] Does cancellation rule show "📍 All Properties"?
- [ ] Can you toggle each rule ON/OFF independently?
- [ ] Can you edit and delete rules?

---

## 🚀 Next Steps

1. **Test the rules** by sending messages to different properties
2. **Monitor the Approvals page** to see rules triggering
3. **Adjust risk levels** based on your needs
4. **Create template rules** for automated responses
5. **Scale to more properties** as you grow!

---

**Questions? Issues?**
- Check the browser console for errors
- Verify clientId is set correctly
- Ensure properties exist in database
- Check that dev server is running on port 3000
