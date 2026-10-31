# Job Tracker – manual workflows, dashboard sync and email tracking

## What was updated
- Manual application create/edit/delete uses the authenticated `/api/applications` API and persists records in PostgreSQL.
- Application form supports status edits; dashboard statistics refresh every 30 seconds and when the browser regains focus.
- Interview form now selects a real saved application instead of asking the user to remember an application ID. Interview API responses are flattened and include the company, role, date/time, status and meeting link.
- Interview meeting links are persisted in the `interviews` table. With `spring.jpa.hibernate.ddl-auto=update`, Hibernate adds the column on startup.
- Manual reminders are available from the Reminders page and saved to the database. Reminder email delivery requires SMTP settings.
- Automatic inbox tracking is already implemented in `AutomaticStatusTrackingService`; it is disabled until Gmail IMAP credentials are supplied.
- Dashboard's Selected count includes both `SELECTED` and `OFFER` statuses.

## Run locally (Windows / VS Code)

### Backend
1. Start PostgreSQL and ensure database `job_tracker_db` exists.
2. Open `job-tracker-backend` in the VS Code terminal.
3. Set the environment variables below in that terminal, then run `.\mvnw.cmd spring-boot:run`.

Example PowerShell (use your own values; do not commit passwords):
```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/job_tracker_db"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="YOUR_POSTGRES_PASSWORD"
$env:MAIL_ENABLED="true"
$env:MAIL_USERNAME="your.address@gmail.com"
$env:MAIL_PASSWORD="YOUR_16_CHARACTER_GOOGLE_APP_PASSWORD"
$env:MAIL_TRACKING_ENABLED="true"
$env:MAIL_TRACKING_USERNAME="your.address@gmail.com"
$env:MAIL_TRACKING_PASSWORD="YOUR_16_CHARACTER_GOOGLE_APP_PASSWORD"
$env:MAIL_TRACKING_OWNER_EMAIL="the-same-email-used-to-sign-in-to-job-tracker"
.\mvnw.cmd spring-boot:run
```
For Gmail, enable 2-Step Verification and create a Google App Password. Use that app password, not your normal Gmail password. Enable IMAP in Gmail settings if required. `MAIL_TRACKING_OWNER_EMAIL` must match the email address on the Job Tracker user account, otherwise messages will not be associated with that user's records. Never share or commit credentials.

### Frontend
Open a second terminal in `job-tracker-frontend`:
```powershell
npm install
npm run dev
```
Open the Vite URL shown in the terminal (normally `http://localhost:5173`). Sign in, then add applications, schedule interviews, and create reminders.

## How to use
- **Applications:** click **Add Application**, save the company and role, and use the application's Edit page to manually update its status/details.
- **Interviews:** open Interviews, select an existing application from the dropdown, enter date/time and details, and save.
- **Reminders:** open Reminders, select an application, choose a future date/time, and save. Use the test-email button to verify SMTP before relying on reminders.
- **Dashboard:** open Dashboard or refresh the page. Counts refresh automatically about every 30 seconds.
- **Email tracking:** the backend checks recent Gmail inbox messages on the configured polling interval. It can detect supported recruiting emails and update matching applications; it cannot guarantee every company's email wording will be recognized. Verify important status changes manually.

## Troubleshooting
- If the dashboard is empty, confirm you are signed in as the same user who created the records and that `GET http://localhost:8080/api/applications` works with your authenticated session.
- If manual saves fail, inspect the Spring Boot terminal for validation/database errors and confirm PostgreSQL is running.
- If interviews do not display, restart the backend after updating the code and let Hibernate update the schema.
- Email tracking is intentionally off unless `MAIL_TRACKING_ENABLED=true` and valid IMAP credentials are configured.
- Scheduled reminders only send while the backend is running and SMTP is configured.
