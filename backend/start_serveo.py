import os
import time
import subprocess
import sys
import re

def kill_port_8001():
    print("Cleaning up port 8001...")
    try:
        # Find PID using port 8001
        result = subprocess.check_output("netstat -ano | findstr :8001", shell=True).decode()
        lines = result.strip().split('\n')
        for line in lines:
            parts = line.split()
            pid = parts[-1]
            if pid != "0": # Don't kill system idle process
                print(f"Killing PID {pid}...")
                subprocess.call(f"taskkill /F /PID {pid}", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except:
        pass # No process found or permission error

def start_services():
    kill_port_8001()
    print("Starting services with SERVEO...")
    
    # 1. Start Backend (Uvicorn)
    print("Starting FastAPI Backend on port 8001...")
    log_file = open("backend_error.log", "w")
    backend_process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--reload", "--port", "8001"],
        cwd=os.path.dirname(os.path.abspath(__file__)), # Run from backend dir
        stdout=log_file,
        stderr=log_file
    )
    time.sleep(5) # Wait for backend to initialize

    # 2. Start Serveo SSH Tunnel
    print("Starting Serveo SSH Tunnel on port 8001...")
    # Serveo prints the URL to stdout
    # We need to capture it line by line
    serveo_process = subprocess.Popen(
        ["ssh", "-R", "80:localhost:8001", "serveo.net"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE, # Serveo might output to stderr or stdout
        stdin=subprocess.PIPE # Keep open
    )
    
    # Wait for URL
    public_url = None
    print("Waiting for Serveo URL...")
    
    # Read output non-blocking or just wait a bit and peek
    # Serveo outputs: "Forwarding HTTP traffic from https://XXXXX.serveo.net"
    try:
        # We'll read line by line for a few seconds
        start_time = time.time()
        while time.time() - start_time < 15:
            output = serveo_process.stdout.readline().decode().strip()
            if output:
                print(f"Serveo says: {output}")
                match = re.search(r"https://[a-zA-Z0-9-]+\.serveo\.net", output)
                if match:
                    public_url = match.group(0)
                    break
            else:
                time.sleep(0.1)
                
        if not public_url:
            print("Could not get URL from stdout, checking stderr...")
            # Sometimes SSH outputs connection info to stderr
            # But verifying URL is tricky without interactive
            # Let's try assumes it works if process is alive
            pass

    except Exception as e:
        print(f"Error reading Serveo output: {e}")

    if public_url:
        print("\n!!! SYSTEM ONLINE !!!")
        print(f"Backend: http://localhost:8001")
        print(f"Public URL: {public_url}")
        print("\nUpdating frontend/.env.local...")
        
        env_path = os.path.join(os.path.dirname(__file__), "../frontend/.env.local")
        with open(env_path, "w") as f:
            f.write(f"NEXT_PUBLIC_API_URL={public_url}\n")
        print(f"Updated {env_path}")
        
        print("\nKEEP THIS WINDOW OPEN to keep the server running.")
        print("Press Ctrl+C to stop.")
        
        # Keep alive
        backend_process.wait()
        serveo_process.wait()
    else:
        print("Failed to get Serveo URL. Trying manual fallback...")
        print("Please check the output above.")
        backend_process.terminate()
        serveo_process.terminate()

if __name__ == "__main__":
    try:
        start_services()
    except KeyboardInterrupt:
        print("\nShutting down...")
