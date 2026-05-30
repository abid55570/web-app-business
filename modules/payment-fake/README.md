# payment-fake — always-succeeds adapter

Implements `payment@v1`. No HTTP. Test/dev/spike only.

Mounted by orders module via `get_payment_adapter()`. Real gateways
(payment-stripe, payment-razorpay) follow same `PaymentAdapter` ABC.

No router, no model — pure adapter class. Wirer copies `adapters.py` to
`<out>/backend/app/payment_fake/adapters.py`.
