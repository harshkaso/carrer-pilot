# CareerPilot — Learning Log

This document records the technical concepts, implementation decisions, debugging experiences, mistakes, and lessons learned while building **CareerPilot — an AI Job Search & Interview Copilot**.

The purpose of this log is to:

* document the engineering decisions made during development;
* capture problems and their solutions;
* reinforce concepts for technical interviews;
* provide a record of how the application evolved from a basic vertical slice into a production-oriented full-stack application.

---

# Day 1 — Project Setup

## Goals

* Set up the Python backend using `uv`.
* Create the Django project.
* Set up the React + TypeScript frontend using Vite.
* Verify that both development environments work.
* Understand the role of the primary project configuration files.

## Implementation

### Django + uv

Created the Python backend:

```bash
uv init backend
cd backend
uv add django
```

Created the Django project in the current directory:

```bash
uv run django-admin startproject config .
```

The `.` prevents Django from creating an additional nested directory.

Applied Django's initial migrations:

```bash
uv run python manage.py migrate
```

Started the development server:

```bash
uv run python manage.py runserver
```

Verified the Django development server at:

```text
http://127.0.0.1:8000/
```

SQLite was intentionally used initially. PostgreSQL was introduced later once the basic Django project was verified.

### React + TypeScript + Vite

Created the frontend:

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

Started the development server:

```bash
npm run dev
```

Verified the frontend at:

```text
http://localhost:5173/
```

## Key Concepts

### `pyproject.toml`

The primary Python project configuration file.

It contains project metadata and Python dependencies.

### `uv.lock`

Locks the resolved Python dependency versions so the environment can be reproduced consistently.

### `.venv`

The project's isolated Python environment.

It prevents CareerPilot's dependencies from interfering with other Python projects.

It should not be committed to Git.

### `manage.py`

Django's project-specific command-line utility.

Examples:

```bash
uv run python manage.py migrate
uv run python manage.py runserver
uv run python manage.py startapp jobs
```

### React vs. Vite

React is responsible for building the UI.

Vite provides the development and build tooling around the React application.

Vite is therefore not a replacement for React.

### `package.json`

Defines frontend metadata, dependencies, and npm scripts.

### `package-lock.json`

Records resolved npm dependency versions.

### `node_modules`

Contains installed npm dependencies and should not be committed.

## Decisions

### SQLite for initial setup

SQLite was used only during initial Django setup.

The purpose of Day 1 was to verify the development environment before introducing PostgreSQL and additional infrastructure.

### Separate frontend and backend

CareerPilot uses a separate React frontend and Django backend rather than Django-rendered templates.

This matches the intended architecture:

```text
React + TypeScript
        ↓
Django REST Framework
        ↓
PostgreSQL
```

## Testing

Verified:

* Django project starts successfully.
* Django migrations execute successfully.
* Django development server loads.
* Vite frontend starts successfully.
* React application renders successfully.

## Problems / Fixes

No significant implementation problems occurred on Day 1.

The main objective was establishing a clean development environment before adding application functionality.

## Interview Takeaways

### What is `uv`?

`uv` is a Python package and project management tool used to create environments, manage dependencies, and execute commands within the project's environment.

### What is the difference between React and Vite?

React is the UI library.

Vite is the development/build tool that serves and bundles the React application.

### Why use a virtual environment?

A virtual environment isolates project dependencies and prevents dependency conflicts between Python projects.

## Files Changed

```text
backend/
├── pyproject.toml
├── uv.lock
├── manage.py
└── config/
    ├── settings.py
    ├── urls.py
    ├── asgi.py
    └── wsgi.py

frontend/
├── package.json
├── package-lock.json
├── vite.config.ts
└── src/
```

## Result

CareerPilot had a working Django backend and React + TypeScript frontend with independent development servers.

---

# Day 2 — Django Models, DRF & Frontend API Integration

## Goals

* Understand Django projects versus apps.
* Create Django models using the ORM.
* Understand relationships and migrations.
* Register models in Django Admin.
* Work with the Django Shell.
* Introduce Django REST Framework.
* Build serializers and generic API views.
* Connect React to the backend.
* Make real `GET` and `POST` requests.
* Build the first vertical slice of CareerPilot.

## Implementation

### Django Project vs. App

The Django project contains application-wide configuration:

```text
config/
├── settings.py
├── urls.py
├── wsgi.py
└── asgi.py
```

The `jobs` app contains the job-related domain logic:

```text
jobs/
├── admin.py
├── apps.py
├── models.py
├── serializers.py
├── views.py
└── urls.py
```

Created the app:

```bash
uv run python manage.py startapp jobs
```

Registered it in `INSTALLED_APPS`.

---

## Initial Domain Models

The initial domain model used:

```text
JobPosting
JobApplication
```

A `JobApplication` referenced a `JobPosting` through a foreign key.

The application status used Django `TextChoices`:

```python
class Status(models.TextChoices):
    SAVED = "saved", "Saved"
    APPLIED = "applied", "Applied"
    INTERVIEW = "interview", "Interview"
    OFFER = "offer", "Offer"
    REJECTED = "rejected", "Rejected"
```

### Relationship

```text
JobPosting
    │
    │ 1 → many
    ▼
JobApplication
```

One job posting can have multiple applications.

### `on_delete=models.CASCADE`

Deleting a job posting deletes its related applications.

Deleting an application does not delete the job posting.

This reflects the intended ownership relationship: a job posting is an independent entity, while an application depends on it.

---

## Migrations

Created migrations:

```bash
uv run python manage.py makemigrations
```

Applied them:

```bash
uv run python manage.py migrate
```

Checked migration state:

```bash
uv run python manage.py showmigrations
```

Migration workflow:

```text
models.py
    ↓
makemigrations
    ↓
migration file
    ↓
migrate
    ↓
database schema
```

## Django Admin

Registered the models in Django Admin to make it possible to inspect and modify records without building a custom management interface.

Created a superuser:

```bash
uv run python manage.py createsuperuser
```

Verified the admin interface at:

```text
http://127.0.0.1:8000/admin/
```

## Django Shell

Used the Django Shell to create and inspect test data:

```bash
uv run python manage.py shell
```

Tested:

* creating job postings;
* creating applications;
* counting records;
* querying related fields;
* checking application statuses.

Example:

```python
JobApplication.objects.values(
    "job_posting__title",
    "job_posting__company",
    "status",
)
```

## Django REST Framework

Installed DRF:

```bash
uv add djangorestframework
```

Added it to `INSTALLED_APPS`.

The architecture became:

```text
React + TypeScript
        ↓
HTTP / JSON
        ↓
Django REST Framework
        ↓
Serializer
        ↓
Django ORM
        ↓
Database
```

## Serializers

Created serializers for jobs and applications.

The application serializer initially nested the job posting:

```python
job_posting = JobPostingSerializer(read_only=True)
```

This allowed the API to return application information together with the associated job.

## Generic Views

Used DRF generic views:

```python
generics.ListAPIView
generics.ListCreateAPIView
```

The initial endpoints were:

```text
GET  /api/applications/
GET  /api/applications/?status=saved

GET  /api/job-postings/
POST /api/job-postings/
```

The application endpoint supported status filtering through a query parameter.

## `select_related`

Used:

```python
JobApplication.objects.select_related("job_posting")
```

because the API needed information from the related job posting.

This allows Django to retrieve the foreign-key relationship efficiently instead of unnecessarily querying the database for each related object.

## React API Integration

Created a frontend API module rather than placing `fetch()` calls directly inside components.

The architecture became:

```text
React Component
      ↓
Frontend API Module
      ↓
Django REST API
      ↓
Django ORM
      ↓
Database
```

Implemented:

```text
GET /api/applications/?status=saved
POST /api/job-postings/
```

## Vite Proxy

Configured Vite to proxy `/api` requests to Django:

```typescript
server: {
    proxy: {
        "/api": {
            target: "http://127.0.0.1:8000",
            changeOrigin: true,
        },
    },
},
```

This allows frontend code to use:

```typescript
fetch("/api/applications/")
```

instead of hardcoding the Django development server URL.

## Frontend

Built:

* saved applications page;
* job posting form;
* controlled form inputs;
* API abstraction;
* loading state;
* error state;
* successful POST handling.

## Decisions

### Thin vertical slice

The goal was not to implement complete CRUD immediately.

Instead, Day 2 focused on proving the complete path:

```text
React
 ↓
HTTP
 ↓
DRF
 ↓
Serializer
 ↓
Django ORM
 ↓
Database
```

This reduced the amount of simultaneous complexity.

### API calls separated from components

API logic was kept in dedicated modules so components remain responsible primarily for presentation and user interaction.

## Testing

Verified:

* migrations apply;
* models appear in Django Admin;
* test records can be created;
* application filtering works;
* nested job data is returned;
* `GET` requests work from React;
* `POST` requests create database records;
* created jobs appear in Django Admin/Shell.

## Problems / Fixes

The initial model/API naming was later identified as too verbose:

```text
JobPosting
JobApplication
```

The product domain was simplified to:

```text
Job
Application
```

This naming change was carried forward into later implementation.

## Interview Takeaways

### What does a Django model represent?

A Django model is a Python representation of a database entity and provides the ORM interface for querying and modifying that entity.

### What does a serializer do?

A DRF serializer handles serialization of Python/Django objects into API-friendly representations and validates/deserializes incoming data.

### Why use `select_related()`?

For foreign-key or one-to-one relationships, `select_related()` can retrieve related objects as part of the database query, reducing additional queries when those objects are accessed.

### Why separate API modules from React components?

It keeps network communication separate from UI logic, making components easier to test, reuse, and maintain.

## Files Changed

```text
backend/
└── jobs/
    ├── models.py
    ├── admin.py
    ├── serializers.py
    ├── views.py
    ├── urls.py
    └── migrations/

frontend/
└── src/
    ├── api/
    │   └── jobs.ts
    ├── components/
    │   └── JobPostingForm.tsx
    ├── pages/
    │   └── SavedApplicationsPage.tsx
    └── types/
        └── job.ts
```

## Result

CareerPilot had its first working full-stack vertical slice.

A user could retrieve saved applications from Django through React and create job postings through the frontend.

---

# Day 3 — PostgreSQL, Database Design & DRF CRUD

## Goals

