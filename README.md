# Api Assignment
Backend Assignment for flipr internship

Consists of 2 API's

## API 1:
Path - /api<collection1_name>?<query>

  Accepts A collection name as a parameter, another collection name as a query and a mongodb connection url in the body. The query name can be anything. The content type of the request can be of plain/text or application/json. It returns the latest 30 devices with their latest 50 locations if available as a object with the imei number as the key.

## API2:
Path - /api2

  Accepts a list of addresses and returns the coordinates of the address as a list of objects using the google geocoding API.
  

### Modules used:
  #### Express:
      As a framework for the API's in nodejs.
  #### Axios: 
      To send request to google geocoding API.
  #### Dotenv:
      To manage environment variables.
  #### MongoDB:
      MongoDB driver to connect to the mongoDB atlas server.
