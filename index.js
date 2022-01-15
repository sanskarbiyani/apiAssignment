const express = require("express");
const {getLocationData, getAllCoordinates} = require("./utility");

const app = express();
const port = 3000;

app.use(express.text());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

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
    var location = getLocationData(connUrl, collection1, collection2).catch(console.error);
    location.then((result)=>{
        res.set({
            "Name": "Sanskar Biyani",
            "Contact": "sanskarbiyani902@gmail.com"
        })
        res.json(result)
    })
})

app.post("/api2", (req, res)=>{
    // Checking to see if the addresses are returned as array or as dictionary of arrays
    if(Array.isArray(req.body)){
        var addressArray = req.body;
    } else {
        var addressArray = Object.values(req.body)[0];
    }
    const allCoordinates = getAllCoordinates(addressArray);
    allCoordinates.then(result=>{
        res.json(result);
    });
})

app.listen(port, ()=>{
    console.log("Server started.");
})