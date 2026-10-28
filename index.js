const express = require("express");
const mongoose = require("mongoose");

const app = express();
const port = process.env.PORT || 3000;
const mongoUri =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/studentDB";

app.use(express.json());

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0 },
    course: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["enrolled", "in-progress", "completed"],
      default: "enrolled",
    },
    scholarship: { type: Boolean },
  },
  { timestamps: true },
);

const Student = mongoose.model("Student", studentSchema);

app.get("/", (req, res) => {
  res.json({ message: "Student API is running", endpoint: "/api/students" });
});

app.post("/api/students", async (req, res) => {
  const student = await Student.create(req.body);
  res.status(201).json(student);
});

app.get("/api/students", async (req, res) => {
  const {
    ageGt,
    ageLt,
    course,
    courseIn,
    status,
    scholarshipExists,
    logic,
  } = req.query;
  const conditions = [];

  if (ageGt !== undefined || ageLt !== undefined) {
    const ageFilter = {};
    if (ageGt !== undefined) ageFilter.$gt = Number(ageGt);
    if (ageLt !== undefined) ageFilter.$lt = Number(ageLt);
    conditions.push({ age: ageFilter });
  }

  if (course !== undefined) conditions.push({ course });
  if (courseIn !== undefined) {
    conditions.push({ course: { $in: courseIn.split(",") } });
  }
  if (status !== undefined) conditions.push({ status });
  if (scholarshipExists !== undefined) {
    conditions.push({ scholarship: { $exists: scholarshipExists === "true" } });
  }

  const filter =
    conditions.length === 0
      ? {}
      : logic === "or"
        ? { $or: conditions }
        : { $and: conditions };

  res.json(await Student.find(filter).sort({ name: 1 }));
});

app.get("/api/students/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid student ID" });
  }

  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ error: "Student not found" });
  res.json(student);
});

app.patch("/api/students/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid student ID" });
  }

  const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!student) return res.status(404).json({ error: "Student not found" });
  res.json(student);
});

app.delete("/api/students/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid student ID" });
  }

  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) return res.status(404).json({ error: "Student not found" });
  res.json({ message: "Student deleted", student });
});

app.delete("/api/students", async (req, res) => {
  if (req.query.confirm !== "true") {
    return res.status(400).json({
      error: "To delete all students, add the query parameter confirm=true",
    });
  }

  const result = await Student.deleteMany({});
  res.json({ message: "All students deleted", deletedCount: result.deletedCount });
});

app.use((err, req, res, next) => {
  if (err instanceof mongoose.Error.ValidationError || err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: err.message });
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log(`Connected to MongoDB at ${mongoUri}`);
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exitCode = 1;
  });
