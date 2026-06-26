# AI-Based University Recommendation System - Claude Rules

## Project Summary

This is a BSCS Final Year Project named AI-Based University Recommendation System. It helps students planning to study abroad by analyzing academic profile, budget, target degree, program interests, scores, country/continent/worldwide preferences, and credentials, then providing AI-assisted university recommendations.

## Tech Stack

Frontend: React, Vite, TailwindCSS.
Backend: FastAPI, MongoDB, Beanie ODM.
Auth: JWT authentication.
AI: OpenAI API foundation.
Development: Docker Compose, Git, private GitHub repo.

## Main Rule

Do not break the current working project.

## Workflow

Always follow:
Analyze → Plan → List affected files → Wait for approval → Edit → Test → Summary.

## Coding Rules

* Do not rewrite the full project unless explicitly asked.
* Do not refactor unrelated files.
* Do not touch frontend unless the task requires it.
* Do not touch recommendation logic unless the task requires it.
* Do not expose, read aloud, print, hardcode, or commit .env secrets.
* Do not commit or push unless I explicitly approve.
* Keep changes minimal and testable.
* After edits, show git diff summary and exact test commands.

## Current Priority

Backend stability and security first. UI polish later.

## Security Rules

* Public registration must never trust a client-supplied role.
* Student/admin role separation must be enforced server-side.
* Official university data should come from verified database records wherever possible, not blindly from AI-generated output.

## Git Rules

main is stable.
dev is active development.
Commit only after tests pass.
