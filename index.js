const express = require("express");
const {MongoClient} = require("mongodb");
var ObjectId = require("mongodb").ObjectId;

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

async function getData(url, collection1, collection2){
    const client = new MongoClient(url);
    try{
        await client.connect();
        const devices = client.db('__CONCOX__').collection(collection1)
        const device = devices.find({}).sort("createdAt", -1).limit(30)
        var arr = [];
        await device.forEach(doc => {
            arr.push(doc.id)
        });
    } catch(err){
        console.log(err)
    } finally {
        await client.close()
    }
}

app.post("/api1/:collection1", (req, res)=>{
    var collection1 = req.params.collection1;
    var collection2 = req.query.collection2;
    var connUrl = req.body.mongodbUrl;
    getData(connUrl, collection1, collection2).catch(console.error);
    res.send("Got it.");
})

app.listen(port, ()=>{
    console.log("Server started.");
})