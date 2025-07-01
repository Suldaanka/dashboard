"use client"; // This directive is crucial for using hooks like useParams

import React from 'react';
import { useParams } from "next/navigation"; 
import { UpdateMenuItem } from '../_components/UpdateMenuItem';

export default function Page() { 
  const params = useParams();
  const id = params.id; 
 

  return (
    <div>
      <UpdateMenuItem id={id}/>
    </div>
  );
}