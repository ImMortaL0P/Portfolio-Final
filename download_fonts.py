import urllib.request
import os

fonts = {
    "Anton": "https://fonts.gstatic.com/s/anton/v25/1Ptgg87LROyAm3Kz-C8ckhw.woff2",
    "Archivo": "https://fonts.gstatic.com/s/archivo/v20/k3kQo8UDI-1M0wlSSd04.woff2",
    "Spline Sans Mono": "https://fonts.gstatic.com/s/splinesansmono/v4/wXKdE3IWGmUDBzzR2Xg71-P40k1rR363V8c.woff2"
}

for name, url in fonts.items():
    filename = name.lower().replace(' ', '-') + '.woff2'
    filepath = os.path.join('assets/fonts', filename)
    print(f"Downloading {filename}...")
    urllib.request.urlretrieve(url, filepath)

    # Note: These URLs might not be correct 500/400 weights specifically 
    # I should use the proper google fonts api via bash curl to get accurate ones

print("Done")
