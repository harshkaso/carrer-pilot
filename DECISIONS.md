# Architecture Decision Records

This document records architectural and engineering decisions made while
building CareerPilot.

Each decision captures the context, chosen approach, rationale,
alternatives considered, and consequences where the decision materially
affects the architecture or future development of the project.

---

# ADR-001: Treat Committed Content as Potentially Public

### Status

Accepted

### Context

CareerPilot will eventually be published as a public GitHub repository.
Development notes and project documentation are currently stored in the
same repository.

### Decision

Anything committed to the CareerPilot repository should be considered
potentially public.

The repository may be made public in the future, so committed files must
not contain secrets, credentials, private user data, or other information
that should not be publicly accessible.

### Guidelines

* Never commit API keys, passwords, tokens, or credentials.
* Never commit `.env` files containing secrets.
* Do not commit real user data or private application information.
* Keep learning and engineering notes professional and potentially
  portfolio-ready.
* Use `.env.example` for documenting required environment variables.
* Use sanitized or fictional data in examples and development fixtures.

### Rationale

This prevents accidentally committing secrets, private information, or
informal content that would be inappropriate for a public portfolio.

### Consequences

* `README.md`, `DECISIONS.md`, `LEARNING_LOG.md`, source code, tests,
  documentation, and project configuration are treated as potentially
  public artifacts.
* Secrets and private information must be kept outside the repository.
* Repository examples and test data should use placeholders or
  fictional/sanitized data.

---

# ADR-002: Django + Django REST Framework

### Status

Accepted

### Context

CareerPilot requires a backend application that can provide a REST API
for the React frontend and handle authentication, authorization, database
access, validation, and business logic.

The backend will also integrate with an external AI provider and manage
user-owned resources such as jobs, applications, interview preparation
data, and AI-generated job analyses.

The project is intended to demonstrate production-oriented Python
software development while remaining small enough to build and deploy
within the MVP timeframe.

### Decision

Use Django as the backend framework and Django REST Framework (DRF) as
the API layer.

Django will provide the core application framework, ORM, authentication,
authorization, and administrative capabilities. DRF will provide the
REST API consumed by the React + TypeScript frontend.

### Guidelines

* Use Django's ORM for database access.
* Use Django's built-in authentication system where appropriate.
* Use Django REST Framework for API endpoints.
* Keep business logic out of serializers and views when it becomes
  sufficiently complex to warrant a dedicated service layer.
* Keep AI provider integration behind backend services rather than
  exposing provider credentials or API calls to the frontend.
* Use Django's built-in security mechanisms and middleware where
  applicable.
* Write automated tests for important backend behavior and API
  endpoints.

### Rationale

Django provides a mature and batteries-included Python ecosystem that
fits CareerPilot's requirements for authentication, database access,
security, and application structure.

DRF provides the API functionality needed to connect Django with the
React frontend without introducing a separate API framework.

### Alternatives Considered

#### Flask

Flask is lightweight and provides greater freedom over application
structure. However, CareerPilot would require additional components and
decisions for authentication, database integration, API conventions,
and other functionality that Django already provides.

#### FastAPI

FastAPI provides excellent API development capabilities and strong
support for type hints and asynchronous workloads. However, the MVP does
not currently require its strengths enough to justify introducing
another framework when Django already provides the broader application
features CareerPilot needs.

### Consequences

* The backend follows Django's project and application structure.
* PostgreSQL is accessed through Django's ORM.
* API endpoints are implemented using DRF.
* The React frontend communicates with the backend through REST APIs.
* The project becomes coupled to Django's conventions and ecosystem.

---

# ADR-003: Use uv for Python Dependency and Environment Management

### Status

Accepted

### Context

CareerPilot requires isolated Python dependencies, reproducible
development environments, and a straightforward dependency-management
workflow for local development, CI, and deployment.

### Decision

Use `uv` to manage the CareerPilot backend's Python environment and
dependencies.

