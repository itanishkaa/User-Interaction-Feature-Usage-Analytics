import pandas as pd
import random
from datetime import datetime, timedelta

random.seed(42)

num_rows = 50000
start_date = datetime.now() - timedelta(days=60)

feature_categories = [
    "onboarding", "Onboarding", "search", "checkout", "Checkout",
    "dashboard", "export", "kpi_page", None
]

event_names_by_feature = {
    "onboarding": ["landing_viewed", "signup_started", "signup_completed", "onboarding_step_completed"],
    "search": ["page_viewed", "search_performed", "filter_applied"],
    "checkout": ["checkout_started", "payment_submitted", "checkout_completed"],
    "dashboard": ["page_viewed", "button_clicked", "widget_expanded"],
    "export": ["export_clicked", "download_completed"],
    "kpi_page": ["page_viewed", "button_clicked"],
}
generic_event_names = ["page_viewed", "button_clicked"]

device_types = ["mobile", "desktop", "tablet"]
browsers = ["Chrome", "Safari", "Firefox", "Edge", None]
os_by_device = {
    "mobile": ["iOS", "Android"],
    "tablet": ["iOS", "Android"],
    "desktop": ["Windows", "macOS", "Linux"],
}

data = []

for i in range(num_rows):
    feature_category = random.choice(feature_categories)
    normalized_feature = feature_category.lower() if feature_category else None
    event_pool = event_names_by_feature.get(normalized_feature, generic_event_names)
    device_type = random.choice(device_types)

    row = {
        "timestamp": (start_date + timedelta(
            minutes=random.randint(0, 60 * 24 * 60)
        )).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "user_id": f"usr_{random.randint(1000, 5000)}",
        "event_name": random.choice(event_pool),
        "feature_category": feature_category,
        "session_id": f"sess_{random.randint(10000, 50000)}",
        "device_type": device_type,
        "browser": random.choice(browsers),
        "os": random.choice(os_by_device[device_type]),
    }

    # introduce duplicates (real-world dupe events / retries)
    if random.random() < 0.05:
        data.append(row)

    data.append(row)

df = pd.DataFrame(data)
df.to_csv("user_interactions_raw.csv", index=False)

print("✅ Uncleaned user interaction data generated")
print(df.head())