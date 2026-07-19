// can keep in same const too and then use operationName

const upcoming_query = `
query UpcomingContests{

    contestV2UpcomingContests {
        title
        titleSlug
        startTime
        duration
    }

}
`

const history_query = `
query HistoryContests($skip: Int!, $limit: Int!){

    contestV2HistoryContests(skip: $skip, limit: $limit) {
        totalNum
        contests {
            titleSlug
            title
            startTime
            duration
        }
    }
}
`

// note to check if ongoing contest appears in upcoming or history to ensure that ongoing contests don't vanish when cache is refreshed (or that it just fetches ongoing ones too)

const fetchContests= (async (query, skip=0, num=0) => {
    let response=null
    if(query==history_query){
        response= await fetch("https://leetcode.com/graphql/",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({
                query: query,
                variables:{
                    skip: skip,
                    limit: num
                }
            })
        })
    }
    else{
        response= await fetch("https://leetcode.com/graphql/",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({
                query: query
            })
        })
    }
    if(!response.ok){
        throw new Error(response.status)
    }
    const data= await response.json()
    if(data.errors?.length){
        throw new Error("Error in the data fetched of leetcode")
    }
    return data
})

const get_lc= (async ()=>{
    
    const num= 20
    let skip=0
    let finished=false

    const allContests=[]

    const now= new Date()

    const prevMonth= new Date(now.getFullYear(),now.getMonth()-1,1)
    const prevMonthSecs= Math.floor(prevMonth.getTime()/1000)

    while(!finished){
        try{
            const response= await fetchContests(history_query,skip,num)
            const history= response.data?.contestV2HistoryContests?.contests ?? []
            if(history.length==0) break
            for(const contest of history){
                if(contest.startTime<prevMonthSecs){
                    finished=true
                    break
                }
                allContests.push({
                    id:contest.titleSlug,
                    name:contest.title,
                    startTime:contest.startTime,
                    duration:contest.duration,
                    url:`https://leetcode.com/contest/${contest.titleSlug}`
                })
            }
            skip+=num
        }
        catch(err){
            throw new Error(`Fetching past contests failed at offset ${skip} and limit ${num}:`,err)
        }
    }

    try{
        const response=await fetchContests(upcoming_query)
        const contests= response.data?.contestV2UpcomingContests ?? []
        for(const contest of contests){
            allContests.push({
                id:contest.titleSlug,
                name:contest.title,
                startTime:contest.startTime,
                duration:contest.duration,
                url:`https://leetcode.com/contest/${contest.titleSlug}`
            })
        }
    }
    catch(err){
        throw new Error("Fetching upcoming contests failed:",err)
    }
    return allContests
})

export default get_lc