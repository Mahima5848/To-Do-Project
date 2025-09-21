const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const conString = "mongodb://127.0.0.1:27017";
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let db;

// Connect to MongoDB once on server start
MongoClient.connect(conString)
  .then(client => {
    db = client.db("todo");
    console.log("MongoDB connected successfully.");
  })
  .catch(err => console.error("MongoDB connection error:", err));

// --- Routes ---

// Get user by ID
app.get("/users/:userid", async (req, res) => {
  try {
    const user = await db.collection("users").findOne({ user_id: req.params.userid });
    res.send(user);
  } catch (err) {
    res.status(500).send({ error: "Internal server error" });
  }
});

// Get all appointments for a user
app.get("/appointments/:userid", async (req, res) => {
  try {
    const appointments = await db.collection("appointments")
      .find({ user_id: req.params.userid })
      .toArray();
    res.send(appointments);
  } catch (err) {
    res.status(500).send({ error: "Internal server error" });
  }
});

// Get a single appointment by ID
app.get("/appointment/:id", async (req, res) => {
  try {
    const appointment = await db.collection("appointments")
      .findOne({ appointment_id: parseInt(req.params.id) });
    res.send(appointment);
  } catch (err) {
    res.status(500).send({ error: "Internal server error" });
  }
});

// Register a new user
app.post("/register-user", async (req, res) => {
  try {
    const user = {
      user_id: req.body.user_id,
      user_name: req.body.user_name,
      password: req.body.password,
      mobile: req.body.mobile
    };
    await db.collection("users").insertOne(user);
    console.log("User Registered:", user.user_id);
    res.send({ success: true });
  } catch (err) {
    res.status(500).send({ error: "Internal server error" });
  }
});

// Add a new appointment
app.post("/add-appointment", async (req, res) => {
  try {
    const appointment = {
      appointment_id: parseInt(req.body.appointment_id),
      title: req.body.title,
      description: req.body.description,
      date: new Date(req.body.date),
      user_id: req.body.user_id
    };
    await db.collection("appointments").insertOne(appointment);
    console.log("Appointment Added:", appointment.appointment_id);
    res.send({ success: true });
  } catch (err) {
    res.status(500).send({ error: "Internal server error" });
  }
});

// Edit an appointment
app.put("/edit-appointment/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const appointment = {
      appointment_id: parseInt(req.body.appointment_id),
      title: req.body.title,
      description: req.body.description,
      date: new Date(req.body.date),
      user_id: req.body.user_id
    };
    await db.collection("appointments").updateOne({ appointment_id: id }, { $set: appointment });
    console.log("Appointment Updated:", id);
    res.send({ success: true });
  } catch (err) {
    res.status(500).send({ error: "Internal server error" });
  }
});

// Delete an appointment
app.delete("/delete-appointment/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.collection("appointments").deleteOne({ appointment_id: id });
    console.log("Appointment Deleted:", id);
    res.send({ success: true });
  } catch (err) {
    res.status(500).send({ error: "Internal server error" });
  }
});

// Start server
app.listen(4040, () => {
  console.log("Server Started: http://127.0.0.1:4040");
});
