import { createIcs } from "./utils/ics.js"

import { Router } from "express"

import { DatabaseSync } from "node:sqlite"
const db= new DatabaseSync("cacheContests.db")

const calendarRouter= Router()

calendarRouter.get('/ics',(req,res)=>{
    const platforms=req.query.platforms?.split(',')
    let contests
    if(platforms?.length){
        const placeholder=platforms.map(()=>'?').join(',')
        contests = db.prepare(`
            SELECT *
            FROM contests
            WHERE platform IN (${placeholder})    
        `).all(...platforms) 
    }
    else{
        contests = db.prepare(`
            SELECT *
            FROM contests  
        `).all() 
    }
    const reminders=req.query.reminders?.split(',').map(Number).filter(Number.isFinite)
    const ics= createIcs(contests,reminders)
    res.type("text/calendar").send(ics)
})

export default calendarRouter