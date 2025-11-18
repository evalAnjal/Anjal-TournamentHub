import React from 'react'
import Login from './(auth)/login/page'
import Home from './(main)/home/page'

const isLoggedIn = true;

function root() {
 if(!isLoggedIn){
   return <Login />
 }
 else{
  return  <Home />
 }

}

export default root