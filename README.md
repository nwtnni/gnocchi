# gnocchi

Basic Minecraft-like procedurally generated world using WebGL and WebSockets.

Made with [Angela Jin][Angela] and [Irene Yoon][Irene] as our final project
for [CS 4621][Graphics].

## Screenshot

![Gnocchi screenshot](/assets/screenshot.png)

## Usage

To launch a client and connect to the deployed Heroku server:

```
$ python3 -m http.server
```

And then open the localhost URL spawned by Python in your favorite browser

---

To launch and connect to a local server (requires [Rust][1] to be installed):

First, uncomment and comment the following lines 7-13 in `event.js`:

```javascript
// Local testing
// const protocol = window.location.protocol === 'https:' && 'wss://' || 'ws://';
// const host = 'localhost:8080/ws';
// var connection = new WebSocket(protocol + host);

// Remote server
const host = "wss://gnocchi-graphics.herokuapp.com/ws";
var connection = new WebSocket(host);
```

So it looks like this:

```javascript
// Local testing
const protocol = window.location.protocol === 'https:' && 'wss://' || 'ws://';
const host = 'localhost:8080/ws';
var connection = new WebSocket(protocol + host);

// Remote server
// const host = "wss://gnocchi-graphics.herokuapp.com/ws";
// var connection = new WebSocket(host);
```

Then run the following commands

```
$ python3 -m http.server
$ cargo run --release
```

And then open the localhost URL spawned by Python in your favorite browser

## Dependencies

[Rust 1.31][1], WebGL 1.0, Python3

<sub><sup>not gluten-free</sup></sub>

[1]: https://rustup.rs/ 
[Angela]: https://github.com/acjin21
[Irene]: https://github.com/euisuny
[Graphics]: http://www.cs.cornell.edu/courses/cs4620/2018fa/cs4621/index.html 
