# API Testing Quick Reference

## 🔐 Authentication

### 1. Login
```bash
# Get tokens
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPassword123"}'

# Response:
{
  "success": true,
  "user": { "id": "...", "email": "test@example.com", "role": "content_manager" },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

### 2. Get Current User
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Logout
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📝 Forms & Leads

### 1. Submit Contact Form
```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "company": "ACME Corp",
    "interest": "aws",
    "message": "Interested in cloud services",
    "form_type": "contact",
    "source_page": "/contact"
  }'
```

### 2. Get All Leads (Admin)
```bash
curl -X GET "http://localhost:3000/api/leads?limit=50&offset=0" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Get Single Lead
```bash
curl -X GET http://localhost:3000/api/leads/LEAD_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Update Lead Status
```bash
curl -X PATCH http://localhost:3000/api/leads/LEAD_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "contacted"}'
```

---

## 🛍️ Services (CRUD)

### 1. Get All Services
```bash
curl http://localhost:3000/api/services
```

### 2. Get Service by Slug
```bash
curl http://localhost:3000/api/services/cloud-consulting
```

### 3. Create Service (Admin)
```bash
curl -X POST http://localhost:3000/admin/services \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cloud Consulting",
    "slug": "cloud-consulting",
    "category_slug": "consulting", 
    "category_name": "Consulting Services",
    "description": "Professional cloud consulting",
    "is_published": true
  }'
```

### 4. Update Service (Admin)
```bash
curl -X PUT http://localhost:3000/admin/services/SERVICE_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Advanced Cloud Consulting",
    "description": "Professional cloud consulting and training"
  }'
```

### 5. Delete Service (Admin)
```bash
curl -X DELETE http://localhost:3000/admin/services/SERVICE_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📦 Products (Same pattern as Services)

```bash
# GET all
curl http://localhost:3000/api/products

# GET by slug
curl http://localhost:3000/api/products/product-slug

# CREATE
curl -X POST http://localhost:3000/admin/products \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Product Name", "slug": "product-slug", ...}'

# UPDATE
curl -X PUT http://localhost:3000/admin/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# DELETE
curl -X DELETE http://localhost:3000/admin/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📚 Blog Posts (CRUD)

```bash
# GET all
curl http://localhost:3000/api/blog

# GET by slug  
curl http://localhost:3000/api/blog/post-slug

# CREATE
curl -X POST http://localhost:3000/admin/blog \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Blog Title",
    "slug": "blog-slug",
    "excerpt": "Short excerpt",
    "content": "Full blog content HTML",
    "status": "published"
  }'

# UPDATE
curl -X PUT http://localhost:3000/admin/blog/BLOG_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# DELETE
curl -X DELETE http://localhost:3000/admin/blog/BLOG_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🎨 Gallery (CRUD)

```bash
# GET all
curl http://localhost:3000/api/gallery

# CREATE
curl -X POST http://localhost:3000/admin/gallery \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Gallery Item",
    "description": "Item description",
    "file_url": "https://example.com/image.jpg",
    "alt_text": "Alt text",
    "category": "portfolio",
    "sort_order": 0
  }'

# UPDATE
curl -X PUT http://localhost:3000/admin/gallery/GALLERY_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# DELETE
curl -X DELETE http://localhost:3000/admin/gallery/GALLERY_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 💬 Chat

### 1. Start Conversation
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "start_chat",
    "visitor_name": "John Doe",
    "visitor_email": "john@example.com"
  }'
```

### 2. Send Message
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send_message",
    "conversation_id": "CONVERSATION_ID",
    "message": "Hello, how can you help?"
  }'
```

### 3. Fetch Messages
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "fetch_messages",
    "conversation_id": "CONVERSATION_ID"
  }'
```

---

## 📊 Analytics

### 1. Track Page View
```bash
curl -X POST http://localhost:3000/api/page-views \
  -H "Content-Type: application/json" \
  -d '{
    "page_path": "/contact",
    "page_title": "Contact Us",
    "referrer": "https://google.com"
  }'
```

### 2. Get Analytics
```bash
curl -X GET "http://localhost:3000/api/page-views/analytics?days=30" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## ✅ Health Check

```bash
curl http://localhost:3000/health
# Response: {"status":"ok","timestamp":"2026-03-22T13:15:00.000Z"}
```

---

## 🔑 How to Get Access Token

1. Login first:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPassword123"}'
```

2. Copy the `accessToken` from the response

3. Use it in headers:
```bash
-H "Authorization: Bearer eyJhbGc..."
```

4. Or set as environment variable for easier testing:
```bash
export TOKEN="your_access_token_here"
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📌 Common Errors & Solutions

### 401 Unauthorized
- **Cause**: Missing or invalid token
- **Fix**: Include valid `Authorization: Bearer TOKEN` header

### 403 Forbidden
- **Cause**: Insufficient permissions (not admin or staff)
- **Fix**: Ensure user has `admin` or `content_manager` role

### 429 Too Many Requests
- **Cause**: Rate limit exceeded
  - Leads: 8 per 30 minutes
  - Chat messages: 5 per 10 minutes
- **Fix**: Wait before retrying

### 422 Validation Error
- **Cause**: Required field missing or invalid format
- **Fix**: Check required fields in endpoint docs

### 500 Server Error
- **Cause**: Unexpected server error
- **Fix**: Check backend logs and database connection

---

## 🧪 Testing Tools

### Using PowerShell (Windows)
```powershell
$body = @{
    email = "test@example.com"
    password = "TestPassword123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Method Post `
  -Uri http://localhost:3000/auth/login `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body

$token = $response.accessToken
echo $token
```

### Using cURL (Linux/Mac)
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPassword123"}' \
  | jq -r '.accessToken')

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/auth/me
```

### Using Postman
1. Create request
2. Set method (GET, POST, PUT, DELETE)
3. Set URL
4. Go to "Authorization" tab
5. Select "Bearer Token"
6. Paste access token
7. Send request

---

## 📦 Server Files Created

| File | Lines | Purpose |
|------|-------|---------|
| server/src/routes/auth.ts | 200+ | Authentication endpoints |
| server/src/routes/cms.ts | 300+ | Service/Product/Blog endpoints |
| server/src/routes/leads.ts | 150+ | Lead submission & management |
| server/src/routes/chat.ts | 200+ | Chat functionality |
| server/src/routes/analytics.ts | 80+ | Page tracking |
| server/src/routes/admin.ts | 490+ | Admin CRUD operations |
| server/src/utils/auth.ts | 120+ | JWT utilities |
| server/src/index.ts | 100+ | Express setup |

## 🎨 Frontend Files Created

| File | Lines | Purpose |
|------|-------|---------|
| enterprise-essence-hub/src/integrations/api/client.ts | 560+ | REST API client |
| src/lib/submitLead.ts | Updated | Form submission |
| src/hooks/useAuth.tsx | 140+ | Auth hook integration |

---

**Last Updated**: March 22, 2026
**Status**: ✅ All endpoints tested and working
