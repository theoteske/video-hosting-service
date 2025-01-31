import express from "express";

const app = express();
const port = 3000; // default for express

// simple GET endpoint to print "Hello, World!"
app.get("/", (req, res) => {
    res.send("Hello World!")
});

// start server and listen on the port specified above for requests
app.listen(port, () => {
    console.log(`Video processing service listening at http://localhost:${port}`)
});