# API Setup Guide

## Backend Configuration

### 1. Environment Variables

Project root mein `.env` file banao aur apni backend URL add karo:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

**Note:** Agar production mein deploy kar rahe ho, to production URL use karo.

### 2. Required Backend API Endpoints

Aapke backend mein ye endpoints hone chahiye:

#### Register Endpoint
- **URL:** `POST /api/auth/register`
- **Request Body:**
```json
{
  "fullName": "John Doe",
  "mobileNumber": "1234567890",
  "email": "john@example.com",
  "password": "password123"
}
```
- **Success Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "...",
    "fullName": "John Doe",
    "email": "john@example.com"
  }
}
```
- **Error Response:**
```json
{
  "success": false,
  "message": "Email already exists",
  "error": "Email already exists"
}
```

#### Login Endpoint
- **URL:** `POST /api/auth/login`
- **Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Success Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "...",
    "fullName": "John Doe",
    "email": "john@example.com"
  }
}
```
- **Error Response:**
```json
{
  "success": false,
  "message": "Invalid credentials",
  "error": "Invalid email or password"
}
```

### 3. Loan Application Endpoint
- **URL:** `POST /api/loans/apply`
- **Headers:** `Authorization: Bearer <token>` (Required - User must be logged in)
- **Request Body:**
```json
{
  "fullName": "John Doe",
  "mobileNumber": "1234567890",
  "email": "john@example.com",
  "loanAmount": 500000,
  "loanDurationMonths": 24,
  "loanPurpose": "personal",
  "employmentType": "salaried"
}
```
- **Success Response:**
```json
{
  "success": true,
  "message": "Loan application submitted successfully",
  "loan": {
    "id": "...",
    "fullName": "John Doe",
    "loanAmount": 500000,
    "status": "pending"
  }
}
```
- **Error Response:**
```json
{
  "success": false,
  "message": "Failed to submit loan application",
  "error": "Error details"
}
```

**Note:** `loanPurpose` values: `personal`, `business`, `education`, `home`, `vehicle`, `medical`
**Note:** `employmentType` values: `salaried`, `self-employed`, `business`, `retired`

### 4. Authentication Token

Login ke baad token `localStorage` mein store hota hai. Har authenticated request mein ye token automatically add hota hai header mein:

```
Authorization: Bearer <token>
```

### 5. Backend Example (Node.js + Express + MongoDB)

Agar aapko backend example chahiye, to ye structure follow karo:

```javascript
// Backend routes example
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, mobileNumber, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already exists' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = new User({
      fullName,
      mobileNumber,
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});
```

// Loan Application Route
app.post('/api/loans/apply', authenticateToken, async (req, res) => {
  try {
    const { 
      fullName, 
      mobileNumber, 
      email, 
      loanAmount, 
      loanDurationMonths, 
      loanPurpose, 
      employmentType 
    } = req.body;
    
    // Get user ID from token
    const userId = req.user.userId;
    
    // Create loan application
    const loan = new Loan({
      userId,
      fullName,
      mobileNumber,
      email,
      loanAmount,
      loanDurationMonths,
      loanPurpose,
      employmentType,
      status: 'pending',
      appliedDate: new Date()
    });
    
    await loan.save();
    
    res.status(201).json({
      success: true,
      message: 'Loan application submitted successfully',
      loan: {
        id: loan._id,
        fullName: loan.fullName,
        loanAmount: loan.loanAmount,
        status: loan.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit loan application',
      error: error.message
    });
  }
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    req.user = user;
    next();
  });
}
```

### 6. Testing

1. `.env` file mein backend URL set karo
2. Backend server start karo
3. Frontend run karo: `npm run dev`
4. Register page se naya account banao
5. Login page se login karo
6. Loan form page accessible hoga

### 7. Troubleshooting

**CORS Error:**
Agar CORS error aaye, to backend mein CORS enable karo:
```javascript
const cors = require('cors');
app.use(cors());
```

**API URL Not Found:**
- `.env` file project root mein hai na?
- `VITE_API_BASE_URL` correctly set hai?
- Backend server running hai?

**401 Unauthorized:**
- Token expire ho gaya ho sakta hai
- Login phir se karo
