# Complete Testing Guide - Step by Step Instructions

## Table of Contents
1. [Environment Setup](#1-environment-setup)
2. [Backend Testing](#2-backend-testing)
3. [Frontend Unit Testing](#3-frontend-unit-testing)
4. [Frontend E2E Testing](#4-frontend-e2e-testing)
5. [Results and Reports](#5-results-and-reports)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Environment Setup

### Step 1.1: Check Dependencies
```bash
# Check Node.js version (requires >= 16)
node --version

# Check npm version
npm --version
```

### Step 1.2: Install Backend Dependencies
```bash
cd Backend_system
npm install
```

### Step 1.3: Install Frontend Dependencies
```bash
cd Frontend_system/chat-system-frontend
npm install
```

### Step 1.4: Database Setup (MongoDB)
```bash
# Ensure MongoDB is running
# Create test database
mongosh
> use chat-system-test
> exit
```

---

## 2. Backend Testing

### Step 2.1: Run All Backend Tests
```bash
cd Backend_system
npm test
```

**Expected Results:**
```
✅ PASS src/__tests__/routes/auth.test.ts
✅ PASS src/__tests__/routes/users.test.ts
✅ PASS src/__tests__/routes/groups.test.ts
✅ PASS src/__tests__/routes/channels.test.ts
✅ PASS src/__tests__/routes/messages.test.ts
```

### Step 2.2: Run Tests by Category
```bash
# Test routes only
npm run test:routes

# Test services only
npm run test:services

# Test with coverage report
npm run test:coverage
```

### Step 2.3: View Coverage Report
```bash
# After running test:coverage
# Open file: Backend_system/coverage/lcov-report/index.html
```

---

## 3. Frontend Unit Testing

### Step 3.1: Run All Unit Tests
```bash
cd Frontend_system/chat-system-frontend
npm test
```

**Expected Results:**
```
✅ Browser: Chrome
✅ Tests: 45 passed
✅ Coverage: 85%
```

### Step 3.2: Run Tests by Component
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

### Step 3.3: Run with Coverage
```bash
npm run test:coverage
```

---

## 4. Frontend E2E Testing

### Step 4.1: Open Cypress Test Runner
```bash
cd Frontend_system/chat-system-frontend
npm run e2e
```

**Cypress UI will open in browser:**
- Select test file from the list
- Click on test to run
- View real-time results

### Step 4.2: Run E2E Tests in Headless Mode
```bash
# Run all E2E tests
npm run e2e:run

# Run in CI mode
npm run e2e:ci
```

### Step 4.3: Run Specific Tests
```bash
# Run auth tests
npx cypress run --spec "cypress/e2e/auth.cy.ts"

# Run chat tests
npx cypress run --spec "cypress/e2e/chat.cy.ts"
```

---

## 5. Results and Reports

### Backend Test Results:
```
📁 Backend_system/coverage/
├── lcov-report/
│   ├── index.html          # Coverage overview
│   ├── base.css
│   └── ...
├── lcov.info              # Coverage data
└── clover.xml             # Coverage XML
```

### Frontend Test Results:
```
📁 Frontend_system/chat-system-frontend/
├── coverage/              # Unit test coverage
├── cypress/
│   ├── screenshots/       # E2E test screenshots
│   ├── videos/           # E2E test videos
│   └── downloads/        # Downloaded files
```

---

## 6. Troubleshooting

### Backend Test Issues:

**Problem 1: Database connection error**
```bash
# Solution: Check MongoDB
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
# Solution: Create .env.test file
cd Backend_system
copy .env .env.test
```

### Frontend Test Issues:

**Problem 1: Unit tests failing**
```bash
# Solution: Clear cache and reinstall
npm cache clean --force
rm -rf node_modules
npm install
```

**Problem 2: Cypress won't open**
```bash
# Solution: Reinstall Cypress
npm uninstall cypress
npm install --save-dev cypress
npx cypress install
```

**Problem 3: E2E tests timeout**
```bash
# Solution: Increase timeout in cypress.config.ts
defaultCommandTimeout: 15000
requestTimeout: 15000
```

---

## Quick Commands Summary

### Backend:
```bash
cd Backend_system
npm test                    # All tests
npm run test:routes         # Routes only
npm run test:coverage       # With coverage
npm run test:watch          # Watch mode
```

### Frontend:
```bash
cd Frontend_system/chat-system-frontend
npm test                    # Unit tests
npm run e2e                 # Open Cypress UI
npm run e2e:run             # E2E headless
npm run test:coverage       # Unit test coverage
```

### All Tests:
```bash
# Use the created script
run-tests.bat
```

---

## Expected Results

### Backend Tests:
- ✅ 8 test suites passed (3 skipped)
- ✅ 144 individual tests passed (34 skipped)
- ✅ 86.5% code coverage

### Frontend Unit Tests:
- ✅ 25+ test suites passed
- ✅ 100+ individual tests passed
- ✅ 75%+ code coverage

### Frontend E2E Tests:
- ✅ Auth flow tests passed
- ✅ Chat functionality tests passed
- ✅ Video call tests passed
- ✅ Admin panel tests passed

---

## Test Architecture Overview

### Testing Pyramid
```
                    E2E Tests (Cypress)
                   ┌─────────────────────┐
                   │ • Full User Journey │
                   │ • Cross-browser     │
                   │ • Integration       │
                   └─────────────────────┘

            Integration Tests (Jest)
           ┌─────────────────────────────┐
           │ • API Route Testing        │
           │ • Database Integration     │
           │ • Middleware Testing       │
           │ • Service Integration      │
           └─────────────────────────────┘

        Unit Tests (Jest + Karma)
       ┌─────────────────────────────────┐
       │ • Service Functions            │
       │ • Component Logic              │
       │ • Utility Functions            │
       │ • Controller Methods           │
       └─────────────────────────────────┘
```

### Test Categories

**Backend Test Suites:**
- Authentication Tests (15 tests)
- Message System Tests (15 tests)
- User Management Tests (18 tests)
- Channel Management Tests (23 tests)
- Group Management Tests (6 tests)
- Admin Panel Tests (16 tests)
- Video Call Tests (17 tests)
- Client API Tests (22 tests)
- Upload Tests (20 tests - skipped)
- Integration Tests (6 tests - skipped)

**Frontend Test Suites:**
- Component Unit Tests
- Service Unit Tests
- Integration Tests
- E2E User Journey Tests

---

## Best Practices

### Writing Tests
1. **Test Naming**: Use descriptive names that explain what is being tested
2. **Test Structure**: Follow AAA pattern (Arrange, Act, Assert)
3. **Test Isolation**: Each test should be independent
4. **Mocking**: Mock external dependencies appropriately
5. **Coverage**: Aim for meaningful coverage, not just high percentages

### Running Tests
1. **Before Committing**: Always run tests before pushing code
2. **CI/CD Integration**: Use automated testing in pipelines
3. **Parallel Execution**: Run tests in parallel for faster feedback
4. **Watch Mode**: Use watch mode during development

### Debugging Tests
1. **Console Logging**: Add temporary logs to understand test flow
2. **Test Isolation**: Run individual tests to isolate issues
3. **Mock Verification**: Check if mocks are being called correctly
4. **Environment Setup**: Ensure test environment matches production

---

## Continuous Integration

### GitHub Actions Example
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd Backend_system && npm ci
      - run: cd Backend_system && npm test
      
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd Frontend_system/chat-system-frontend && npm ci
      - run: cd Frontend_system/chat-system-frontend && npm test
```

---

**Last Updated**: October 7, 2025  
**Version**: 2.0.0  
**Author**: David Nguyen