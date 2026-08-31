"""
core.logging_filters
~~~~~~~~~~~~~~~~~~~~
Custom logging filters for production safety.

Prevents sensitive data (passwords, tokens, secrets) from
appearing in log output.
"""

import logging
import re


# Patterns that must never appear in logs.
_SENSITIVE_PATTERNS = re.compile(
    r'(password|passwd|secret|token|jwt|authorization|api_key|api_secret)',
    re.IGNORECASE,
)


class SensitiveDataFilter(logging.Filter):
    """
    Logging filter that redacts sensitive key-value pairs
    from log messages.

    Registered in settings.py → LOGGING["filters"]["sensitive_data"].
    """

    def filter(self, record):
        if isinstance(record.msg, str):
            record.msg = _SENSITIVE_PATTERNS.sub('[REDACTED]', record.msg)

        if record.args:
            record.args = self._sanitize_args(record.args)

        return True

    def _sanitize_args(self, args):
        """Recursively sanitize log format arguments."""
        if isinstance(args, dict):
            return {
                k: '[REDACTED]' if _SENSITIVE_PATTERNS.search(str(k)) else v
                for k, v in args.items()
            }
        if isinstance(args, (list, tuple)):
            sanitized = [
                '[REDACTED]' if isinstance(a, str) and _SENSITIVE_PATTERNS.search(a) else a
                for a in args
            ]
            return type(args)(sanitized)
        return args
