"""Vercel FastAPI entry — re-export app from app.main."""

from app.main import app

__all__ = ["app"]
