import 'dotenv/config';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name} (revisá tu archivo .env)`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  db: {
    host: requireEnv('DB_HOST'),
    port: Number(process.env.DB_PORT ?? 3306),
    name: requireEnv('DB_NAME'),
    user: requireEnv('DB_USER'),
    password: requireEnv('DB_PASSWORD'),
  },
  auth: {
    secret: requireEnv('BETTER_AUTH_SECRET'),
    origin: process.env.APP_ORIGIN ?? 'http://localhost:5173',
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_FROM_EMAIL,
  },
};
