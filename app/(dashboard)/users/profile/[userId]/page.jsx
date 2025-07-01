"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import UserProfile from '../../_components/UserProfile';


export default function Page() {
  const params = useParams();
  const userId = params?.userId
  
  return (
    <div className="container">
      <UserProfile userId={userId} />
    </div>
  );
}