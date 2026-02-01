/* eslint-disable no-undef */
const page = document.body;
const sessionId = page.dataset.sessionId;
const sessionTimeRemaining = Number(page.dataset.timeRemaining || 0);

const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');
const palette = document.getElementById('colorPalette');
const timeRemainingEl = document.getElementById('timeRemaining');
const brushSizeInput = document.getElementById('brushSize');
const sizeValue = document.getElementById('sizeValue');
const eraserToggle = document.getElementById('eraserToggle');
const clearCanvas = document.getElementById('clearCanvas');

const colors = ['#1f1f1f', '#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
let currentColor = colors[0];
let isEraser = false;
let drawing = false;
let lastPoint = null;
let socket;

function formatTime(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
}

function updateTimer() {
    const now = Date.now();
    const endTime = now + sessionTimeRemaining;
    const tick = () => {
        const remaining = endTime - Date.now();
        timeRemainingEl.textContent = formatTime(remaining);
        if (remaining <= 0) {
            timeRemainingEl.textContent = '0:00';
            return;
        }
        requestAnimationFrame(tick);
    };
    tick();
}

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function setColor(color) {
    currentColor = color;
    isEraser = false;
    eraserToggle.classList.remove('active');
    document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.classList.toggle('active', swatch.dataset.color === color);
    });
}

function getPointerPosition(event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        rect
    };
}

function startDraw(event) {
    drawing = true;
    const { x, y } = getPointerPosition(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
    lastPoint = { x, y };
}

function endDraw() {
    drawing = false;
    ctx.beginPath();
    lastPoint = null;
}

function draw(event) {
    if (!drawing) return;
    const { x, y, rect } = getPointerPosition(event);

    const brushSize = Number(brushSizeInput.value);
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
    ctx.strokeStyle = isEraser ? '#000000' : currentColor;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    if (socket && socket.readyState === WebSocket.OPEN && lastPoint) {
        const stroke = {
            points: [
                { x: lastPoint.x / rect.width, y: lastPoint.y / rect.height },
                { x: x / rect.width, y: y / rect.height }
            ],
            color: currentColor,
            width: brushSize,
            widthRatio: brushSize / rect.width,
            tool: isEraser ? 'eraser' : 'pen'
        };
        socket.send(JSON.stringify({ type: 'paint:stroke', stroke }));
    }

    lastPoint = { x, y };
}

function drawStroke(stroke) {
    const rect = canvas.getBoundingClientRect();
    const points = stroke.points || [];
    if (points.length < 2) return;

    const lineWidth = stroke.widthRatio
        ? stroke.widthRatio * rect.width
        : (stroke.width || 3);

    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = stroke.tool === 'eraser' ? '#000000' : (stroke.color || '#000000');

    ctx.beginPath();
    ctx.moveTo(points[0].x * rect.width, points[0].y * rect.height);
    ctx.lineTo(points[1].x * rect.width, points[1].y * rect.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.globalCompositeOperation = 'source-over';
}

function connectWebSocket() {
    const wsUrl = `ws://${window.location.host}?sessionId=${sessionId}`;
    socket = new WebSocket(wsUrl);

    socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'paint:init') {
            if (Array.isArray(data.strokes)) {
                data.strokes.forEach(drawStroke);
            }
        }

        if (data.type === 'paint:stroke') {
            drawStroke(data.stroke);
        }

        if (data.type === 'paint:clear') {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    });

    socket.addEventListener('close', () => {
        setTimeout(connectWebSocket, 2000);
    });

    socket.addEventListener('error', () => {
        socket.close();
    });
}

function setupPalette() {
    colors.forEach(color => {
        const swatch = document.createElement('button');
        swatch.type = 'button';
        swatch.className = 'color-swatch';
        swatch.style.background = color;
        swatch.dataset.color = color;
        swatch.addEventListener('click', () => setColor(color));
        palette.appendChild(swatch);
    });
    setColor(colors[0]);
}

brushSizeInput.addEventListener('input', () => {
    sizeValue.textContent = brushSizeInput.value;
});

eraserToggle.disabled = true;
eraserToggle.classList.add('disabled');

clearCanvas.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'paint:clear' }));
    }
});

canvas.addEventListener('pointerdown', startDraw);
canvas.addEventListener('pointerup', endDraw);
canvas.addEventListener('pointerleave', endDraw);
canvas.addEventListener('pointermove', draw);

window.addEventListener('resize', () => {
    resizeCanvas();
});

setupPalette();
updateTimer();
resizeCanvas();
connectWebSocket();
