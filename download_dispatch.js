var firebase = require("firebase")
var unzip = require("unzip")
var http = require("http")
var fs = require("fs")
var mkdirp = require("mkdirp");


// Configurable stuff

var nem = "http://www.nemweb.com.au"

var dispatch_path = "/Reports/ARCHIVE/Dispatch_SCADA/"

var days = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"]

var month = "06"

var year = "2016"

var local_raw_path = "raw/"

var local_output_path = "data/"



firebase.initializeApp({
    serviceAccount: "firebase-account.json",
    databaseURL: "https://chameleon-9a6e4.firebaseio.com"
})
days.forEach((day) => {

    var dispatch_file = `PUBLIC_DISPATCHSCADA_${year + month + day}.zip`

    mkdirp(local_raw_path, function (err) {

        if (err) {

            console.error(err)

        }

    })

    mkdirp(local_output_path + year + month + day, function (err) {

        if (err) {

            console.error(err)

        }

    })

    var file = fs.createWriteStream(`${local_raw_path}${dispatch_file}`)

    http.get(`${nem}${dispatch_path}${dispatch_file}`, function (response) {

        response.pipe(file)

        response.on("end", function () {

            console.log("Download file finished")

            fs.createReadStream(`${local_raw_path}${dispatch_file}`)
                .pipe(unzip.Parse())
                .on("entry", function (entry) {

                    entry
                        .pipe(unzip.Parse())
                        .on("entry", function (file) {

                            console.log(file.path)
                            file.pipe(fs.createWriteStream(local_output_path + year + month + day + "/" + file.path))

                        })

                })


        })

    })


})




