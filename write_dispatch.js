var csv = require("csv")
var firebase = require("firebase")
var fs = require("fs")
var walker = require("walk")
var generators = require("./generators.json")
var moment = require("moment-timezone")

var generator_map = new Map()

generators.forEach(function (item) {

    generator_map.set(item.duid, item)

})

firebase.initializeApp({
    serviceAccount: "firebase-account.json",
    databaseURL: "https://chameleon-9a6e4.firebaseio.com",
    storageBucket: "gs://chameleon-9a6e4.appspot.com/"
})

var db = firebase.database()

var days = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"]
// var days = ["01"]

days.forEach((day) => {

    var walk_stream = walker.walk("data/201606" + day, {})

    walk_stream
        .on("file", function (root, fileStats, next) {

            fs.readFile("data/201606" + day + "/" + fileStats.name, "utf8", parse_generators)
            next()

        })

    walk_stream
        .on("errors", function (root, nodeStatsArray, next) {

            next()

        })

    walk_stream
        .on("end", function () {

            console.log("all done")

        })


    function parse_generators (err, data) {

        if (err) {

            return console.log(err)

        }

        var lines = data.split("\n")

        lines.splice(0, 1)

        var new_data = lines.join("\n")

        var options = {
            columns: true,
            relax_column_count: true
        }

        csv.parse(new_data, options, write_dispatch)

    }

    function write_dispatch (err, data) {

        if (err) {

            return console.log(err)

        }

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

        var settlement_date

        data.forEach(function (datum) {

            if (!datum.DUID) {

                return

            }

            var scada_value = +datum.SCADAVALUE

            if (scada_value === 0) {

                return

            }

            var duid = datum.DUID

            settlement_date = datum.SETTLEMENTDATE

            var generator = generator_map.get(duid)

            if (!generator) {

                return

            }

            var tech_type = generator.feul

            var region = generator.region

            region = region.substring(0, region.length - 1)

            national_modal[region][tech_type] += Math.round(scada_value)

            national_modal[region][tech_type] = national_modal[region][tech_type] < 0
                ? 0
                : national_modal[region][tech_type]

        })
        var isoTime = moment.tz(settlement_date, "YYYY/MM/DD HH:mm:ss", "Australia/Sydney").toISOString()

        Object.keys(national_modal).forEach(function (state) {

            var value = national_modal[state]

            Object.keys(value).forEach(function (tech) {

                var key = db.ref(`/${state}/dispatch/${tech}`).push().key

                var ref = db.ref(`/${state}/dispatch/${tech}/${key}`)

                console.log(national_modal[state][tech])
                ref.set({
                    x: isoTime,
                    y: national_modal[state][tech]
                })

            })

        })

    }

})

