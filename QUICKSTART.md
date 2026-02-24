# QUICK START GUIDE

## 🚀 Get Started in 5 Minutes

### Step 1: Database Setup (2 minutes)

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE inventory_db;"

# Import schema
mysql -u root -p inventory_db < database/schema.sql

# Import sample data
mysql -u root -p inventory_db < database/sample-data.sql
```

### Step 2: Backend Setup (1 minute)

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOL
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=inventory_db
JWT_SECRET=your_super_secret_key_12345
CORS_ORIGIN=http://localhost:3000
EOL

# Start server
npm run dev
```

✅ Backend running at `http://localhost:5000`

### Step 3: Frontend Setup (2 minutes)

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_BASE_URL=http://localhost:5000/api/v1" > .env

# Start development server
npm run dev
```

✅ Frontend running at `http://localhost:3000`

### Step 4: Login & Explore

Open browser to `http://localhost:3000`

**Default Credentials:**
- Username: `admin`
- Password: `admin123`

## 🎯 What to Try First

1. **Dashboard** - View inventory overview
2. **Products** - Add a new product
3. **Transactions** - Record a sale or purchase
4. **Check Stock Updates** - See real-time inventory changes

## 🔥 Key Features to Test

### Add a Product
1. Go to Products → Add Product
2. Fill in: SKU, Name, Price, Initial Stock
3. Click Create

### Record a Sale
1. Go to Transactions → New Transaction
2. Select "Sale" type
3. Choose a product
4. Enter quantity
5. Watch stock automatically update!

### View Low Stock Alerts
- Dashboard shows products below reorder point
- Automatic alerts when stock is low

## ⚡ Performance Tips

- Uses **database transactions** for consistency
- **Row-level locking** prevents concurrent issues
- **Indexed queries** for fast lookups
- **Connection pooling** for scalability

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check MySQL is running
mysql -u root -p -e "SELECT 1;"

# Verify database exists
mysql -u root -p -e "SHOW DATABASES LIKE 'inventory_db';"
```

### Frontend can't connect
```bash
# Verify backend is running
curl http://localhost:5000/health

# Check CORS settings in backend/.env
CORS_ORIGIN=http://localhost:3000
```

### Database errors
```bash
# Re-import schema
mysql -u root -p inventory_db < database/schema.sql
```

## 📚 Next Steps

1. Read `ARCHITECTURE.md` for technical details
2. Review `README.md` for full documentation
3. Explore API endpoints with Postman/cURL
4. Try different user roles (admin, manager, staff)

## 🎓 Learning Resources

### Understanding Stock Updates
See `backend/src/models/Transaction.js` - Lines 15-80
- Transaction-based updates
- Row locking mechanism
- Stock validation logic

### API Authentication
See `backend/src/middleware/auth.js`
- JWT token verification
- Role-based access control

### Frontend State Management
See `frontend/src/contexts/AuthContext.jsx`
- Context API for global state
- Authentication flow

## 💡 Pro Tips

1. **Use Postman** for API testing
2. **Check MySQL logs** for slow queries
3. **Monitor console** for errors
4. **Test concurrent transactions** to see locking in action

---

**Happy Coding! 🚀**
