# Astrology RAG API - Complete Documentation

## Base URL
```
http://localhost:8000
```

## Authentication Endpoints

### 1. User Signup
```bash
curl -X POST "http://localhost:8000/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

### 2. User Login
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 3. Google Authentication
```bash
curl -X POST "http://localhost:8000/auth/google-auth" \
  -H "Content-Type: application/json" \
  -d '{
    "id_token": "your_google_id_token"
  }'
```

### 4. Create Admin User (No Auth Required)
```bash
curl -X POST "http://localhost:8000/auth/admin/create-user" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "name": "Admin User",
    "role": "admin"
  }'
```

## Astrology Endpoints

### 5. Fetch Birth Chart Data
```bash
curl -X POST "http://localhost:8000/astrology/fetch-data" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "year": 1990,
    "month": 7,
    "date": 15,
    "hours": 10,
    "minutes": 30,
    "seconds": 0,
    "latitude": 28.6139,
    "longitude": 77.2090,
    "timezone": 5.5,
    "config": {"ayanamsha": "lahiri"}
  }'
```

### 6. Query Astrology Data (Legacy)
```bash
curl -X POST "http://localhost:8000/astrology/query" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "question": "What does my Mars placement indicate about my career?"
  }'
```

## Chat System Endpoints

### 7. Create New Chat
```bash
curl -X POST "http://localhost:8000/chat/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Career Guidance Chat"
  }'
```

### 8. Get All User Chats
```bash
curl -X GET "http://localhost:8000/chat/" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 9. Get Specific Chat with Messages
```bash
curl -X GET "http://localhost:8000/chat/CHAT_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 10. Send Message (HTTP)
```bash
curl -X POST "http://localhost:8000/chat/CHAT_ID/messages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "content": "What does my Mars placement say about my career?"
  }'
```

### 11. Update Chat Title
```bash
curl -X PUT "http://localhost:8000/chat/CHAT_ID/title" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Updated Career Discussion"
  }'
```

### 12. Delete Chat
```bash
curl -X DELETE "http://localhost:8000/chat/CHAT_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 13. Delete Specific Message
```bash
curl -X DELETE "http://localhost:8000/chat/CHAT_ID/messages/MESSAGE_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 14. WebSocket Connection
```
ws://localhost:8000/chat/ws?token=YOUR_JWT_TOKEN
```

**WebSocket Send Message:**
```json
{
  "type": "send_message",
  "chat_id": "your_chat_id",
  "content": "Tell me about my Jupiter placement"
}
```

## Razorpay Payment Endpoints

### 15. Get Available Plans (Public)
```bash
curl -X GET "http://localhost:8000/razorpay/plans"
```

### 16. Create Payment Order
```bash
curl -X POST "http://localhost:8000/razorpay/create-order" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "plan_id": "premium_plan"
  }'
```

### 17. Verify Payment
```bash
curl -X POST "http://localhost:8000/razorpay/verify-payment" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "razorpay_order_id": "order_xyz123",
    "razorpay_payment_id": "pay_abc456",
    "razorpay_signature": "signature_hash"
  }'
```

### 18. Get My Subscription
```bash
curl -X GET "http://localhost:8000/razorpay/my-subscription" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 19. Cancel Subscription
```bash
curl -X POST "http://localhost:8000/razorpay/cancel-subscription" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 20. Razorpay Webhook (For Razorpay to call)
```bash
curl -X POST "http://localhost:8000/razorpay/webhook" \
  -H "Content-Type: application/json" \
  -H "X-Razorpay-Signature: webhook_signature" \
  -d '{
    "event": "payment.captured",
    "payload": {...}
  }'
```

## Subscription Management Endpoints

### 21. Get Subscription Plans
```bash
curl -X GET "http://localhost:8000/subscription/plans"
```

### 22. Create Subscription Order
```bash
curl -X POST "http://localhost:8000/subscription/create-order" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "plan_id": "premium_plan"
  }'
```

### 23. Verify Subscription Payment
```bash
curl -X POST "http://localhost:8000/subscription/verify-payment" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "razorpay_order_id": "order_xyz123",
    "razorpay_payment_id": "pay_abc456",
    "razorpay_signature": "signature_hash"
  }'
```

### 24. Get My Subscription Details
```bash
curl -X GET "http://localhost:8000/subscription/my-subscription" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 25. Cancel My Subscription
```bash
curl -X POST "http://localhost:8000/subscription/cancel" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 26. Get Payment History
```bash
curl -X GET "http://localhost:8000/subscription/payment-history" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Premium Endpoints

