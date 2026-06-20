/**
 * 외부 dotenv 패키지 없이 .env 파일을 간단히 읽는 유틸입니다.
 * 이미 환경변수에 값이 있으면 덮어쓰지 않습니다.
 */
const fs = require("fs");
const path = require("path");

function loadEnv(envPath = path.join(process.cwd(), ".env")) {
  if (!fs.existsSync(envPath)) return;

  const text = fs.readFileSync(envPath, "utf8");
  text.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) return;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
}

module.exports = { loadEnv };
