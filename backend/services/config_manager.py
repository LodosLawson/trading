import os
import json
from pathlib import Path

APP_NAME = "Pulse"

def get_config_dir():
    """Get the appropriate user config directory for the OS."""
    if os.name == 'nt':
        # Windows
        base_dir = os.environ.get('APPDATA', os.path.expanduser('~'))
    else:
        # macOS / Linux
        base_dir = os.path.expanduser('~/.config')
        
    config_dir = Path(base_dir) / APP_NAME
    config_dir.mkdir(parents=True, exist_ok=True)
    return config_dir

def get_config_path():
    return get_config_dir() / "config.json"

def load_config():
    """Load configuration from the local JSON file. If it doesn't exist, return empty dict."""
    config_path = get_config_path()
    if config_path.exists():
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except json.JSONDecodeError:
            return {}
    return {}

def save_config(new_config: dict):
    """Save configuration to the local JSON file. Merges with existing config."""
    config_path = get_config_path()
    current_config = load_config()
    current_config.update(new_config)
    
    with open(config_path, 'w', encoding='utf-8') as f:
        json.dump(current_config, f, indent=4)
    return current_config

def get_api_key(key_name: str, fallback_env: bool = True):
    """
    Get an API key. Prioritizes the local JSON config. 
    Falls back to environment variables (for dev/cloud usage) if allowed.
    """
    config = load_config()
    if key_name in config and config[key_name]:
        return config[key_name]
    
    if fallback_env:
        return os.environ.get(key_name)
        
    return None
