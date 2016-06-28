import http from 'http'
import fs from 'fs'

let file = fs.createWriteStream("demand_data/DATA201112_NSW1_NEW.csv");

http.get("http://www.nemweb.com.au/mms.GRAPHS/data/DATA201112_NSW1.csv", response => {

    response.pipe(file);

});