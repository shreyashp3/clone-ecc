# Admin Panel & Forms Verification Checklist

## 🔐 Authentication Flow

### Test: User Login/Registration
- [ ] Navigate to admin login page
- [ ] Login with test credentials:
  - Email: `test@example.com`
  - Password: `TestPassword123`
- [ ] Verify user is redirected to admin dashboard
- [ ] Check localStorage contains auth tokens:
  ```javascript
  // In browser console:
  localStorage.getItem('auth_token')
  localStorage.getItem('refresh_token')
  ```
- [ ] Click logout button
- [ ] Verify user is redirected to login page
- [ ] Verify tokens are cleared from localStorage

---

## 📋 Contact Form Testing

### Test: Lead Submission via Contact Form
1. Navigate to `/contact` page
2. Fill in contact form:
   - Name: `Test User`
   - Email: `testlead@example.com`
   - Phone: `555-0123`
   - Company: `Test Company`
   - Service Interest: Select any option
   - Message: `This is a test message`
3. Click "Submit"
4. Verify success message appears
5. Check database: Form data was saved
   ```bash
   curl http://localhost:3000/api/leads \
     -H "Authorization: Bearer $TOKEN"
   ```
6. Verify rate limiting works (submit 9 times in 30 minutes, 9th should fail)

### Test: Form Validation
- [ ] Submit with empty name → Error displayed
- [ ] Submit with invalid email → Error displayed
- [ ] Submit without selecting service → Error displayed
- [ ] Submit with empty message → Error displayed

---

## 🛠️ Admin Panel - Services Management

### Test: View Services
- [ ] Login to admin panel
- [ ] Navigate to "Services" section
- [ ] Verify service list loads
- [ ] Check all columns display: Title, Slug, Category, Published
- [ ] Pagination works (if 10+ services)

### Test: Create Service
- [ ] Click "Add Service" button
- [ ] Fill form:
  - Title: `Test Service`
  - Slug: `test-service`
  - Category: `Consulting`
  - Is Published: Checked
- [ ] Click "Save"
- [ ] Verify success message
- [ ] Verify new service appears in list
- [ ] Via API:
  ```bash
  curl http://localhost:3000/api/services | jq '.[] | select(.slug=="test-service")'
  ```

### Test: Edit Service
- [ ] Click edit button on any service
- [ ] Change title to `Test Service Updated`
- [ ] Click "Save"
- [ ] Verify service list updates
- [ ] Via API verify change:
  ```bash
  curl http://localhost:3000/api/services/test-service | jq '.title'
  ```

### Test: Delete Service
- [ ] Click delete button on test service
- [ ] Confirm deletion
- [ ] Verify service removed from list
- [ ] Via API verify deletion:
  ```bash
  curl http://localhost:3000/api/services/test-service
  # Should return 404 or empty
  ```

---

## 📦 Admin Panel - Products Management

### Test: View Products
- [ ] Navigate to "Products" section
- [ ] Verify product list loads with pagination
- [ ] Check all columns present

### Test: Create Product
- [ ] Click "Add Product"
- [ ] Fill: Name, Slug, Description
- [ ] Save and verify

### Test: Edit/Delete Products
- [ ] Edit button → Update → Verify
- [ ] Delete button → Confirm → Verify removal

---

## 📚 Admin Panel - Blog Management

### Test: Blog CRUD Operations
- [ ] Create new blog post with title and content
- [ ] Verify post appears in list
- [ ] Edit post title
- [ ] Verify changes saved
- [ ] Delete post
- [ ] Verify deletion

---

## 🎨 Admin Panel - Gallery Management

### Test: Create Gallery Item
- [ ] Click "Add Gallery"
- [ ] Fill form:
  - Title: `Portfolio Item 1`
  - Description: `Test portfolio item`
  - File URL: `https://via.placeholder.com/400`
  - Alt Text: `Test portfolio`
  - Category: `portfolio`
- [ ] Click Save
- [ ] Verify item appears in gallery list

### Test: Edit Gallery Item
- [ ] Click edit on gallery item
- [ ] Update description
- [ ] Save
- [ ] Verify changes reflected

### Test: Delete Gallery Item
- [ ] Click delete
- [ ] Confirm
- [ ] Verify removal from list

---

## 💼 Admin Panel - Case Studies Management

### Test: Case Study CRUD
- [ ] Create case study with title, slug, description
- [ ] Verify appears in list
- [ ] Edit title
- [ ] Delete case study
- [ ] Verify all changes work

---

## 💬 Chat System Testing

### Test: Start Chat Conversation
1. Navigate to any public page
2. Look for chat widget in bottom-right
3. Click to open chat
4. Fill in name and email
5. Click "Start Chat"
6. Verify conversation starts
7. In admin panel, verify new conversation appears in chat list

### Test: Send Chat Message
- [ ] Type message in chat widget
- [ ] Press Send
- [ ] Verify message appears in chat history
- [ ] In admin panel, verify message received
- [ ] Admin sends response
- [ ] Verify response appears in chat widget

---

## 📊 Analytics Testing

### Test: Page View Tracking
1. Enable browser developer tools
2. Open Network tab
3. Navigate to different pages:
   - `/` (home)
   - `/services`
   - `/about`
   - `/contact`
4. Check Network tab for requests to `/api/page-views`
5. Verify each navigation logs a page view
6. In admin analytics (if available), verify counts increment

### Test: Analytics Dashboard
- [ ] Navigate to admin analytics section
- [ ] Verify page view data displays
- [ ] Check date range filter works
- [ ] Verify most visited pages ranking

