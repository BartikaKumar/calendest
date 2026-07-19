import get_cf from "./services/codeforces.js"
import get_cc from "./services/codechef.js"
import get_ac from "./services/atcoder.js"
import get_lc from "./services/leetcode.js"

import { DatabaseSync } from "node:sqlite"

const db= new DatabaseSync("cacheContests.db")

db.exec(`
    CREATE TABLE IF NOT EXISTS contests (
        platform TEXT,
        contestId TEXT,
        name TEXT,
        startTime INTEGER,
        duration INTEGER,
        url TEXT,
        PRIMARY KEY (platform,contestId)
    )
`)

db.exec(`
    CREATE TABLE IF NOT EXISTS lastFetched (
        platform TEXT PRIMARY KEY,
        lastFetchedAt INTEGER
    )
`)

const response={
    cf:null,
    cc:null,
    ac:null,
    lc:null
}

const services={
    cf:get_cf,
    ac:get_ac,
    cc:get_cc,
    lc:get_lc
}

const fetchData= (async (platform)=>{

    // we take care of ordering here
    const cachedContests= db.prepare(`
        SELECT *
        FROM contests
        WHERE platform = ?
        ORDER BY startTime
    `)

    try{

        const fetchedData= await services[platform]()

        if(!fetchedData){
            throw new Error(`No data returned by ${platform}`)
        }

        db.exec("BEGIN")

        try{
            db.prepare(`
                DELETE
                FROM contests
                WHERE platform = ?
            `).run(platform)
    
            const insert= db.prepare(`
                INSERT INTO contests(platform, contestId, name, startTime, duration,url)
                VALUES (?,?,?,?,?,?)
            `)
    
            fetchedData.forEach(contest => {
                insert.run(platform,contest.id,contest.name,contest.startTime,contest.duration,contest.url)
            });
    
            db.prepare(`
                INSERT
                INTO lastFetched(platform, lastFetchedAt)
                VALUES (?,?)
                ON CONFLICT(platform)
                DO UPDATE SET lastFetchedAt=excluded.lastFetchedAt
            `).run(platform,Math.floor(new Date().getTime()/1000))

            db.exec("COMMIT")

        }
        catch(err){
            db.exec("ROLLBACK")
            throw err
        }

    }
    catch(err){
        console.log(err)
    }

    return cachedContests.all(platform)

})

const refresh= (async (platform)=>{

    if(response[platform]!==null){
        return response[platform]
    }

    response[platform]=fetchData(platform)
    .finally(()=>{
        response[platform]=null
    })

    return response[platform]

})

const getData= (async (platform)=> {

    // returning cache data if it is fresh

    const lastFetched= db.prepare(`
      SELECT *
      FROM lastFetched
      WHERE platform = ?
    `).get(platform)?.lastFetchedAt ?? 0

    if(lastFetched+1800>Math.floor(new Date().getTime()/1000)){
        // console.log("return fresh cache data")
        return db.prepare(`
            SELECT *
            FROM contests
            WHERE platform = ?
        `).all(platform)
    }

    // cache stale

    const contests= await refresh(platform)

    return contests

})

export default getData

