# Tutor AI Farmasi - AI Engine

This project is the AI Engine for Tutor AI Farmasi, responsible for analyzing sample images and predicting concentrations using machine learning models.

## Prerequisites

This project uses [uv](https://github.com/astral-sh/uv) for fast and reliable Python package management. Ensure you have `uv` installed on your system.

## Getting Started

### 1. Installation

Synchronize the project dependencies and create a virtual environment:

```bash
uv sync
```

### 2. Running the Server

Start the FastAPI server using `uv`:

```bash
# Using the main script directly
uv run main.py
```

The server will be available at `http://localhost:5000`.

## API Endpoints

- `GET /`: Health check and welcome message.

## Scalability: Adding New Metal Types

The engine uses a **Registry Pattern** for easy extension. To add support for a new metal:

1.  Place your `.pkl` model in the `models/` directory.
2.  Create a new class in `services/predictor.py` inheriting from `BaseMetalPredictor`.
3.  Implement the `extract_features` method specific to that metal.
4.  Register the new class in the `registry` instance at the bottom of the file:
    ```python
    registry.register("your_metal", YourMetalPredictor, aliases=["alias1", "alias2"])
    ```

## Directory Structure

- `models/`: Machine learning model files (`.pkl`).
- `routes/`: FastAPI router definitions.
- `services/`: Core logic, image processing, and predictors.
- `main.py`: Application entry point.