* Replace the initial SQLite database with PostgreSQL.
* Run PostgreSQL using Docker.
* Understand relational database design independently of Django.
* Practice SQL fundamentals.
* Connect Django to PostgreSQL.
* Expand the API toward CRUD functionality.
* Understand the relationship between Django migrations and direct SQL.

## Implementation

### PostgreSQL with Docker

PostgreSQL was introduced as the primary application database.

Docker was used to avoid requiring PostgreSQL to be installed directly on the development machine.

The development architecture became:

```text
React
   ↓
Django / DRF
   ↓
PostgreSQL
```

Docker Compose manages the database container.

### Configuration Mistake

The PostgreSQL environment variable was initially written incorrectly:

```yaml
POSTGRESS_PASSWORD
```

The correct variable is:

```yaml
POSTGRES_PASSWORD
```

The issue reinforced the importance of checking official environment variable names when configuring infrastructure.

---

## Django PostgreSQL Connection

Django was configured to connect to the PostgreSQL container.

After changing the database configuration, migrations were applied:

```bash
uv run python manage.py migrate
```

The database schema was then verified directly through PostgreSQL.

---

## Independent SQL Practice

SQL exercises were performed independently of Django to strengthen understanding of the underlying relational database.

Topics included:

* `CREATE TABLE`;
* primary keys;
* foreign keys;
* unique constraints;
* indexes;
* joins;
* `GROUP BY`;
* `HAVING`;
* `DISTINCT ON`;
* window functions;
* normalization;
* transactions;
* ACID properties.

### Schema Design

The SQL exercise modeled:

```text
users
jobs
applications
```

with foreign-key relationships.

A typo was found in the application status constraint:

```sql
'rejectted'
```

and corrected to:

```sql
'rejected'
```

---

## Django ORM vs. Raw SQL

One important distinction learned on Day 3:

Django migrations and direct SQL are not competing approaches.

Django migrations are the application's **schema migration mechanism**.

Direct SQL exercises were used to understand what the database itself is doing.

Conceptually:

```text
Django Model
    ↓
Migration
    ↓
Database Schema
```

while SQL knowledge explains the underlying database operations.

---

## DRF CRUD

The API was expanded toward the CareerPilot job-management workflow.

The API architecture became:

```text
GET
POST
PATCH
DELETE
```

for job resources.

The job endpoints evolved toward:

```text
GET    /api/jobs/
POST   /api/jobs/
GET    /api/jobs/<id>/
PATCH  /api/jobs/<id>/
DELETE /api/jobs/<id>/
```

Application retrieval continued to support filtering:

```text
GET /api/applications/
GET /api/applications/?status=saved
```

## Naming Decision

The original names:

```text
JobPosting
JobApplication
job_posting
```

were simplified to:

```text
Job
Application
job
```

This better matches the language used throughout the product.

The generic view was also named:

```python
JobListView
```

rather than:

```python
JobListCreateView
```

because `ListCreateAPIView` already communicates that the view supports both operations.

## Decisions

### PostgreSQL instead of SQLite

PostgreSQL was selected because it better represents the production database environment CareerPilot is expected to use.

### SQL practice separately from Django

Raw SQL exercises were intentionally kept separate from the Django ORM implementation.

The goal was to understand both:

```text
Application-level abstraction
        ↓
Django ORM
```

and:

```text
Database-level concepts
        ↓
SQL
```

### Backend filtering

Application status filtering was kept on the backend:

```text
GET /api/applications/?status=applied
```

rather than retrieving every application and filtering only in React.

This provides a better foundation for:

* larger datasets;
* pagination;
* database-level filtering;
* composable API queries.

## Testing

Verified:

* PostgreSQL container starts;
* Django connects to PostgreSQL;
* migrations apply successfully;
* database tables exist;
* SQL queries work directly;
* job CRUD endpoints work;
* application status filtering works.

## Problems / Fixes

### PostgreSQL environment variable typo

Fixed:

```text
POSTGRESS_PASSWORD
```

to:

```text
POSTGRES_PASSWORD
```

### Status constraint typo

Fixed:

```text
rejectted
```

to:

```text
rejected
```

### Naming cleanup

Replaced the verbose domain names with:

```text
Job
Application
job
```

to keep the application API and codebase consistent.

## Interview Takeaways

### Why PostgreSQL?

PostgreSQL is a production-grade relational database with strong support for constraints, transactions, indexing, joins, and complex queries.

### What is normalization?

Normalization organizes relational data to reduce unnecessary duplication and update anomalies.

### What is the difference between `select_related()` and a normal query?

`select_related()` can use a SQL join to retrieve foreign-key/one-to-one related objects efficiently.

### Why filter at the database level?

Database filtering reduces unnecessary data transfer and allows the database to perform the filtering efficiently, especially as the dataset grows.

## Files Changed

```text
backend/
├── config/
│   └── settings.py
├── jobs/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
└── docker-compose.yml

frontend/
└── src/
    ├── api/
    ├── components/
    ├── pages/
    └── types/
```

## Result

CareerPilot moved from a basic SQLite prototype to a PostgreSQL-backed application with a more complete REST API and stronger understanding of the underlying relational database.

---

# Day 4 — React + TypeScript Job Management UI

## Goals

* Build the main job-management UI.
* Strengthen TypeScript usage.
* Create reusable React components.
* Separate UI, state, and API responsibilities.
* Support creating, editing, and deleting jobs.
* Add client-side validation.
* Prevent duplicate submissions.
* Build a responsive job dashboard.

## Implementation

### TypeScript Domain Types

Introduced explicit frontend domain types.

```typescript
export type JobStatus =
    | "saved"
    | "applied"
    | "interview"
    | "offer"
    | "rejected";
```

The `Job` interface represents the backend job resource.

The `Application` interface represents an application and its related job.

Using a union type for status prevents arbitrary strings from being used as application statuses.

---

## Reusable Components

Built:

```text
JobCard
JobForm
```

The responsibilities were intentionally separated.

```text
JobForm
    ↓
Form state
Validation
Form UI

JobCard
    ↓
Job display
Edit/delete actions

JobsPage
    ↓
UI state
Operation selection

useJobs
    ↓
Application state
Mutations

api/jobs.ts
    ↓
HTTP requests
```

This created a clear separation between presentation, state management, and networking.

---

## `useJobs()` Hook

Created a custom hook to centralize job state:

```text
jobs
loading
error
addJob
updateJob
deleteJob
reload
```

The hook handles:

* loading jobs;
* creating jobs;
* updating jobs;
* deleting jobs;
* updating local state after mutations;
* loading/error state.

`useCallback()` was used for mutation and loading functions where stable function references were useful.

---

## Add Job UX

The add form was intentionally not implemented as a permanent sidebar.

Instead:

```text
+ Add Job
     ↓
Temporary Job Card
     ↓
JobForm
```

The add button is disabled while the temporary form is open.

Cancelling removes only the temporary card.

A successful submission removes the temporary form and adds the created job to the dashboard.

---

## Edit Job UX

Editing an existing job replaces that card with the same reusable `JobForm`.

```text
JobCard
   ↓
Edit
   ↓
JobForm(mode="edit")
```

This avoids maintaining separate add and edit forms.

---

## Validation

Added frontend validation for job form inputs.

The UI also prevents duplicate submissions while an API request is running.

This avoids accidentally creating multiple identical records from repeated clicks.

## API Integration

The frontend API layer supports:

```text
GET
POST
PATCH
DELETE
```

for jobs.

The custom hook updates React state after successful mutations instead of requiring a full page reload.

## Responsive UI

The dashboard was implemented to work across desktop and mobile layouts.

## Decisions

### One reusable form

Add and edit operations use the same `JobForm`.

The operation is determined by the parent through props.

This prevents duplicated form logic.

### State ownership

State ownership was deliberately divided:

```text
JobForm
    → local form state

JobsPage / JobCard
    → UI operation state

useJobs
    → application state

api/jobs.ts
    → HTTP communication
```

### Backend as source of truth

The frontend updates local state only after the backend operation succeeds.

This prevents the UI from claiming a mutation succeeded when the server rejected it.

## Testing

Verified:

* jobs load from the backend;
* new jobs can be created;
* duplicate submission is prevented;
* existing jobs can be edited;
* jobs can be deleted;
* form validation works;
* cancelling an add form restores the dashboard;
* edit mode uses the existing job values;
* responsive layout works on desktop/mobile sizes.

## Problems / Fixes

A React/TypeScript rendering issue occurred around mapping data:

```text
Type 'void[]' is not assignable to type 'ReactNode'
```

The issue came from an arrow-function callback used in JSX that did not return the JSX element.

The fix was to ensure the `map()` callback returns the rendered element.

This reinforced an important React/JavaScript distinction:

```tsx
items.map((item) => (
    <Component />
))
```

returns elements, while:

```tsx
items.map((item) => {
    <Component />
})
```

returns `undefined` because the block body has no explicit `return`.

## Interview Takeaways

### Why use a custom hook?

A custom hook allows reusable stateful logic to be extracted from components without creating a separate component hierarchy.

### Controlled vs uncontrolled components

CareerPilot uses controlled inputs:

```text
React state
    ↕
input value
```

The input's value is controlled by React state.

### Why use TypeScript interfaces?

Interfaces provide compile-time contracts for data structures, improve editor support, catch mismatches early, and make refactoring safer.

### Why does React rerender?

A state update schedules a component rerender.

React then reconciles the new element tree and updates the necessary parts of the DOM rather than blindly replacing the entire DOM.

## Files Changed

```text
frontend/src/
├── api/
│   └── jobs.ts
├── components/
│   ├── JobCard.tsx
│   ├── JobForm.tsx
│   └── AddJobCard.tsx
├── hooks/
│   └── useJobs.ts
├── pages/
│   └── JobsPage.tsx
└── types/
    └── jobs.ts
```

## Result

CareerPilot gained a functional job-management dashboard supporting:

* loading jobs;
* creating jobs;
* editing jobs;
* deleting jobs;
* validation;
* duplicate-submission prevention;
* responsive UI.

The frontend architecture also became significantly more reusable and maintainable.

---

# Day 5 — Authentication, Authorization & Ownership

## Goals

* Understand authentication versus authorization.
* Add user registration.
* Add login and logout.
* Protect the job API.
* Associate jobs with users.
* Ensure users can only access their own data.
* Protect application data.
* Connect authentication state to React.
* Verify security boundaries manually.

