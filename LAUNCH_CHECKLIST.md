# Aparna Aura launch checklist

## 1. Production environment

Set these values in the production platform's secret manager or environment configuration. Never commit `.env` files.

```env
DEBUG=False
SECRET_KEY=<new-long-random-django-secret>
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,api.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
FRONTEND_URL=https://yourdomain.com

DB_NAME=<production-database-name>
DB_USER=<production-database-user>
DB_PASSWORD=<unique-production-database-password>
DB_HOST=<production-database-host>
DB_PORT=5432

CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>

EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
DEFAULT_FROM_EMAIL=orders@yourdomain.com
EMAIL_HOST=<smtp-host>
EMAIL_PORT=587
EMAIL_HOST_USER=<smtp-user>
EMAIL_HOST_PASSWORD=<smtp-password-or-app-password>
EMAIL_USE_TLS=True

GOOGLE_OAUTH_CLIENT_ID=<client-id>.apps.googleusercontent.com
```

Use HTTPS for both frontend and API. Run `python manage.py check --deploy` in the production environment; do not launch until the security warnings caused by `DEBUG=True` are gone.

## 2. Razorpay: test mode to live mode

No frontend code change is required. The backend creates Razorpay orders and sends only the **public Key ID** to the browser; the Key Secret remains server-only.

1. Finish Razorpay KYC and switch the Razorpay Dashboard to **Live Mode**.
2. Generate new live API keys. Test keys and live keys are different.
3. In the production backend environment, set:

   ```env
   RAZORPAY_KEY_ID=rzp_live_...
   RAZORPAY_KEY_SECRET=<live-key-secret>
   RAZORPAY_WEBHOOK_SECRET=<unique-random-secret-of-32-or-more-characters>
   ```

4. In Razorpay Dashboard → Account & Settings → Payment Capture, enable automatic capture.
5. In Razorpay Dashboard → Webhooks, add this public HTTPS URL:

   ```text
   https://api.yourdomain.com/api/v1/payments/webhook/razorpay/
   ```

   Use exactly the same `RAZORPAY_WEBHOOK_SECRET` configured above and subscribe to `payment.captured` and `payment.failed`.
6. Deploy/restart the backend, then complete a small live payment and verify that Razorpay shows it as **Captured** and the local order becomes **confirmed**.

The implementation verifies checkout signatures server-side, rate-limits payment actions, keeps amounts server-calculated, and verifies signed Razorpay webhooks before it confirms an order.

## 3. Before opening the site

- Rotate every credential that was ever committed or shared in a screenshot/log.
- Use a managed PostgreSQL database with backups and a restricted database user.
- Configure HTTPS certificates and automatic renewal.
- Configure production DNS for the frontend, API, and Razorpay webhook.
- Build the frontend with the production API URL: `VITE_API_BASE_URL=https://api.yourdomain.com/api/v1`.
- Update Google OAuth authorised JavaScript origins to the exact production frontend URLs.
- Restrict Django Admin access: create a strong, unique admin password; enable MFA on the hosting, Cloudinary, Razorpay, email, and GitHub accounts.
- Monitor error logs and Razorpay Dashboard after launch.
