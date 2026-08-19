# Jubilee Nation Platform Engineering Guide

## Vision

Build a production-grade church engagement platform that demonstrates modern software engineering, cloud architecture, DevOps, and scalable application design.

This project is intended to be production ready.

Every architectural decision should prioritize maintainability, simplicity, scalability and developer experience.

---

# Engineering Principles

1. Simplicity over cleverness.
2. Readability over brevity.
3. Secure by default.
4. Mobile-first.
5. Accessibility first.
6. Strong typing everywhere.
7. Keep business logic out of UI components.
8. Reusable components over duplicated code.
9. Explain architectural decisions in pull requests.
10. Optimize only when necessary.

---

# Technology Stack

Frontend

- Next.js
- React
- TypeScript
- TailwindCSS
- Shadcn UI

Backend

- Next.js Route Handlers
- Prisma ORM

Database

- PostgreSQL

Authentication

- Auth.js

Infrastructure

- Docker
- Docker Compose
- AWS
- Terraform

Storage

- Amazon S3

Deployment

- GitHub Actions
- AWS

---

# Folder Principles

Each folder should have a single responsibility.

Business logic belongs inside services.

Validation belongs inside schemas.

Database logic belongs inside Prisma.

UI components should remain presentational.

---

# Database Principles

Never duplicate data.

Prefer relationships over duplicated columns.

Use foreign keys.

Always use migrations.

Never edit production data manually.

---

# Security

Validate every request.

Never trust client input.

Never expose secrets.

Environment variables only.

Hash passwords.

Use HTTPS in production.

---

# Git Workflow

feature/*
bugfix/*
hotfix/*
release/*

Never develop on main.

Every feature should have its own branch.

---

# UI

Mobile first.

Accessible.

Consistent spacing.

Consistent typography.

Dark mode supported.

---

# AI Assistant Instructions

You are contributing to the Jubilee Nation Platform.

Follow the existing architecture.

Do not introduce additional libraries unless necessary.

Do not change the project structure.

Do not introduce new design patterns without explanation.

Keep components small.

Prefer composition over inheritance.

Explain significant code changes.

If uncertain, ask before making architectural decisions.

---

# Definition of Done

A feature is complete when:

- Code compiles.
- Lint passes.
- Types pass.
- Database migrations run.
- UI is responsive.
- Edge cases handled.
- Error states handled.
- Loading states handled.
- Empty states handled.
- Code reviewed.
# Learning Notes

Whenever introducing a new technology:

- Explain why it exists.
- Explain the problem it solves.
- Explain why it was chosen over alternatives.