## Implementation

### Authentication

Added Django REST Framework token authentication.

Enabled:

```text
rest_framework.authtoken
```

Configured DRF to use:

```python
TokenAuthentication
```

Authentication endpoints:

```text
POST /api/auth/register/
POST /api/auth/login/
POST /api/auth/logout/
```

---

## Registration

Created a registration serializer using Django's built-in `User` model.

User passwords are created using:

```python
User.objects.create_user(...)
```

rather than directly creating a `User` object.

This ensures Django hashes the password instead of storing the raw password.

Registration returns non-sensitive user information.

The password is never returned in the API response.

---

## Login

Login authenticates the supplied username and password.

A token is created or retrieved:

```python
Token.objects.get_or_create(user=user)
```

The API returns:

```json
{
    "token": "...",
    "user": {
        "id": 1,
        "username": "...",
        "email": "..."
    }
}
```

---

## Logout

Authenticated users can invalidate their token by deleting the authentication token.

The logout endpoint requires:

```python
IsAuthenticated
```

---

# Authorization and Data Ownership

Authentication answers:

> Who are you?

Authorization answers:

> What are you allowed to access?

For CareerPilot, every user's jobs and applications must be isolated from other users.

## Job Ownership

The `Job` model was updated to include an explicit user relationship:

```python
user = models.ForeignKey(
    User,
    on_delete=models.CASCADE,
    related_name="jobs",
)
```

The intended structure is:

```text
User
 ├── jobs
 │    └── Job
 │
 └── applications
      └── Application
```

## Application Ownership

`Application` also has a direct user relationship:

```python
user = models.ForeignKey(
    User,
    on_delete=models.CASCADE,
    related_name="applications",
)
```

It also references its job:

```python
job = models.ForeignKey(
    Job,
    on_delete=models.CASCADE,
    related_name="applications",
)
```

Therefore:

```text
Application
├── user → User
└── job → Job → user
```

The direct user relationship is somewhat redundant because ownership can technically be inferred through `job.user`.

It was nevertheless chosen because it makes application filtering and authorization explicit and simpler:

```python
Application.objects.filter(user=request.user)
```

This also provides flexibility if application ownership later becomes independent of a particular job relationship.

---

# Protecting Job APIs

The job list endpoint requires authentication:

```python
permission_classes = [IsAuthenticated]
```

The queryset is restricted:

```python
Job.objects.filter(user=self.request.user)
```

Creation assigns ownership from the authenticated request:

```python
serializer.save(user=self.request.user)
```

The client therefore does not control the job owner.

The detail endpoint uses the same ownership-restricted queryset.

This creates an important security property:

```text
User A requests User B's Job ID
                ↓
Job is not in User A's queryset
                ↓
404 Not Found
```

The API does not expose another user's job.

---

# Protecting Applications

Application queries are similarly restricted:

```python
Application.objects.filter(
    user=self.request.user
)
```

The related job is loaded efficiently:

```python
.select_related("job")
```

Status filtering remains available:

```text
GET /api/applications/?status=applied
```

The status query parameter can also be validated against:

```python
Application.Status.values
```

to prevent invalid application statuses from silently producing misleading results.

---

# Serializer Ownership

The client should not be allowed to submit:

```json
{
    "user": 2
}
```

and assign ownership to another user.

Ownership is therefore assigned by the backend using:

```python
request.user
```

rather than trusted client input.

This is an important authorization boundary.

---

# React Authentication

Added frontend authentication types:

```typescript
export interface AuthUser {
    id: number;
    username: string;
    email: string;
}
```

Authentication state tracks:

```text
token
user
isAuthenticated
```

Implemented temporary authentication logic through a `useAuth()` hook.

Login stores the returned token and user.

Logout clears the local authentication state after invalidating the backend token.

---

# Authenticated API Requests

Created an API helper that attaches the authentication token:

```text
Authorization: Token <token>
```

The frontend can therefore make authenticated requests without repeating the authorization header logic in every API function.

The AI provider key will follow the same security principle later:

```text
React
   ↓
Django API
   ↓
AI Provider
```

The AI API key will remain server-side and will never be exposed to the React application.

---

# Security Testing

Manual testing focused on authorization boundaries.

### Test 1 — User isolation

Create:

```text
User A
User B
```

Create a job for each user.

Verify:

```text
User A → GET /api/jobs/
```

returns only User A's jobs.

### Test 2 — Direct object access

User A attempts to access User B's job ID.

Expected:

```text
404 Not Found
```

### Test 3 — Unauthenticated access

Call protected endpoints without authentication.

Expected:

```text
401 Unauthorized
```

### Test 4 — Invalid token

Send an invalid token.

Expected:

```text
401 Unauthorized
```

### Test 5 — Registration validation

Test missing:

* username;
* email;
* password.

Expected:

```text
400 Bad Request
```

### Test 6 — Login validation

Test:

* missing username;
* missing password;
* incorrect password.

Expected:

```text
400 / 401
```

depending on the validation case.

### Test 7 — Ownership on create

The client must not be able to select the owner of a newly created job.

The authenticated user is assigned by the backend.

### Test 8 — Update/delete ownership

A user must not be able to update or delete another user's job by changing the resource ID.

---

# Decisions

## Explicit ownership

The backend owns authorization decisions.

The frontend never determines which user owns a job or application.

## Queryset-level authorization

Authorization is enforced at the queryset level:

```python
Job.objects.filter(user=request.user)
```

rather than retrieving arbitrary objects and checking ownership afterward.

This makes unauthorized objects invisible to the view's object lookup.

## Token authentication

DRF token authentication was selected for the current MVP because it provides a straightforward authentication mechanism for the React + Django architecture.

The authentication implementation can be revisited later if CareerPilot requires a more sophisticated session or token strategy.

## Temporary React auth state

The initial `useAuth()` implementation stores the token in React state.

This is intentionally a first implementation rather than the final authentication architecture.

A page refresh clears the React state, so persistent authentication/session handling still needs to be improved.

---

# Problems / Fixes

### Domain naming inconsistencies

The early implementation used:

```text
JobPosting
JobApplication
job_posting
```

These were standardized to:

```text
Job
Application
job
```

### `related_name`

The user relationship uses:

```python
related_name="jobs"
```

rather than:

```python
related_name="job"
```

so the natural Django API becomes:

```python
user.jobs.all()
```

### Authentication state persistence

The first React authentication implementation keeps the token in component state.

This works during the current session but does not survive a browser refresh.

This limitation was documented rather than hiding it behind the initial implementation.

### API ownership

Ownership is assigned server-side rather than trusting values supplied by React.

This prevents clients from attempting to create records for another user.

---

# Interview Takeaways

### Authentication vs. authorization

Authentication identifies the user.

Authorization determines what that authenticated user can access.

### Why filter querysets by `request.user`?

It establishes the authorization boundary before object retrieval and ensures users only operate on resources they own.

### Why not accept `user_id` from the frontend?

The client should not be trusted to decide ownership.

Ownership must come from the authenticated request:

```python
request.user
```

### Are passwords encrypted?

No.

Django stores passwords using secure password hashing.

Passwords should not be stored as plaintext.

### Why use `IsAuthenticated`?

It prevents unauthenticated users from accessing protected API endpoints.

### Why can User A receive a 404 for User B's job?

Because User B's job is excluded from User A's queryset.

The detail view therefore cannot retrieve that object.

---

# Files Changed

```text
backend/
├── config/
│   ├── settings.py
│   └── urls.py
├── accounts/
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
└── jobs/
    ├── models.py
    ├── serializers.py
    ├── views.py
    └── urls.py

frontend/src/
├── api/
│   ├── auth.ts
│   └── jobs.ts
├── hooks/
│   └── useAuth.ts
└── types/
    └── auth.ts
```

## Result

CareerPilot now has the foundation for multi-user application tracking.

The backend can:

* register users;
* authenticate users;
* issue authentication tokens;
* log users out;
* restrict job access by owner;
* restrict application access by owner;
* prevent clients from assigning ownership;
* reject unauthenticated API requests.

The security boundary is now enforced by Django rather than relying on frontend behavior.

## Day 3 - PostgreSQL & Django REST Framework

### PostgreSQL Setup
To keep the development environment reproducible, we will use Docker to setup a local PostgreSQL instance.

### 1. Check whether Docker is available
```shell
docker --version
```
and: 
```shell
docker compose version
```
if both work, we can continue

### 2. Create `docker-compose.yml` at the root of project
```shell
careerpilot/
├── backend/
├── frontend/
├── docker-compose.yml
└── ...
```
Create:
```yaml
services:
    db:
        image: postgres:18
        container_name: careerpilot-db
        restart: unless-stopped
        environment:
            POSTGRES_DB: careerpilot
            POSTGRES_USER: careerpilot
            POSTGRES_PASSWORD: careerpilot
        ports:
            - "5432:5432"
        volumes:
            - postgres_data:/var/lib/postgresql/data

volumes:
    postgres_data:
```

### 3. Start PostgreSQL

From project root
```shell
docker compose up -d db
```

Check that it's running:
```shell
docker compose ps
```

```shell
NAME             STATUS
careerpilot-db   Up
```

We can also check the PostgreSQL logs:
```shell
docker compose logs db
```
Look for something indicating that PostgreSQL is ready to accept connections.

### Review

Now we have:
```shell
PostgreSQL server
        │
        └── Database: careerpilot
                │
                ├── User: careerpilot
                └── Password: careerpilot
```
And Docker exposes PostgreSQL on:
```shell
localhost:5432
```
Django application will eventually connect using:
```shell
Host:     localhost
Port:     5432
Database: careerpilot
User:     careerpilot
Password: careerpilot
```

### 5. Connecting Django with PostgreSQL

So far, Django is still using SQLite setup on day 1. Now that we have PostgreSQL up and running, lets configure Django backend to use it

We will need PostgreSQL drivers:
```shell
cd backend
uv add 'psycopg[binary]'
```

Then update `backend/config/settings.py`.\
Replace the current `DATABASES` configuration with:

```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "careerpilot",
        "USER": "careerpilot",
        "PASSWORD": "careerpilot",
        "HOST": "localhost",
        "PORT": "5432",
    }
}
```
> [!WARNING] For now, local development credentials are hardcoded. Later, we'll move these into environment variables.

