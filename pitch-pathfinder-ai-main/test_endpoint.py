import requests

url = 'http://127.0.0.1:8002/ai/assess'
files = {'file': open('runs/exp1/best.pt', 'rb')}

try:
    response = requests.post(url, files=files)
    print(f"Status code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")