import crypto from 'node:crypto';
import process from 'node:process';

const getJwtSecret = () =>
  process.env.JWT_SECRET || 'playgrid-local-dev-secret-change-me';

const base64Url = (input) => Buffer.from(input).toString('base64url');

const sign = (payload, secret = getJwtSecret()) => {
  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64Url(JSON.stringify(payload));

  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
};

const verify = (token, secret = getJwtSecret()) => {
  const [header, body, signature] = String(token || '').split('.');

  if (!header || !body || !signature) {
    throw new Error('Invalid token');
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64url');

  if (
    !crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    )
  ) {
    throw new Error('Invalid token signature');
  }

  const payload = JSON.parse(
    Buffer.from(body, 'base64url').toString('utf8')
  );

  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }

  return payload;
};

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');

  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex');

  return `${salt}:${hash}`;
};

const verifyPassword = (password, passwordHash) => {
  const [salt, storedHash] = String(passwordHash || '').split(':');

  if (!salt || !storedHash) {
    return false;
  }

  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex');

  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(storedHash)
  );
};

export { sign, verify, hashPassword, verifyPassword };