The backend uses `pyproject.toml` to declare dependencies and
`uv.lock` to record resolved dependency versions.

### Guidelines

* Keep the backend virtual environment in `.venv/`.
* Do not commit `.venv/`.
* Commit both `pyproject.toml` and `uv.lock`.
* Add dependencies using `uv add`.
* Add development-only dependencies using `uv add --dev`.
* Run backend commands using `uv run` where practical.
* CI and deployment environments should install dependencies from the
  committed project configuration and lockfile.

### Rationale

`uv` provides environment creation, dependency management, locking, and
command execution in a single tool.

Using a lockfile makes backend environments more reproducible across
local development, CI, and deployment.

### Alternatives Considered

#### pip + venv

Widely supported and simple, but requires separate dependency and
environment-management workflows.

#### Poetry

Provides dependency and environment management but introduces additional
project-management conventions that CareerPilot does not currently
require.

### Consequences

* Contributors need `uv` installed for the preferred backend workflow.
* Python dependencies are managed through `pyproject.toml`.
* Resolved dependency versions are tracked in `uv.lock`.
* The backend does not rely on a manually maintained `requirements.txt`
  as its primary dependency definition.

---

# ADR-004: React + TypeScript for the Frontend

### Status

Accepted

### Context

CareerPilot requires a web frontend containing interactive views, forms,
API-driven data, and reusable UI components.

The frontend will communicate with the Django REST API and is also
intended to demonstrate practical modern frontend development skills.

### Decision

Use React with TypeScript for the CareerPilot frontend.

The frontend is developed as a separate application from the Django
backend and communicates with the backend through REST APIs.

### Guidelines

* Use React components to build the user interface.
* Use TypeScript rather than plain JavaScript.
* Define types for API responses, request payloads, and important
  application state.
* Keep frontend and backend responsibilities clearly separated.
* Avoid duplicating backend business logic in the frontend.
* Keep API communication isolated from presentation components where
  practical.
* Prefer reusable components over duplicated UI logic.
* Use ESLint to maintain consistent code quality.

### Rationale

React provides a mature component-based approach for building
interactive web applications.

TypeScript provides compile-time type checking, improves editor support,
and makes larger frontend codebases easier to maintain.

### Alternatives Considered

#### Plain JavaScript with React

Would provide less compile-time protection against incorrect data
structures.

#### Vue

A capable alternative, but React was selected because of its relevance to
the target software-development ecosystem.

#### Angular

More opinionated and comprehensive than necessary for CareerPilot's MVP.

### Consequences

* The frontend uses `.ts` and `.tsx` files.
* API contracts are represented with TypeScript types.
* The frontend and backend can evolve independently while maintaining
  API compatibility.
* The project gains static typing but introduces TypeScript-specific
  tooling and concepts.

---

# ADR-005: Use Django's Built-in User Model

### Status

Accepted

### Context

CareerPilot requires users to own resources such as jobs and
applications.

Django provides a built-in authentication and user model that already
supports the account functionality required by the MVP.

The MVP does not currently require custom authentication fields or
behavior that would justify introducing a custom user model.

### Decision

Use Django's built-in `User` model for CareerPilot's MVP.

Application-specific models that belong to a user reference
`django.contrib.auth.models.User` using foreign keys.

### Guidelines

* Use Django's built-in `User` model for MVP accounts.
* Do not create a custom user model unless future requirements
  demonstrate a clear need.
* Use Django's built-in authentication infrastructure where applicable.
* Keep application-specific user data in application models.

### Rationale

The built-in model provides the authentication and user-management
functionality required by the MVP without introducing unnecessary
complexity.

### Alternatives Considered

#### Custom User Model

Would provide greater control over user fields and authentication
behavior, but the MVP does not currently require that flexibility.

### Consequences

* `Job` references Django's built-in `User`.
* `Application` references Django's built-in `User`.
* CareerPilot uses Django's existing authentication infrastructure.
* A future requirement for custom user behavior may require revisiting
  this decision.

---

