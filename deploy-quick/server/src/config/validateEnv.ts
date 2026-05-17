/**
 * Environment variable validation
 * Ensures all required environment variables are set before starting the server
 */

const requiredEnvVars = [
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
  'XAI_API_KEY',
  'META_APP_ID',
  'META_APP_SECRET',
  'TIKTOK_CLIENT_KEY',
  'TIKTOK_CLIENT_SECRET',
] as const;

const optionalEnvVars = [
  'XAI_MODEL',
  'META_REDIRECT_URI',
  'TIKTOK_REDIRECT_URI',
  'NODE_ENV',
  'PORT',
] as const;

export function validateEnvironment(): void {
  console.log('\n🔍 Validating environment variables...\n');

  const missing: string[] = [];
  const present: string[] = [];

  // Check required variables
  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      missing.push(key);
    } else {
      present.push(key);
    }
  }

  // Display results
  if (present.length > 0) {
    console.log('✅ Required variables set:');
    present.forEach(key => {
      const value = process.env[key]!;
      const displayValue = key.includes('SECRET') || key.includes('KEY') || key.includes('PASSWORD')
        ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
        : value;
      console.log(`   ✓ ${key}: ${displayValue}`);
    });
  }

  // Display optional variables
  console.log('\n📋 Optional variables:');
  for (const key of optionalEnvVars) {
    const value = process.env[key];
    if (value) {
      console.log(`   ✓ ${key}: ${value}`);
    } else {
      console.log(`   - ${key}: (not set, using default)`);
    }
  }

  // Exit if any required variables are missing
  if (missing.length > 0) {
    console.error('\n❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   ✗ ${key}`));
    console.error('\n💡 Please set these variables in your .env file');
    console.error('   See .env.example for reference\n');
    process.exit(1);
  }

  console.log('\n✅ All required environment variables are set\n');
}

/**
 * Get environment variable with fallback
 */
export function getEnv(key: string, fallback?: string): string {
  const value = process.env[key];
  if (!value && !fallback) {
    throw new Error(`Environment variable ${key} is not set and no fallback provided`);
  }
  return value || fallback!;
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return !isProduction();
}
