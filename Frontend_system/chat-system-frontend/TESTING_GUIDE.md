# 🧪 Testing Guide - Chat System

## 📋 Tổng Quan Testing

Dự án Chat System đã được setup đầy đủ testing cho cả Backend và Frontend theo yêu cầu của Assignment Phase 2:

### ✅ **Backend Testing (Server-side)**
- **Framework**: Jest + Supertest
- **Coverage**: Routes, Controllers, Services, Models
- **Database**: MongoDB với test database riêng

### ✅ **Frontend Testing (Angular)**
- **Unit Tests**: Jasmine + Karma
- **E2E Tests**: Cypress (thay thế Protractor deprecated)
- **Coverage**: Components, Services, Guards

---

## 🚀 **CÁCH SỬ DỤNG TESTING**

### **1. BACKEND TESTING**

#### **Chạy tất cả Backend tests:**
```bash
cd Backend_system
npm test
```

#### **Chạy tests theo loại:**
```bash
# Test routes only
npm run test:routes

# Test services only  
npm run test:services

# Test với coverage report
npm run test:coverage

# Test trong CI mode
npm run test:ci

# Test với watch mode (auto-reload)
npm run test:watch
```

#### **Test structure:**
```
Backend_system/src/__tests__/
├── routes/           # API route tests
│   ├── auth.test.ts
│   ├── users.test.ts
│   ├── groups.test.ts
│   ├── channels.test.ts
│   ├── messages.test.ts
│   └── ...
├── services/         # Service layer tests
├── fixtures/         # Test data
└── utils/           # Test helpers
```

#### **Ví dụ Backend test:**
```typescript
describe('Auth Routes', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toBeDefined();
  });
});
```

---

### **2. FRONTEND TESTING**

#### **A. Unit Tests (Jasmine + Karma)**

**Chạy tất cả unit tests:**
```bash
cd Frontend_system/chat-system-frontend
npm test
```

**Chạy tests theo loại:**
```bash
# Test components only
npm run test:components

# Test services only
npm run test:services

# Test auth components
npm run test:auth

# Test chat components
npm run test:chat

# Test admin components
npm run test:admin

# Test với coverage
npm run test:coverage

# Test trong CI mode
npm run test:ci
```

#### **B. E2E Tests (Cypress)**

**Mở Cypress Test Runner:**
```bash
npm run e2e
```

**Chạy E2E tests trong headless mode:**
```bash
# Chạy tất cả E2E tests
npm run e2e:run

# Chạy trong CI mode
npm run e2e:ci

# Chạy headless
npm run e2e:headless
```

#### **E2E Test Structure:**
```
cypress/
├── e2e/              # E2E test files
│   ├── auth.cy.ts    # Authentication tests
│   ├── chat.cy.ts    # Chat functionality tests
│   ├── video-call.cy.ts # Video call tests
│   └── admin.cy.ts   # Admin panel tests
├── fixtures/         # Test data
├── support/          # Custom commands & config
└── cypress.config.ts # Cypress configuration
```

---

## 🛠️ **SETUP VÀ CẤU HÌNH**

### **Backend Setup:**
1. **Environment**: Tạo `.env.test` file
2. **Database**: MongoDB test database
3. **Dependencies**: Jest, Supertest đã được cài đặt

### **Frontend Setup:**
1. **Unit Tests**: Jasmine + Karma (Angular default)
2. **E2E Tests**: Cypress đã được cài đặt và cấu hình
3. **Test Data**: Fixtures và mock data đã được tạo

---

## 📊 **TEST COVERAGE**

### **Backend Coverage:**
- ✅ Authentication routes
- ✅ User management routes  
- ✅ Group management routes
- ✅ Channel management routes
- ✅ Message handling routes
- ✅ File upload routes
- ✅ Video call routes
- ✅ Admin routes

### **Frontend Coverage:**
- ✅ Authentication components
- ✅ Chat components
- ✅ Video call components
- ✅ Admin components
- ✅ Shared components
- ✅ Services
- ✅ Guards

---

## 🎯 **CUSTOM COMMANDS (Cypress)**

Đã tạo các custom commands để dễ dàng testing:

```typescript
// Login command
cy.login('test@example.com', 'password123');

// Logout command  
cy.logout();

// Create test user
cy.createTestUser();

// Wait for Angular
cy.waitForAngular();

// Intercept API calls
cy.interceptAPI('GET', '/api/users', { users: [] });
```

---

## 🔧 **TROUBLESHOOTING**

### **Backend Test Issues:**
1. **Database connection**: Đảm bảo MongoDB đang chạy
2. **Environment variables**: Kiểm tra `.env.test` file
3. **Port conflicts**: Đảm bảo port 3000 không bị conflict

### **Frontend Test Issues:**
1. **Unit tests**: Kiểm tra imports và dependencies
2. **E2E tests**: Đảm bảo app đang chạy trên localhost:4200
3. **Cypress**: Kiểm tra cypress.config.ts

---

## 📈 **BEST PRACTICES**

### **Backend Testing:**
- Sử dụng test database riêng
- Mock external services
- Test cả success và error cases
- Sử dụng fixtures cho test data

### **Frontend Testing:**
- Test components in isolation
- Mock services và HTTP calls
- Test user interactions
- Sử dụng data-cy attributes cho E2E tests

---

## 🚀 **QUICK START**

### **1. Chạy Backend Tests:**
```bash
cd Backend_system
npm test
```

### **2. Chạy Frontend Unit Tests:**
```bash
cd Frontend_system/chat-system-frontend
npm test
```

### **3. Chạy Frontend E2E Tests:**
```bash
# Mở Cypress UI
npm run e2e

# Hoặc chạy headless
npm run e2e:run
```

---

## 📝 **TEST REPORTS**

### **Coverage Reports:**
- Backend: `Backend_system/coverage/`
- Frontend: `Frontend_system/chat-system-frontend/coverage/`

### **E2E Reports:**
- Screenshots: `cypress/screenshots/`
- Videos: `cypress/videos/`

---

## ✅ **VERIFICATION CHECKLIST**

- [x] Backend routes tests implemented
- [x] Frontend unit tests implemented  
- [x] Frontend E2E tests implemented
- [x] Test coverage reports available
- [x] CI/CD ready test scripts
- [x] Custom test commands created
- [x] Test data fixtures prepared

---

**🎉 Testing setup hoàn chỉnh và sẵn sàng cho Assignment Phase 2!**
