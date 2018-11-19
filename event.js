$(function() {

    const protocol = window.location.protocol === 'https:' && 'wss://' || 'ws://';
    const host = 'localhost:8080/ws/';
    var connection = new WebSocket(protocol + host);
    console.log(connection);

    connection.onopen = function() {
        console.log("Connected.");
    };

    connection.onmessage = function(m) {
        console.log("Received message: " + JSON.parse(m.data));
    };

    connection.onclose = function() {
        console.log("Disconnected.");
        connection = null;
    };

    // window.onkeydown = function (event) {
    //     console.log(event);
    //     event.preventDefault();

    //     switch (event.key) {
    //     case "w":
    //         console.log("North");
    //         connection.send("N");
    //         break;
    //     case "a":
    //         console.log("West");
    //         connection.send("W");
    //         break;
    //     case "s":
    //         console.log("South");
    //         connection.send("S");
    //         break;
    //     case "d":
    //         console.log("East");
    //         connection.send("E");
    //         break;
    //     case "q":
    //         console.log("Down");
    //         connection.send("D");
    //         break;
    //     case "e":
    //         console.log("Up");
    //         connection.send("U");
    //         break;
    //     default:
    //         break;
    //     }
    // };
});

var data = [1, 1, 1, 1, 1, 1, 1, 1];
var chunk = new Chunk(2, [0, -10], data);