### 6. Run Migrations
Since we made changes to the Django database config, need to migrate those changes to actual database. This will connect all previous django work (models, serializers, views) to PostgreSQL.

Run:
```shell
uv run python manage.py migrate
```
Django will create its tables in PostgreSQL, including things like:
```shell
auth_user
django_admin_log
django_content_type
django_migrations
django_session
```
and application table:
```shell
jobs_jobposting
jobs_jobapplication
```
No need to write SQL such as:
```sql
CREATE TABLE jobs_jobposting ...
```
Django generates the SQL from the models.

### 7. Verify the database
You can connect directly to PostgreSQL:
```shell
docker exec -it careerpilot-db psql -U careerpilot -d careerpilot
```
> [!TIP]
> Breakdown:
>
> - `docker exec` — runs a command inside an existing container.
> - `-i` — keeps standard input open so you can type commands.
> - `-t` — allocates a terminal interface. Together, `-it` makes it interactive.
> - `careerpilot-db` — the target container’s name.
> - `psql` — PostgreSQL’s command-line client.
> - `-U` careerpilot — connects as the PostgreSQL user careerpilot.
> - `-d` careerpilot — connects to the database named careerpilot.

Then:
to list the tables in the current database schema, usually the `public` schema.
```shell
\dt
```
Output should be somthing like
```shell
                 List of relations
 Schema |          Name
--------+--------------------------
 public | auth_group
 public | auth_permission
 public | auth_user
 public | django_admin_log
 public | django_content_type
 public | django_migrations
 public | django_session
 public | jobs_jobapplication
 public | jobs_jobposting
 ```

 Exit with:
 ```shell
 \q
 ```

 ### SQL

 >[!NOTE] This step is to understand/learn SQL independently of Django.

#### 1. SQL to create `user`, `job_postings` and `applications` table 
```sql
-- Write SQL to create `users`, `job_postings`, and `applications`.

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE job_postings (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    job_posting_id INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'saved',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_applications_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_applications_job_posting
        FOREIGN KEY (job_posting_id)
        REFERENCES job_postings(id)
        ON DELETE CASCADE,

    CONSTRAINT applications_status_check
        CHECK(
            status IN (
                'saved',
                'applied',
                'interview',
                'offer',
                'rejected'
            )
        )
);
```
Verify:

```sql
\dt
```

You should see:

```shell
 applications
 job_postings
 users
```

Then check the structure:

```sql
\d users
\d job_postings
\d applications
```


#### 2. SQL query returning every application with company name, job title, and current status.
```sql
-- Write a query returning every application with company name, job title, and current status.

SELECT 
    applications.id,
    job_postings.company,
    job_postings.title AS job_title,
    applications.status
FROM applications
JOIN users
    ON applications.user_id = users.id
JOIN job_postings
    on applications.job_posting_id = job_postings.id;
```

The `applications` table contains IDs:

```shell
user_id
job_posting_id
```

Those IDs allow us to connect the tables.

```shell
applications.user_id
        ↓
users.id

applications.job_posting_id
        ↓
job_postings.id
```

This is the core purpose of a **foreign key**.

#### 3. SQL query returning number of applications grouped by status.
```sql
-- Write a query returning the number of applications grouped by status.

SELECT
  status,
  COUNT(*) AS application_count
FROM applications
GROUP BY status
ORDER BY application_count DESC;
```
Example result:

```shell
 status       | application_count
--------------+------------------
 applied      | 5
 saved        | 3
 rejected     | 2
 interview    | 1
 offer        | 1
```

The important concept is:

```sql
GROUP BY status
```

means:

> Put rows having the same status into the same group.

Then:

```sql
COUNT(*)
```

counts the rows in each group.

#### 4. SQL returning companies with more than 2 applications
This introduces `HAVING`.

```sql
SELECT
    job_postings.company,
    COUNT(applications.id) AS application_count
FROM applications
JOIN job_postings
    ON applications.job_posting_id = job_postings.id
GROUP BY job_postings.company
HAVING COUNT(applications.id) > 2
ORDER BY application_count DESC;
```

##### `WHERE` vs `HAVING`

This is an important interview question.

**WHERE filters rows before grouping:**

```sql
WHERE status = 'applied'
```

**HAVING filters groups after grouping:**

```sql
HAVING COUNT(*) > 2
```

A useful mental model:

```shell
FROM
 ↓
JOIN
 ↓
WHERE
 ↓
GROUP BY
 ↓
HAVING
 ↓
SELECT
 ↓
ORDER BY
```

#### 5. SQL query returning the most recently added job for each company.
First, we need a timestamp on `job_postings`.

Your current table doesn't have one, so for this SQL exercise add it:

```sql
ALTER TABLE job_postings
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
```

Now the query can use `created_at`.

A PostgreSQL-friendly solution is:

```sql
SELECT DISTINCT ON (company)
    id,
    company,
    title,
    url,
    created_at
FROM job_postings
ORDER BY company, created_at DESC;
```

##### Why this works

For each company:

```shell
company
   ↓
sort newest → oldest
   ↓
take first row
```

`DISTINCT ON (company)` tells PostgreSQL to keep one row per company.

The important part is:

```sql
ORDER BY company, created_at DESC
```

Without the correct ordering, PostgreSQL cannot know which row you want to keep.

##### Interview note

`DISTINCT ON` is PostgreSQL-specific.

A more portable SQL approach uses a window function:

```sql
SELECT
    id,
    company,
    title,
    url,
    created_at
FROM (
    SELECT
        id,
        company,
        title,
        url,
        created_at,
        ROW_NUMBER() OVER (
            PARTITION BY company
            ORDER BY created_at DESC
        ) AS row_num
    FROM job_postings
) jobs
WHERE row_num = 1;
```

#### 6. Database concepts

This is the final Day 3 SQL task.

##### Primary Key

A primary key uniquely identifies a row.

```sql
id SERIAL PRIMARY KEY
```

For example:

```shell
users

id | name
---+------
1  | Alice
2  | Bob
3  | Charlie
```

`id` uniquely identifies each user.

Properties:

- unique
    
- cannot be `NULL`
    
- identifies a row
    

---

##### Foreign Key

A foreign key creates a relationship between tables.

```sql
user_id INTEGER REFERENCES users(id)
```

For example:

```shell
applications
id | user_id
---+--------
1  | 2
2  | 1
3  | 2
```

`user_id = 2` means the application belongs to:

```shell
users.id = 2
```

Interview answer:

> "A foreign key is a column that references a primary key or unique key in another table and helps maintain referential integrity."

---

##### Unique Constraint

A unique constraint prevents duplicate values.

We used:

```sql
email VARCHAR(255) UNIQUE
```

This means:

```shell
alice@example.com
alice@example.com
```

cannot appear twice.

Primary key vs unique:

||Primary Key|Unique|
|---|---|---|
|Identifies row|Yes|Not necessarily|
|Allows NULL|No|PostgreSQL allows NULL|
|Multiple per table|No|Yes|
|Example|`id`|`email`|

---

##### Index

An index makes searching/sorting certain columns faster.

Example:

```sql
CREATE INDEX idx_applications_status
ON applications(status);
```

Now queries such as:

```sql
SELECT *
FROM applications
WHERE status = 'interview';
```

can potentially use that index.

The trade-off:

```shell
Index
  ↓
Faster reads
  +
More storage
  +
Slightly slower INSERT/UPDATE/DELETE
```

Interview answer:

> "An index is a data structure that improves query performance for searches on indexed columns, at the cost of additional storage and write overhead."

You don't need to blindly index every column.

---

##### Normalization

Normalization means organizing data to **reduce unnecessary duplication and maintain consistency**.

Bad design:

```shell
applications

id | user_name | user_email | company | job_title | status
```

If someone applies to five jobs, their name and email are repeated five times.

Instead:

```shell
users
-----
id
name
email

job_postings
------------
id
company
title

applications
------------
id
user_id
job_posting_id
status
```

Now information has a single source of truth.

Think:

```shell
User information
       ↓
     users

Job information
       ↓
 job_postings

Application-specific information
       ↓
 applications
```

For your interview, understand **1NF, 2NF, and 3NF at a conceptual level**, but don't spend a large amount of Day 3 time memorizing formal definitions.

---

##### Transaction

A transaction groups multiple database operations into one logical unit.

For example:

```sql
BEGIN;

INSERT INTO job_postings (
    title,
    company,
    url,
    description
)
VALUES (
    'Software Developer',
    'Example Corp',
    'https://example.com/job',
    'Python backend developer'
);

INSERT INTO applications (
    user_id,
    job_posting_id,
    status
)
VALUES (
    1,
    1,
    'saved'
);

COMMIT;
```

If something goes wrong:

```sql
ROLLBACK;
```

The key idea:

```shell
BEGIN
  ↓
operation 1
  ↓
operation 2
  ↓
operation 3
  ↓
COMMIT
```

Either the transaction succeeds, or you can roll it back.

Interview answer:

> "A transaction is a group of database operations treated as a single logical unit. If the operations succeed, we commit them; if something fails, we can roll them back."

This is closely related to **ACID**:

```shell
A — Atomicity
C — Consistency
I — Isolation
D — Durability
```

### Django REST Framework (DRF)

We have already setup DRF, serializer and views for the following APIs earlier.
```shell
GET  /api/applications/
GET  /api/applications/?status=saved

GET  /api/job-postings/
POST /api/job-postings/
```
today we will make some changes to these APIs and add a few more.

The goal is to build a complete CRUD API for jobs:

```shell
GET    /api/jobs/           → list jobs
POST   /api/jobs/           → create job
GET    /api/jobs/<id>/      → get one job
PATCH  /api/jobs/<id>/      → update one job
DELETE /api/jobs/<id>/      → delete one job
```

#### Views
> [!NOTE] 
> We have already implemented model `JobPosting` and serializer class `JobPostingSerializer`. 

No changes are required in model and serializer. So we can skip and focus on view now.

Replace/create:

```shell
backend/jobs/views.py
```

with:

```python
from rest_framework import generics

from .models import JobPosting
from .serializers import JobPostingSerializer


class JobListCreateView(generics.ListCreateAPIView):
    queryset = JobPosting.objects.all()
    serializer_class = JobPostingSerializer


class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = JobPosting.objects.all()
    serializer_class = JobPostingSerializer
```
##### `ListCreateAPIView`

