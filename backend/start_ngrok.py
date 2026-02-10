import os
import time
import subprocess
import sys

def install_ngrok_if_needed():
    try:
        subprocess.check_call(["ngrok", "--version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except FileNotFoundError:
        print("Ngrok is not installed. Please install it from https://ngrok.com/download")
        sys.exit(1)

def start_ngrok():
    print("Starting ngrok tunnel on port 8000...")
    # Start ngrok in a separate process
    # We use 'start' on Windows to open a new window, but subprocess.Popen is better for background
    try:
        ngrok_process = subprocess.Popen(["ngrok", "http", "8000"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        time.sleep(3) # Give it a moment to start
        
        # We can't easily grab the URL from stdout because ngrok uses a UI.
        # So we query the local ngrok API.
        import requests
        try:
            response = requests.get("http://localhost:4040/api/tunnels")
            tunnels = response.json()["tunnels"]
            public_url = tunnels[0]["public_url"]
            print(f"\n✅ Ngrok Tunnel Started!")
            print(f"🌍 Public URL: {public_url}")
            print(f"\nCreating/Updating frontend/.env.local with this URL...")
            
            env_path = os.path.join(os.path.dirname(__file__), "../frontend/.env.local")
            with open(env_path, "w") as f:
                f.write(f"NEXT_PUBLIC_API_URL={public_url}\n")
            print(f"✅ Updated {env_path}")
            
            print("\n⚠️  KEEP THIS SCRIPT RUNNING TO KEEP THE TUNNEL OPEN ⚠️")
            ngrok_process.wait()
        except Exception as e:
            print(f"Error getting ngrok URL: {e}")
            print("Make sure ngrok is running.")
            ngrok_process.terminate()
            
    except KeyboardInterrupt:
        print("Stopping tunnel...")
        ngrok_process.terminate()

if __name__ == "__main__":
    try:
        import requests
    except ImportError:
        print("Installing requests library...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    
    install_ngrok_if_needed()
    start_ngrok()
