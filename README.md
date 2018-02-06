# Plurbot
PlurBot is a moderation bot for plug.dj for [Plur Electronica](https://plug.dj/plur-electronica), using node and the PlugAPI. A modification of the "F!shtank" bot of the "SWaQ Hanger" plug.dj room.

## Prerequisites
- Have [Git](https://git-scm.com/downloads)
- Have [Node & NPM](https://nodejs.org)

## Setup

1. Run `git clone https://github.com/Psykoral/plurbot.git`
2. Run `cd plurbot`
3. Run `npm i` to install the required packages.
4. Create a file called `creds.js`.
5. Use this template for the format of the file:
```javascript
module.exports = {
    email: "myplugbot@gmail.com",
    password: "myplugbotspassword",
    room: "plur-electronica"
}
```

## Running

`npm start` // Or `npm start &` to run in the background
