# LockTrace Pulse

The ultimate AI-Native Trading Ecosystem.

## Architecture

LockTrace utilizes a split-architecture for maximum security and privacy:
1. **Pulse Web (Frontend):** A Next.js 16 (App Router) frontend hosted on the cloud. Focuses on UI/UX, charts, and visualizations.
2. **Pulse Node (Backend):** A local, downloadable `.exe` file (compiled via PyInstaller from FastAPI). Users run this on their own machines to securely manage API keys (Gemini, Apify) and broker connections (MetaTrader 5) without sending credentials to a centralized server.

### Running the Desktop Node
1. Navigate to the `Settings` page on the web app.
2. Download `PulseNode.exe`.
3. Run the executable (a GUI will appear showing the connection status).
4. The web app will automatically route sensitive requests to `http://localhost:8000`.

### Development
```bash
# Frontend
cd frontend
npm run dev

# Backend
cd backend
python main.py
```
