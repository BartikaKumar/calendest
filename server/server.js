import express from 'express'

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import contestRouter from './contests.js'

const PORT = process.env.PORT || 8000

const __filename= fileURLToPath(import.meta.url)
const __dirname= path.dirname(__filename)

// console.log(__filename, __dirname)

const app= express()

app.use('/api/contests',contestRouter)

app.use(express.static(path.join(__dirname,'../dist'))) // we extract dirname here cuz only ../dist would be relative to the CWD, not server.js

app.listen(PORT,()=>{
    console.log("Server connected successfully!")
}).on("error",(err)=>{
    console.log("Server connection failed: ", err)
})