```python
class JobListCreateView(generics.ListCreateAPIView):
```

automatically gives us:

```shell
GET  /api/jobs/
POST /api/jobs/
```

##### `RetrieveUpdateDestroyAPIView`

```python
class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
```

automatically gives us:

```shell
GET    /api/jobs/<id>/ # Retrieve
PATCH  /api/jobs/<id>/ # Update
DELETE /api/jobs/<id>/ # Destroy
```

So we don't need to write five separate view functions.

#### URLs

Create:

```shell
backend/jobs/urls.py
```

```python
from django.urls import path

from .views import JobDetailView, JobListCreateView


urlpatterns = [
    path(
        "jobs/",
        JobListCreateView.as_view(),
        name="job-list-create",
    ),
    path(
        "jobs/<int:pk>/",   # id represents <integer:primary_key>
        JobDetailView.as_view(),
        name="job-detail",
    ),
]
```

project URLs:

```shell
backend/config/urls.py
```

should contain:

```python
from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("jobs.urls")),
]
```

Now the final routes are:

```shell
/api/jobs/
/api/jobs/<id>/
```

Test `GET /api/jobs/`

Open:

```text
http://127.0.0.1:8000/api/jobs/
```

If you have no jobs yet:

```json
[]
```

If you have jobs:

```json
[
    {
        "id": 1,
        "title": "Software Developer",
        "company": "Acme Corp",
        "url": "https://example.com/job",
        "description": "Python developer"
    }
]
```

DRF also gives you a browsable API in the browser, which is very useful while learning.

---

### TESTs
#### 1. `POST /api/jobs/`

We can use the DRF browsable API or `curl`.

```bash
curl -X POST http://127.0.0.1:8000/api/jobs/ \
    -H "Content-Type: application/json" \
    -d '{
        "title": "Software Developer",
        "company": "Acme Corp",
        "url": "https://example.com/jobs/1",
        "description": "Python and Django developer"
    }'
```

Successful creation should return:

```json
{
    "id": 1,
    "title": "Software Developer",
    "company": "Acme Corp",
    "url": "https://example.com/jobs/1",
    "description": "Python and Django developer"
}
```

with HTTP status:

```shell
201 Created
```

---

#### 2. Validation

Try sending an incomplete request:

```bash
curl -X POST http://127.0.0.1:8000/api/jobs/ \
    -H "Content-Type: application/json" \
    -d '{
        "title": "Software Developer"
    }'
```

DRF should return something similar to:

```json
{
    "company": [
        "This field is required."
    ],
    "url": [
        "This field is required."
    ],
    "description": [
        "This field is required."
    ]
}
```

with:

```shell
400 Bad Request
```

That's your serializer-level validation working.

---

#### 3. GET one job

```bash
curl http://127.0.0.1:8000/api/jobs/1/
```

Expected:
```json
{
    "id": 1,
    "title": "Software Developer",
    "company": "Acme Corp",
    "url": "https://example.com/jobs/1",
    "description": "Python and Django developer"
}

```

```shell
200 OK
```

---

#### 4. PATCH

PATCH means:

> Update only the fields I provide.

For example:

```bash
curl -X PATCH http://127.0.0.1:8000/api/jobs/1/ \
    -H "Content-Type: application/json" \
    -d '{
        "title": "Senior Software Developer"
    }'
```

You should get:

```json
{
    "id": 1,
    "title": "Senior Software Developer",
    "company": "Acme Corp",
    "url": "https://example.com/jobs/1",
    "description": "Python and Django developer"
}
```

Status:

```shell
200 OK
```

Notice that you didn't need to send `company`, `url`, or `description`.

That's one reason we're specifically using `PATCH`.

---

#### 5. DELETE

```bash
curl -X DELETE http://127.0.0.1:8000/api/jobs/1/
```

Successful deletion returns:

```shell
204 No Content
```

There is normally no JSON response body.

### HTTP status codes

|Operation|Success|Validation|
|---|--:|--:|
|GET list|`200 OK`|—|
|POST|`201 Created`|`400 Bad Request`|
|GET detail|`200 OK`|`404 Not Found`|
|PATCH|`200 OK`|`400 Bad Request`|
|DELETE|`204 No Content`|`404 Not Found`|

For example, requesting:

```shell
GET /api/jobs/999/
```

when job `999` doesn't exist should produce:

```shell
404 Not Found
```

DRF's generic views handle these responses for you.

---

### Understand what DRF is doing

Architecture is:

```shell
React
  │
  │ HTTP
  ▼
DRF View
  │
  ▼
Serializer
  │
  ▼
Django Model
  │
  ▼
Django ORM
  │
  ▼
PostgreSQL
```

For a POST:

```shell
POST /api/jobs/
        │
        ▼
JobListCreateView
        │
        ▼
JobPostingSerializer
        │
        ├── validation
        │
        ▼
JobPosting.objects.create(...)
        │
        ▼
PostgreSQL
        │
        ▼
201 Created
```

For a GET:

```shell
GET /api/jobs/
        │
        ▼
JobListCreateView
        │
        ▼
JobPosting.objects.all()
        │
        ▼
JobPostingSerializer
        │
        ▼
JSON response
        │
        ▼
200 OK
```

### Frontend

#### 1. Create the API function

We already have `frontend/src/api/jobs.ts`, add:

```ts
import type { JobPosting } from "../types/job";

export async function getJobs(): Promise<JobPosting[]> {
    const response = await fetch("/api/jobs/");

    if (!response.ok) {
        throw new Error("Failed to fetch jobs");
    }

    return response.json();
}
```
This gives React code a clean function:

```ts
const jobs = await getJobs();
```

rather than putting `fetch()` directly inside the component.

---

#### 2. Jobs Page
`frontend/src/pages/JobsPage.tsx`

```tsx
import { useEffect, useState } from "react";

import { getJobs } from "../api/jobs";
import type { JobPosting } from "../types/job";

export function JobsPage() {
    const [jobs, setJobs] = useState<JobPosting[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadJobs() {
            try {
                const data = await getJobs();
                setJobs(data);
            } catch {
                setError("Unable to load jobs.");
            } finally {
                setLoading(false);
            }
        }

        loadJobs();
    }, []);

    if (loading) {
        return <p>Loading jobs...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (jobs.length === 0) {
        return (
            <section>
                <h1>Jobs</h1>
                <p>No jobs have been added yet.</p>
            </section>
        );
    }

    return (
        <section>
            <h1>Jobs</h1>

            <ul>
                {jobs.map((job) => (
                    <li key={job.id}>
                        <h2>{job.title}</h2>
                        <p>{job.company}</p>
                        <a
                            href={job.url}
                            target="_blank"
                            rel="noreferrer"
                        >
                            View job posting
                        </a>
                        <p>{job.description}</p>
                    </li>
                ))}
            </ul>
        </section>
    );
}
```

---

#### 3. Understand the three states

This is the main thing you're learning here.

##### Loading

Immediately when the page opens:

```shell
React
  ↓
GET /api/jobs/
  ↓
waiting...
  ↓
"Loading jobs..."
```

That's controlled by:

```tsx
if (loading) {
    return <p>Loading jobs...</p>;
}
```

##### Error

If Django is unavailable or the request fails:

```shell
GET /api/jobs/
       ↓
    FAILED
       ↓
"Unable to load jobs."
```

Controlled by:

```tsx
if (error) {
    return <p>Unable to load jobs.</p>;
}
```

##### Empty

The request succeeds, but PostgreSQL contains no jobs:

```json
[]
```

That's **not an error**.

It's a successful response containing zero jobs.

So:

```tsx
if (jobs.length === 0) {
    return (
        <section>
            <h1>Jobs</h1>
            <p>No jobs have been added yet.</p>
        </section>
    );
}
```

This distinction is important:

```text
Loading → request hasn't finished
Error   → request failed
Empty   → request succeeded, but there are no records
Data    → request succeeded and jobs exist
```

---

## Day 4 React, TypeScript & Job Dashboard

### 1. Target Structure

```text
frontend/src/
├── api/
│   └── jobs.ts
├── components/
│   ├── JobCard.tsx
│   └── JobForm.tsx
├── hooks/
│   └── useJobs.ts
├── pages/
│   └── JobsPage.tsx
└── types/
    └── jobs.ts
```

The important separation is:

```text

JobCard     → displays one job

JobForm     → collects/validates job data

useJobs()   → manages loading, errors, jobs, API mutations

api/jobs.ts → actually communicates with Django
```

---

### 2. Define `Job`, `Application` & `JobStatus`

Repalce `types/jobs.ts` with:
```ts
export type JobStatus =
    | "saved"
    | "applied"
    | "interview"
    | "offer"
    | "rejected";

export interface Job {
    id: number;
    title: string;
    company: string;
    url: string;
    description: string;
}

export interface Application {
    id: number;
    job: Job;
    status: JobStatus;
    created_at: string;
    updated_at: string;
}
```
#### Why `JobStatus`?

Instead of:

```ts
status: string;
```

TypeScript now knows that only these values are valid:

```text
saved
applied
interview
offer
rejected
```

For example:

```ts
const status: JobStatus = "interview";
```

is valid.

But:

```ts
const status: JobStatus = "hired";
```

produces a TypeScript error.

This is particularly useful because these values correspond to your Django `TextChoices`.

---

### 3. Update the API layer

update `api/jobs.ts` to use `Job`, `Application` and `JobStatus`

```ts
import type { Application, Job } from "../types/jobs";

export async function getSavedApplications(): Promise<Application[]> {
    const response = await fetch("/api/applications/?status=saved");
    if (!response.ok) {
        throw new Error("Failed to fetch saved applications");
    }   
    return response.json();
}


export async function getJobs(): Promise<Job[]> {
    const response = await fetch("/api/jobs/");
    if (!response.ok) {
        throw new Error("Failed to fetch jobs")
    }
    return response.json();
}


export interface CreateJobInput {
    title: string;
    company: string;
    url: string;
    description: string;
}

export async function createJob(job: CreateJobInput): Promise<Job> {
    const response = await fetch("/api/jobs/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(job),
    });

    if (!response.ok) {
        throw new Error("Failed to create job");
    }

    return response.json();
}
```
Don't add validation here yet. The API layer's job is communicating with Django.

---

### 4. Create reusable `JobCard`

Create:

```text
src/components/JobCard.tsx
```

