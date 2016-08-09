let csv = require("csv")
let moment = require("moment-timezone")
let influx = require("influx")
let http = require("http")
var promisify = require("promisify-node")
var fs = promisify("fs")
var glob = require("glob")

// Configurable stuff

var client = influx({
    host: "45.63.27.151",
    port: 8086,
    protocol: "http",
    username: "datawrite",
    password: "datawrite",
    database: "aemo_data"
})

let nem = "http://www.nemweb.com.au"

let demand_path = "/mms.GRAPHS/data/"

let demand_local_path = "data/demand/"

let states = ["NSW", "QLD", "SA", "TAS", "VIC"]

let fetch_from_this_date = moment([2016, 0, 1])

let fetch_until_this_date = moment([2016, 6, 1])

let price_points = []

let demand_points = []

// Main procedure

module.exports = {
    get_demand: get_demand,
    import_demand: import_demand
}

// get_demand({
//     from_date: fetch_from_this_date,
//     to_date: fetch_until_this_date,
//     stateIndex: 0
// })

import_demand({
    from_date: fetch_from_this_date,
    to_date: fetch_until_this_date,
    file_index: 0
})

function get_demand (config) {

    let {from_date, to_date, stateIndex = 0} = config

    let month = from_date.format("MM")

    let year = from_date.format("YYYY")

    let state = states[stateIndex]

    let demand_file = `DATA${year}${month}_${state}1.csv`

    let demand_local_file = fs.createWriteStream(`${demand_local_path}${demand_file}`)

    http.get(`${nem}${demand_path}DATA${year}${month}_${state}1.csv`, (response) => {

        response.pipe(demand_local_file)

        response.on("end", () => {

            console.log(`Download file finished : ${demand_file}`)

            if (stateIndex === states.length - 1) {

                console.log(`Finish downloading all states data in  ${year} - ${month}`)

                var next_month = from_date.add(1, "months")

                if (next_month.isSameOrBefore(to_date)) {

                    return get_demand({
                        from_date: next_month,
                        to_date: to_date,
                        stateIndex: 0
                    })

                }

                return

            }

            return get_demand({
                from_date: from_date,
                to_date: to_date,
                stateIndex: stateIndex + 1
            })

        })

    })

}


function import_demand (config) {

    let {from_date, to_date, file_index = 0} = config

    let month = from_date.format("MM")

    let year = from_date.format("YYYY")

    glob(`${demand_local_path}DATA${year}${month}_*.csv`, {}, (er, files) => {

        let file = files[file_index]

        fs.readFile(file)
            .then(parse_demand)
            .then(write_demand)
            .then(() => {

                console.log(`Finish writing data from ${file}`)

                if (file_index === files.length - 1) {

                    console.log("Move on to next date")

                    var next_month = from_date.add(1, "m")

                    if (next_month.isSameOrBefore(to_date)) {

                        return import_demand({
                            from_date: next_month,
                            to_date: to_date,
                            file_index: 0
                        })

                    }

                    return

                }

                console.log("scanning next file...")

                return import_demand({
                    from_date: from_date,
                    to_date: to_date,
                    file_index: file_index + 1
                })

            })
            .catch((err) => {

                console.log(err)

            })

    })

}


function parse_demand (data) {

    console.log("Parse demand data")

    var options = {
        columns: true
    }

    return new Promise(function (resolve, reject) {

        csv.parse(data, options, function (error, data) {

            if (error) {

                reject(error)

            }

            resolve(data)

        })

    })

}

function write_demand (data) {

    console.log("Write dispatch data")

    console.log(data)

    data.forEach((datum) => {

        let unixTime = moment.tz(datum.SETTLEMENTDATE, "YYYY/MM/DD HH:mm:ss", "Australia/Sydney").valueOf()

        let region = datum.REGION.substring(0, datum.REGION.length - 1)

        price_points.push([
            {
                value: (+datum.RRP),

                time: unixTime
            },
            {
                region: region
            }
        ])

        demand_points.push([
            {
                value: (+datum.TOTALDEMAND),

                time: unixTime
            },
            {
                region: region
            }
        ])

    })

    var series = {
        price: price_points,
        demand: demand_points
    }

    console.log(series)

    return new Promise(function (resolve, reject) {

        client.writeSeries(series, {db: "aemo_data"}, function (err, response) {

            if (err) {

                console.log(err)

            }

            console.log(response)

        })

    })

}
