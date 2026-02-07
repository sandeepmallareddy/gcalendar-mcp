# Contributing to gcalendar-mcp

Thank you for your interest in contributing! This document outlines the process for contributing to this project.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- A Google account (for testing with Google Calendar API)

### Development Setup

1. **Fork the repository**

   Click the "Fork" button on GitHub to create your own copy of the repository.

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR-USERNAME/gcalendar-mcp.git
   cd gcalendar-mcp
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/sandeepmallareddy/gcalendar-mcp.git
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running the Server

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build

# Run built server
node build/index.js
```

### Testing

```bash
# Run all tests
npm test

# Run tests with watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Type Checking

```bash
# Type check the code
npm run typecheck

# Or use the combined check
npm run check
```

### Code Style

```bash
# Format code with Prettier
npm run format

# Lint code
npm run lint
```

## Submitting Changes

### 1. Keep Your Fork Updated

Before making changes, ensure your fork is up to date:

```bash
git fetch upstream
git merge upstream/main
```

### 2. Make Your Changes

Make your changes to the code. Ensure:
- Tests pass
- Code is properly formatted
- No new linting errors are introduced

### 3. Commit Your Changes

Write a clear commit message following [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new tool for batch event creation
fix: resolve token refresh issue on expiry
docs: update installation instructions
```

### 4. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 5. Create a Pull Request

1. Go to the [original repository](https://github.com/sandeepmallareddy/gcalendar-mcp)
2. Click "New Pull Request"
3. Select your fork and branch
4. Fill in the PR template
5. Submit the PR

## Pull Request Guidelines

- **One focus per PR**: Keep pull requests focused on a single feature or fix
- **Include tests**: Add or update tests for your changes
- **Update documentation**: Update the README or other docs if needed
- **Follow code style**: Use the existing code style (enforced by linting)
- **Link issues**: Reference any related issues in your PR

## Reporting Bugs

When reporting bugs, please include:

1. **Description**: Clear description of the bug
2. **Steps to reproduce**: Detailed steps to reproduce the issue
3. **Expected behavior**: What you expected to happen
4. **Actual behavior**: What actually happened
5. **Environment**:
   - Node.js version (`node --version`)
   - Operating system
   - Any relevant logs

## Suggesting Features

For feature suggestions, please include:

1. **Problem**: The problem you're trying to solve
2. **Proposed solution**: Your idea for solving it
3. **Alternatives**: Any alternative solutions you considered
4. **Use cases**: Who would benefit from this feature

## Code of Conduct

Please note that this project is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Questions?

If you have questions, feel free to:
- Open an issue for discussion
- Ask in the PR comments