```tsx
import type { Job } from "../types/jobs";

interface JobCardProps {
    job: Job;
}

export function JobCard({ job }: JobCardProps) {
    return (
        <article>
            <h2>{job.title}</h2>
            <p>{job.company}</p>

            <a
                href={job.url}
                target="_blank"
                rel="noreferrer"
            >
                View job posting
            </a>
        </article>
    );
}
```

The important concept is that `JobCard` doesn't fetch anything.

It simply receives:

```tsx
<JobCard job={job} />
```

and displays it.

That's what makes it reusable.

---

### 5. Create reusable `JobForm`

Rename:

```text
JobPostingForm.tsx
```

to:

```text
JobForm.tsx
```

Then:

```tsx
import { useState, type SubmitEvent } from "react";
import { createJob, type CreateJobInput } from "../api/jobs";

interface JobFormProps {
    onCreated?: (job: Awaited<ReturnType<typeof createJob>>) => void;
}

interface FormErrors {
    title?: string;
    company?: string;
    url?: string;
    description?: string;
    general?: string;
}

export function JobForm({ onCreated }: JobFormProps) {
    const [title, setTitle] = useState("");
    const [company, setCompany] = useState("");
    const [url, setUrl] = useState("");
    const [description, setDescription] = useState("");

    const [errors, setErrors] = useState<FormErrors>({});
    const [submitting, setSubmitting] = useState(false);

    function validate(): FormErrors {
        const errors: FormErrors = {};

        if (!title.trim()) {
            errors.title = "Title is required.";
        }

        if (!company.trim()) {
            errors.company = "Company is required.";
        }

        if (!url.trim()) {
            errors.url = "URL is required.";
        }

        if (!description.trim()) {
            errors.description = "Description is required.";
        }

        return errors;
    }

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (submitting) {
            return;
        }

        const validationErrors = validate();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        setSubmitting(true);

        try {
            const jobInput: CreateJobInput = {
                title: title.trim(),
                company: company.trim(),
                url: url.trim(),
                description: description.trim(),
            };

            const job = await createJob(jobInput);

            onCreated?.(job);

            setTitle("");
            setCompany("");
            setUrl("");
            setDescription("");
        } catch {
            setErrors({
                general: "Unable to create job.",
            });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Add Job</h2>

            <div>
                <label htmlFor="title">Title</label>
                <input
                    id="title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                />
                {errors.title && <p>{errors.title}</p>}
            </div>

            <div>
                <label htmlFor="company">Company</label>
                <input
                    id="company"
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                />
                {errors.company && <p>{errors.company}</p>}
            </div>

            <div>
                <label htmlFor="url">URL</label>
                <input
                    id="url"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                />
                {errors.url && <p>{errors.url}</p>}
            </div>

            <div>
                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                />
                {errors.description && <p>{errors.description}</p>}
            </div>

            {errors.general && <p>{errors.general}</p>}

            <button type="submit" disabled={submitting}>
                {submitting ? "Adding..." : "Add Job"}
            </button>
        </form>
    );
}
```
This accomplishes three Day 4 requirements:

- form validation
    
- duplicate submission prevention
    
- displaying validation errors
---

### 6. Why `submitting` prevents duplicate requests

Without it, a user could click:

```text
Add Job
Add Job
Add Job
```

while the first request is still running.

we have:

```tsx
if (submitting) {
    return;
}
```

and:

```html
<button disabled={submitting}>
```

So both the UI and the handler prevent another submission.

The lifecycle is:

```text
submitting = false
        ↓
user submits
        ↓
validation
        ↓
submitting = true
        ↓
API request
        ↓
request completes
        ↓
submitting = false
```

`finally` is important because it runs whether the request succeeds or fails.

---

### 7. Create `useJobs()` Hook

> [!Note]
> A hook in React is a function that allows you to use state and other React features in functional components, enabling you to manage component state and handle side effects without using class components. Although the most common hooks are useState for managing state and useEffect for handling side effects, we can also define custom hooks.

We can move the job-fetching and job-management logic out of `JobsPage` into a custom `useJobs` hook. This keeps the page focused on rendering while allowing the job state and operations to be reused by other components when needed.

Create:

```text
src/hooks/useJobs.ts
```

```tsx
import { useCallback, useEffect, useState } from "react";
import { createJob, getJobs, type CreateJobInput } from "../api/jobs";
import type { Job } from "../types/jobs";

export function useJobs() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadJobs = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await getJobs();
            setJobs(data);
        } catch {
            setError("Unable to load jobs.");
        } finally {
            setLoading(false);
        }
    }, []);

    const addJob = useCallback(async (job: CreateJobInput) => {
        const createdJob = await createJob(job);

        setJobs((currentJobs) => [
            ...currentJobs,
            createdJob,
        ]);

        return createdJob;
    }, []);

    useEffect(() => {
        loadJobs();
    }, [loadJobs]);

    return {
        jobs,
        loading,
        error,
        addJob,
        reload: loadJobs,
    };
}
```

Now the hook owns:

```text
jobs
loading
error
addJob()
reload()
```
---

### 8. Use the hook in `JobsPage`

Now `JobsPage.tsx` becomes:

```tsx
import { JobCard } from "../components/JobCard";
import { useJobs } from "../hooks/useJobs";

export function JobsPage() {
    const { jobs, loading, error } = useJobs();

    if (loading) {
        return <p>Loading jobs...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <section>
            <h1>Jobs</h1>

            {jobs.length === 0 ? (
                <p>No jobs have been added yet.</p>
            ) : (
                jobs.map((job) => (
                    <JobCard
                        key={job.id}
                        job={job}
                    />
                ))
            )}
        </section>
    );
}
```

Notice what disappeared:

```text
useState
useEffect
fetch
API error handling
```

That's now handled by `useJobs()`.

---

### 9. Update `JobForm` to use the `useJobs` hook
Now that we have our custom hook handling jobs, update `JobForm` 
```tsx
import { useState, type SubmitEvent } from "react";

import type { CreateJobInput } from "../api/jobs";
import type { Job } from "../types/jobs";

interface JobFormProps {
    onSubmit: (job: CreateJobInput) => Promise<Job>;
}

interface FormErrors {
    title?: string;
    company?: string;
    url?: string;
    description?: string;
    general?: string;
}

export function JobForm({ onSubmit }: JobFormProps) {
    const [title, setTitle] = useState("");
    const [company, setCompany] = useState("");
    const [url, setUrl] = useState("");
    const [description, setDescription] = useState("");

    const [errors, setErrors] = useState<FormErrors>({});
    const [submitting, setSubmitting] = useState(false);

    function validate(): FormErrors {
        const errors: FormErrors = {};

        if (!title.trim()) {
            errors.title = "Title is required.";
        }

        if (!company.trim()) {
            errors.company = "Company is required.";
        }

        if (!url.trim()) {
            errors.url = "URL is required.";
        }

        if (!description.trim()) {
            errors.description = "Description is required.";
        }

        return errors;
    }

    async function handleSubmit(
        event: SubmitEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (submitting) {
            return;
        }

        const validationErrors = validate();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        setSubmitting(true);

        try {
            await onSubmit({
                title: title.trim(),
                company: company.trim(),
                url: url.trim(),
                description: description.trim(),
            });

            setTitle("");
            setCompany("");
            setUrl("");
            setDescription("");
        } catch {
            setErrors({
                general: "Unable to create job.",
            });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Add Job</h2>

            <div>
                <label htmlFor="title">Title</label>
                <input
                    id="title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                />
                {errors.title && <p>{errors.title}</p>}
            </div>

            <div>
                <label htmlFor="company">Company</label>
                <input
                    id="company"
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                />
                {errors.company && <p>{errors.company}</p>}
            </div>

            <div>
                <label htmlFor="url">URL</label>
                <input
                    id="url"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                />
                {errors.url && <p>{errors.url}</p>}
            </div>

            <div>
                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                />
                {errors.description && <p>{errors.description}</p>}
            </div>

            {errors.general && <p>{errors.general}</p>}

            <button type="submit" disabled={submitting}>
                {submitting ? "Adding..." : "Add Job"}
            </button>
        </form>
    );
}
```

Then `JobsPage` connects it:

```tsx
const { jobs, loading, error, addJob } = useJobs();

<JobForm onSubmit={addJob} />
```
---

### 10. Controlled vs Uncontrolled Components

This is an interview concept you should understand rather than just memorize.

#### Controlled

Your current `JobForm` is a **controlled component**.

For example:

```tsx
const [title, setTitle] = useState("");

<input
    value={title}
    onChange={(event) => setTitle(event.target.value)}
/>
```

React owns the input value.

```text
User types
    ↓
onChange
    ↓
setTitle()
    ↓
React state changes
    ↓
input value updates
```

Interview answer:

> A controlled component is a form element whose value is managed by React state. React becomes the source of truth for the input.

##### Advantages

- Easy validation
    
- Easy conditional UI
    
- Easy to reset
    
- Easy to transform input
    
- React always knows the current value
    

---

#### Uncontrolled

An uncontrolled input lets the DOM manage its own value.

Example:

```tsx
const inputRef = useRef<HTMLInputElement>(null);

<input ref={inputRef} />
```

You would retrieve the value from the DOM when needed:

```tsx
inputRef.current?.value
```

Interview answer:

> An uncontrolled component lets the DOM manage the input's state, and React accesses the value through a ref when needed.

#### Quick comparison

||Controlled|Uncontrolled|
|---|---|---|
|State owner|React|DOM|
|Access|React state|`ref`|
|Validation|Easy|More manual|
|Resetting|Easy|DOM-based|
|Typical React forms|Common|Less common|

For **CareerPilot**, controlled inputs are a good choice because we need validation and backend error handling.

---

### 11. Edit + Delete Jobs

For edit and delete functionality we first need to implement API functions in `api/jobs.ts`

#### `updateJob()`
```ts
export async function updateJob(
    id: number,
    updates: Partial<CreateJobInput>,
): Promise<Job> {
    const response = await fetch(`/api/jobs/${id}/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
    });

    if (!response.ok) {
        throw new Error("Failed to update job");
    }

    return response.json();
}
```
#### `deleteJob()`
```ts
export async function deleteJob(id: number): Promise<void> {
    const response = await fetch(`/api/jobs/${id}/`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("Failed to delete job");
    }
}
```

Then we can add `updateJob()` and `deleteJob()` to `useJobs()`.

```ts
import {
    createJob,
    getJobs,
    updateJob as updateJobApi,
    deleteJob as deleteJobApi,
    type CreateJobInput,
} from "../api/jobs";

