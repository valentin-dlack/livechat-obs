# RawChat 🔈

RawChat is a simple application that allows users to communicate in real-time using an overlay on OBS linked to Discord.
Inspired by Cacabox's Livechat, demo available [here](https://www.youtube.com/watch?v=Qs4zvCv1Ir8).

## Quick project demo

Web view with a sample background on the left, and Discord chat on the right.


## Installation

To install and run RawChat locally, follow these steps:

1. Clone the repository:
    ```sh
    git clone https://github.com/krz0001/rawchat.git
    cd rawchat
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file in the root directory and add your Discord bot token as BOT_TOKEN:
    ```sh
    touch .env
    ```

4. Start the development server:
    ```sh
    npm start
    ```

## Usage

Once the development server is running, you can access the application at `http://localhost:3000`. Register a new account or log in with an existing account to start chatting.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any features, bug fixes, or enhancements.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
