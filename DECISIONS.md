# Architecture Decision Records

## ADR-001: Treat Committed Content as Potentially Public

### Status

Accepted

### Context

CareerPilot will eventually be published as a public GitHub repository.
Development notes and project documentation are currently stored in the
same repository.

### Decision

Anything committed to the CareerPilot repository should be considered
potentially public.

The repository may be made public in the future, so committed files
must not contain secrets, credentials, private user data, or other
information that should not be publicly accessible.

#### Guidelines

- Never commit API keys, passwords, tokens, or credentials.
- Never commit `.env` files containing secrets.
- Do not commit real user data or private application information.
- Keep learning and engineering notes professional and potentially
  portfolio-ready.
- Use `.env.example` for documenting required environment variables.
- Use sanitized or fictional data in examples and development fixtures.

### Rationale

This prevents accidentally committing secrets, private information,
or informal content that would be inappropriate for a public portfolio.


### Consequences

- `README.md`, `DECISIONS.md`, `LEARNING_LOG.md`, source code, tests,
  documentation, and project configuration are treated as potentially
  public artifacts.
- Secrets and private information must be kept outside the repository.
- Repository examples and test data should use placeholders or
  fictional/sanitized data.


## ADR-002: Django + Django REST Framework

### Status

Accepted

### Context

CareerPilot requires a backend application that can provide a REST API
for the React frontend and handle authentication, authorization, database
access, validation, and business logic.

The backend will also integrate with an external AI provider and manage
user-owned resources such as job postings, job applications, interview
preparation data, and AI-generated job analyses.

The project is intended to demonstrate production-oriented Python
software development while remaining small enough to build and deploy
within the MVP timeframe.

### Decision

Use Django as the backend framework and Django REST Framework (DRF) as
the API layer.

Django will provide the core application framework, ORM, authentication,
authorization, and administrative capabilities. DRF will provide the
REST API consumed by the React + TypeScript frontend.

#### Guidelines

- Use Django's ORM for database access.
- Use Django's built-in authentication system where appropriate.
- Use Django REST Framework for API endpoints.
- Keep business logic out of serializers and views when it becomes
  sufficiently complex to warrant a dedicated service layer.
- Keep AI provider integration behind backend services rather than
  exposing provider credentials or API calls to the frontend.
- Use Django's built-in security mechanisms and middleware where
  applicable.
- Write automated tests for important backend behavior and API
  endpoints.

### Rationale

Django provides a mature and batteries-included Python ecosystem that
fits CareerPilot's requirements for authentication, database access,
security, and application structure.

Django REST Framework provides the API functionality needed to connect
the Django backend with the React frontend without introducing a
separate API framework.

Using Django also allows the project to demonstrate practical experience
with a widely used Python web framework while keeping the technology
stack focused.

### Alternatives Considered

#### Flask

Flask is lightweight and provides greater freedom over application
structure. However, CareerPilot would require additional components and
decisions for authentication, database integration, API conventions,
and other functionality that Django already provides.

#### FastAPI

FastAPI provides excellent API development capabilities and strong
support for type hints and asynchronous workloads. However, the MVP
does not currently require its strengths enough to justify introducing
another framework when Django already provides the broader application
features CareerPilot needs.

### Consequences

- The backend will follow Django's project and application structure.
- PostgreSQL will be accessed through Django's ORM.
- API endpoints will be implemented using Django REST Framework.
- The React frontend will communicate with the backend through REST APIs.
- Django-specific concepts such as models, migrations, serializers,
  views/viewsets, permissions, and authentication will become part of
  the application's architecture.
- The project gains Django's mature ecosystem but becomes more coupled
  to the Django framework.


## ADR-003: Use uv for Python Dependency and Environment Management

### Status

Accepted

### Context

CareerPilot requires isolated Python dependencies, reproducible
development environments, and a straightforward dependency-management
workflow for local development, CI, and deployment.

### Decision

Use `uv` to manage the CareerPilot backend's Python environment and
dependencies.

The backend will use `pyproject.toml` to declare dependencies and
`uv.lock` to record resolved dependency versions.

#### Guidelines

- Keep the backend virtual environment in `.venv/`.
- Do not commit `.venv/`.
- Commit both `pyproject.toml` and `uv.lock`.
- Add dependencies using `uv add`.
- Add development-only dependencies using `uv add --dev`.
- Run backend commands using `uv run` where practical.
- CI and deployment environments should install dependencies from the
  committed project configuration and lockfile.

### Rationale

`uv` provides environment creation, dependency management, locking,
and command execution in a single tool.

Using a lockfile also makes backend environments more reproducible
across local development, CI, and deployment.

### Alternatives Considered

#### pip + venv

Python's built-in `venv` combined with `pip` is widely supported and
simple, but requires separate dependency and locking workflows.

#### Poetry

Poetry provides dependency and environment management but introduces
additional project-management conventions that CareerPilot does not
currently require.

### Consequences

- Contributors need `uv` installed to use the preferred backend
  development workflow.
- Python dependencies will be managed through `pyproject.toml`.
- Exact resolved dependency versions will be tracked in `uv.lock`.
- The backend will not rely on a manually maintained
  `requirements.txt` as its primary dependency definition.


## ADR-004: React + TypeScript for the Frontend

### Status

Accepted

### Context

CareerPilot requires a web frontend that provides the user interface for
job analysis, interview preparation, and application tracking.

The frontend will communicate with the Django REST API and will eventually
contain multiple interactive views, forms, API-driven data, and reusable
UI components.

The project also serves as a portfolio project intended to demonstrate
practical software development skills.

### Decision

Use React with TypeScript for the CareerPilot frontend.

