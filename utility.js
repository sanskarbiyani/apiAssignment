const {MongoClient} = require("mongodb");
const axios = require('axios');

async function getLocationData(url, collection1, collection2){
    const client = new MongoClient(url);
    try{
        await client.connect();
        const devicesCollection = client.db('__CONCOX__').collection(collection1)
        const statusCollection = client.db('__CONCOX__').collection(collection2);
        const deviceCursor = devicesCollection.find().sort("createdAt", -1).limit(30);
        let deviceArray = await deviceCursor.toArray()
        let imeiArray = deviceArray.map(dev => {
            return dev.imei;
        });
        const result = {};
        for(let imeiNumber of imeiArray){
            const locations = statusCollection.find({imei: imeiNumber, gps: {$ne: null}}).sort("createdAt", -1).limit(50).sort("createdAt", 1);
            let locationArray = await locations.toArray();
            let gpsArray = locationArray.map(loc => {
                return loc.gps;
            });
            result[imeiNumber] = gpsArray;
        }
        await client.close();
        return result;
    } catch(err){
        console.log(err)
    }
}


async function getAllCoordinates(addressArray){
    var baseURL = "https://maps.googleapis.com/maps/api/geocode/json?address=";
    var apiKey = "AIzaSyA5bwbEsAOUMOI4RK2zXcIayG4vjuQSpcw";
    try {
        let allCoordinates = [];
        for(let address of addressArray){
            const url = baseURL + address + "&key=" + apiKey;
            const response = await axios.get(url);
            const coor = response.data.results[0].geometry.location
            coordinate =  {
                "add": response.data.results[0].formatted_address,
                "location": [coor.lat, coor.lng]
            }
            allCoordinates.push(coordinate);
        };
        return allCoordinates;
    } catch(err) {
        console.log(err);
    }
}

module.exports = {
    getLocationData,
    getAllCoordinates
}