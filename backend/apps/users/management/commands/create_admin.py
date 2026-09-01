"""
Management command: create_admin

Creates a Django superuser from environment variables if one does not already
exist.  This is called from build.sh so the admin panel is always accessible
on Render's free tier (which has no shell access).

Required environment variables on Render:
    DJANGO_SUPERUSER_EMAIL     — admin login email
    DJANGO_SUPERUSER_PASSWORD  — admin login password

The command is intentionally silent when the account already exists so
re-deploys are noise-free.
"""

import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Create a superuser from env vars if one does not already exist."

    def handle(self, *args, **options):
        User = get_user_model()

        email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "").strip()
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "").strip()

        if not email or not password:
            self.stdout.write(self.style.WARNING(
                "create_admin: DJANGO_SUPERUSER_EMAIL or DJANGO_SUPERUSER_PASSWORD "
                "not set — skipping superuser creation."
            ))
            return

        if User.objects.filter(is_superuser=True).exists():
            self.stdout.write(
                "create_admin: superuser already exists — skipping."
            )
            return

        User.objects.create_superuser(email=email, password=password)
        self.stdout.write(self.style.SUCCESS(
            f"create_admin: superuser created → {email}"
        ))
