# Python Django Dockerfile

Dockerfile template for Django projects.

## Dockerfile

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN python manage.py collectstatic --noinput
EXPOSE 8000
CMD ["gunicorn", "{project_name}.wsgi:application", "--bind", "0.0.0.0:8000"]
```

Where `{project_name}` is the Django module name (the folder containing `wsgi.py`).
