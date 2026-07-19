const get_cf = (async () => {

  const response= await fetch("https://codeforces.com/api/contest.list?gym=false")
  if(!response.ok){
      throw new Error(`Codeforces API returned ${response.status}`)
  }

  const data= await response.json()

  if(data.status!=="OK"){
      throw new Error(data.comment||"Codeforces data error")
  }

  const now= new Date()

  const prevMonth= new Date(now.getFullYear(),now.getMonth()-1,1)
  const prevMonthSecs= Math.floor(prevMonth.getTime()/1000) // flooring to accomodate for decimal when divided by 1000

  return data.result
  .filter(contest=>contest.startTimeSeconds>=prevMonthSecs) // here filtering first cuz huge data so map before filtered for formatting is not preferable
  .map(contest => ({
    id:contest.id,
    name:contest.name,
    startTime:contest.startTimeSeconds,
    duration:contest.durationSeconds,
    url:`https://codeforces.com/contest/${contest.id}`
  }))

})

export default get_cf