import { Router } from "express"

import getData from "./getData.js"

const contestRouter= Router()

const platforms=["cf","cc","lc","ac"]

for (const platform of platforms){
    contestRouter.get(`/${platform}`, async (req,res)=>{
        try{
            const contests= await getData(platform)
            res.json(contests)
        }
        catch(err){
            res.status(500).json({error:`Failed to fetch ${platform} contests`})
        }
    })
}

export default contestRouter