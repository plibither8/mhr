# mhr

> 🔗 A simple URL shortener, controlled via a Telegram bot.

mhr = mihir, but shortened (\*_\*).

## Setup

### Create a Telegram Bot

You would first need to create a Telegram bot and get the bot's access token. Fortunately, it's pretty simple and easy: you can create one with [@BotFather](https://t.me/BotFather).

Make sure to take note of the token received! It should look like this: `3141592653:KAS_JFD04YEGFxbQV4FTPetQpZefUhr37HC`.

### Get your Telegram Chat ID

The `chat_id` identifies you on Telegram. You can get it by `/start`ing a chat with [@RawDataBot](https://t.me/RawDataBot) or [some other ways](https://stackoverflow.com/questions/32423837/telegram-bot-how-to-get-a-group-chat-id). It can be a positive or negative number.

### Setup the Server

1. Clone this repo: `git clone https://github.com/plibither8/mhr`
2. Install dependencies: `npm install`
3. Create `config.json` file from [`config.example.json`](config.example.json) file: `cp config.example.json config.json`
4. Edit the `config.json` file with **your values**
5. Start up the server and use the bot: `npm start`
6. Party hard.

## Usage

Open the chat with your bot and `/start` it.

Interact with your Telegram bot to create, read, update or delete the aliases. Following are the available commands:

| Command       | Description                                           |
|---------------|-------------------------------------------------------|
| **`/help`**   | Show list of commands and help information.           |
| **`/cancel`** | Cancel the ongoing operation.                         |
| **`/urls`**   | Show list of shortened URLs along with their aliases. |
| **`/new`**    | Create a new alias for a URL.                         |
| **`/update`** | Update the target URL for an existing alias.          |
| **`/delete`** | Delete an alias and redirection.                      |

## License

[MIT](LICENSE)
