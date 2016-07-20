var csv = require("csv")
var walker = require("walk")
var generators = require("./generators.json")
var moment = require("moment-timezone")
var promisify = require("promisify-node")
var fs = promisify("fs")
var influx = require("influx")

// Configurable stuff

var client = influx({

  // cluster configuration

    host: "localhost",
    port: 8086,
    protocol: "http",
    username: "dbwriter",
    password: "dbwriter",
    database: "volta"
})



// var write_data = new EventEmitter()

var generator_map = new Map()

generators.forEach(function (item) {

    generator_map.set(item.duid, item)

})

var month = "06"

var year = "2016"

// var lastDayOfMonth = new Date(year, month, 0).getDate()

var day = "01"


var walk_stream = walker.walk(`data/${year}${month}${day}`, {})

walk_stream
    .on("file", function (root, fileStats, next) {

        console.log(`Transform ${fileStats.name}`)

        fs.readFile(`data/${year}${month}${day}/${fileStats.name}`)
            .then(parse_dispatch)
            .then(write_dispatch)
            .then(() => {

                console.log("Finish writing data, scanning next file")
                next()

            })
            .catch((err) => {

                console.log(err)

            })

    })

walk_stream
    .on("errors", function (root, nodeStatsArray, next) {

        console.log("File Error. Skip to next file")
        next()

    })

walk_stream
    .on("end", function () {

        console.log("all done")

    })


function parse_dispatch (data) {

    console.log("Parse dispatch data")

    var lines = data.toString().split("\n")

    lines.splice(0, 1)

    var new_data = lines.join("\n")

    var options = {
        columns: true,
        relax_column_count: true
    }

    return new Promise(function (resolve, reject) {

        csv.parse(new_data, options, function (error, data) {

            if (!error) {

                resolve(data)

            } else {

                reject(error)

            }

        })

    })

}

function write_dispatch (data) {

    console.log("Write dispatch data")

    let dispatch_points = []

    var data_model = {
        wind: 0,
        brown_coal: 0,
        black_coal: 0,
        gas: 0,
        other: 0,
        hydro: 0
    }

    var national_modal = {
        TAS: Object.assign({}, data_model),
        VIC: Object.assign({}, data_model),
        NSW: Object.assign({}, data_model),
        SA: Object.assign({}, data_model),
        QLD: Object.assign({}, data_model)
    }

    var date = moment.tz(data[0].SETTLEMENTDATE, "YYYY/MM/DD HH:mm:ss", "Australia/Sydney").valueOf()

    data.forEach((datum) => {

        if (!datum.DUID) {

            return

        }

        var scada_value = +datum.SCADAVALUE

        if (scada_value === 0) {

            return

        }

        var generator = generator_map.get(datum.DUID)

        if (!generator) {

            return

        }

        var tech_type = generator.feul

        var region = generator.region.substring(0, generator.region.length - 1)

        national_modal[region][tech_type] += Math.round(scada_value) > 0 ? Math.round(scada_value) : 0

    })

    Object.keys(national_modal).forEach((region) => {

        var regional_modal = national_modal[region]

        Object.keys(regional_modal).forEach(function (tech) {

            dispatch_points.push([
                {
                    value: national_modal[region][tech],
                    time: date
                },
                {
                    region: region,
                    technology: tech
                }
            ])

        })

    })

    return new Promise(function (resolve, reject) {

        client.writePoints("dispatch", dispatch_points, {db: "volta"}, (error, response) => {

            if (error) {

                reject.log(error)

            }

            resolve()

        })

    })

}