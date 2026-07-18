const get_cc = (async () => {

    const response= await fetch("https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&mode=all")
    if(!response.ok){
        throw new Error(`Codechef API returned ${response.status}`)
    }
  
    const data= await response.json()
  
    if(data.status!=="success"){
        // console.log(response)
        throw new Error(data.message||"Codechef data error")
    }
  
    const now= new Date()
  
    const prevMonth= new Date(now.getFullYear(),now.getMonth()-1,1)
    const prevMonthSecs= Math.floor(prevMonth.getTime()/1000) // flooring to accomodate for decimal when divided by 1000

    const formatted= [...data.past_contests,...data.present_contests,...data.future_contests]
        .map(contest => ({
            id:contest.contest_code,
            name:contest.contest_name,
            startTime:Math.floor(new Date(contest.contest_start_date_iso).getTime()/1000),
            duration:contest.contest_duration*60
        }))

    return formatted
        .filter(contest=>contest.startTime>=prevMonthSecs)

})
  
  export default get_cc