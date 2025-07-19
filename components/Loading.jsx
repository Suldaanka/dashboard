import React from 'react'

export default function Loading() {
    return (
        <div className='flex justify-center items-center h-screen'>
            <div className="w-8 h-8 border-2 rounded-full inline-block relative box-border animate-spin">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2 border-transparent border-t-black dark:border-t-white"></div>
            </div>
        </div>
    )
}