React will be used to build the application's component-based user
interface, while TypeScript will provide static typing for the frontend
codebase.

The frontend will be developed as a separate application from the Django
backend and will communicate with the backend through REST APIs.

#### Guidelines

* Use React components to build the user interface.
* Use TypeScript rather than plain JavaScript for application code.
* Define appropriate types for API responses, request payloads, and
  important application state.
* Keep frontend and backend responsibilities clearly separated.
* Avoid duplicating backend business logic in the frontend.
* Keep API communication isolated from presentation components where
  practical.
* Prefer reusable components over duplicating UI logic.
* Use ESLint to maintain consistent code quality and identify common
  problems.

### Rationale

React provides a mature component-based approach for building interactive
web applications and has a large ecosystem and strong industry adoption.

TypeScript adds static type checking to JavaScript, which helps identify
errors during development and makes larger frontend codebases easier to
maintain.

Using React and TypeScript also provides relevant experience for modern
frontend development roles while keeping the CareerPilot technology stack
focused and widely recognized.

### Alternatives Considered

#### Plain JavaScript with React

React could be used without TypeScript. However, JavaScript would provide
less compile-time type checking and would make it easier for incorrect
data structures to propagate through the application.

#### Vue

Vue is a capable frontend framework with a strong developer experience.
However, React was selected because of its broader relevance to the
targeted software-development ecosystem and its suitability for the
project.

#### Angular

Angular provides a more opinionated and comprehensive frontend framework.
However, its additional structure and complexity are not necessary for
CareerPilot's MVP.

### Consequences

- The frontend codebase will use `.ts` and `.tsx` files.
- Developers working on the project will need a basic understanding of
  TypeScript.
- API contracts should be represented with appropriate TypeScript types.
- The frontend and backend can evolve independently as long as their API
  contract remains compatible.
- The project gains the benefits of static typing but introduces the
  additional concepts and tooling associated with TypeScript.

## ADR-005: Use Django's Built-in User Model

### Status

Accepted

### Context

CareerPilot requires users to own resources such as job applications. Django provides a built-in authentication and user model that already supports common user attributes and authentication functionality.

The MVP does not currently require custom authentication fields or behavior that would justify introducing a custom user model.

### Decision

Use Django's built-in `User` model for CareerPilot's MVP.

Application-specific models that belong to a user will reference `django.contrib.auth.models.User` using a foreign key.

#### Guidelines

- Use Django's built-in `User` model for MVP user accounts.
- Do not create a custom user model unless future requirements demonstrate a clear need for one.
- Use Django's built-in authentication mechanisms where applicable.
- Keep application-specific user data in application models rather than modifying the built-in user model.

### Rationale

Django's built-in user model provides the authentication and user management functionality required by the MVP without introducing unnecessary complexity.

Using the built-in model also keeps the initial architecture simple and allows development to focus on CareerPilot's core functionality.

### Alternatives Considered

#### Custom User Model

A custom user model would provide greater control over user fields and authentication behavior. However, the MVP does not currently require that flexibility, and introducing a custom model would add unnecessary complexity.

### Consequences

- `JobApplication` will reference Django's built-in `User` model.
- CareerPilot will use Django's existing authentication infrastructure.
- Future requirements that require custom user behavior may require revisiting this decision.

## ADR-006: Model Job Applications and Job Postings as Separate Entities

### Status

Accepted

### Context

CareerPilot needs to store job postings and track a user's application to those postings.

A job posting contains information about the position itself, while a job application represents a user's relationship with that posting and its current application status.

These are separate concepts with different lifecycles and responsibilities.

### Decision

Represent `JobPosting` and `JobApplication` as separate Django models.

`JobApplication` will reference both the owning `User` and the related `JobPosting` using foreign key relationships.

#### Guidelines

- Store job information in `JobPosting`.
- Store application-specific information in `JobApplication`.
- Do not duplicate job-posting fields inside `JobApplication`.
- Use foreign keys to represent the relationships between entities.
- Keep application status associated with `JobApplication`, not `JobPosting`.

### Rationale

Separating the two entities provides a clearer domain model and avoids duplicating job-posting information.

It also allows application-specific state, such as `saved`, `applied`, or `interview`, to remain independent from the underlying job posting.

### Consequences

- `JobPosting` and `JobApplication` have separate database tables.
- A `JobApplication` references a `JobPosting`.
- A `JobApplication` also references the owning `User`.
- Job-posting data can be reused by application records without duplication.
- Deleting a `JobPosting` currently cascades to its related `JobApplication` records.

## ADR-007: Represent Application Status Using Django TextChoices

### Status

Accepted

### Context

CareerPilot needs to track the lifecycle of a job application.

The application status must be restricted to a known set of values so that invalid or inconsistent states cannot be stored.

### Decision

Represent `JobApplication.status` using Django's `TextChoices`.

The MVP will support the following statuses:

* `saved`
* `applied`
* `interview`
* `offer`
* `rejected`

#### Guidelines

- Define application statuses using `models.TextChoices`.
- Store the machine-readable value in the database.
- Use Django's display labels for human-readable status values.
- Do not use arbitrary strings for application status.
- Add new statuses only when the application's domain requirements justify them.

### Rationale

`TextChoices` provides a clear set of allowed status values while integrating with Django's model validation and display functionality.

It also keeps the status values and their human-readable labels together in the model definition.

### Consequences

- Invalid status values can be detected through Django's model validation.
- API and frontend code can rely on a defined set of application statuses.
- Adding or changing statuses requires updating the model definition and potentially the frontend API types.
- Application lifecycle behavior can be extended later without changing the underlying relationship between users, applications, and job postings.

