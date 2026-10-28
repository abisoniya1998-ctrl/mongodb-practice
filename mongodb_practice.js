const studentDb = db.getSiblingDB("studentDB");

if (studentDb.getCollectionInfos({ name: "students" }).length === 0) {
  studentDb.createCollection("students");
}

const students = studentDb.getCollection("students");

print("\n--- Insert one student ---");
printjson(
  students.insertOne({
    name: "abi",
    age: 20,
    course: "MERN Stack",
    status: "enrolled",
  }),
);

print("\n--- Insert multiple students ---");
printjson(
  students.insertMany([
    {
      name: "michael",
      age: 22,
      course: "MERN Stack",
      status: "enrolled",
    },
    {
      name: "priscilla",
      age: 19,
      course: "Python",
      status: "enrolled",
    },
    {
      name: "catherine",
      age: 24,
      course: "Data Science",
      status: "completed",
    },
    {
      name: "soniya",
      age: 21,
      course: "MERN Stack",
      status: "enrolled",
      scholarship: true,
    },
  ]),
);

print("\n--- Read all students ---");
printjson(students.find({}).toArray());

print('\n--- Students enrolled in "MERN Stack" ---');
printjson(students.find({ course: "MERN Stack" }).toArray());

print("\n--- Update one student to completed ---");
printjson(
  students.updateOne(
    { name: "abi" },
    { $set: { status: "completed" } },
  ),
);

print("\n--- Update multiple enrolled students ---");
printjson(
  students.updateMany(
    { status: "enrolled" },
    { $set: { status: "in-progress" } },
  ),
);

print("\n--- Query operators ---");
print("Age greater than 20:");
printjson(students.find({ age: { $gt: 20 } }).toArray());

print("Age less than 22:");
printjson(students.find({ age: { $lt: 22 } }).toArray());

print("Course is one of MERN Stack or Python:");
printjson(
  students.find({ course: { $in: ["MERN Stack", "Python"] } }).toArray(),
);

print("Age at least 20 AND status is in-progress:");
printjson(
  students
    .find({
      $and: [{ age: { $gte: 20 } }, { status: "in-progress" }],
    })
    .toArray(),
);

print("Course is Python OR status is completed:");
printjson(
  students
    .find({
      $or: [{ course: "Python" }, { status: "completed" }],
    })
    .toArray(),
);

print("Students with a scholarship field:");
printjson(students.find({ scholarship: { $exists: true } }).toArray());

print("\n--- Delete one student by condition ---");
printjson(students.deleteOne({ name: "catherine" }));

print("\n--- Product catalog use case ---");
if (studentDb.getCollectionInfos({ name: "products" }).length === 0) {
  studentDb.createCollection("products");
}

const products = studentDb.getCollection("products");

print("Add products:");
printjson(
  products.insertMany([
    {
      name: "Wireless Mouse",
      category: "Accessories",
      price: 24.99,
      stock: 35,
    },
    {
      name: "Mechanical Keyboard",
      category: "Accessories",
      price: 79.99,
      stock: 12,
    },
    {
      name: "USB-C Hub",
      category: "Adapters",
      price: 39.99,
      stock: 0,
    },
  ]),
);

print("Search accessories under $50:");
printjson(
  products
    .find({ category: "Accessories", price: { $lt: 50 } })
    .toArray(),
);

print("Restock the USB-C Hub:");
printjson(
  products.updateOne(
    { name: "USB-C Hub" },
    { $set: { stock: 20 } },
  ),
);

print("Products currently in stock:");
printjson(products.find({ stock: { $gt: 0 } }).toArray());

print(
  "\nDeleting every student document as requested.",
);

