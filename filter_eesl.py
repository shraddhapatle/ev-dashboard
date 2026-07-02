import pandas as pd
import numpy as np
import random

# 1. Load your Kaggle CSV (Ensure the filename matches your downloaded file)
# Assuming the kaggle file has columns like 'name', 'lat', 'lng', 'vendor'
df = pd.read_csv('ev_final.csv')

# 2. Filter for EESL only (adjust the 'vendor' column name based on the exact Kaggle schema)
# If the column is named something else like 'operator', change it below.
df_eesl = df[df['vendor'].str.contains('EESL', case=False, na=False)].copy()

# 3. Generate Synthetic Telemetry for the POC
num_stations = len(df_eesl)

# Create Station IDs
df_eesl['station_id'] = [f'EESL-IND-{str(i).zfill(4)}' for i in range(num_stations)]

# Assign Status (80% Online, 10% Warning, 5% Critical, 5% Offline)
status_choices = ['Online', 'Warning', 'Critical', 'Offline']
df_eesl['status'] = np.random.choice(status_choices, num_stations, p=[0.80, 0.10, 0.05, 0.05])

# Total Ports & Peak Capacity
df_eesl['total_ports'] = np.random.randint(2, 8, num_stations)
df_eesl['peak_capacity_kw'] = np.random.choice([50.0, 100.0, 150.0, 200.0], num_stations)

# Active Sessions & Current Load (Logic: can't have more sessions than ports)
df_eesl['active_sessions'] = df_eesl['total_ports'].apply(lambda x: random.randint(0, x))

# Logic: Offline stations have 0 load. Critical/Warning stations have high load.
def calculate_load(row):
    if row['status'] == 'Offline': return 0.0
    base_load = (row['active_sessions'] * 25.0) # Assume ~25kW per car
    if row['status'] in ['Warning', 'Critical']:
        return min(row['peak_capacity_kw'], base_load * random.uniform(1.2, 1.5))
    return min(row['peak_capacity_kw'], base_load * random.uniform(0.8, 1.1))

df_eesl['current_load_kw'] = df_eesl.apply(calculate_load, axis=1).round(1)

# Hardware Temperature (Logic: Higher load = higher temp. Critical status forces high temp)
def calculate_temp(row):
    if row['status'] == 'Offline': return random.uniform(25.0, 35.0)
    if row['status'] == 'Critical': return random.uniform(80.0, 95.0)
    if row['status'] == 'Warning': return random.uniform(65.0, 79.0)
    return random.uniform(35.0, 55.0)

df_eesl['temperature_celsius'] = df_eesl.apply(calculate_temp, axis=1).round(1)

# AI Risk Score (0-100)
def assign_risk(row):
    if row['status'] == 'Critical': return random.randint(85, 100)
    if row['status'] == 'Warning': return random.randint(60, 84)
    if row['status'] == 'Offline': return random.randint(70, 90) # Might be broken
    return random.randint(5, 30)

df_eesl['ai_risk_score'] = df_eesl.apply(assign_risk, axis=1)

# 4. Digital Twin Flag (Set exactly 2 stations to True for your POC feature)
df_eesl['has_digital_twin'] = False
if num_stations >= 2:
    twin_indices = random.sample(range(num_stations), 2)
    df_eesl.iloc[twin_indices, df_eesl.columns.get_loc('has_digital_twin')] = True

# 5. Export the Final CSV
columns_to_keep = [
    'station_id', 'name', 'lat', 'lng', 'vendor', 'status', 
    'current_load_kw', 'peak_capacity_kw', 'temperature_celsius', 
    'active_sessions', 'total_ports', 'ai_risk_score', 'has_digital_twin'
]
# Note: Rename 'name', 'lat', 'lng' if the Kaggle CSV uses different headers.
df_eesl.to_csv('eesl_final_poc.csv', index=False)

print("Successfully generated eesl_final_poc.csv with synthetic AI telemetry!")