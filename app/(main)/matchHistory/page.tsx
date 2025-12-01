import React from 'react'
import './matchhistory.css'

function matchHistory() {
    const match1 = {
        name: 'hari om',
        date: '12-10-2024',
        total_players : 100,
    }
  return (
    <>
    <div>
        <h1 className='mh-title'>matches</h1>
    </div>
    <div>
    <ul>
        <li>match 1 details: match name: {match1.name} match date: {match1.date} total_players : {match1.total_players}</li>
        <li>match 2</li>
        <li>match 3</li>


    </ul>
    </div>
    </>
  )
}

export default matchHistory;