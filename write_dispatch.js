var csv = require("csv")
var firebase = require("firebase")
var fs = require("fs")
var walker = require("walk")
var generators = require("./generators.json")

var generator_map = new Map()

generators.forEach(function (item) {

    generator_map.set(item.duid, item)

})

var walk_stream = walker.walk("data/20160601", {})

walk_stream
    .on("file", function (root, fileStats, next) {

        fs.readFile("data/20160601/" + fileStats.name, "utf8", parse_generators)
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

    console.log(data)

}
