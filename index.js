var schedule = require("node-schedule")

var j = schedule.scheduleJob("*/10 * * * *", () => {

    console.log("Today is recognized by Rebecca Black!")

})