# ADR-006: Model Jobs and Applications as Separate Entities

### Status

Accepted

### Context

CareerPilot needs to store information about job opportunities and
separately track a user's relationship with those opportunities.

A job contains information about the position itself, while an
application represents a user's application state for that job.

These concepts have different responsibilities and lifecycles.

### Decision

Represent `Job` and `Application` as separate Django models.

`Application` references both the owning `User` and the related `Job`.

The resulting relationship is:

```text
User
 ├── jobs
 │    └── Job
 │
 └── applications
      └── Application
             │
             └── job → Job
```

### Guidelines

* Store job information in `Job`.
* Store application-specific information in `Application`.
* Do not duplicate job fields inside `Application`.
* Use foreign keys to represent relationships.
* Keep application status associated with `Application`.
* Keep user ownership explicit on both user-owned entities.

### Rationale

Separating the entities avoids duplicating job information and makes the
domain model easier to reason about.

An application can have its own lifecycle without changing the underlying
job information.

### Alternatives Considered

#### Combine Job and Application

This would simplify the initial schema but would mix job information
with user-specific application state and make future reuse more
difficult.

### Consequences

* `Job` and `Application` have separate database tables.
* An `Application` references a `Job`.
* An `Application` references its owning `User`.
* Job data can be reused without duplicating job fields.
* Deleting a `Job` currently cascades to its related `Application`
  records.

---

# ADR-007: Represent Application Status Using Django TextChoices

### Status

Accepted

### Context

CareerPilot needs to track the lifecycle of a job application.

The status must be restricted to a known set of values.

### Decision

Represent `Application.status` using Django's `TextChoices`.

The MVP supports:

* `saved`
* `applied`
* `interview`
* `offer`
* `rejected`

### Guidelines

* Define statuses using `models.TextChoices`.
* Store machine-readable values in the database.
* Use human-readable labels for display.
* Do not use arbitrary status strings.
* Add statuses only when product requirements justify them.

### Rationale

`TextChoices` provides a defined set of domain values while integrating
with Django's model validation and display functionality.

### Consequences

* Backend code has a single source of truth for supported statuses.
* API validation can use the same status definitions.
* Frontend TypeScript types mirror the supported status values.
* Adding a status requires considering backend, API, and frontend
  changes.

---

# ADR-008: Use PostgreSQL as the Application Database

### Status

Accepted

### Context

CareerPilot initially used SQLite during Django project setup because
SQLite provides a simple way to verify that Django is functioning.

The application will eventually be deployed as a production web
application and requires a production-oriented relational database.

### Decision

Use PostgreSQL as CareerPilot's primary application database.

Run PostgreSQL in Docker during local development.

Django accesses PostgreSQL through the Django ORM.

### Guidelines

* Use PostgreSQL as the primary development and production database.
* Use Docker for local PostgreSQL infrastructure.
* Use Django migrations to manage application schema changes.
* Do not manually modify the production schema outside the migration
  process unless a migration cannot reasonably express the required
  operation.
* Use direct SQL for database learning, diagnostics, or cases where
  database-specific functionality is intentionally required.

### Rationale

PostgreSQL provides mature support for relational modeling,
constraints, indexes, transactions, joins, and production workloads.

Docker makes local database setup reproducible without requiring
PostgreSQL to be installed directly on the host machine.

### Alternatives Considered

#### SQLite

Useful for initial Django setup and lightweight development, but less
representative of the intended production environment.

#### MySQL

A capable relational database, but PostgreSQL was selected for its
feature set and strong fit with the project's Python ecosystem.

### Consequences

* Local development requires Docker for the PostgreSQL service.
* Django database configuration is PostgreSQL-specific.
* Developers need basic PostgreSQL knowledge in addition to Django ORM
  knowledge.
* The production environment can use the same database technology as
  local development.

---

# ADR-009: Use Django Migrations as the Application Schema Migration Mechanism

### Status

Accepted

### Context

CareerPilot's database schema is defined through Django models, but the
underlying database is PostgreSQL.

