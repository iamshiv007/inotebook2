const connectToMongo = require('./db');
connectToMongo();
const express = require('express')
var cors = require('cors')

const app = express()
const port = process.env.PORT || 2000;

app.use(express.json())

app.use(cors())

//available routes
app.use('/api/auth',require('./routes/auth'))
app.use('/api/notes',require('./routes/notes'))

//Server production assests
if(process.env.NODE_ENV === "production"){
  const path = require("path");

  app.get("/",(req, res) => {
    app.use(express.static(path.join(_dirname,"inotebook","build")));
    res.sendFile(path.resolve(_dirname, "inotebook", "build", "index.html"))
  });
  
}

app.listen(port, () => {
  console.log(`iNotebook app listening on port ${port}`)
})

