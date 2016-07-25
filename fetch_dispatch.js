var unzip = require("unzip")
var http = require("http")
var fs = require("fs")
var mkdirp = require("mkdirp")
let moment = require("moment-timezone")

// Configurable stuff

var nem = "http://www.nemweb.com.au"

var dispatch_path = "/Reports/ARCHIVE/Dispatch_SCADA/"

var startDay = 1

var month = 1

var year = 2016

var local_raw_path = "raw/"

var local_output_path = "data/"

var firstDayToQuery = moment([year, month, startDay])

var lastDayToQuery = moment([2016, 6, 20])

main(firstDayToQuery)

function main (date) {

    var dateString = date.format("YYYYMMDD")

    console.log(dateString)

    var dispatch_file = `PUBLIC_DISPATCHSCADA_${dateString}.zip`

    mkdirp(local_raw_path, (err) => {

        if (err) {

            console.error(err)

        }

    })

    mkdirp(local_output_path + dateString, (err) => {

        if (err) {

            console.error(err)

        }

    })

    var file = fs.createWriteStream(`${local_raw_path}${dispatch_file}`)

    http.get(`${nem}${dispatch_path}${dispatch_file}`, (response) => {

        response.pipe(file)

        response.on("end", () => {

            console.log("Download file finished")

            fs.createReadStream(`${local_raw_path}${dispatch_file}`)
                .pipe(unzip.Parse())
                .on("entry", (entry) => {

                    entry
                        .pipe(unzip.Parse())
                        .on("entry", (file) => {

                            console.log(file.path)
                            file.pipe(fs.createWriteStream(local_output_path + dateString + "/" + file.path))

                        })

                })

            var newDate = date.add(1, "d")

            if (newDate.isSameOrBefore(lastDayToQuery)) {

                return main(newDate)

            }

        })

    })

}
