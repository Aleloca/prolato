# Python Flask Dockerfile

Dockerfile template for Flask projects.

## Dockerfile

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:app"]
```

## Notes

- If `gunicorn` is not in `requirements.txt`, add it or fall back to:
  ```dockerfile
  CMD ["flask", "run", "--host=0.0.0.0", "--port=8000"]
  ```
- The module name `app:app` assumes the Flask instance is named `app` in `app.py`. Adjust based on the actual file and variable name (e.g., `main:app`, `wsgi:application`).
- If `pyproject.toml` exists with Poetry dependencies, use:
  ```dockerfile
  RUN pip install poetry && poetry config virtualenvs.create false && poetry install --no-dev
  ```