...

const updateJob = useCallback(
    async (id: number, updates: Partial<CreateJobInput>) => {
        const updatedJob = await updateJobApi(id, updates);

        setJobs((currentJobs) =>
            currentJobs.map((job) =>
                job.id === id ? updatedJob : job
            )
        );

        return updatedJob;
    },
    [],
);

const deleteJob = useCallback(async (id: number) => {
    await deleteJobApi(id);

    setJobs((currentJobs) =>
        currentJobs.filter((job) => job.id !== id)
    );
}, []);

return {
    jobs,
    loading,
    error,
    addJob,
    updateJob,
    deleteJob,
    reload: loadJobs,
};
```

### What Changed

Refactored the job creation and job editing UI to use a single reusable JobForm component.

Previously:

- `JobForm` was primarily used for adding jobs.
- `JobCard` contained its own edit-form markup.
The Add Job form was permanently displayed in a sidebar.

Now:

- `JobForm` supports both add and edit modes.
- Add and Edit use the same form structure and styling.
- `JobCard` renders `JobForm` when a job is being edited.
- A new AddJobCard renders the same `JobForm` in add mode.
- The Add Job form appears as a temporary job card within the existing job list.
- The `+ Add Job` button is disabled while the temporary add card is open.
- Canceling the add operation removes only the temporary add card.
- Successfully creating a job removes the temporary form and adds the newly created job to the job list.

#### Component Responsibilities
```text
JobsPage
├── controls add-job state
├── renders + Add Job button
├── renders AddJobCard when adding
└── renders JobCard for existing jobs
AddJobCard
└── renders JobForm in add mode

JobCard
├── displays job
├── handles edit state
├── renders JobForm in edit mode
└── handles delete

JobForm
├── manages form state
├── validates input
├── handles submitting state
└── calls the supplied onSubmit callback
```

#### Key Design Decision

The form component does not know whether it is creating or updating a job at the API level.

It receives behavior through callbacks:
```tsx
<JobForm
    mode="add"
    onSubmit={addJob}
    onCancel={() => setAdding(false)}
/>
```
and:
```tsx
<JobForm
    mode="edit"
    initialValues={job}
    onSubmit={(values) => updateJob(job.id, values)}
    onCancel={() => setEditing(false)}
/>
```
This keeps responsibilities separated:
```text
JobForm
    ↓
Form state + validation + UI

JobsPage / JobCard
    ↓
Decides what operation should happen

useJobs
    ↓
Application state + mutations

api/jobs.ts
    ↓
HTTP requests
```

#### React Concepts Learned

##### Reusable Components

When two UI flows have the same fields, validation, layout, and behavior, they should share a common component instead of maintaining duplicate markup.

The differences should be supplied through props.

##### Controlled Components

`JobForm` uses controlled inputs:
```tsx
<input
    value={title}
    onChange={(event) => setTitle(event.target.value)}
/>
```
React state is the source of truth for the form values.

##### Conditional Rendering

The dashboard uses conditional rendering to display the temporary Add Job card:
```tsx
{adding && (
    <AddJobCard
        onSubmit={handleAddJob}
        onCancel={handleCancelAdd}
    />
)}
```
The existing jobs remain in the same list.

##### Component Composition

`AddJobCard` and `JobCard` both compose the same `JobForm` rather than implementing separate forms.

This avoids duplication while allowing each parent component to control its own behavior.

#### UX Improvement

The Add Job flow now behaves consistently with the Edit flow.

Instead of navigating away from the job list or replacing the dashboard:
```text
+ Add Job
    ↓
temporary JobCard
    ↓
JobForm
```
The user remains in the context of the job list.

Canceling simply removes the temporary card and restores the previous state.

#### API Behavior

No backend API changes were required.

Existing operations remain:
``` shell
GET    /api/jobs/
POST   /api/jobs/
PATCH  /api/jobs/<id>/
DELETE /api/jobs/<id>/
```
Edit continues to send only fields that changed.

#### Files Changed
```shell
frontend/src/
├── components/
│   ├── AddJobCard.tsx      # New
│   ├── JobCard.tsx         # Refactored
│   ├── JobCard.css         # Simplified
│   ├── JobForm.tsx         # Refactored for add/edit
│   └── JobForm.css         # Shared form styling
│
└── pages/
    ├── JobsPage.tsx        # Inline add-card flow
    └── JobsPage.css        # Removed add-job sidebar layout
```

#### Result

The dashboard now has one reusable form implementation for both job creation and editing, with the Add Job form appearing as a temporary card in the same visual context as an edited job.

No duplicate Add/Edit form markup is maintained.


## Day 5 Django Authentication and Security

### 0. Target architecture

By the end of Day 5, the flow should be:
```shell
React
  │
  │ username + password
  ▼
POST /api/auth/register/
POST /api/auth/login/
  │
  │ token
  ▼
React stores authentication state
  │
  │ Authorization: Token <token>
  ▼
Django REST Framework
  │
  ├── verifies token
  ├── identifies request.user
  │
  ▼
Job APIs
  │
  └── only return/modify request.user's jobs
```

The final API should roughly be:

```shell
POST   /api/auth/register/
POST   /api/auth/login/
POST   /api/auth/logout/

GET    /api/jobs/
POST   /api/jobs/
GET    /api/jobs/<id>/
PATCH  /api/jobs/<id>/
DELETE /api/jobs/<id>/

GET    /api/applications/

```
---

### 1. Install DRF token authentication

Add the token app to INSTALLED_APPS:
```python
INSTALLED_APPS = [
    # ...
    "rest_framework",
    "rest_framework.authtoken",
]
```
Then:
```shell
python manage.py migrate
```
This creates the token table.

You can verify:
```shell
python manage.py showmigrations
```
You should see the authtoken migrations applied.

--- 

### 2. Configure DRF authentication

In `settings.py`:
```python
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
    ],
}
```
This tells DRF:

> When a request contains Authorization: Token <token>, use that token to identify the user.

Later, we'll be able to access:
```python
self.request.user
```
inside your views.

---

### 3. Add ownership to `JobPosting`

> [!Note] Naming Changes in Django Backend
> - `JobPosting` -> `Job`
> - `JobApplication` -> `Application`
> - `job_posting` -> `job`

This is necessary before protecting your job API.

Currently you have something like:

```python
class JobPosting(models.Model):
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    url = models.URLField()
    description = models.TextField()
```

Change it to:

```python
from django.contrib.auth.models import User
from django.db import models


class Job(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="jobs",
    )
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    url = models.URLField()
    description = models.TextField()

    def __str__(self) -> str:
        return f"{self.company} — {self.title}"
```

#### Why?

We need a relationship like:

```text
User A
 ├── Job 1
 └── Job 2

User B
 ├── Job 3
 └── Job 4
```

Without `user` on `Job`, Django has no way to know who owns a job.

Same goes for `Application`:

```python
user = models.ForeignKey(
    User,
    on_delete=models.CASCADE,
    related_name="applications",
)
```

---

### # 4. Create the migration

Run:

```bash
python manage.py makemigrations
```

Then:

```bash
python manage.py migrate
```

#### Important

If you already have jobs in your development database, Django may ask how to populate the new non-null `user` field.

That's expected.

Because we're still early in CareerPilot development, we have two options:

#### Option A — Disposable development data

If we don't care about the existing test jobs, reset the database and recreate them after authentication.

#### Option B — Keep existing jobs

Create a development user first and use that user as the default owner during the migration.

For now, **Option A is simpler if your existing jobs are only test data.**

Don't delete production data if/when this becomes a deployed application.

---

### 5. Create the authentication serializers

User registration is an authentication/account concern, not a job concern.

Let's create a django app for it called `accounts`.
```shell
uv run python manage.py startapp accounts
```

Register `accounts` app in Django project (`config/settings.py`)

```python
INSTALLED_APPS = [
    ...
    "rest_framework",
    "rest_framework.authtoken",
    "jobs",
    "accounts",
]
```


Create:

```text
backend/
└── accounts/
    ├── serializers.py
    └── views.py
```

Add a registration serializer.

```python
from django.contrib.auth.models import User
from rest_framework import serializers


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )
```

#### Important part

Use:

```python
User.objects.create_user(...)
```

not:

```python
User.objects.create(...)
```

`create_user()` hashes the password.

You should **never store the user's raw password**.

---

### 6. Create the registration view

In `views.py`:

```python
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status

from .serializers import RegisterSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },
            status=status.HTTP_201_CREATED,
        )
```

Notice that the response doesn't contain the password.

---

### 7. Add the registration URL

In your app's `backend/accounts/urls.py`:

```python
from django.urls import path

from .views import RegisterView

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
]
```

and finally register it in `backend/config/urls.py`
```python
urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("jobs.urls")),
    path("api/", include("accounts.urls")),
]

```

Your endpoint is now:

```text
POST /api/auth/register/
```

assuming your project's main URL already includes your app under `/api/`.

---

### 8. Test registration before continuing

Use Postman, Insomnia, curl, or your browser's API tooling.

Request:

```http
POST /api/auth/register/
Content-Type: application/json
```

Body:

```json
{
    "username": "usera",
    "email": "usera@example.com",
    "password": "password123"
}
```

Expected:

```text
201 Created
```

Response:

```json
{
    "id": 1,
    "username": "usera",
    "email": "usera@example.com"
}
```

Then test duplicate username:

```json
{
    "username": "usera",
    "email": "another@example.com",
    "password": "password123"
}
```

Expected:

```text
400 Bad Request
```
Response:
```json
{
    "username":["A user with that username already exists."]
}
```

---

### 9. Implement login

Now create:

```text
POST /api/auth/login/
```

Use DRF's built-in token mechanism.

In `views.py`:

```python
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class LoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {"detail": "Username and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(
            username=username,
            password=password,
        )

        if user is None:
            return Response(
                {"detail": "Invalid username or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                "token": token.key,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                },
            }
        )
```

The important sequence is:

```text
username + password
        ↓
authenticate()
        ↓
User
        ↓
get_or_create Token
        ↓
