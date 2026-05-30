"""payment-stripe router — re-exports the webhook router so the wirer's
backend_routers manifest entry resolves cleanly. (Wirer expects a
``router`` symbol per backend_routers entry; we point ours at webhooks.)
"""
from .webhooks import router as router  # noqa: F401, PLC0414
