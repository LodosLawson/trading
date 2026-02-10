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

def start_services():
    print("Starting services...")
    
    # 1. Start Backend (Uvicorn)
    print("Starting FastAPI Backend on port 8000...")
    # Use Popen to run in background
    backend_process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.main:app", "--reload", "--port", "8000"],
        cwd=os.path.join(os.path.dirname(__file__), ".."),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    time.sleep(5) # Wait for backend to initialize

    # 2. Start Ngrok
    print("Starting Ngrok Tunnel on port 8000...")
    ngrok_process = subprocess.Popen(
        ["ngrok", "http", "8000"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    time.sleep(5) # Give it a moment to connect
    
    # 3. Get Public URL
    import requests
    try:
        response = requests.get("http://localhost:4040/api/tunnels")
        tunnels = response.json()["tunnels"]
        public_url = tunnels[0]["public_url"]
        
        print("\n!!! SYSTEM ONLINE !!!")
        print(f"Backend: http://localhost:8000")
        print(f"Public URL: {public_url}")
        print("\nUpdating frontend/.env.local...")
        
        env_path = os.path.join(os.path.dirname(__file__), "../frontend/.env.local")
        with open(env_path, "w") as f:
            f.write(f"NEXT_PUBLIC_API_URL={public_url}\n")
        print(f"Updated {env_path}")
        
        print("\nKEEP THIS WINDOW OPEN to keep the server running.")
        print("Press Ctrl+C to stop.")
        
        # Keep the script running to keep subprocesses alive
        backend_process.wait()
        ngrok_process.wait()

    except Exception as e:
        print(f"Error: {e}")
        print("Make sure ngrok is running.")
        try:
            ngrok_process.terminate()
            backend_process.terminate()
        except:
            pass

if __name__ == "__main__":
    try:
        import requests
    except ImportError:
        print("Installing requests library...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    
    install_ngrok_if_needed()
    try:
        start_services()
    except KeyboardInterrupt:
        print("\nShutting down...")
