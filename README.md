# White Pine

Modern Next.js monorepo with TypeScript, API, and deployment automation.

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd usa
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```
   This will automatically install git hooks that run tests before commits.

3. **Set up environment**
   ```bash
   cp env.template .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development**
   ```bash
   pnpm dev
   ```

## Git Hooks

This project includes a pre-commit hook that automatically runs tests before allowing commits.

### Usage

**Normal commits (with tests):**
```bash
git commit -m "Your commit message"
# Tests will run automatically, commit proceeds if all tests pass
```

**Bypass commits (skip tests):**
```bash
git commit --no-verify -m "Your commit message"
# Skips tests and commits immediately
```

### Manual Hook Installation

If hooks aren't installed automatically:
```bash
pnpm install-hooks
```

## Development

### Scripts

- `pnpm dev` - Start development servers (API + Web)
- `pnpm build` - Build all packages
- `pnpm test` - Run all tests
- `pnpm lint` - Run linting
- `pnpm typecheck` - Run TypeScript type checking

### Project Structure

```
usa/
├── apps/
│   ├── api/          # Express.js API server
│   ├── web/          # Next.js web application
│   └── ops/          # Operations and deployment scripts
├── packages/
│   ├── types/        # Shared TypeScript types
│   └── tsconfig/     # Shared TypeScript configurations
├── scripts/          # Utility scripts
└── docs/            # Documentation
```

## Testing

The project uses Vitest for testing with the following configuration:
- **API tests**: Node.js environment
- **Web tests**: jsdom environment
- **All tests**: Run automatically before commits

## Deployment

See `apps/ops/` for deployment scripts and configuration.

## Contributing

1. Make your changes
2. Tests will run automatically on commit
3. Use `--no-verify` only when necessary (documentation, config changes)
4. Ensure all tests pass before pushing

## License

ISC
