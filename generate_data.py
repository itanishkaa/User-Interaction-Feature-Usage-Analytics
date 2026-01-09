import pandas as pd
import random
from datetime import datetime, timedelta

random.seed(42)

num_rows = 50000
start_date = datetime.now() - timedelta(days=60)

features = [
    "Dashboard", "dashboard", "Search", "Filter",
    "Export", "KPI Page", None
]

actions = ["click", "view", "download"]
devices = ["web", "mobile"]
user_types = ["new", "returning"]

data = []

for i in range(num_rows):
    row = {
        "event_timestamp": start_date + timedelta(
            minutes=random.randint(0, 60 * 24 * 60)
        ),
        "user_id": random.randint(1000, 5000),
        "feature_name": random.choice(features),
        "action_type": random.choice(actions),
        "session_id": random.randint(10000, 50000),
        "session_duration_sec": random.choice([
            random.randint(10, 1800),
            None
        ]),
        "device_type": random.choice(devices),
        "user_type": random.choice(user_types)
    }

    # introduce duplicates
    if random.random() < 0.05:
        data.append(row)

    data.append(row)

df = pd.DataFrame(data)
df.to_csv("user_interactions_raw.csv", index=False)

print("✅ Uncleaned user interaction data generated")
