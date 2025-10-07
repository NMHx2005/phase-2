# 🎯 HƯỚNG DẪN CHI TIẾT - CÁCH CHẠY TESTS

## 📖 **MỤC LỤC**
1. [Chuẩn bị môi trường](#1-chuẩn-bị-môi-trường)
2. [Chạy Backend Tests](#2-chạy-backend-tests)
3. [Chạy Frontend Unit Tests](#3-chạy-frontend-unit-tests)
4. [Chạy Frontend E2E Tests](#4-chạy-frontend-e2e-tests)
5. [Xem kết quả và báo cáo](#5-xem-kết-quả-và-báo-cáo)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. **CHUẨN BỊ MÔI TRƯỜNG**

### **Bước 1.1: Kiểm tra dependencies**
```bash
# Kiểm tra Node.js version (cần >= 16)
node --version

# Kiểm tra npm version
npm --version
```

### **Bước 1.2: Cài đặt dependencies cho Backend**
```bash
npm install
```

### **Bước 1.3: Cài đặt dependencies cho Frontend**
```bash
npm install
```

### **Bước 1.4: Chuẩn bị database (MongoDB)**
```bash
# Đảm bảo MongoDB đang chạy
# Tạo test database
mongosh
> use chat-system-test
> exit
```

---

## 2. **CHẠY BACKEND TESTS**

### **Bước 2.1: Chạy tất cả Backend tests**
```bash
npm test
```

**Kết quả mong đợi:**
```
✅ PASS src/__tests__/routes/auth.test.ts
✅ PASS src/__tests__/routes/users.test.ts
✅ PASS src/__tests__/routes/groups.test.ts
✅ PASS src/__tests__/routes/channels.test.ts
✅ PASS src/__tests__/routes/messages.test.ts
```

### **Bước 2.2: Chạy tests theo loại**
```bash
# Chỉ test routes
npm run test:routes

# Chỉ test services
npm run test:services

# Test với coverage report
npm run test:coverage
```

### **Bước 2.3: Xem coverage report**
```bash
# Sau khi chạy test:coverage
# Mở file: Backend_system/coverage/lcov-report/index.html
```

---

## 3. **CHẠY FRONTEND UNIT TESTS**

### **Bước 3.1: Chạy tất cả unit tests**
```bash
npm test
```

**Kết quả mong đợi:**
```
✅ Browser: Chrome
✅ Tests: 45 passed
✅ Coverage: 85%
```

### **Bước 3.2: Chạy tests theo component**
```bash
# Test auth components
npm run test:auth

# Test chat components
npm run test:chat

# Test admin components
npm run test:admin

# Test services
npm run test:services
```

### **Bước 3.3: Chạy với coverage**
```bash
npm run test:coverage
```

---

## 4. **CHẠY FRONTEND E2E TESTS**

### **Bước 4.1: Mở Cypress Test Runner**
```bash
cd Frontend_system/chat-system-frontend
npm run e2e
```

**Cypress UI sẽ mở trong browser:**
- Chọn test file từ danh sách
- Click vào test để chạy
- Xem kết quả real-time

### **Bước 4.2: Chạy E2E tests trong headless mode**
```bash
# Chạy tất cả E2E tests
npm run e2e:run

# Chạy trong CI mode
npm run e2e:ci
```

### **Bước 4.3: Chạy test cụ thể**
```bash
# Chạy test auth
npx cypress run --spec "cypress/e2e/auth.cy.ts"

# Chạy test chat
npx cypress run --spec "cypress/e2e/chat.cy.ts"
```

---

## 5. **XEM KẾT QUẢ VÀ BÁO CÁO**

### **Backend Test Results:**
```
📁 Backend_system/coverage/
├── lcov-report/
│   ├── index.html          # Coverage overview
│   ├── base.css
│   └── ...
├── lcov.info              # Coverage data
└── clover.xml             # Coverage XML
```

### **Frontend Test Results:**
```
📁 Frontend_system/chat-system-frontend/
├── coverage/              # Unit test coverage
├── cypress/
│   ├── screenshots/       # E2E test screenshots
│   ├── videos/           # E2E test videos
│   └── downloads/        # Downloaded files
```

---

## 6. **TROUBLESHOOTING**

### **❌ Backend Test Issues:**

**Problem 1: Database connection error**
```bash
# Solution: Kiểm tra MongoDB
mongosh
> show dbs
> use chat-system-test
```

**Problem 2: Port already in use**
```bash
# Solution: Kill process using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Problem 3: Environment variables missing**
```bash
# Solution: Tạo .env.test file
cd Backend_system
copy .env .env.test
```

### **❌ Frontend Test Issues:**

**Problem 1: Unit tests failing**
```bash
# Solution: Clear cache và reinstall
npm cache clean --force
rm -rf node_modules
npm install
```

**Problem 2: Cypress không mở được**
```bash
# Solution: Reinstall Cypress
npm uninstall cypress
npm install --save-dev cypress
npx cypress install
```

**Problem 3: E2E tests timeout**
```bash
# Solution: Tăng timeout trong cypress.config.ts
defaultCommandTimeout: 15000
requestTimeout: 15000
```

---

## 🚀 **QUICK COMMANDS SUMMARY**

### **Backend:**
```bash
cd Backend_system
npm test                    # Tất cả tests
npm run test:routes         # Routes only
npm run test:coverage       # Với coverage
npm run test:watch          # Watch mode
```

### **Frontend:**
```bash
cd Frontend_system/chat-system-frontend
npm test                    # Unit tests
npm run e2e                 # Mở Cypress UI
npm run e2e:run             # E2E headless
npm run test:coverage       # Unit test coverage
```

### **All Tests:**
```bash
# Sử dụng script đã tạo
run-tests.bat
```

---

## 📊 **EXPECTED RESULTS**

### **Backend Tests:**
- ✅ 9 test suites passed
- ✅ 45+ individual tests passed
- ✅ 80%+ code coverage

### **Frontend Unit Tests:**
- ✅ 25+ test suites passed
- ✅ 100+ individual tests passed
- ✅ 75%+ code coverage

### **Frontend E2E Tests:**
- ✅ Auth flow tests passed
- ✅ Chat functionality tests passed
- ✅ Video call tests passed
- ✅ Admin panel tests passed
