import crypto from "node:crypto";

/**
 * @param {string} initData - raw query string from Telegram.WebApp.initData
 * @param {string} botToken
 * @returns {Record<string, string> | null}
 */
export function validateInitData(initData, botToken) {
  if (!initData || typeof initData !== "string" || !botToken) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");

  const pairs = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = pairs.map(([k, v]) => `${k}=${v}`).join("\n");

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const hmac = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest();

  let hashBuf;
  try {
    hashBuf = Buffer.from(hash, "hex");
  } catch {
    return null;
  }
  if (hashBuf.length !== hmac.length || !crypto.timingSafeEqual(hashBuf, hmac)) {
    return null;
  }

  const authDate = Number(params.get("auth_date"));
  if (!Number.isFinite(authDate)) return null;
  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > 86400) return null;

  return Object.fromEntries(pairs);
}

/**
 * @param {Record<string, string>} data
 */
export function parseUser(data) {
  const raw = data.user;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