The project also uses direct SQL exercises to understand relational
database concepts independently of Django.

A clear distinction is required between learning/database-level SQL and
the application's actual schema management process.

### Decision

Use Django migrations as the authoritative mechanism for changing the
CareerPilot application database schema.

Raw SQL may be used for:

* learning;
* database inspection;
* diagnostics;
* performance investigation;
* database-specific operations when necessary.

### Rationale

Django migrations provide version-controlled, repeatable schema changes
that are tied directly to the application's models.

This allows schema changes to be reviewed and applied consistently
across development, CI, and deployment environments.

### Consequences

The normal schema workflow is:

```text
models.py
    ↓
makemigrations
    ↓
migration file
    ↓
migrate
    ↓
PostgreSQL schema
```

Direct SQL knowledge remains important because Django ultimately
translates ORM operations and migrations into database operations.

---

# ADR-010: Keep the React Frontend and Django Backend as Separate Applications

### Status

Accepted

### Context

CareerPilot contains a React + TypeScript frontend and a Django + DRF
backend.

The frontend and backend have different responsibilities and different
development tooling.

### Decision

Maintain the frontend and backend as separate applications communicating
through HTTP/JSON REST APIs.

The architecture is:

```text
React + TypeScript
        │
        │ HTTP / JSON
        ▼
Django REST Framework
        │
        ▼
Django ORM
        │
        ▼
PostgreSQL
```

### Guidelines

* React owns presentation and client-side interaction.
* Django owns server-side business rules and authorization.
* API modules isolate frontend network communication.
* The frontend must not access PostgreSQL directly.
* The frontend must not contain server-side secrets.
* Backend validation remains authoritative.

### Rationale

This separation creates a clear API boundary and allows the frontend
and backend to evolve independently.

It also reflects a common production architecture for modern web
applications.

### Alternatives Considered

#### Django Templates

Would simplify the architecture initially, but would not provide the
same React + TypeScript experience required by the project.

#### Combined frontend/backend framework

Would reduce the explicit API boundary but would make it harder to
demonstrate independent frontend and backend responsibilities.

### Consequences

* Two development servers are used locally.
* The frontend requires API communication rather than direct database
  access.
* API contracts become an important integration boundary.
* Deployment requires coordinating frontend and backend applications.

---

# ADR-011: Use the Vite Development Proxy for Local API Requests

### Status

Accepted

### Context

During development, Vite and Django run on different local ports.

Directly hardcoding the Django development URL throughout the frontend
would couple application code to the local development environment.

### Decision

Configure Vite to proxy `/api` requests to the Django development
server.

Frontend code therefore uses:

```typescript
fetch("/api/jobs/")
```

rather than:

```typescript
fetch("http://127.0.0.1:8000/api/jobs/")
```

### Rationale

The proxy keeps API calls relative to the frontend application and
avoids unnecessary CORS configuration during local development.

### Consequences

* Local frontend API requests use the `/api` prefix.
* Vite handles development-time forwarding to Django.
* Production deployment will require an appropriate reverse proxy,
  hosting configuration, or equivalent API routing strategy.

---

# ADR-012: Isolate Frontend API Communication from React Components

### Status

Accepted

### Context

CareerPilot contains multiple React components that communicate with
the backend.

Placing `fetch()` calls directly inside every component would duplicate
HTTP behavior and make components harder to maintain.

### Decision

Keep frontend API communication in dedicated API modules.

The intended structure is:

```text
React Component
      ↓
API Module
      ↓
Django REST API
```

For example:

```text
src/api/jobs.ts
src/api/auth.ts
```

### Guidelines

* Keep HTTP requests in API modules.
* Keep presentation logic in React components.
* Keep API response types explicit.
* Centralize repeated HTTP concerns where practical.
* Do not put authentication or business rules exclusively in the API
  client.

### Rationale

This separation makes React components easier to understand and allows
API behavior to be reused across multiple components.

### Consequences

