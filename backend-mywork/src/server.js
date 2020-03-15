const express = require("express");
const port = 8000;
const app = express();
const MongoClient = require('mongodb').MongoClient;
const config = require("./config");


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const withDB = async (operations, res) => {
  try { 
    const client = new MongoClient(config.uri,  { useNewUrlParser: true, useUnifiedTopology: true });
    
    client.connect(async function(err, client) {
      if(err){
        operations(err)
      } else {
        const db = client.db(config.dbname);
        await operations(db)
        await client.close();
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Error connecting to db", error });
  }
};

app.get('/test', function(req, res){
  withDB(db => {
    const article = db.collection('articles')
    article.findOne({name:'mongo-cloud'}, function(err, data){
      if(err){
        console.log(err)
      }else{
        console.log(data)
      }
    })
  })
})

app.get("/api/articles/:name", async (req, res) => {
  withDB(async db => {
    const articleName = req.params.name;

    const articleInfo = await db
      .collection("articles")
      .findOne({ name: articleName });
    res.status(200).json(articleInfo);
  }, res);
});

app.post("/api/articles/:name/upvote", async (req, res) => {
  withDB(async db => {
    const articleName = req.params.name;

    const articleInfo = await db
      .collection("articles")
      .findOne({ name: articleName });
    await db.collection("articles").updateOne(
      { name: articleName },
      {
        $set: {
          upvotes: articleInfo.upvotes + 1
        }
      }
    );
    const updatedArticleInfo = await db
      .collection("articles")
      .findOne({ name: articleName });

    res.status(200).json(updatedArticleInfo);
  }, res);
});

app.post("/api/articles/:name/add-comment", (req, res) => {
  const { username, text } = req.body;
  const articleName = req.params.name;

  withDB(async db => {
    const articleInfo = await db
      .collection("articles")
      .findOne({ name: articleName });
    await db.collection("articles").updateOne(
      { name: articleName },
      {
        $set: {
          comments: articleInfo.comments.concat({ username, text })
        }
      }
    );
    const updatedArticleInfo = await db
      .collection("articles")
      .findOne({ name: articleName });

    res.status(200).json(updatedArticleInfo);
  }, res);
});

app.listen(port, function() {
  console.log("Server is running on " + port + " port");
});
