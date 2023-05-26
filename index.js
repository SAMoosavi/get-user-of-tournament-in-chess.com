const puppeteer = require("puppeteer")
const fs = require("fs")
const TEAM_NAME = "TEAM IRAN LIVE"
let my_users = []

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}


const index_page = (TEAM_NAME) => {
    let my_users = []

    const get_data = element => {
        let user = {name: "", point: 0}
        user.name = element.querySelector(".tournaments-live-view-player-info a").innerText
        user.point = +element.querySelector(".tournaments-live-view-results-points .tournaments-live-view-total-score").innerText
        my_users.push(user)
    }

    const get_users = () => {
        let table = document.querySelector(".tournaments-live-view-results-table-wrapper div table tbody")
        let elements = []
        let rows = table.getElementsByTagName("tr")
        for (const row of rows)
            if (row.querySelector('.tournaments-live-view-club-name-link').innerText === TEAM_NAME)
                elements.push(row)

        for (const element of elements)
            get_data(element)
    }

    get_users()

    return my_users
}

const index = async (PAGE) => {
    const USERS = await PAGE.evaluate(index_page, TEAM_NAME)
    my_users = my_users.concat(USERS)
}
const a = async () => {
    const BROWSER_NAME = await puppeteer.launch({headless: false, product: "firefox"})
    const PAGE = (await BROWSER_NAME.pages())[0]
    await PAGE.goto("https://www.chess.com/tournament/live/arena/one-world-league-peace-for-ukraine-2698107?&players=1")
    await sleep(2000)
    await PAGE.evaluate(() => {
        let e = document.querySelector("button.ui_v5-button-component:nth-child(1)")
        if (e)
            e.click()
    })
    let i = 1
    try {
        while (true) {
            const url = new URL(PAGE.url())
            const b = url.searchParams
            if (+b.get("players") === i) {
                await sleep(2000)
                await index(PAGE)
                await sleep(2000)
                console.log(`index page ${i}`)
                i++
                await PAGE.$eval(".ui_pagination-navigation button:last-child", e => {
                    if (e.disabled)
                        throw new Error
                    e.click()
                })

            }
            await sleep(2000)
        }
    } catch (err) {
    }
    await BROWSER_NAME.close()

    let s = "name,point\n"
    for (const my_user of my_users)
        s += my_user.name + "," + my_user.point + "\n"

    fs.writeFileSync("./users.csv", s, {encoding: "utf8"})
}
a()