Frontend responsibilities become:

```text
Component
    → presentation and interaction

API module
    → HTTP communication

Hook
    → reusable client-side stateful logic
```

The backend remains authoritative for validation, authorization, and
business rules.

---

# ADR-013: Use Backend Filtering for Application Status

### Status

Accepted

### Context

CareerPilot needs to display applications by status, such as saved,
applied, interview, offer, or rejected.

Filtering could be performed either in React after retrieving all
applications or on the backend through the API.

### Decision

Perform application status filtering on the backend.

The API supports:

```text
GET /api/applications/
GET /api/applications/?status=saved
GET /api/applications/?status=applied
```

### Rationale

Backend filtering provides a better foundation for larger datasets.

The database can perform the filtering before results are transferred to
the frontend.

It also works naturally with future pagination and additional query
parameters.

### Consequences

* React does not need to download every application to filter them.
* API query parameters become part of the application's API contract.
* Status query parameters should be validated against the supported
  application statuses.
* Future filtering and pagination can be composed at the API level.

---

# ADR-014: Enforce Resource Ownership on the Backend

### Status

Accepted

### Context

CareerPilot is a multi-user application.

Users must only be able to access and modify their own jobs and
applications.

Relying on React to hide another user's resources would not provide
actual security because API requests can be made independently of the
frontend.

### Decision

Enforce ownership at the Django/DRF layer.

User-owned querysets are filtered using the authenticated user:

```python
Job.objects.filter(user=request.user)
```

and:

```python
Application.objects.filter(user=request.user)
```

When creating resources, ownership is assigned from the authenticated
request:

```python
serializer.save(user=request.user)
```

The client does not provide or control the owner.

### Rationale

Authorization must be enforced at a trusted server boundary.

Filtering the queryset before object retrieval also prevents users from
accessing another user's resources by changing an object ID.

### Security Model

```text
User A
   │
   ▼
GET /api/jobs/
   │
   ▼
Job.objects.filter(user=request.user)
   │
   ▼
Only User A's jobs
```

If User A requests User B's job ID, that job is not present in User A's
queryset and the API returns `404 Not Found`.

### Consequences

* Authorization is enforced independently of frontend behavior.
* Clients cannot assign resources to arbitrary users.
* Every user-owned endpoint must explicitly consider ownership.
* Automated authorization tests are required for important endpoints.

---

# ADR-015: Use DRF Token Authentication for the MVP

### Status

Accepted

### Context

CareerPilot requires authentication between the React frontend and Django
API.

The MVP needs a straightforward mechanism for authenticating API
requests while keeping the implementation small enough for the initial
development timeframe.

### Decision

Use Django REST Framework's token authentication for the MVP.

Authenticated requests use:

```text
Authorization: Token <token>
```

The authentication flow is:

```text
Register
   ↓
Login
   ↓
Token issued
   ↓
React stores authentication state
   ↓
Token included in API requests
   ↓
Django authenticates request
```

### Guidelines

* Require authentication on user-owned endpoints.
* Never expose passwords after authentication.
* Do not commit authentication tokens.
* Do not expose third-party API keys to React.
* Revisit the authentication strategy if future requirements demand
  more sophisticated session or token management.

### Rationale

DRF token authentication is simple to understand and sufficient for the
current MVP API.

It also provides a clear authentication mechanism for demonstrating
backend authentication and authorization concepts.

### Alternatives Considered

#### Session Authentication

A strong choice for traditional Django applications, but the current
React/API architecture benefits from an explicit API authentication
mechanism.

#### JWT

JWT provides additional capabilities for distributed systems and
stateless authentication, but introduces additional complexity that is
not currently required by the MVP.

### Consequences

* Protected API requests require a valid token.
* Tokens must be treated as credentials.
* Authentication state management becomes a frontend concern.
* A future production implementation may require additional token
  lifecycle and storage considerations.

---

# ADR-016: Keep Authentication and Authorization as Separate Concerns

### Status

Accepted

### Context

