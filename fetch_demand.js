let csv = require("csv")
var fetch = require("node-fetch")
let moment = require("moment-timezone")
var influx = require("influx")

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

let month = "07"

let year = "2016"

let states = ["NSW", "QLD", "SA", "TAS", "VIC"]

let price_points = []

let demand_points = []

// Main procedure

states.forEach((state) => {

    fetch(`${nem}${demand_path}DATA${year}${month}_${state}1.csv`)
        .then((res) => {

            return res.text()

        })
        .then((body) => {

            let options = {
                columns: true
            }

            csv.parse(body, options, transform_demand_data)

        })

    function transform_demand_data (error, data) {

        if (error) {

            console.log(error)

        }

        data.forEach((datum) => {

            let unixTime = moment.tz(datum.SETTLEMENTDATE, "YYYY/MM/DD HH:mm:ss", "Australia/Sydney").valueOf()

            price_points.push([
                {
                    value: (+datum.RRP),
                    time: unixTime
                },
                {
                    region: state
                }
            ])

            demand_points.push([
                {
                    value: (+datum.TOTALDEMAND),
                    time: unixTime
                },
                {
                    region: state
                }
            ])

        })

        var series = {
            price: price_points,
            demand: demand_points
        }

        client.writeSeries(series, {db: "aemo_data"}, function (err, response) {

            if (err) {

                console.log(err)

            }

            console.log(response)

        })

    }

})
