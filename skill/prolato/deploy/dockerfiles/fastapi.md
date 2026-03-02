# Python FastAPI Dockerfile

Dockerfile template for FastAPI projects.

## Dockerfile

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Notes

- If the main file is not called `main.py`, adjust the `uvicorn` command (e.g., `app.main:app`).
- If `pyproject.toml` exists with Poetry dependencies, use:
  ```dockerfile
  RUN pip install poetry && poetry config virtualenvs.create false && poetry install --no-dev
  ```