CareerPilot needs both identity verification and resource protection.

These are related but distinct security responsibilities.

### Decision

Treat authentication and authorization separately.

Authentication answers:

> Who is making this request?

Authorization answers:

> Is this authenticated user allowed to access this resource?

### Implementation

Authentication is handled by DRF authentication mechanisms.

Authorization is enforced through:

```python
IsAuthenticated
```

and user-specific querysets such as:

```python
Job.objects.filter(user=request.user)
```

### Rationale

Separating these concepts makes the security model easier to reason about
and prevents a common mistake where verifying a user's identity is
incorrectly treated as sufficient permission checking.

### Consequences

Every protected endpoint must consider both:

1. whether the request is authenticated;
2. whether the authenticated user owns or has permission to access the
   requested resource.

---

# ADR-017: Keep Ownership Server-Controlled

### Status

Accepted

### Context

A client could theoretically submit a `user_id` when creating a job or
application.

Allowing this would make the client responsible for selecting resource
ownership and could allow users to attempt to create resources belonging
to other users.

### Decision

Do not expose ownership as a client-controlled API field.

The backend assigns ownership from:

```python
request.user
```

For example:

```python
def perform_create(self, serializer):
    serializer.save(user=self.request.user)
```

### Rationale

The authenticated request is the trusted source of identity.

Client-provided ownership data is unnecessary and should not be trusted.

### Consequences

* `user` is excluded from normal client-controlled serializers.
* Ownership is assigned by backend code.
* Frontend forms do not contain a user selector for user-owned
  resources.
* Authorization remains a server-side responsibility.

---

# ADR-018: Use Reusable React Components for Add and Edit Job Operations

### Status

Accepted

### Context

CareerPilot needs to create and edit jobs.

The two operations require almost identical fields and validation rules.

Maintaining separate forms would duplicate UI and validation logic.

### Decision

Use a single reusable `JobForm` component for both add and edit operations.

The operation is controlled by the parent component through props.

Conceptually:

```text
JobForm
├── mode="add"
└── mode="edit"
```

### Guidelines

* Keep form state and validation inside `JobForm`.
* Let the parent decide whether the operation is add or edit.
* Reuse the same validation rules for both operations.
* Keep API mutation logic outside the form.

### Rationale

The two operations have the same fundamental form structure.

Reusing the component reduces duplication and ensures validation behavior
remains consistent.

### Consequences

* One form component supports both operations.
* Changes to job fields generally require changes in one place.
* The form remains independent from the job API implementation.

---

# ADR-019: Centralize Job State Management in a Custom React Hook

### Status

Accepted

### Context

The job dashboard needs to load, create, update, and delete jobs.

Keeping all API state and mutation logic directly inside the dashboard
component would make the component increasingly difficult to maintain.

### Decision

Use a custom `useJobs()` hook to manage client-side job state and
mutations.

The hook exposes operations such as:

```text
jobs
loading
error
addJob
updateJob
deleteJob
reload
```

### Responsibilities

```text
JobForm
    → form state and validation

JobCard / JobsPage
    → UI operation state

useJobs
    → application state and mutations

api/jobs.ts
    → HTTP requests
```

### Rationale

The custom hook provides a clear boundary for reusable job-management
logic without introducing unnecessary global state management for the
current MVP.

### Consequences

* Job state is centralized within the hook.
* Multiple components can consume the same job-management logic.
* More sophisticated global state management can be introduced later
  if the application actually requires it.

---

# ADR-020: Keep Backend Validation Authoritative

### Status

Accepted

### Context

CareerPilot performs validation in the React frontend for usability.

However, frontend validation can be bypassed because API requests can be
made directly against the backend.

### Decision

Frontend validation is treated as a user-experience feature, while
backend validation remains authoritative.

### Guidelines

* Validate user input in the frontend to provide immediate feedback.
* Validate the same data again in the backend.
* Never rely exclusively on React validation for security or data
  integrity.
* Never trust client-controlled ownership or authorization fields.

