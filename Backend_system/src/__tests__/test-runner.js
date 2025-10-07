#!/usr/bin/env node

/**
 * Test Runner Script for Chat System Backend
 * 
 * This script provides comprehensive testing capabilities for all API routes
 * and services in the chat system backend.
 * 
 * Usage:
 *   npm run test                    # Run all tests
 *   npm run test:routes             # Run only route tests
 *   npm run test:services           # Run only service tests
 *   npm run test:coverage           # Run tests with coverage
 *   npm run test:watch              # Run tests in watch mode
 *   npm run test:ci                 # Run tests for CI/CD
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

interface TestConfig {
    name: string;
    pattern: string;
    description: string;
}

const TEST_CONFIGS: TestConfig[] = [
    {
        name: 'auth',
        pattern: '**/auth.test.ts',
        description: 'Authentication routes tests'
    },
    {
        name: 'admin',
        pattern: '**/admin.test.ts',
        description: 'Admin routes tests'
    },
    {
        name: 'channels',
        pattern: '**/channels.test.ts',
        description: 'Channels routes tests'
    },
    {
        name: 'client',
        pattern: '**/client.test.ts',
        description: 'Client routes tests'
    },
    {
        name: 'groups',
        pattern: '**/groups.test.ts',
        description: 'Groups routes tests'
    },
    {
        name: 'messages',
        pattern: '**/messages.test.ts',
        description: 'Messages routes tests'
    },
    {
        name: 'upload',
        pattern: '**/upload.test.ts',
        description: 'Upload routes tests'
    },
    {
        name: 'users',
        pattern: '**/users.test.ts',
        description: 'Users routes tests'
    },
    {
        name: 'video-call',
        pattern: '**/video-call.test.ts',
        description: 'Video call routes tests'
    }
];

class TestRunner {
    private projectRoot: string;
    private testDir: string;

    constructor() {
        this.projectRoot = process.cwd();
        this.testDir = path.join(this.projectRoot, 'src', '__tests__');
    }

    /**
     * Run all tests
     */
    runAllTests(): void {
        console.log('🚀 Running all tests...\n');
        this.executeCommand('npm test');
    }

    /**
     * Run tests for specific route
     */
    runRouteTests(routeName?: string): void {
        if (routeName) {
            const config = TEST_CONFIGS.find(c => c.name === routeName);
            if (config) {
                console.log(`🧪 Running ${config.description}...\n`);
                this.executeCommand(`npm test -- --testPathPattern=${config.pattern}`);
            } else {
                console.error(`❌ Unknown route: ${routeName}`);
                console.log('Available routes:', TEST_CONFIGS.map(c => c.name).join(', '));
            }
        } else {
            console.log('🧪 Running all route tests...\n');
            this.executeCommand('npm test -- --testPathPattern="**/routes/**/*.test.ts"');
        }
    }

    /**
     * Run service tests
     */
    runServiceTests(): void {
        console.log('🔧 Running service tests...\n');
        this.executeCommand('npm test -- --testPathPattern="**/services/**/*.test.ts"');
    }

    /**
     * Run tests with coverage
     */
    runTestsWithCoverage(): void {
        console.log('📊 Running tests with coverage...\n');
        this.executeCommand('npm run test:coverage');
    }

    /**
     * Run tests in watch mode
     */
    runTestsWatch(): void {
        console.log('👀 Running tests in watch mode...\n');
        this.executeCommand('npm run test:watch');
    }

    /**
     * Run tests for CI/CD
     */
    runTestsCI(): void {
        console.log('🤖 Running tests for CI/CD...\n');
        this.executeCommand('npm run test:ci');
    }

    /**
     * Generate test report
     */
    generateTestReport(): void {
        console.log('📋 Generating test report...\n');
        
        const report = {
            timestamp: new Date().toISOString(),
            project: 'Chat System Backend',
            version: '2.0.0',
            testSuites: TEST_CONFIGS.map(config => ({
                name: config.name,
                description: config.description,
                pattern: config.pattern,
                status: this.checkTestFileExists(config.pattern) ? 'available' : 'missing'
            })),
            coverage: {
                target: '80%',
                current: 'TBD'
            }
        };

        const reportPath = path.join(this.testDir, 'test-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        console.log(`✅ Test report generated: ${reportPath}`);
        console.log('\nTest Suite Status:');
        report.testSuites.forEach(suite => {
            const status = suite.status === 'available' ? '✅' : '❌';
            console.log(`  ${status} ${suite.name}: ${suite.description}`);
        });
    }

    /**
     * Validate test setup
     */
    validateTestSetup(): void {
        console.log('🔍 Validating test setup...\n');

        const checks = [
            {
                name: 'Jest configuration',
                check: () => fs.existsSync(path.join(this.projectRoot, 'jest.config.js'))
            },
            {
                name: 'Test setup file',
                check: () => fs.existsSync(path.join(this.testDir, 'setup.ts'))
            },
            {
                name: 'Test utilities',
                check: () => fs.existsSync(path.join(this.testDir, 'utils', 'test-helpers.ts'))
            },
            {
                name: 'Package.json test scripts',
                check: () => {
                    const packageJson = JSON.parse(fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8'));
                    return packageJson.scripts && packageJson.scripts.test;
                }
            }
        ];

        let allPassed = true;
        checks.forEach(check => {
            const passed = check.check();
            const status = passed ? '✅' : '❌';
            console.log(`  ${status} ${check.name}`);
            if (!passed) allPassed = false;
        });

        if (allPassed) {
            console.log('\n🎉 All test setup checks passed!');
        } else {
            console.log('\n⚠️  Some test setup checks failed. Please review the configuration.');
        }
    }

    /**
     * Show help information
     */
    showHelp(): void {
        console.log(`
🧪 Chat System Backend Test Runner

Usage:
  node test-runner.js [command] [options]

Commands:
  all                    Run all tests
  routes [name]          Run route tests (optionally for specific route)
  services               Run service tests
  coverage               Run tests with coverage
  watch                  Run tests in watch mode
  ci                     Run tests for CI/CD
  report                 Generate test report
  validate               Validate test setup
  help                   Show this help

Available Routes:
${TEST_CONFIGS.map(c => `  ${c.name.padEnd(12)} - ${c.description}`).join('\n')}

Examples:
  node test-runner.js all
  node test-runner.js routes auth
  node test-runner.js coverage
  node test-runner.js report
        `);
    }

    /**
     * Execute command and handle output
     */
    private executeCommand(command: string): void {
        try {
            execSync(command, { 
                stdio: 'inherit',
                cwd: this.projectRoot
            });
        } catch (error) {
            console.error(`❌ Command failed: ${command}`);
            process.exit(1);
        }
    }

    /**
     * Check if test file exists
     */
    private checkTestFileExists(pattern: string): boolean {
        const testPath = path.join(this.testDir, 'routes', pattern.replace('**/', ''));
        return fs.existsSync(testPath);
    }
}

// Main execution
const args = process.argv.slice(2);
const command = args[0] || 'help';
const option = args[1];

const runner = new TestRunner();

switch (command) {
    case 'all':
        runner.runAllTests();
        break;
    case 'routes':
        runner.runRouteTests(option);
        break;
    case 'services':
        runner.runServiceTests();
        break;
    case 'coverage':
        runner.runTestsWithCoverage();
        break;
    case 'watch':
        runner.runTestsWatch();
        break;
    case 'ci':
        runner.runTestsCI();
        break;
    case 'report':
        runner.generateTestReport();
        break;
    case 'validate':
        runner.validateTestSetup();
        break;
    case 'help':
    default:
        runner.showHelp();
        break;
}
