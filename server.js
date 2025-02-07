const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); 


const users = [];       
const highScores = [];  


function authenticateJWT(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).send();
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).send();
  }

  const token = parts[1];
  jwt.verify(token, "secretKey", (err, decoded) => {
    if (err) {
      return res.status(401).send();
    }
    req.user = decoded;
    next();
  });
}


// POST
app.post("/signup", (req, res) => {
  const body = req.body;

  
  if (
    !body ||
    typeof body !== "object" ||
    Object.keys(body).length !== 2 ||
    !("userHandle" in body) ||
    !("password" in body)
  ) {
    return res.status(400).send();
  }

  const { userHandle, password } = body;

  
  if (
    typeof userHandle !== "string" ||
    typeof password !== "string" ||
    userHandle.length < 6 ||
    password.length < 6
  ) {
    return res.status(400).send();
  }


  users.push({ userHandle, password });
  return res.status(201).send();
});


// POST 
app.post("/login", (req, res) => {
  const body = req.body;

  
  if (
    !body ||
    typeof body !== "object" ||
    Object.keys(body).length !== 2 ||
    !("userHandle" in body) ||
    !("password" in body)
  ) {
    return res.status(400).send();
  }

  const { userHandle, password } = body;

 
  if (
    typeof userHandle !== "string" ||
    typeof password !== "string" ||
    userHandle.length < 6 ||
    password.length < 6
  ) {
    return res.status(400).send();
  }

  
  const user = users.find(
    (u) => u.userHandle === userHandle && u.password === password
  );
  if (!user) {
    return res.status(401).send();
  }


  const token = jwt.sign({ userHandle: user.userHandle }, "secretKey", {
    expiresIn: "1h",
  });

 
  return res.status(200).json({ jsonWebToken: token });
});


// POST 
app.post("/high-scores", authenticateJWT, (req, res) => {
  const body = req.body;


  if (
    !body ||
    typeof body !== "object" ||
    Object.keys(body).length !== 4 ||
    !("level" in body) ||
    !("userHandle" in body) ||
    !("score" in body) ||
    !("timestamp" in body)
  ) {
    return res.status(400).send();
  }

  const { level, userHandle, score, timestamp } = body;

  if (
    typeof level !== "string" ||
    typeof userHandle !== "string" ||
    typeof score !== "number" ||
    typeof timestamp !== "string"
  ) {
    return res.status(400).send();
  }

  
  highScores.push({ level, userHandle, score, timestamp });
  return res.status(201).send();
});


// GET
app.get("/high-scores", (req, res) => {
  const level = req.query.level;
  let page = parseInt(req.query.page);

  if (!level) {
    return res.status(200).json([]);
  }

  if (isNaN(page) || page < 1) {
    page = 1;
  }

  
  const filtered = highScores.filter((hs) => hs.level === level);
  filtered.sort((a, b) => b.score - a.score);

  
  const pageSize = 20;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const results = filtered.slice(startIndex, endIndex);

  return res.status(200).json(results);
});

let serverInstance = null;

module.exports = {
  start: function () {
    serverInstance = app.listen(port, () => {
      console.log(`test`);
    });
  },
  close: function () {
    serverInstance.close();
  },
};