### Rationale

The backend is the trusted system boundary.

Frontend validation improves usability but cannot enforce security or
database integrity on its own.

### Consequences

The same business rule may intentionally exist in both layers:

```text
React
 ↓
Fast user feedback

Django / DRF
 ↓
Authoritative validation
```

---

# ADR-021: Use a Thin Vertical Slice Before Expanding Features

### Status

Accepted

### Context

CareerPilot contains several planned features:

* job analysis;
* interview preparation;
* application tracking;
* authentication;
* AI integration;
* analytics.

Implementing all layers simultaneously would increase complexity and make
it difficult to verify individual parts of the system.

### Decision

Develop CareerPilot through thin vertical slices that exercise the full
stack before expanding functionality.

The initial slice followed:

```text
React
 ↓
API module
 ↓
DRF
 ↓
Serializer
 ↓
Django ORM
 ↓
PostgreSQL
```

### Rationale

A vertical slice validates that the major architectural layers work
together before additional features are built on top of them.

This reduces the risk of discovering integration problems late in the
project.

### Consequences

* Features are developed incrementally.
* Each development stage should leave the application in a working
  state.
* New functionality should integrate with the existing architecture
  rather than bypassing it.

---

# ADR-022: Keep AI Provider Integration Server-Side

### Status

Accepted

### Context

CareerPilot will eventually use an external AI provider for job analysis,
interview preparation, and other AI-assisted functionality.

AI provider credentials are sensitive and must not be exposed to the
browser.

### Decision

All AI provider communication will occur through the Django backend.

The intended architecture is:

```text
React
   ↓
Django / DRF
   ↓
AI Provider
```

The React application will never communicate directly with the AI
provider using a private server-side API key.

### Guidelines

* Store AI provider credentials in environment variables or deployment
  secrets.
* Never place AI API keys in React source code.
* Never commit AI credentials to Git.
* Validate and structure AI requests on the backend.
* Treat AI-generated output as untrusted application data and validate
  it before persistence where appropriate.

### Rationale

The backend is the appropriate trust boundary for provider credentials,
usage controls, validation, and future AI-related business logic.

### Consequences

* AI requests introduce backend latency.
* AI usage can be monitored and controlled server-side.
* Future rate limiting, usage limits, structured output validation, and
  provider abstraction can be implemented in the backend.
* The frontend remains independent of the specific AI provider.

---

# ADR-023: Use Backend Generic Views for Conventional CRUD APIs

### Status

Accepted

### Context

CareerPilot's initial REST API consists primarily of conventional CRUD
operations.

Writing custom API views for every standard operation would add
unnecessary code.

### Decision

Use DRF generic views where the endpoint behavior matches conventional
CRUD operations.

Examples include:

```python
generics.ListCreateAPIView
generics.RetrieveUpdateDestroyAPIView
generics.ListAPIView
```

View names describe the resource rather than repeating the HTTP
operations already communicated by the generic base class.

For example:

```python
class JobListView(generics.ListCreateAPIView):
    ...
```

rather than:

```python
class JobListCreateView(generics.ListCreateAPIView):
    ...
```

### Rationale

DRF generic views provide standard behavior while still allowing
customization through methods such as:

```python
get_queryset()
perform_create()
```

### Consequences

* CRUD endpoints require less boilerplate.
* Standard DRF conventions become part of the backend architecture.
* More complex business workflows may eventually require dedicated
  service logic or custom API views.

---

# ADR-024: Optimize Related Object Retrieval with `select_related`

### Status

Accepted

### Context

CareerPilot's application API returns application information together
with the related job.

Without careful query construction, serializing related objects can
result in unnecessary database queries.

### Decision

Use `select_related()` when retrieving foreign-key relationships that
are required by the API response.

For example:

```python
Application.objects.select_related("job")
```

### Rationale

`select_related()` allows Django to retrieve the related foreign-key
object efficiently as part of the database query.

This helps avoid the N+1 query pattern when serializing related data.

