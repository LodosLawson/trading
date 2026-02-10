
import sys
import os
import json
import urllib.request
import urllib.error

def test_chat():
    # Health Check first
    try:
        with urllib.request.urlopen("http://localhost:4044/health") as res:
             print(f"Health Check: {res.status}")
    except Exception as e:
        print(f"Health Check Failed: {e}")
        return

    print("--- Testing Chat Widget API ---")
    url = "http://localhost:4044/api/ai/chat"
    payload = {"message": "Is the market bullish today?"}
    data = json.dumps(payload).encode('utf-8')
    
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    
    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                print("Chat Response:")
                print(json.dumps(json.loads(response.read().decode()), indent=2))
            else:
                print(f"Error {response.status}")
    except urllib.error.URLError as e:
        print(f"Connection Error: {e}")

if __name__ == "__main__":
    test_chat()
