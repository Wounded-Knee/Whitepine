# Shared Configuration System

This directory contains configuration files that are shared between the frontend (Next.js) and backend (Express.js) applications.

## Structure

```
shared/
├── config.js          # Main shared configuration with environment support
└── README.md          # This documentation
```

## Usage

### Frontend (Next.js)

```typescript
import { useConfig } from '@/app/hooks/useConfig';

const MyComponent = () => {
  const { appName, primaryColor, isOAuthEnabled } = useConfig();
  
  return (
    <div style={{ color: primaryColor }}>
      <h1>{appName}</h1>
      {isOAuthEnabled && <OAuthButton />}
    </div>
  );
};
```

### Backend (Express.js)

```javascript
const { sharedConfig } = require('../../shared/config.js');

// Use shared values
const tokenExpiry = sharedConfig.auth.tokenExpiry;
const defaultScopes = sharedConfig.auth.defaultScopes;
```

## Configuration Categories

### API Configuration
- Base URL and version
- Request timeout settings
- Endpoint configurations

### Authentication
- Token expiration times
- Cookie settings
- Default user scopes
- OAuth configuration

### Application Settings
- App name and version
- Environment detection
- Feature flags

### UI Configuration
- Theme colors (Federal Standard palette)
- Pagination settings
- Component defaults

## Environment Support

The configuration automatically adapts based on the environment:

- **Development**: Uses localhost URLs, debug mode enabled, verbose logging
- **Staging**: Uses staging URLs, debug mode disabled, production-like settings
- **Production**: Uses production URLs, optimized settings, secure configurations

### Environment Helper Functions

```javascript
const { isProduction, isDevelopment, isStaging, getEnvironmentConfig } = require('../../shared/config.js');

// Check current environment
if (isProduction()) {
  // Production-specific logic
}

// Get specific environment config
const stagingConfig = getEnvironmentConfig('staging');
```

## Adding New Configuration

1. **Add to shared config** (`shared/config.js`):
   ```typescript
   export interface SharedConfig {
     // ... existing config
     newFeature: {
       enabled: boolean;
       settings: string[];
     };
   }
   ```

2. **Update default config**:
   ```typescript
   const defaultConfig: SharedConfig = {
     // ... existing config
     newFeature: {
       enabled: true,
       settings: ['option1', 'option2'],
     },
   };
   ```

3. **Use in frontend**:
   ```typescript
   const { config } = useConfig();
   const isNewFeatureEnabled = config.newFeature.enabled;
   ```

4. **Use in backend**:
   ```javascript
   const { sharedConfig } = require('../../shared/config.js');
   const newFeatureSettings = sharedConfig.newFeature.settings;
   ```

## Best Practices

1. **Keep it simple**: Only share configuration that both frontend and backend need
2. **Type safety**: Use TypeScript interfaces for better type checking
3. **Environment awareness**: Make configuration environment-aware
4. **Documentation**: Document all configuration options
5. **Validation**: Add runtime validation for critical settings

## Security Considerations

- Never include secrets in shared config
- Use environment variables for sensitive data
- Validate configuration values at startup
- Keep production and development configs separate

## Migration from Existing Config

To migrate existing configuration files:

1. **Identify shared values**: Look for duplicated configuration between frontend and backend
2. **Move to shared config**: Add shared values to `shared/config.js`
3. **Update imports**: Replace hardcoded values with shared config imports
4. **Test thoroughly**: Ensure both applications work with shared config
5. **Remove duplicates**: Clean up old configuration files

## Examples

### Feature Flags
```typescript
// In shared/config.js
features: {
  oauth: true,
  governmentData: true,
}

// In frontend
const { isOAuthEnabled } = useConfig();
{isOAuthEnabled && <OAuthButton />}

// In backend
const { sharedConfig } = require('../../shared/config.js');
if (sharedConfig.features.oauth) {
  // Enable OAuth routes
}
```

### API URLs
```typescript
// In shared/config.js
api: {
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  version: 'v1',
}

// In frontend
const { getApiUrl } = useConfig();
const usersUrl = getApiUrl('/users');

// In backend
const { sharedConfig } = require('../../shared/config.js');
const apiVersion = sharedConfig.api.version;
```