### 27. Upgrade to Premium (Legacy)
```bash
curl -X POST "http://localhost:8000/premium/upgrade" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Contact Endpoints

### 28. Submit Contact Form (No Auth Required)
```bash
curl -X POST "http://localhost:8000/contact/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Question about premium features",
    "message": "I would like to know more about the premium features available."
  }'
```

### 29. Get Contact Messages (Admin Only)
```bash
curl -X GET "http://localhost:8000/contact/admin/messages?skip=0&limit=50" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### 30. Update Contact Status (Admin Only)
```bash
curl -X PUT "http://localhost:8000/contact/admin/messages/CONTACT_ID/status?status=replied" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

## Admin - User Management

### 31. Get All Users
```bash
curl -X GET "http://localhost:8000/admin/users?skip=0&limit=50" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### 32. Get User Details
```bash
curl -X GET "http://localhost:8000/admin/users/USER_ID" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### 33. Update User Details
```bash
curl -X PUT "http://localhost:8000/admin/users/USER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "name": "Updated Name",
    "role": "admin",
    "plan_type": "premium"
  }'
```

### 34. Create User with Role
```bash
curl -X POST "http://localhost:8000/admin/create-user" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "name": "New User",
    "role": "user"
  }'
```

### 35. Update User Role
```bash
curl -X PUT "http://localhost:8000/admin/users/USER_ID/role?role=admin" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### 36. Revoke User Access
```bash
curl -X POST "http://localhost:8000/admin/users/USER_ID/revoke-access" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### 37. Grant User Access
```bash
curl -X POST "http://localhost:8000/admin/users/USER_ID/grant-access" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### 38. Upgrade User to Premium
```bash
curl -X POST "http://localhost:8000/admin/users/USER_ID/upgrade-premium" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

## Admin - Pricing Management

### 39. Create Pricing Plan
```bash
curl -X POST "http://localhost:8000/admin/pricing" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "name": "Premium Plan",
    "price": 9.99,
    "currency": "USD",
    "features": ["Unlimited queries", "Priority support", "Advanced features"],
    "query_limit": null
  }'
```

### 40. Get All Pricing Plans
```bash
curl -X GET "http://localhost:8000/admin/pricing" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### 41. Get Specific Pricing Plan
```bash
curl -X GET "http://localhost:8000/admin/pricing/PLAN_ID" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### 42. Update Pricing Plan
```bash
curl -X PUT "http://localhost:8000/admin/pricing/PLAN_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "name": "Updated Premium Plan",
    "price": 14.99,
    "features": ["Unlimited queries", "Priority support", "Advanced features", "API access"]
  }'
```

### 43. Delete Pricing Plan
```bash
curl -X DELETE "http://localhost:8000/admin/pricing/PLAN_ID" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### 44. Activate Pricing Plan
```bash
curl -X POST "http://localhost:8000/admin/pricing/PLAN_ID/activate" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### 45. Deactivate Pricing Plan
```bash
curl -X POST "http://localhost:8000/admin/pricing/PLAN_ID/deactivate" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

## Admin - Analytics & Monitoring

### 46. Get All User Chats
```bash
curl -X GET "http://localhost:8000/admin/chats" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### 47. Get Admin Statistics
```bash
curl -X GET "http://localhost:8000/admin/stats" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### 48. Get All Razorpay Subscriptions (Admin)
```bash
curl -X GET "http://localhost:8000/razorpay/admin/subscriptions?skip=0&limit=100" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### 49. Get All Subscription Records (Admin)
```bash
curl -X GET "http://localhost:8000/subscription/admin/all-subscriptions?skip=0&limit=100" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### 50. Create Subscription Plan (Admin)
```bash
curl -X POST "http://localhost:8000/subscription/admin/create-plan" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "name": "Enterprise Plan",
    "price_inr": 1999.0,
    "duration_days": 30,
    "features": ["Unlimited queries", "Priority support", "API access", "Custom integrations"],
    "query_limit": null,
    "is_active": true
  }'
```

## Utility Endpoints

### 51. Root Endpoint
```bash
curl -X GET "http://localhost:8000/"
```

### 52. Health Check
```bash
curl -X GET "http://localhost:8000/health"
```

## Complete Workflow Examples

