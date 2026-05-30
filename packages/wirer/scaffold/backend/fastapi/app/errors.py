"""Shared error type for service-layer exceptions.

Every module's service errors should subclass AppError so the error_handler
converts them to a consistent JSON shape: { "code": ..., "message": ... }.
"""


class AppError(Exception):
    """Base for service-layer errors mapped to HTTP responses by middleware."""

    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)
