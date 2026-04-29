const fs = require("fs");
const path = require("path");

function loadEnvFile() {
  const envFile = path.join(__dirname, ".env");
  const env = { NODE_ENV: "production" };

  try {
    if (fs.existsSync(envFile)) {
      const envContent = fs.readFileSync(envFile, "utf8");
      envContent.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const [key, ...valueParts] = trimmed.split("=");
          if (key && valueParts.length > 0) {
            let value = valueParts.join("=");
            value = value.replace(/^["']|["']$/g, "");
            env[key.trim()] = value;
          }
        }
      });
    }
  } catch (error) {
    console.warn("Could not load .env file:", error.message);
  }

  return env;
}

module.exports = {
  apps: [
    {
      name: "vortexbotvn",
      script: "./dist/main.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      cron_restart: "0 */6 * * *",
      // --unhandled-rejections=strict makes Node terminate on unhandled
      // promise rejections (e.g. Telegraf 409 polling crash) so pm2 restarts
      // a fresh polling loop instead of leaving a zombie process.
      node_args: "--unhandled-rejections=strict",
      env: loadEnvFile(),
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
    },
  ],
  deploy: {
    production: {
      user: "gwang",
      host: "bore.mated.dev",
      port: "22005",
      ref: "origin/main",
      repo: "https://github.com/gwang08/VortexBotVN.git",
      path: "/home/gwang/apps/vortexbotvn",
      "pre-deploy-local": "",
      "post-deploy":
        "source ~/.bashrc && source ~/.nvm/nvm.sh && nvm use 20 && npm ci && npm install --save-dev @swc/cli @swc/core && npx nest build --builder swc && pm2 reload ecosystem.config.js && pm2 save",
      "pre-setup": "mkdir -p /home/gwang/apps/vortexbotvn",
      ssh_options: "StrictHostKeyChecking=no",
    },
  },
};
