import copernicusmarine
import xarray as xr
import json
import numpy as np

product_id = "OCEANCOLOUR_GLO_BGC_L4_MY_009_104"
dataset_id = "cmems_obs-oc_glo_bgc-plankton_my_l4-multi-4km_P1M"
variable = "CHL"
output_file = "data/chl_global.nc"

print("Opening dataset...")
try:
    ds = xr.open_dataset(output_file)
except FileNotFoundError:
    print("Dataset not found, downloading...")
    copernicusmarine.subset(
        dataset_id=dataset_id,
        variables=[variable],
        start_datetime="2023-01-01",
        end_datetime="2023-01-31",
        output_filename="chl_global.nc",
        output_directory="data"
    )
    ds = xr.open_dataset(output_file)

print("\n--- BACKEND SUBSET REPORT ---")
print(f"Product ID: {product_id}")
print(f"Dataset ID: {dataset_id}")
print(f"Variable: {variable}")
print(f"Units: {ds[variable].attrs.get('units', 'mg/m³')}")

lat_range = [float(ds.latitude.min()), float(ds.latitude.max())]
lon_range = [float(ds.longitude.min()), float(ds.longitude.max())]
time_range = [str(ds.time.min().values), str(ds.time.max().values)]

print(f"Latitude Range: {lat_range}")
print(f"Longitude Range: {lon_range}")
print(f"Time Range: {time_range}")

chl_data = ds[variable].values[0] # first time step
valid_mask = ~np.isnan(chl_data)
valid_count = int(np.sum(valid_mask))
missing_count = int(np.sum(~valid_mask))

print(f"Number of valid CHL values: {valid_count}")
print(f"Minimum CHL: {np.nanmin(chl_data) if valid_count > 0 else 'N/A'}")
print(f"Maximum CHL: {np.nanmax(chl_data) if valid_count > 0 else 'N/A'}")
print(f"Missing-value count: {missing_count}")

# Downsample for frontend
print("Downsampling for frontend...")
# Let's stride to make it 216x128 max like the other data, or maybe 360x180 (1-degree resolution)
stride_lat = max(1, len(ds.latitude) // 180)
stride_lon = max(1, len(ds.longitude) // 360)
print(f"Striding by lat: {stride_lat}, lon: {stride_lon}")

ds_sub = ds.isel(latitude=slice(None, None, stride_lat), longitude=slice(None, None, stride_lon))
lats = ds_sub.latitude.values
lons = ds_sub.longitude.values
chl_sub = ds_sub[variable].values[0]

rows = []
for i, lat in enumerate(lats):
    for j, lon in enumerate(lons):
        val = chl_sub[i, j]
        if not np.isnan(val) and val > 0:
            rows.append(["2023-01-01T00:00:00Z", round(float(lat), 4), round(float(lon), 4), round(float(val), 4)])

out_json = {
    "table": {
        "columnNames": ["time", "latitude", "longitude", "CHLOROPHYLL"],
        "columnTypes": ["String", "float", "float", "float"],
        "rows": rows
    }
}

with open("public/chlorophyll.json", "w") as f:
    json.dump(out_json, f)

print(f"Saved {len(rows)} points to public/chlorophyll.json")