### User Registration & Premium Subscription Flow
```bash
# 1. Sign up
curl -X POST "http://localhost:8000/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123", "name": "Test User"}'

# 2. Login and get token
TOKEN=$(curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}' | jq -r '.access_token')

# 3. Fetch astrology data
curl -X POST "http://localhost:8000/astrology/fetch-data" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"year": 1990, "month": 7, "date": 15, "hours": 10, "minutes": 30, "seconds": 0, "latitude": 28.6139, "longitude": 77.2090, "timezone": 5.5, "config": {"ayanamsha": "lahiri"}}'

# 4. Get available plans
curl -X GET "http://localhost:8000/razorpay/plans"

# 5. Create payment order
ORDER_RESPONSE=$(curl -X POST "http://localhost:8000/razorpay/create-order" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"plan_id": "premium_plan"}')

ORDER_ID=$(echo $ORDER_RESPONSE | jq -r '.order_id')

# 6. Simulate payment verification (in real scenario, this comes from Razorpay frontend)
curl -X POST "http://localhost:8000/razorpay/verify-payment" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"razorpay_order_id\": \"$ORDER_ID\", \"razorpay_payment_id\": \"pay_test123\", \"razorpay_signature\": \"test_signature\"}"

# 7. Check subscription status
curl -X GET "http://localhost:8000/razorpay/my-subscription" \
  -H "Authorization: Bearer $TOKEN"

# 8. Create chat and start unlimited messaging
CHAT_ID=$(curl -X POST "http://localhost:8000/chat/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title": "Premium User Chat"}' | jq -r '.id')

# 9. Send unlimited messages (premium user)
curl -X POST "http://localhost:8000/chat/$CHAT_ID/messages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"content": "What does my chart say about my career path?"}'
```

### Admin Management Flow
```bash
# 1. Create admin user
curl -X POST "http://localhost:8000/auth/admin/create-user" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@company.com", "password": "admin123", "name": "Admin User", "role": "admin"}'

# 2. Login as admin
ADMIN_TOKEN=$(curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@company.com", "password": "admin123"}' | jq -r '.access_token')

# 3. Create custom subscription plan
PLAN_ID=$(curl -X POST "http://localhost:8000/subscription/admin/create-plan" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"name": "Enterprise Plan", "price_inr": 2999.0, "duration_days": 30, "features": ["Unlimited queries", "Priority support", "API access"], "query_limit": null, "is_active": true}' | jq -r '.id')

# 4. Monitor all subscriptions
curl -X GET "http://localhost:8000/razorpay/admin/subscriptions" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 5. Get system statistics
curl -X GET "http://localhost:8000/admin/stats" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 6. Monitor user chats
curl -X GET "http://localhost:8000/admin/chats" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 7. Manage users
curl -X GET "http://localhost:8000/admin/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## WebSocket Usage (JavaScript)

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:8000/chat/ws?token=YOUR_JWT_TOKEN');

// Send message
ws.send(JSON.stringify({
  type: 'send_message',
  chat_id: 'your_chat_id',
  content: 'Tell me about my Venus placement'
}));

// Handle responses
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

## Response Examples

### Subscription Plans Response
```json
[
  {
    "id": "free_plan",
    "name": "Free Plan",
    "price_inr": 0.0,
    "duration_days": 30,
    "features": ["5 queries per day", "Basic astrology insights"],
    "query_limit": 5,
    "plan_type": "FREE"
  },
  {
    "id": "premium_plan",
    "name": "Premium Plan",
    "price_inr": 999.0,
    "duration_days": 30,
    "features": ["Unlimited queries", "Advanced insights", "Priority support"],
    "query_limit": null,
    "plan_type": "PREMIUM"
  }
]
```

### Payment Order Response
```json
{
  "order_id": "order_xyz123",
  "amount": 99900,
  "currency": "INR",
  "key_id": "rzp_test_your_key_id",
  "plan_name": "Premium Plan",
  "test_mode": false
}
```

### Subscription Status Response
```json
{
  "has_subscription": true,
  "subscription_id": "sub_123",
  "plan_name": "Premium Plan",
  "plan_type": "premium",
  "status": "ACTIVE",
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": "2024-01-31T23:59:59Z",
  "auto_renew": true,
  "price_inr": 999.0,
  "query_limit": null,
  "queries_remaining": "unlimited"
}
```

## Rate Limiting
- **Free Users**: 5 queries per day (across all chats)
- **Premium Users**: Unlimited queries
- **Admin Users**: No rate limits
- **Rate limits apply to**: Chat messages, astrology queries

## Authentication Notes
- **JWT Token**: Required for most endpoints
- **Admin Access**: User role must be "admin"
- **Token Format**: `Bearer YOUR_JWT_TOKEN`
- **Token Expiration**: 1 year (configurable)

## Payment Integration
- **Razorpay**: Primary payment gateway
- **Test Mode**: Available for development
- **Webhook**: Handles payment notifications
- **Currency**: INR (Indian Rupees)
- **Plans**: Free (₹0) and Premium (₹999/month)

## Error Handling
```json
{
  "detail": "Error message",
  "error_type": "error_category"
}
```

## Status Codes
- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **429**: Rate Limited
- **500**: Internal Server Error