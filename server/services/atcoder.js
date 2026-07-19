import {load} from "cheerio"

const scrapeContests= ((html,selector)=>{

    const $= load(html)

    const contests=[]

    $(selector).each((_,element)=>{
        const params= $(element).find("td")

        const startTime= $(params[0]).find("time").text().trim()
        
        const relUrl= $(params[1]).find("a").attr("href")
        const name= $(params[1]).find("a").text().trim()
        const duration= $(params[2]).text().trim()

        if(!relUrl||!duration||!startTime) return

        const iso = startTime.replace(" ", "T").replace(/([+-]\d{2})(\d{2})$/, "$1:$2")
        const [hours,minutes]= duration.split(":").map(Number) // Number to convert strings to integer

        contests.push({
            id:relUrl.split("/").pop(),
            name:name,
            startTime:Math.floor(new Date(iso).getTime()/1000),
            duration:hours*60*60+minutes*60,
            url:`https://atcoder.jp${relUrl}`
        })

    })

    return contests
})

const get_ac= (async ()=>{

    const contests=[]

    const present= await fetch("https://atcoder.jp/contests/")
    if(!present.ok){
        throw new Error(`Atcoder current contests request failed: ${present.status}`)
    }
    const p_html=await present.text()
    contests.push(...scrapeContests(p_html,"#contest-table-action tbody tr, #contest-table-upcoming tbody tr"))

    let finished=false
    let page=1

    const now= new Date()

    const prevMonth= new Date(now.getFullYear(),now.getMonth()-1,1)
    const prevMonthSecs= Math.floor(prevMonth.getTime()/1000)

    while(!finished){
        const past= await fetch(`https://atcoder.jp/contests/archive?page=${page}`)
        if(!past.ok){
            throw new Error(`Atcoder past contests request failed at page ${page}: ${past.status}`)
        }
        const html=await past.text()
        const data= scrapeContests(html,"table tbody tr")
        if(data.length==0) break
        for(const record of data){
            if(record.startTime<prevMonthSecs){
                finished=true
                break
            }
            contests.push(record)
        }
        page+=1
    }

    return contests

})

export default get_ac