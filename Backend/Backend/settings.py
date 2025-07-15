from pathlib import Path
import os
from corsheaders.defaults import default_headers

# Build paths inside the project like this: BASE_DIR / 'subdir'
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'i)gr*e4w+t+gu#vh3sma9ij*g304u(6y_0)!6c$msh!&a4975c'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# Application definition
INSTALLED_APPS = [
    "corsheaders",  # ✅ Keep CORS at the top
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "Sims",
    "rest_framework",
    "rest_framework.authtoken",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # ✅ Ensure CORS middleware is at the top
    "django.middleware.common.CommonMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# ✅ CORS SETTINGS (Fix duplicate issues)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # ✅ Allow React frontend
]

CORS_ALLOW_CREDENTIALS = True  # ✅ Allow sending authentication tokens
CORS_ALLOW_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
CORS_ALLOW_HEADERS = list(default_headers) + [
    "Authorization",
    "Content-Type",
]

# ✅ REMOVE CONFLICTING SETTINGS
# CORS_ALLOW_ALL_ORIGINS = True  # ❌ REMOVE THIS - It conflicts with CORS_ALLOWED_ORIGINS
# CORS_ORIGIN_WHITELIST = [...]  # ❌ REMOVE THIS - No need if CORS_ALLOWED_ORIGINS is set

# ✅ CSRF Settings (Optional)
CSRF_TRUSTED_ORIGINS = ["http://localhost:3000"]

# Root URL Configuration
ROOT_URLCONF = "Backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "Backend.wsgi.application"

# ✅ DATABASE CONFIGURATION
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ✅ AUTHENTICATION & PERMISSIONS
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",  # ✅ Enable token authentication
        "rest_framework_simplejwt.authentication.JWTAuthentication",  # ✅ Enable JWT authentication
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",  # ✅ Ensure authentication is required
    ],
}

# ✅ JWT CONFIGURATION
SIMPLE_JWT = {
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# ✅ AUTH BACKENDS
AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
]

# ✅ STATIC FILES
STATIC_URL = "/static/"

# ✅ EMAIL CONFIGURATION
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = "demo.smart.intern@gmail.com"
EMAIL_HOST_PASSWORD = "shjomhljmgfcjabf"
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

# ✅ FRONTEND URL
FRONTEND_URL = "http://localhost:3000"

# ✅ X-FRAME OPTIONS
X_FRAME_OPTIONS = "ALLOW-FROM http://localhost:3000"

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
