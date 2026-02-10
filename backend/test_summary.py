
import sys
import os
import urllib.request
import json

def test_summary():
    print("--- Testing Market Summary API ---")
    url = "http://localhost:8000/api/news/summary"
    
    try:
        with urllib.request.urlopen(url) as response:
            if response.status == 200:
                data = json.loads(response.read().decode())
                print("Summary Response:")
                print(json.dumps(data, indent=2))
                
                if "sentiment" in data and "takeaways" in data:
                    print("\n✅ API Validation Passed")
                else:
                    print("\n❌ API Validation Failed: Missing keys")
            else:
                print(f"Error {response.status}")
    except Exception as e:
        print(f"Connection Error: {e}")

if __name__ == "__main__":
    test_summary()
