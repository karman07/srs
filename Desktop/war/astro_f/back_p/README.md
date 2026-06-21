# Astrology RAG API

A FastAPI application implementing a user-based Retrieval-Augmented Generation (RAG) system that integrates with the FreeAstrologyAPI to analyze user birth data and answer personalized astrology questions.

## Features

- **User Authentication**: JWT-based signup and login with Google Firebase support
- **Astrology Data Integration**: Fetches data from all FreeAstrologyAPI endpoints
- **Custom RAG System**: Uses only user's astrology data for personalized responses
- **Real-time Chat System**: WebSocket-based chat with message history
- **Payment Integration**: Razorpay integration for premium subscriptions
- **Rate Limiting**: Free (5 queries/day) vs Premium (unlimited) plans
- **Admin Panel**: Complete admin interface for user and subscription management
- **Contact System**: Contact form with admin management

## API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - User login
- `POST /auth/google-auth` - Google Firebase authentication
- `POST /auth/admin/create-user` - Create admin user (no auth required)

### Astrology
- `POST /astrology/fetch-data` - Fetch birth chart data
- `POST /astrology/query` - Ask questions about your data (legacy)

### Chat System
- `POST /chat/` - Create new chat
- `GET /chat/` - Get all user chats
- `GET /chat/{chat_id}` - Get specific chat with messages
- `POST /chat/{chat_id}/messages` - Send message
- `PUT /chat/{chat_id}/title` - Update chat title
- `DELETE /chat/{chat_id}` - Delete chat
- `WebSocket /chat/ws` - Real-time messaging

### Razorpay Payments
- `GET /razorpay/plans` - Get available plans
- `POST /razorpay/create-order` - Create payment order
- `POST /razorpay/verify-payment` - Verify payment
- `GET /razorpay/my-subscription` - Get subscription status
- `POST /razorpay/cancel-subscription` - Cancel subscription

### Admin Panel
- `GET /admin/users` - Get all users
- `PUT /admin/users/{user_id}` - Update user
- `GET /admin/stats` - Get system statistics
- `GET /admin/chats` - Monitor all chats
- `GET /admin/pricing` - Manage pricing plans

## FreeAstrologyAPI Endpoints Used

1. **Basic Planets Data**: `/planets`
2. **Extended Planets Data**: `/planets/extended`
3. **D10 Chart Info**: `/d10-chart-info`
4. **Navamsa Chart Info**: `/navamsa-chart-info`
5. **Vimsottari Maha Dasas and Antar Dasas**: `/vimsottari/maha-dasas-and-antar-dasas`
6. **Vimsottari Dasa Information**: `/vimsottari/dasa-information`

## Setup

1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Setup environment variables:**
Create `.env` file with the following variables:
```bash
# Database
MONGO_URI=mongodb://localhost:27017/astro_rag

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=525600

# Astrology API
ASTROLOGY_API_KEY=your_astrology_api_key

# Firebase (for Google Auth)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_service_account_email

# Google LLM (Optional)
USE_GOOGLE_LLM=true
GOOGLE_API_KEY=your_google_api_key
GOOGLE_LLM_MODEL=gemini-2.0-flash

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Pricing Configuration (INR)
FREE_PLAN_QUERIES=5
PREMIUM_PLAN_PRICE_INR=999.0
```

3. **Initialize database plans:**
```bash
python init_plans.py
```

4. **Run the application:**
```bash
uvicorn app.main:app --reload
```

## Payment Plans

- **Free Plan**: ₹0/month - 5 queries per day
- **Premium Plan**: ₹999/month - Unlimited queries + advanced features

## Usage Example

1. **Signup**: Create a new user account
2. **Login**: Get JWT token
3. **Fetch Data**: Provide birth details to fetch astrology data
4. **Create Chat**: Start a new conversation
5. **Ask Questions**: Use natural language to query your chart
6. **Upgrade**: Purchase premium for unlimited queries

```python
# Example birth data
{
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
}

# Example chat message
{
  "content": "What does my Mars placement indicate about my career?"
}
```

## Tech Stack

- **FastAPI**: Web framework
- **MongoDB**: Database with Motor async driver
- **Sentence Transformers**: Text embeddings for RAG
- **Google Gemini**: LLM for astrology responses
- **Firebase Auth**: Google authentication
- **Razorpay**: Payment gateway
- **WebSockets**: Real-time chat
- **JWT**: Authentication (1-year expiration)
- **bcrypt**: Password hashing

## Documentation

Complete API documentation with cURL examples is available in `API_DOCUMENTATION.md`