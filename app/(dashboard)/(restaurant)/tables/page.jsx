"use client"

import TableCard from './_components/tableCard'
import { useFetch } from '@/hooks/useFetch'
import Loading from '@/components/Loading'
import { AddTable } from './_components/Add'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import useUserRole from "@/hooks/useUserRole";


export default function page() {
  const { isAdmin, isLoaded: userRoleIsLoaded } = useUserRole();
  const { data, isLoading, isError } = useFetch('/api/table', ['tables'])
  if (isLoading) return <Loading />
  if (isError) return <p>Error fetching tables</p>

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-none dark:border-0 dark:shadow-none dark:bg-transparent">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl font-bold">Table Management</CardTitle>
            <CardDescription>
              Manage hotel tables and their availability status
            </CardDescription>
          </div>
          <AddTable />
        </CardHeader>
        <CardContent>
          <TableCard data={data || []}  isAdmin={isAdmin}/>
        </CardContent>
      </Card>
    </div>
  )
}
