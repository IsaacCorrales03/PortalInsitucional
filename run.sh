#!/bin/bash

LOG_DIR="logs"
mkdir -p "$LOG_DIR"

# Activar entorno virtual (bash)
source backend/venv/bin/activate
pip install -r backend/requirements.txt
# Backend
cd backend || exit
nohup uvicorn app.main:app --port 8000 --reload > "../$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
cd ..

# Frontend
cd frontend || exit
nohup npm run dev > "../$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
cd ..

# Socket
cd socket || exit
nohup npm install > "../$LOG_DIR/socket.log" 2>&1
nohup node server.js >> "../$LOG_DIR/socket.log" 2>&1 &
SOCKET_PID=$!
cd ..

# Output de control
echo "Run: kill $BACKEND_PID   # detener backend"
echo "Run: kill $FRONTEND_PID # detener frontend"
echo "Run: kill $SOCKET_PID   # detener socket"