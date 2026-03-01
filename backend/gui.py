import tkinter as tk
from tkinter import scrolledtext, ttk
import threading
import uvicorn
import sys
import os
import socket

# We must import the app *after* any sys path manipulations in a packaged environment,
# but since this is the entry point, we can just import it.
from main import app

class PulseNodeGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Pulse Local Node")
        self.root.geometry("600x400")
        self.root.configure(bg="#0a0a0f") # Dark theme matching frontend
        
        # Style
        style = ttk.Style()
        style.theme_use('clam')
        style.configure("TFrame", background="#0a0a0f")
        style.configure("TLabel", background="#0a0a0f", foreground="white", font=("Courier", 10))
        style.configure("TButton", padding=6, font=("Helvetica", 10, "bold"))
        style.map("TButton",
            background=[('active', '#3b82f6'), ('!active', '#1e3a8a')],
            foreground=[('active', 'white'), ('!active', 'white')]
        )

        # Header Frame
        header_frame = ttk.Frame(self.root)
        header_frame.pack(fill=tk.X, padx=10, pady=10)

        self.status_label = ttk.Label(header_frame, text="Status: 🔴 Offline", font=("Courier", 12, "bold"))
        self.status_label.pack(side=tk.LEFT)

        self.ip_label = ttk.Label(header_frame, text=f"URL: http://127.0.0.1:8000")
        self.ip_label.pack(side=tk.RIGHT)

        # Log Area
        self.log_area = scrolledtext.ScrolledText(self.root, bg="#111118", fg="#3b82f6", font=("Consolas", 9), wrap=tk.WORD)
        self.log_area.pack(expand=True, fill=tk.BOTH, padx=10, pady=5)
        self.log_area.insert(tk.END, "Pulse Node Initializing...\n")
        
        # Redirect stdout and stderr to GUI
        sys.stdout = self
        sys.stderr = self

        # Control Frame
        control_frame = ttk.Frame(self.root)
        control_frame.pack(fill=tk.X, padx=10, pady=10)
        
        ttk.Label(control_frame, text="Keep this window open while trading.", foreground="#6b7280", font=("Helvetica", 9)).pack(side=tk.LEFT)

        # Start Server automatically
        self.server_thread = threading.Thread(target=self.run_server, daemon=True)
        self.server_thread.start()

    def write(self, text):
        """Called by sys.stdout/stderr to redirect prints to the text widget"""
        self.log_area.insert(tk.END, text)
        self.log_area.see(tk.END) # Auto scroll

    def flush(self):
        pass
        
    def isatty(self):
        # Uvicorn logging needs this
        return False

    def run_server(self):
        try:
            self.status_label.config(text="Status: 🟢 Running", foreground="#10b981")
            self.write("Starting FastAPI Server on port 8000...\n")
            
            # Create a simple logging config that pushes to stdout (which is now this GUI)
            import logging
            logging.basicConfig(level=logging.INFO, stream=sys.stdout, format='%(asctime)s - %(message)s')
            logger = logging.getLogger("uvicorn.error")
            logger.addHandler(logging.StreamHandler(sys.stdout))
            
            # Run
            uvicorn.run(app, host="127.0.0.1", port=8000, log_config=None)
        except Exception as e:
            self.write(f"\n[ERROR] Server crashed: {e}\n")
            self.status_label.config(text="Status: 🔴 Error", foreground="#ef4444")

if __name__ == "__main__":
    root = tk.Tk()
    app_gui = PulseNodeGUI(root)
    
    # Graceful exit
    def on_closing():
        root.destroy()
        sys.exit(0)
        
    root.protocol("WM_DELETE_WINDOW", on_closing)
    root.mainloop()
