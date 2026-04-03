# tutor-ai-farmasi - Project Setup Guide

This project consists of three main components:
- `web_app`: The frontend application (Next.js) for user interaction.
- `ai_engine`: The production-ready AI inference service (FastAPI) for serving predictions.
- `ai_train`: The experimental and training workspace for model development using Jupyter Notebooks.

---

## Project Structure

| Component | Description | Tech Stack |
| :--- | :--- | :--- |
| **[`web_app`](./web_app/README.md)** | The main user interface and application logic. | Next.js, TypeScript |
| **[`ai_engine`](./ai_engine/README.md)** | FastAPI service that serves the trained model for predictions. | Python, FastAPI, Scikit-learn |
| **[`ai_train`](./ai_train/README.md)** | Research laboratory for training and evaluating models. | Python, Jupyter, Scikit-learn, Pandas |

---

## CI/CD Deployment with Vercel and GitHub Actions

To implement automated deployments via GitHub Actions, you must configure the following **GitHub Secrets** (`Settings > Secrets and variables > Actions`):

### Vercel Authentication
- `VERCEL_TOKEN`: Your Vercel API Token (generated from Vercel Account Settings).

### Project Identifiers
- `VERCEL_WEBAPP_ORG_ID`: Your Vercel Organization ID for the project.
- `VERCEL_WEBAPP_PROJECT_ID`: Your Vercel Project ID for the `web_app`.
- `VERCEL_AIENGINE_ORG_ID`: Your Vercel Organization ID for the project.
- `VERCEL_AIENGINE_PROJECT_ID`: Your Vercel Project ID for the `ai_engine`.

## Manual Setup: Environment Variables (Vercel)

The following environment variables for the **Web App** should be set up manually in the **Vercel Project Settings** under the **Environment Variables** section. **Note: These are NOT intended to be GitHub Secrets for CI/CD unless manually added to your workflow files.**

1. `DATABASE_URL`: Connection string for your database (e.g., Supabase).
2. `DIRECT_URL`: Direct connection string for your database.
3. `BETTER_AUTH_URL`: The base URL of your application (e.g., `https://your-app.vercel.app`).
4. `BETTER_AUTH_SECRET`: A secret key for authentication (can be generated using `openssl rand -base64 32`).
5. `AI_ENGINE_URL`: The URL of your deployed `ai_engine` instance.
