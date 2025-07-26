module.exports = {
  apps: [
    {
      name: "dashboard",
      script: "npm",
      args: "start",
      cwd: "/var/www/dashboard", // Replace with actual project path
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,

      env_production: {
        NODE_ENV: "production",

        // ✅ MySQL DB connection
        DATABASE_URL: "mysql://iftin:Iftin651511my@178.16.131.114:3306/iftin",

        // ✅ Clerk keys for production
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_live_Y2xlcmsuZGFzaGJvYXJkLmlmdGluaG90ZWwuY29tJA",
        CLERK_SECRET_KEY: "sk_live_b5Fc3gJGCAXwY5kt0AdA3lO0zqsU3WAzmuzMWZyN96",
        NEXT_PUBLIC_CLERK_FRONTEND_API: "clerk.dashboard.iftinhotel.com", // ✅ Do NOT include https:// here!
        NEXT_PUBLIC_CLERK_SIGN_IN_URL: "/sign-in",
        NEXT_PUBLIC_CLERK_SIGN_UP_URL: "/sign-up",
        NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: "/",
        NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: "/",
        CLERK_WEBHOOK_SECRET: "whsec_UpgcSOVC1fwciIOgKmuPe9Kkvn38lPQm"
      }
    }
  ]
};
