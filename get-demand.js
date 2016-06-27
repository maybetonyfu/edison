var http = require('http');
var fs = require('fs');

var file = fs.createWriteStream("demand_data/DATA201112_NSW1_NEW.csv");
var request = http.get("http://www.nemweb.com.au/mms.GRAPHS/data/DATA201112_NSW1.csv", function(response) {
  response.pipe(file);
});