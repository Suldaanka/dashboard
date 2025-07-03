import React from 'react'
import EditUserProfile from '../../../_components/EditUserProfile'

export default async function page({params}) {

    const { userId } = params
  return (
    <EditUserProfile userId={userId}/>
  )
}
