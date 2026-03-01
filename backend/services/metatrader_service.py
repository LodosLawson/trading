import MetaTrader5 as mt5
import logging

logger = logging.getLogger(__name__)

class MT5Service:
    @staticmethod
    def connect(login: int, password: str, server: str) -> tuple[bool, str]:
        """
        Connect to a MetaTrader 5 account.
        Requires MT5 terminal to be installed and accessible.
        """
        from . import config_manager
        terminal_path = config_manager.get_api_key("MT5_TERMINAL_PATH", fallback_env=False)

        # Initialize MT5
        init_success = mt5.initialize(path=terminal_path) if terminal_path else mt5.initialize()
        
        if not init_success:
            err = mt5.last_error()
            logger.error(f"initialize() failed, error code = {err}")
            
            error_msg = f"Initialize failed {err}. "
            if err and err[0] == -10005:  # IPC timeout
                error_msg += "Please OPEN your MetaTrader 5 application BEFORE clicking connect."
            else:
                error_msg += "Check if MT5 is installed."
                
            return False, error_msg
            
        # Attempt to login
        authorized = mt5.login(login, password=password, server=server)
        if authorized:
            logger.info(f"Connected to MT5 account {login} on {server}")
            return True, "Success"
        else:
            err = mt5.last_error()
            logger.error(f"Failed to connect to MT5 account {login}, error code = {err}")
            mt5.shutdown()
            return False, f"Login failed (Wrong broker/server name, or terminal issues): {err}"

    @staticmethod
    def disconnect() -> bool:
        """
        Disconnect from MT5 terminal.
        """
        try:
            mt5.shutdown()
            logger.info("MT5 connection closed.")
            return True
        except Exception as e:
            logger.error(f"Error disconnecting MT5: {e}")
            return False

    @staticmethod
    def get_account_info() -> dict:
        """
        Get the current account summary.
        """
        account_info = mt5.account_info()
        if account_info is None:
            logger.error(f"Failed to get account info, error code = {mt5.last_error()}")
            return {}
        
        account_dict = account_info._asdict()
        return account_dict

    @staticmethod
    def get_positions() -> list:
        """
        Get all active positions.
        """
        positions = mt5.positions_get()
        if positions is None:
            logger.error(f"Failed to get positions, error code = {mt5.last_error()}")
            return []
            
        result = []
        for pos in positions:
            # Map MT5 positions to our frontend structure
            # Position types: 0 = POSITION_TYPE_BUY, 1 = POSITION_TYPE_SELL
            side = "LONG" if pos.type == 0 else "SHORT"
            result.append({
                "id": str(pos.ticket),
                "symbol": pos.symbol,
                "side": side,
                "qty": float(pos.volume),
                "entryPrice": float(pos.price_open),
                "currentPrice": float(pos.price_current),
                "pnl": float(pos.profit),
                "openedAt": int(pos.time) * 1000  # Convert to milliseconds for frontend
            })
            
        return result
