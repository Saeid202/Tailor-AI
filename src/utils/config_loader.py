"""
Configuration loader utility
"""
import yaml
from pathlib import Path
from typing import Dict, Any


class ConfigLoader:
    """Loads and manages configuration settings"""
    
    def __init__(self, config_path: str = "config/config.yaml"):
        self.config_path = Path(config_path)
        self.config = self._load_config()
    
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from YAML file"""
        if not self.config_path.exists():
            raise FileNotFoundError(f"Configuration file not found: {self.config_path}")
        
        with open(self.config_path, 'r') as f:
            config = yaml.safe_load(f)
        
        return config
    
    def get(self, key_path: str, default: Any = None) -> Any:
        """
        Get configuration value using dot notation
        Example: config.get('camera.resolution.width')
        """
        keys = key_path.split('.')
        value = self.config
        
        for key in keys:
            if isinstance(value, dict):
                value = value.get(key)
                if value is None:
                    return default
            else:
                return default
        
        return value
    
    def __getitem__(self, key: str) -> Any:
        """Allow dictionary-style access"""
        return self.config[key]
    
    def reload(self):
        """Reload configuration from file"""
        self.config = self._load_config()


# Global config instance
_config = None

def get_config(config_path: str = "config/config.yaml") -> ConfigLoader:
    """Get or create global configuration instance"""
    global _config
    if _config is None:
        _config = ConfigLoader(config_path)
    return _config