return token
```

---

### 10. Add the login URL

```python
urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
]
```

Test:

```http
POST /api/auth/login/
Content-Type: application/json
```

```json
{
    "username": "usera",
    "password": "password123"
}
```

Expected:

```json
{
    "token": "abc123...",
    "user": {
        "id": 1,
        "username": "usera",
        "email": "usera@example.com"
    }
}
```

Save the token temporarily for testing.

---

### 11. Implement logout

Create:

```python
from rest_framework.permissions import IsAuthenticated


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.auth.delete()

        return Response(
            {"detail": "Logged out successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )
```

Add:

```python
path("auth/logout/", LogoutView.as_view(), name="logout"),
```

The request must contain:

```http
Authorization: Token abc123...
```

Logout deletes that token.

#### What is `permission_classes`?
```python
permission_classes = [IsAuthenticated]
```
This tells Django REST Framework:

> "Before allowing this view to run, make sure the request comes from an authenticated user."

---

### 12. Protect the Job API

Now we get to the important security part.

Change:

```python
class JobListView(generics.ListCreateAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
```

to:

```python
from rest_framework.permissions import IsAuthenticated


class JobListView(generics.ListCreateAPIView):
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Job.objects.filter(
            user=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
```

#### Two important things are happening.

##### Reading

```python
Job.objects.filter(user=self.request.user)
```

means:

> Only return jobs owned by the authenticated user.

##### Creating

```python
serializer.save(user=self.request.user)
```

means:

> The server decides who owns the job.

The frontend should **not** send:

```json
{
    "user": 1
}
```

The authenticated request determines the owner.

---

### 13. Protect `JobDetailView`

Change:

```python
class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
```

to:

```python
class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Job.objects.filter(
            user=self.request.user
        )
```

This is what prevents the ID manipulation attack.

Suppose:

```text
User A → Job 1
User B → Job 2
```

User A requests:

```text
GET /api/jobs/2/
```

Django effectively searches:

```python
Job.objects.filter(
    user=user_a,
    id=2,
)
```

No object exists.

Result:

```text
404 Not Found
```

User A cannot retrieve User B's job.

---

### 14. Protect applications

Current application view:

```python
class ApplicationListView(generics.ListAPIView):
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        queryset = Application.objects.select_related("job")

        status = self.request.query_params.get("status")

        if status:
            queryset = queryset.filter(status=status)

        return queryset
```

Change it to:

```python
class ApplicationListView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = (
            Application.objects
            .filter(user=self.request.user)
            .select_related("job")
        )

        status = self.request.query_params.get("status")

        if status:
            queryset = queryset.filter(status=status)

        return queryset
```

This means:

```text
GET /api/applications/
```

only returns the authenticated user's applications.

And:

```text
GET /api/applications/?status=interview
```

only returns **that user's** interview applications.

---

### 15. Check serializer

`JobSerializer` currently has:

```python
class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPosting
        fields = ["id", "title", "company", "url", "description"]
```

Keep `user` out of the fields.

That is intentional.

The client should not control ownership.

---

### 16. Add React authentication types

Create:

```text
frontend/src/types/auth.ts
```

```ts
export interface AuthUser {
    id: number;
    username: string;
    email: string;
}

export interface LoginResponse {
    token: string;
    user: AuthUser;
}

export interface AuthState {
    token: string | null;
    user: AuthUser | null;
    isAuthenticated: boolean;
}
```

---

### 17. Create the authentication API

Create:

```text
frontend/src/api/auth.ts
```

Start with:

```ts
import type { LoginResponse } from "../types/auth";

interface RegisterInput {
    username: string;
    email: string;
    password: string;
}

export async function register(
    input: RegisterInput,
): Promise<void> {
    const response = await fetch("/api/auth/register/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        throw new Error("Registration failed");
    }
}

export async function login(
    username: string,
    password: string,
): Promise<LoginResponse> {
    const response = await fetch("/api/auth/login/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            password,
        }),
    });

    if (!response.ok) {
        throw new Error("Login failed");
    }

    return response.json();
}

export async function logout(token: string): Promise<void> {
    const response = await fetch("/api/auth/logout/", {
        method: "POST",
        headers: {
            Authorization: `Token ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Logout failed");
    }
}
```

---

### 18. Create `useAuth()`

Create:

```text
frontend/src/hooks/useAuth.ts
```

For the MVP, keep it simple:

```tsx
import { useState } from "react";

import { login, logout } from "../api/auth";
import type { AuthUser } from "../types/auth";

export function useAuth() {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<AuthUser | null>(null);

    async function handleLogin(
        username: string,
        password: string,
    ) {
        const data = await login(username, password);

        setToken(data.token);
        setUser(data.user);
    }

    async function handleLogout() {
        if (token) {
            await logout(token);
        }

        setToken(null);
        setUser(null);
    }

    return {
        token,
        user,
        handleLogin,
        handleLogout,
    };
}
```

This is enough to understand the authentication concept.

Later, we'll move this into a React Context so authentication state is available throughout the application.

---

### 19. Send the token with job requests

Your current:

```ts
fetch("/api/jobs/")
```

needs authentication.

For example:

```ts
export async function getJobs(
    token: string,
): Promise<Job[]> {
    const response = await fetch("/api/jobs/", {
        headers: {
            Authorization: `Token ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch jobs");
    }

    return response.json();
}
```

And POST:

```ts
export async function createJob(
    token: string,
    job: CreateJobInput,
): Promise<Job> {
    const response = await fetch("/api/jobs/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
        },
        body: JSON.stringify(job),
    });

    if (!response.ok) {
        throw new Error("Failed to create job");
    }

    return response.json();
}
```

Instead of repeating this manually in every function. We can create an authenticated API helper.

Create: `frontend/src/api/client.ts`
```ts
export async function apiFetch(
    url: string,
    token: string,
    options: RequestInit = {},
) {
    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Token ${token}`,
        },
    });
}
```

Then authenticated APIs can use:

```ts
const response = await apiFetch("/api/auth/logout/", token, {
    method: "POST",
});
```

This centralizes the `Authorization` header instead of repeating it across every authenticated API call.

---

### 20. Manual security test

This is one of the most important Day 5 tasks.

Create two users:

```text
User A
username: usera
password: password123

User B
username: userb
password: password123
```

Login as User A.

Create:

```text
Job A
```

Login as User B.

Create:

```text
Job B
```

You should have:

```text
User A
└── Job A

User B
└── Job B
```

Now authenticate as User A and call:

```text
GET /api/jobs/
```

Expected:

```json
[
    {
        "id": 1,
        "title": "Job A"
    }
]
```

It should **not** contain Job B.

Now deliberately change the ID:

```text
GET /api/jobs/2/
```

Expected:

```text
404 Not Found
```
Response
```json
{
    "detail":"No Job matches the given query."
}
```

That verifies the actual security boundary.

---

### 21. Test authentication failures

Test these.

#### No authentication

```http
GET /api/jobs/
```

Expected:

```text
401 Unauthorized
```

#### Invalid token

```http
Authorization: Token fake-token
```

Expected:

```text
401 Unauthorized
```

#### Malformed authentication header

```http
Authorization: fake-token
```

Expected:

```text
401 Unauthorized
```

#### Missing username

```json
{
    "password": "password123"
}
```

Expected:

```text
400 Bad Request
```

#### Missing password

```json
{
    "username": "usera"
}
```

Expected:

```text
400 Bad Request
```

#### Wrong password

```json
{
    "username": "usera",
    "password": "wrong-password"
}
```

Expected:

```text
401 Unauthorized
```

---

### Authentication vs Authorization

**Authentication** answers: "Who are you?"

CareerPilot authenticates users using username/password credentials.
After successful login, Django REST Framework issues an authentication token.
The client sends that token with authenticated API requests.

**Authorization** answers: "What are you allowed to access?"

After authentication, CareerPilot restricts resources to the authenticated user.
For example, a user can only retrieve, update, or delete their own jobs.

Example:

- Authentication: User logs in successfully and receives a token.
- Authorization: `GET /api/jobs/` only returns jobs belonging to that user.

---

### Password Hashing vs Encryption

**Hashing** is one-way. A password is transformed into a hash that cannot
normally be reversed to recover the original password.

Django hashes passwords before storing them in the database. During login,
Django hashes/verifies the supplied password against the stored hash.

**Encryption** is reversible. Data is encrypted using a key and can later
be decrypted.

Passwords should be hashed, not encrypted, because the application should
never need to recover the user's original (plain-text) password.

---

### Identify 3 User-Controlled Inputs

#### A. Registration

```text
POST /api/auth/register/
```

User controls:

```text
username
email
password
```

**Server-side validation:** `RegisterSerializer`.

Make sure it validates required fields, valid email, password requirements,   and duplicate username/email as appropriate.

```python
class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
```

> [!NOTE] 
> Overriding serializer validation is not required here. 
- Password:  Minimum lenght 8
- Email: `serializers.EmailField()` ensures invalid input like `"hello"` is rejected server-side.

#### B. Job creation/update

```html
POST /api/jobs/
PATCH /api/jobs/<id>/
```

User controls:

```text
title
company
url
description
```

**Server-side validation:** `JobSerializer`.

For example:

```python
class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = ["id", "title", "company", "url", "description"]

    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        return value

    def validate_company(self, value):
        if not value.strip():
            raise serializers.ValidationError("Company cannot be empty.")
        return value
```

>[!NOTE]
> We override default serializer validation here using 
> ```python
> validate_<field_name>(self, value)
> ```` 

Your `URLField` already provides useful URL validation.

#### C. Application status/filter

```text
GET /api/applications/?status=...
```

User controls the `status` query parameter.

Your backend should only accept valid `JobStatus` values.

Since your model uses Django `choices`, explicitly validate it:

**Server-side validation:** `ApplicationListView`.

```python
from rest_framework.exceptions import ValidationError

...
status = self.request.query_params.get("status")

if status and status not in Application.Status.values:
    raise ValidationError({"status": "Invalid application status."})
```

---

#### AI API Key Security

CareerPilot does not currently integrate an AI provider, so there is no AI
API key in the application yet.

When AI integration is implemented, the API key will:
- Be stored only on the Django backend/server environment.
- Never be sent to or stored in the React client.
- Never be committed to Git.
- Be accessed through environment variables or deployment secrets.

Architecture:
``` text
React → Django API → AI Provider
```