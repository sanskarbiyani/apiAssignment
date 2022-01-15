const express = require("express");
const {MongoClient} = require("mongodb");
const axios = require('axios')

const app = express();
const port = 3000;

app.use(express.text());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

async function getData(url, collection1, collection2){
    const client = new MongoClient(url);
    try{
        await client.connect();
        const database = client.db('__CONCOX__')
        const devices = database.collection(collection1)
        const status = database.collection(collection2);
        const device = devices.find({}).sort("createdAt", -1).limit(30);
        var arr = [];
        await device.forEach(doc => {
            arr.push(doc.imei)
        });
        var result = {};
        for(var i=0; i<arr.length; ++i){
            const locations = status.find({imei: arr[i], gps: {$ne: null}}).sort("createdAt", -1).limit(50).sort("createdAt", 1);
            result[arr[i]] = [];
            await locations.forEach(location => {
                result[arr[i]] = [...result[arr[i]], location.gps]
            })
        }
    } catch(err){
        console.log(err)
    } finally {
        await client.close()
        return result;
    }
}

app.post("/api1/:collection1", (req, res)=>{
    var collection1 = req.params.collection1;
    var collection2 = Object.values(req.query)[0];
    if(typeof(req.body) == 'object'){
        var connUrl = Object.values(req.body)[0];
    } else {
        var connUrl = req.body.slice(1, -1);
    }
    if(Array.isArray(connUrl)){
        connUrl = connUrl[0];
    }
    var location = getData(connUrl, collection1, collection2).catch(console.error);
    location.then((result)=>{
        res.json(result)
    })
})

app.post("/api2", (req, res)=>{
    var baseURL = "https://maps.googleapis.com/maps/api/geocode/json?address=";
    var apiKey = "AIzaSyA5bwbEsAOUMOI4RK2zXcIayG4vjuQSpcw";
    if(Array.isArray(req.body)){
        var receivedAddresses = req.body;
    } else {
        var receivedAddresses = Object.values(req.body)[0];
    }
    var result = []
    receivedAddresses.forEach(address => {
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
            if(result.length == receivedAddresses.length){
                res.setHeader('Content-Type', 'application/json');
                res.json(result);
            }
        })
    })
})

app.listen(port, ()=>{
    console.log("Server started.");
})