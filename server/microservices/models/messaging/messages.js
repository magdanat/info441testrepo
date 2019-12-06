"use strict";

// For express package
const express = require("express");

// For the database
const mysql = require("mysql");

//create a new express application
const app = express.Router();

// MySQL commands
const sqlPOSTMessage = "INSERT INTO messages (MessageBody, UserID) VALUES(?, ?)"
const sqlGETUsers = "SELECT * FROM users"

// Connecting to the mysql database
let connection = mysql.createPool({
    // We are going to need to set this ENV variable, TODO
    // host: process.env.MYSQL_ADDR,
    // user: 'root',
    // password: process.env.MYSQL_ROOT_PASSWORD,
    // database: process.env.MYSQL_DB
    host: '127.0.0.1',
    user: 'root',
    password: '123456789',
    database: 'scribble'
});

const amqp = require('amqplib/callback_api');

function sendMessageToRabbitMQ(msg) {
    // amqp.connect("amqp://" + process.env.RABBITADDR, (error0, conn) => {
      amqp.connect("amqp://" + "localhost:5672", (error0, conn) => {
        console.log("Sending message to RabbitMQ...");
        if (error0) {
            throw error0;
        }
        conn.createChannel((error1, ch) => {
            if (error1) {
                throw error1;
            }
            // let queueName = process.env.RABBITNAME;
            let queueName = "events"
            ch.assertQueue(queueName, { durable: true });
            ch.sendToQueue(queueName, Buffer.from(msg));
            console.log(" [x] Sent %s", msg);
            console.log("Message succesfully sent to RabbitMQ!");
        });
        setTimeout(function () {
            conn.close();
            process.exit(0);
        }, 500);
    });
}


// POST request to v1/messages
app.post("/", (req, res, next) => {
    let user = req.body.userid
    let username = req.body.username
    let message = req.body.message;
    connection.query(sqlPOSTMessage, [message, user.id], (err, result) => { 
        if (err) { 
            res.status(500).send("Unable to post message");
        } else { 
            res.status(201);
            res.set("Content-Type", "application/json");
            res.json(result);

            console.log("Succesfully posted message");
            // // Send event to RabbitMQ Server
            // // create event object
            console.log("Sending a message to queue...");
            let event = { "type": "message-new", "message": message, "username": username}

            // write to queue
            sendMessageToRabbitMQ(JSON.stringify(event));
        }
    })
})

module.exports = app;