---

## 🔒 Admin Panel - Access Control Testing

### Test: Role-Based Access
1. Login as `test@example.com` (Content Manager role)
2. Verify access to:
   - [ ] Services management
   - [ ] Products management
   - [ ] Blog management
   - [ ] Gallery management
   - [ ] Leads list
   - [ ] Chat conversations
3. Verify NO access to:
   - [ ] Settings
   - [ ] User management
   - [ ] System configuration

### Test: Login as Different Users (if available)
- [ ] Create test user with different role
- [ ] Verify appropriate page restrictions
- [ ] Verify 403 errors on unauthorized routes

---

## 🔗 Frontend API Integration Testing

### Test: Frontend Uses New REST API
1. Open browser DevTools → Network tab
2. Perform actions that make API calls:
   - Login → Should call `POST /auth/login`
   - Submit contact form → Should call `POST /api/leads`
   - View services → Should call `GET /api/services`
   - Create service (as admin) → Should call `POST /admin/services`

3. Verify NO supabase requests appear:
   - Should NOT call `api.supabase.co`
   - Should NOT call Supabase functions
   - Should NOT use Supabase SDK

4. Verify all responses are JSON with expected structure

---

## 📱 Responsive Design Testing

### Test: Admin Panel on Different Screens
- [ ] Desktop (1920x1080) - Full layout
- [ ] Tablet (768px) - Sidebar collapses
- [ ] Mobile (375px) - Mobile menu appears
- [ ] All buttons and forms clickable

### Test: Contact Form on Mobile
- [ ] Form fields stack vertically
- [ ] Keyboard appears correctly
- [ ] Submit button accessible
- [ ] Success message visible

---

## 🐛 Error Handling Testing

### Test: Network Error Handling
1. Open browser DevTools → Network tab
2. Throttle to "Offline"
3. Try to submit lead form
4. Verify error message displayed
5. Resume online
6. Verify form can be resubmitted

### Test: Validation Errors
- [ ] Submit form with invalid email → Error shows
- [ ] Submit form with empty required field → Error shows
- [ ] Clear error, correct input, resubmit → Success

### Test: Rate Limiting
- [ ] Submit lead form 8 times quickly
- [ ] 9th submission should show rate limit error
- [ ] Wait 30 minutes (or verify in code)
- [ ] Can submit again

---

## 🚀 Performance Testing

### Test: Page Load Times
1. Open DevTools → Performance tab
2. Navigate to admin dashboard
3. Verify load time < 3 seconds
4. Navigate to any content section
5. Verify load time < 2 seconds

### Test: Large Data Sets
- [ ] Admin list with 100+ items loads
- [ ] List pagination works correctly
- [ ] Search/filter responsive

---

## 📝 Data Persistence Testing

### Test: Data Survives Page Refresh
1. Login to admin
2. Create a new service
3. Refresh page (Ctrl+R)
4. Navigate back to services
5. Verify new service still exists

### Test: Auth Token Refresh
1. Login
2. Copy access token from localStorage
3. Wait 15 minutes (or token expiration)
4. Make API request
5. Verify automatic token refresh occurs
6. Request should succeed

---

## 🔄 Workflow Testing

### End-to-End: Contact to Admin to Lead
1. Submit contact form as visitor
2. Login to admin panel
3. Navigate to Leads section
4. Verify new lead appears
5. Click lead to view details
6. Update status from "new" to "contacted"
7. Verify status persists on refresh

### End-to-End: Service Creation and Display
1. Login to admin
2. Create a new service via admin panel
3. Logout
4. Navigate to public `/services` page
5. Verify new service appears in public list
6. Click service detail
7. Verify all information displays correctly

---

## ✅ Final Sign-Off Checklist

- [ ] All forms validate correctly
- [ ] All CRUD operations work in admin panel
- [ ] Contact form submits successfully (public)
- [ ] Chat system works end-to-end
- [ ] Analytics tracking active
- [ ] Access control enforced (admin-only pages)
- [ ] No Supabase references in frontend
- [ ] All API calls to localhost backend
- [ ] Authentication tokens work correctly
- [ ] Data persists after page refresh
- [ ] Error messages display correctly
- [ ] Rate limiting works
- [ ] Responsive design works on all screen sizes
- [ ] No console errors in DevTools
- [ ] No TypeScript compilation errors in backend
- [ ] All tests pass

---

## 🔧 Debugging Tips

### Check API Calls in Browser
```javascript
// In browser console while using the app:
// Monitor all API calls
fetch = ((originalFetch) => {
  return (...args) => {
    console.log('API Call:', args[0], args[1]);
    return originalFetch(...args).then(r => {
      console.log('Response:', r.status, r.url);
      return r;
    });
  };
})(fetch);
```

### Check Stored Tokens
```javascript
// In browser console:
console.log('Access Token:', localStorage.getItem('auth_token'));
console.log('Refresh Token:', localStorage.getItem('refresh_token'));
console.log('User:', localStorage.getItem('user_data'));
```

### Check Backend Logs
```bash
# Terminal where server is running should show request logs:
# POST /auth/login 200 1234ms
# GET /api/services 200 456ms
# etc.
```

### Test API Directly
```bash
# Terminal:
TOKEN="your_access_token"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/auth/me
```

---

**Status**: Ready for comprehensive testing
**Backend**: ✅ Running on port 3000
**Frontend**: ✅ Running on port 5173
**Database**: ✅ PostgreSQL connected
