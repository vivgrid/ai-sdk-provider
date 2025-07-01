# Contributing to Vivgrid Vercel AI SDK Provider

Thank you for your interest in contributing to the Vivgrid Vercel AI SDK Provider! This guide will help you set up your development environment and understand our contribution process.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **pnpm** 8.x or higher (recommended package manager)
- **Git** for version control
- A **Vivgrid API key** (get one from [vivgrid.com](https://www.vivgrid.com/))

### Development Setup

1. **Fork and Clone the Repository**

   ```bash
   git clone https://github.com/your-username/vercel-ai-sdk-provider.git
   cd vercel-ai-sdk-provider
   ```

2. **Install Dependencies**

   ```bash
   pnpm install
   ```

3. **Set Up Environment Variables**

   ```bash
   # Create a .env file in the project root
   echo "VIVGRID_API_KEY=your-api-key-here" > .env
   ```

4. **Start Development Mode**

   ```bash
   pnpm dev
   ```

5. **Verify Setup**

   ```bash
   # Build the project
   pnpm build

   # Run the example
   node examples/basic-usage.ts
   ```

## 📝 Code Standards

### TypeScript Configuration

- We use **TypeScript 5.8+** with strict type checking
- All code must pass type checking: `pnpm type-check`
- Use explicit types when inference isn't clear
- Prefer `interface` over `type` for object definitions

### Code Style (Biome)

We use [Biome](https://biomejs.dev/) for linting and formatting:

```bash
# Check and fix formatting/linting issues
pnpm check

# Check only (without fixing)
pnpm lint:check
pnpm format:check
```

**Key style rules:**

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Line width**: 100 characters
- **Semicolons**: As needed (ASI-safe)
- **Trailing commas**: Always in multiline

### Project Structure

```
src/
├── index.ts                           # Main exports
├── vivgrid-chat-language-model.ts     # Core model implementation
├── vivgrid-chat-settings.ts          # Model configuration
├── convert-to-vivgrid-chat-messages.ts # Message conversion
└── map-openai-finish-reason.ts       # Response mapping

examples/
└── basic-usage.ts                     # Usage examples

tests/                                 # Test files (to be added)
└── ...
```

## 🧪 Testing and Verification

### Current Testing Approach

Currently, we use **example-based verification** instead of a formal testing framework. All validation is done through the examples in the `examples/` directory.

### Running Examples for Verification

**Basic verification:**

```bash
# Build the project first
pnpm build

# Run the main example
node examples/basic-usage.ts
```

**Environment setup for testing:**

```bash
# Set up your API key
export VIVGRID_API_KEY=your-api-key

# Or create a .env file
echo "VIVGRID_API_KEY=your-api-key" > .env
```

### Manual Testing Checklist

When making changes, verify these core functionalities work:

1. **✅ Basic Text Generation**

   ```bash
   # Should generate coherent text without errors
   node examples/basic-usage.ts
   ```

2. **✅ Streaming Text Generation**

   - Verify streaming output appears progressively
   - Check for proper stream termination

3. **✅ Object Generation**

   - Confirm structured JSON output
   - Validate schema compliance

4. **✅ Tool Calling**
   - Test function execution
   - Verify tool results integration

### Creating Additional Examples

To test specific functionality, create focused example files:

```typescript
// examples/test-your-feature.ts
import { vivgrid } from "../dist/index.js";
import { generateText } from "ai";

async function testYourFeature() {
  try {
    const result = await generateText({
      model: vivgrid(),
      prompt: "Test your specific feature here",
    });
    console.log("✅ Feature test passed:", result.text);
  } catch (error) {
    console.error("❌ Feature test failed:", error);
    process.exit(1);
  }
}

testYourFeature();
```

### Testing Different Configurations

**Test with custom configuration:**

```typescript
import { createVivgrid } from "../dist/index.js";

const customVivgrid = createVivgrid({
  apiKey: process.env.VIVGRID_API_KEY,
  baseURL: "https://api.vivgrid.com/v1",
  headers: {
    "X-Test": "true",
  },
});
```

**Test error handling:**

```typescript
// Test with invalid API key
const testErrorHandling = createVivgrid({
  apiKey: "invalid-key",
});
```

### Future Testing Framework (Optional)

If you'd like to contribute a formal testing framework, we recommend:

```bash
# Suggested test dependencies for future implementation
pnpm add -D vitest @vitest/ui @types/node
pnpm add -D msw # For API mocking
pnpm add -D dotenv-cli # For test environment management
```

### Verification Before Contributing

Before submitting changes, ensure:

- [ ] `pnpm build` completes without errors
- [ ] `examples/basic-usage.ts` runs successfully
- [ ] All example functions execute without exceptions
- [ ] API responses are properly formatted
- [ ] Error cases are handled gracefully

## 🔧 Development Workflow

### Branch Strategy

- **`main`**: Production-ready code
- **`develop`**: Integration branch for new features
- **Feature branches**: `feature/description` or `feat/description`
- **Bug fixes**: `fix/description` or `bugfix/description`
- **Documentation**: `docs/description`

### Making Changes

1. **Create a Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**

   - Write clean, well-documented code
   - Follow the existing code patterns
   - Add/update tests as needed
   - Update documentation if applicable

3. **Test Your Changes**

   ```bash
   # Run all checks
   pnpm check          # Lint and format
   pnpm type-check     # TypeScript checking
   pnpm build          # Build the project

   # Verify through examples
   node examples/basic-usage.ts

   # Test specific functionality if you added new features
   # Create additional example files as needed
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

### Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```
feat: add support for custom headers
fix: handle network timeout errors
docs: update API documentation
test: add unit tests for message conversion
```

## 🚀 Building and Publishing

### Build Process

```bash
# Clean previous builds
pnpm clean

# Run all checks
pnpm check

# Build for production
pnpm build
```

### Pre-publish Checklist

Before publishing, ensure:

- [ ] All examples run successfully
- [ ] Code is properly formatted (`pnpm check`)
- [ ] TypeScript types are correct (`pnpm type-check`)
- [ ] Core functionality verified through examples
- [ ] Documentation is updated
- [ ] Version is bumped appropriately

### Release Process

1. **Version Bump**

   ```bash
   # Update version in package.json
   npm version patch|minor|major
   ```

2. **Verify Build**

   ```bash
   pnpm prepublishOnly
   ```

3. **Create Release PR**

   - Create PR with version bump
   - Include changelog updates
   - Get approval from maintainers

4. **Publish** (Maintainers only)
   ```bash
   pnpm publish
   ```

## 🐛 Debugging and Troubleshooting

### Local Development Issues

**Build Errors:**

```bash
# Clear cache and rebuild
pnpm clean
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

**Type Errors:**

```bash
# Check TypeScript configuration
pnpm type-check

# Verify dependencies
pnpm audit
```

### API Integration Testing

**Testing with Real API:**

```bash
# Set up test environment
export VIVGRID_API_KEY=your-test-key
export NODE_ENV=development

# Run examples
node examples/basic-usage.ts
```

**Debugging API Calls:**

```typescript
// Add debug logging
const vivgrid = createVivgrid({
  apiKey: process.env.VIVGRID_API_KEY,
  // Add custom headers for debugging
  headers: {
    "X-Debug": "true",
  },
});
```

### Common Issues

1. **"API key not found" error**

   - Ensure `VIVGRID_API_KEY` is set in your environment
   - Check if `.env` file is in the project root

2. **Build fails with type errors**

   - Run `pnpm type-check` to see detailed errors
   - Ensure all dependencies are properly installed

3. **Examples don't work**
   - Make sure the project is built: `pnpm build`
   - Check that your API key is valid

## 📋 Pull Request Process

### Before Submitting

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our code standards
3. **Test thoroughly** - ensure all examples run successfully and new functionality is demonstrated
4. **Update documentation** if you're changing APIs
5. **Run the full check suite**:
   ```bash
   pnpm check && pnpm type-check && pnpm build
   ```

### PR Requirements

- **Clear title** following conventional commit format
- **Detailed description** explaining what and why
- **Link to related issues** if applicable
- **Screenshots/examples** for UI changes
- **Breaking changes** clearly marked

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Examples run successfully
- [ ] New functionality demonstrated in examples
- [ ] All core features verified manually
- [ ] Error cases handled properly
- [ ] All checks pass (`pnpm check && pnpm type-check && pnpm build`)

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or marked as such)
```

## 🐛 Bug Reports

### Before Reporting

1. **Check existing issues** - your bug might already be reported
2. **Use the latest version** - the bug might be fixed
3. **Test with minimal reproduction** - isolate the problem

### Bug Report Template

```markdown
**Bug Description**
Clear description of the bug

**To Reproduce**
Steps to reproduce the behavior:

1. Go to '...'
2. Click on '....'
3. See error

**Expected Behavior**
What you expected to happen

**Environment**

- OS: [e.g. macOS 14.0]
- Node.js version: [e.g. 18.17.0]
- Package version: [e.g. 0.1.0]

**Additional Context**
Add any other context about the problem here
```

## 💡 Feature Requests

### Before Requesting

1. **Check existing issues** and discussions
2. **Consider the scope** - is it within the project's goals?
3. **Think about implementation** - how would it work?

### Feature Request Template

```markdown
**Feature Description**
Clear description of what you want to happen

**Problem Statement**
What problem does this solve?

**Proposed Solution**
How you'd like it to work

**Alternatives Considered**
Other solutions you've considered

**Additional Context**
Any other context or screenshots
```

## 🔒 Security Issues

For security vulnerabilities, please **DO NOT** open a public issue. Instead:

1. **Email us directly** at security@vivgrid.com
2. **Include full details** of the vulnerability
3. **Allow time for response** - we aim to respond within 48 hours

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and community chat
- **Documentation**: Check our [README](README.md) first
- **Vivgrid Support**: Visit [vivgrid.com](https://www.vivgrid.com/) for platform-specific help

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the same [MIT License](LICENSE) that covers the project.

---

**Thank you for contributing to Vivgrid Vercel AI SDK Provider!** 🎉

Your contributions help make AI more accessible to developers worldwide.
