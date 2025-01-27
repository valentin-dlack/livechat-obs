# Livechat OBS

Livechat OBS is a professional real-time chat overlay solution for OBS, seamlessly integrating Discord messages into your streams. Inspired by Cacabox's Livechat ([demo](https://www.youtube.com/watch?v=Qs4zvCv1Ir8)), it provides a modern and customizable way to display chat messages in your broadcasts.

## Features

- 🔄 Real-time Discord message display
- 🎨 Customizable overlay styling
- 🖼️ Support for images, videos, and audio attachments
- ⚡ Low-latency WebSocket communication
- 🛡️ Secure Discord bot integration
- 🧪 Comprehensive test coverage

## Demo
> [!NOTE]  
> The following demo shows a live feed from OBS:

https://github.com/user-attachments/assets/c5c3c629-7850-45c6-854d-b7133b03337c

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- A Discord bot token ([How to create a Discord bot](https://discord.com/developers/docs/getting-started))

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/valentin-dlack/livechat-obs.git
    cd livechat-obs
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Configure environment variables:
    ```sh
    cp .env.example .env
    ```
    Edit the `.env` file and replace `your_bot_token` with your actual Discord bot token:
    ```
    BOT_TOKEN="your_bot_token"
    ```

4. Start the server:
    ```sh
    npm start
    ```

## Usage

1. Invite your Discord bot to your server with the following permissions:
   - Read Messages/View Channels
   - Send Messages
   - Read Message History

2. Access the overlay URL:
   ```
   http://<IP/localhost>:3000/channel/{CHANNEL_ID}
   ```
   Replace `{CHANNEL_ID}` with your Discord channel ID.

3. In OBS:
   - Add a new "Browser" source
   - Set the URL to your overlay URL
   - Set width and height as needed
   - Enable "Shutdown source when not visible" for optimal performance

## Available Commands

- `!tell <message>` - Display a message in the overlay
- `!stell <message>` - Display a message and remove previous messages
- `!stop` - Clear all messages from the overlay

## Development

Run tests:
```sh
npm test
```

Run tests in watch mode:
```sh
npm run test:watch
```

Run linting:
```sh
npm run lint
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by [Cacabox's Livechat](https://www.youtube.com/watch?v=Qs4zvCv1Ir8)
- Built with [Discord.js](https://discord.js.org/)
- Uses [Express](https://expressjs.com/) for the web server
- WebSocket implementation with [ws](https://github.com/websockets/ws)
