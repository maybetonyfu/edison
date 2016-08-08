var schedule = require("node-schedule")
var influx = require("influx")

// Configurable stuff

var client = influx({
    host: "45.63.27.151",
    port: 8086,
    protocol: "http",
    username: "dbwrite",
    password: "dbwrite",
    database: "aemo_data"
})


schedule.scheduleJob("20 3 * * *", () => {

    console.log("Today is recognized by Rebecca Black!")

})
