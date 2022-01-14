const express = require("express");
const {MongoClient} = require("mongodb");
// const request = require("request")
// const https = require("https")
const axios = require('axios')
var ObjectId = require("mongodb").ObjectId;
const { add } = require("nodemon/lib/rules");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

async function getData(url, collection1, collection2){
    const client = new MongoClient(url);
    try{
        await client.connect();
        const database = client.db('__CONCOX__')
        const devices = database.collection(collection1)
        const status = database.collection(collection2);
        const device = devices.find({}).sort("createdAt", -1).limit(30)
        var arr = [];
        await device.forEach(doc => {
            arr.push(doc.imei)
        });
        for(var i=0; i<arr.length; ++i){
            console.log(`\nFor ${arr[i]}`)
            const locations = status.find({gps: {$ne: null}, imei: `${arr[i]}`}).count()
            // console.log(locations.limit())
            // await locations.forEach(loc => console.log(loc))
            console.log(await locations)
        }
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

function getLocation(addresses){
    // var result = addresses.map(address => {
    //     
    //     request(url, { json: true }, (err, res, body) => {
    //         if (err) { return console.log(err); }
    //         coor = body.results[0].geometry.location
    //         retValue = {
    //             "add": body.results[0].formatted_address,
    //             "location": [coor.lat, coor.lng]
    //         }
    //         console.log(retValue);
    //         return retValue
    //     });
    // })
}

app.post("/api2", (req, res)=>{
    var baseURL = "https://maps.googleapis.com/maps/api/geocode/json?address="
    var apiKey = "AIzaSyA5bwbEsAOUMOI4RK2zXcIayG4vjuQSpcw"
    var addresses = req.body.address
    var result = []
    addresses.forEach(address => {
        var url = baseURL + address + "&key=" + apiKey;
        axios.get(url)
        .then(response => {
            coor = response.data.results[0].geometry.location
            retValue = {
                "add": response.data.results[0].formatted_address,
                "location": [coor.lat, coor.lng]
            }
            result.push(retValue);
        })
        .catch(error => {
            console.log(error);
        })
        .finally(()=>{
            if(result.length == addresses.length){
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(result));
            }
        })
    })
})

app.listen(port, ()=>{
    console.log("Server started.");
})