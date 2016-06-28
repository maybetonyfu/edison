import http from "http"
import fs from "fs"

let file = fs.createWriteStream("../data/demand/test/test.csv")

http.get("http://www.nemweb.com.au/mms.GRAPHS/data/DATA201112_NSW1.csv", (response) => {

    response.pipe(file)

})