"use strict";

// For express package
const express = require("express");

// For the database
const mysql = require("mysql");

//create a new express application
const app = express.Router();

// MySQL commands
const sqlPOSTMessage = "INSERT INTO Messages (MessageBody, UserID) VALUES(?, ?)"
const sqlGETUsers = "SELECT * FROM Users"

const sqlGETMessage = "SELECT * FROM Messages m JOIN Users u on m.UserID = u.UserID ORDER BY m.MessageID DESC LIMIT 50"

// Connecting to the mysql database
let connection = mysql.createPool({
    // We are going to need to set this ENV variable, TODO
    host: process.env.MYSQL_ADDR,
    user: 'root',
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DB,
    insecureAuth: true
    // host: '127.0.0.1',
    // user: 'root',
    // password: 'password',
    // database: 'scribble'
});

const amqp = require('amqplib/callback_api');

function sendMessageToRabbitMQ(msg) {
    // amqp.connect("amqp://" + process.env.RABBITADDR, (error0, conn) => {
    //   amqp.connect("amqp://" + "localhost:5672", (error0, conn) => {
    amqp.connect("amqp://guest:guest@rabbitmq:5672", (error0, conn) => {
        console.log(msg)
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
        }, 500);
    });
}


// POST request to v1/messages
app.post("/", (req, res, next) => {
    let userid = req.body.userid;
    let message = req.body.message;
    let username = req.body.username;
    console.log(req.body)
    connection.query(sqlPOSTMessage, [message, userid], (err, result) => { 
        if (err) { 
            console.log(err)
            res.status(500).send(err.toString());
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

app.get("/", (req, res, next) => {
    connection.query(sqlGETMessage, [], (err, result) => { 
        if (err) { 
            console.log(err)
            res.status(500).send(err.toString());
        } else { 
            res.status(201);
            res.set("Content-Type", "application/json");
            res.json(result);
        }
    })
})

module.exports = app;