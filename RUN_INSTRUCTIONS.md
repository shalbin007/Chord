# How to Run ChordAI

## Backend
The backend is a FastAPI application.

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```

2.  Create and activate a virtual environment:
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  Install dependencies (if not already done):
    ```bash
    pip install -r requirements.txt
    ```

4.  Run the server:
    ```bash
    python main.py
    ```
    The server will start at `http://0.0.0.0:8000`.

## Frontend
**Prerequisities Installed:** Node.js v18 and `nvm` have been installed.

To run the frontend, you need to ensure `nvm` is loaded and Node 18 is selected. Run the following in your terminal:

1.  **Load nvm and switch to Node 18:**
    ```bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm use 18
    ```
    *(Note: You might want to add these lines to your `.bashrc` or `.zshrc` to make `nvm` available automatically in new terminals).*

2.  **Start the server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:8080`.
