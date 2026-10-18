from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

API_KEY = "ak_f9ruyuht707lgyc48zw1zwhd"
EMAIL = "YOUR_EMAIL_HERE"   # <-- replace with your logged-in email

app = FastAPI()

# CORS: let any website call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analytics")
async def analytics(request: Request):
    # 1. Check the password
    if request.headers.get("x-api-key") != API_KEY:
        return JSONResponse({"error": "unauthorized"}, status_code=401)

    # 2. Read the events
    body = await request.json()
    events = body.get("events", [])

    # 3. Do the counting
    users = set()
    positive_totals = {}   # user -> sum of their positive amounts
    revenue = 0.0

    for e in events:
        user = e["user"]
        amount = e["amount"]
        users.add(user)
        if amount > 0:
            revenue += amount
            positive_totals[user] = positive_totals.get(user, 0) + amount

    top_user = max(positive_totals, key=positive_totals.get) if positive_totals else None

    # 4. Send the answer
    return {
        "email": EMAIL,
        "total_events": len(events),
        "unique_users": len(users),
        "revenue": round(revenue, 2),
        "top_user": top_user,
    }
