import http from "http"
import fs from "fs"



let nem = "http://www.nemweb.com.au"

let demand_path = "/mms.GRAPHS/data/"

let month = "12"

let year = "2011"

let state = "NSW"

let file = fs.createWriteStream(`../data/demand/${state}/${year}-${month}.csv`)

// "http://www.nemweb.com.au/mms.GRAPHS/data/DATA201112_NSW1.csv"

http.get(`${nem}${demand_path}DATA${year}${month}_${state}1.csv`, (response) => {

    response.pipe(file)

})