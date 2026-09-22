# LostLens

**Find what you lost. Return what you found.**

LostLens is a college campus Lost & Found platform built as a final-year CSE project. It intelligently connects lost and found reports using a transparent, rule-based matching algorithm (category, color, brand, location, date, and description) — not just keyword search.

## Features

### Core Functionality
- **Student & Admin Authentication**: JWT-based authentication with role-based access control
- **Lost & Found Reporting**: Unified item reporting system with image uploads
- **Automatic Matching**: Rule-based matching engine with transparent scoring (0-100)
- **Claim System**: Request claims, admin review, and recovery workflow
- **Notifications**: In-app notifications for matches and claim updates
- **Admin Dashboard**: Analytics, statistics, and campus heatmap visualization
- **Location Integration**: OpenStreetMap + Leaflet for location selection and display
- **Search & Filter**: Advanced search with category, color, brand, date, and location filters

### Matching Algorithm
The system uses a simple, explainable matching algorithm:
- **Category Match**: 30 points
- **Color Match**: 20 points  
- **Brand Match**: 15 points
- **Location Match**: 15 points (proximity-based)
- **Date Match**: 10 points
- **Description Match**: 10 points (keyword similarity)

**Maximum Score: 100 points**

Match Levels:
- 80-100: High Probability
- 60-79: Possible Match
- 40-59: Weak Match
- 0-39: Low Match

## Technology Stack

### Frontend
- **Framework**: React with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **HTTP Client**: Axios
- **Forms**: React Hook Form + Zod validation
- **Maps**: Leaflet + OpenStreetMap
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with httpOnly cookies
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **Security**: Helmet, CORS, rate limiting
- **Validation**: Zod schemas

### External Services
- **Image Storage**: Cloudinary (with local fallback)
- **Maps**: OpenStreetMap + Nominatim (free, no API key required)

## Project Structure

```
lostlens/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── context/        # React contexts
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── validators/     # Request validation
│   │   └── scripts/        # Utility scripts
│   └── package.json
├── docs/                   # Documentation
└── README.md
```

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd lostlens
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://127.0.0.1:27017/lostlens

JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

4. **Start MongoDB**
```bash
# If using local MongoDB
mongod

# Or if using MongoDB Atlas, update MONGODB_URI in .env
```

5. **Run the development server**
```bash
npm run dev
```

This starts both frontend and backend concurrently:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### Optional: Seed Database

To populate the database with sample data:
```bash
npm run seed
```

Demo credentials (after seeding):
- Student: `aarav.demo@campus.edu` / `Demo@1234`
- Admin: `admin@lostlens.demo` / `Demo@1234`

## Usage

### Demo Flow

1. **Register/Login**: Create a student account or login as admin
2. **Report Lost Item**: 
   - Click "Report Lost Item"
   - Fill in item details (category, color, brand, description)
   - Upload images
   - Select location on map
   - Submit report
3. **Report Found Item**: Similar process for found items
4. **View Matches**: Automatic matching generates potential matches
5. **Request Claim**: Submit claim for matching found items
6. **Admin Review**: Admin reviews and approves/rejects claims
7. **Recovery**: Approved claims mark items as resolved

### User Roles

**Student:**
- Register and login
- Report lost items
- Report found items
- View matches
- Submit claims
- View notifications
- Manage own reports

**Admin:**
- View all reports
- Review claims
- Approve/reject claims
- View analytics dashboard
- Manage inappropriate content
- View campus heatmap

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Items
- `POST /api/items` - Create item report
- `GET /api/items` - Get all items (with filters)
- `GET /api/items/:id` - Get item details
- `PATCH /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Matches
- `GET /api/matches` - Get user matches
- `GET /api/matches/:id` - Get match details

### Claims
- `POST /api/claims` - Submit claim
- `GET /api/claims` - Get claims
- `PATCH /api/claims/:id` - Update claim status

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/items` - Get all items
- `GET /api/admin/claims` - Get all claims
- `DELETE /api/admin/items/:id` - Delete item

## Database Schema

### User
- `_id`, `name`, `email`, `password`, `role`, `createdAt`, `updatedAt`

### Item
- `_id`, `userId`, `type` (LOST/FOUND), `title`, `description`, `category`, `brand`, `color`, `images`, `location`, `eventDate`, `status`, `createdAt`, `updatedAt`

### Match
- `_id`, `lostItemId`, `foundItemId`, `score`, `scoreBreakdown`, `explanation`, `status`, `createdAt`

### Claim
- `_id`, `matchId`, `claimantId`, `explanation`, `proofImage`, `status`, `createdAt`, `updatedAt`

### Notification
- `_id`, `userId`, `title`, `message`, `type`, `read`, `relatedItemId`, `createdAt`

## Testing

### Run Tests
```bash
npm test
```

### Test Matching Algorithm
```bash
cd server
node src/scripts/testMatching.js
```

### Check API Configuration
```bash
cd server
node src/scripts/testApis.js
```

### Clear Database
```bash
cd server
node src/scripts/clearDatabase.js
```

## Documentation

- [Architecture](docs/architecture.md) - System architecture and design principles
- [Database Schema](docs/database-schema.md) - Detailed database schema documentation
- [Matching Algorithm](docs/matching-algorithm.md) - Detailed matching algorithm explanation
- [API Documentation](docs/api-documentation.md) - Complete API reference
- [Setup Guide](docs/setup-guide.md) - Detailed setup instructions
- [Testing](docs/testing.md) - Testing guidelines

## Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Token-based authentication with httpOnly cookies
- **Role-Based Access**: Student and Admin roles with appropriate permissions
- **Input Validation**: Zod schemas for request validation
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS**: Configured CORS for cross-origin requests
- **Helmet**: Security headers for Express
- **File Validation**: Image type and size validation

## Deployment

### Environment Variables
Ensure the following environment variables are set in production:
- `NODE_ENV=production`
- `MONGODB_URI` (production MongoDB URI)
- `JWT_SECRET` (strong, random secret)
- `CLIENT_URL` (production frontend URL)
- Cloudinary credentials

### Build Frontend
```bash
cd client
npm run build
```

### Start Backend
```bash
cd server
npm start
```

## Limitations

- **Rule-Based Matching**: Uses simple rule-based algorithm, not machine learning
- **Location Accuracy**: Dependent on user-selected locations
- **Image Recognition**: No automatic image recognition (manual description required)
- **Email Notifications**: Not implemented (in-app notifications only)
- **Single Campus**: Designed for single campus deployment

## Future Enhancements

- AI-based image recognition
- Email notifications
- Multi-campus support
- Mobile application
- Advanced geospatial analysis
- Fraud detection
- OCR for ID cards
- Semantic description matching

## License

This project is for educational purposes.

## Contact

For questions or issues, please open an issue in the repository.

---

**LostLens** - Find what you lost. Return what you found.