### Consequences

* API querysets explicitly communicate required relationships.
* Database query performance is improved for these access patterns.
* Query optimization should still be measured rather than applied
  indiscriminately.

---

# ADR-025: Keep Initial React Authentication State Simple, Then Improve Persistence

### Status

Accepted

### Context

The first authenticated React implementation needs to establish the
authentication flow without introducing unnecessary infrastructure.

The initial implementation stores the authentication token in React
state.

This means the token is lost when the page is refreshed.

### Decision

Use temporary in-memory authentication state for the initial
implementation and explicitly treat persistent authentication as a
follow-up concern.

### Rationale

The first objective is to prove the complete authentication flow:

```text
Login
 ↓
Token received
 ↓
Authenticated API request
 ↓
Logout
```

Persistent authentication/session management can then be implemented
after the core security boundary is working.

### Known Limitation

A browser refresh clears the React authentication state.

This means the current implementation does not provide persistent login
across page reloads.

### Consequences

* The current implementation remains intentionally simple.
* Persistent authentication is a known future improvement.
* Any future persistence mechanism must consider token security and
  browser storage risks rather than simply persisting the token
  automatically.

---

# ADR-026: Use Backend-Owned Filtering and Authorization Together

### Status

Accepted

### Context

CareerPilot's application API supports filtering by status while also
requiring users to see only their own applications.

Filtering by status without first applying ownership could accidentally
expose another user's records.

### Decision

User ownership is always applied as part of the base queryset before
optional user-controlled filters.

Conceptually:

```python
queryset = Application.objects.filter(
    user=self.request.user
)

if status:
    queryset = queryset.filter(status=status)
```

### Rationale

Authorization establishes the security boundary.

Filtering is then applied only within the authorized dataset.

### Consequences

A request such as:

```text
GET /api/applications/?status=applied
```

means:

> Return this authenticated user's applications whose status is
> `applied`.

It never means:

> Return all applications with status `applied`.

---

# ADR-027: Use Meaningful Separation Between Documentation and Source Code

### Status

Accepted

### Context

CareerPilot is both a working software project and a portfolio project.

The repository contains implementation code as well as engineering
documentation.

### Decision

Keep architectural decisions in `DECISIONS.md` and practical learning,
debugging, and interview notes in `LEARNING_LOG.md`.

### Responsibilities

```text
DECISIONS.md
    → Why architectural choices were made

LEARNING_LOG.md
    → What was learned and how problems were solved

README.md
    → What CareerPilot is and how to run/use it

Source code
    → Actual implementation
```

### Rationale

Separating these concerns keeps the repository easier to navigate and
prevents architectural rationale from becoming mixed with daily
development notes.

### Consequences

* Architecture decisions should not be duplicated unnecessarily in the
  learning log.
* Learning logs can contain implementation details without becoming the
  canonical source for architectural decisions.
* The README remains focused on the project's purpose and usage.

---

# ADR-028: Treat the Backend as the Final Source of Truth

### Status

Accepted

### Context

CareerPilot contains a React client that provides validation, local
state, and user interaction.

However, the client cannot be trusted for security, authorization, or
data integrity.

### Decision

The Django backend is the final source of truth for:

* authentication;
* authorization;
* ownership;
* validation;
* persisted application state;
* database operations;
* AI provider credentials;
* server-side business rules.

React is responsible for presentation, interaction, and client-side
usability.

### Architecture

```text
React
    ↓
User interaction
Client-side validation
Local UI state
    ↓
Django / DRF
    ↓
Authentication
Authorization
Validation
Business rules
    ↓
PostgreSQL
```

### Rationale

This establishes a clear trust boundary and prevents security-critical
logic from depending on client behavior.

### Consequences

* Frontend state can be treated as a representation of server state,
  rather than an authority.
* Successful mutations must be confirmed by the backend.
* Backend validation remains necessary even when equivalent frontend
  validation exists.
* Future clients could consume the same API without changing the core
  business rules.
