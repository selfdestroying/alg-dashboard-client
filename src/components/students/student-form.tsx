'use client'

import type React from 'react'

import { Input } from '@/components/ui/input'

import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { IStudent } from '@/types/student'
import { toast } from 'sonner'
import { FC } from 'react'
import { ApiResponse } from '@/types/response'
import { api } from '@/lib/api/api-client'

const CreateStudentFormSchema = z.object({
  name: z.string().min(2, { error: 'Name must be at least 2 characters long.' }).trim(),
  age: z.number().min(6, { error: 'Minimal age must be 6' }).max(18, 'Maximum age must be 18'),
})

interface IDefaultValues {
  name: string
  age: number
}

interface IStudentFormProps {
  student?: IStudent
  defaultValues: IDefaultValues
}

export const StudentForm: FC<IStudentFormProps> = ({ defaultValues, student }) => {
  const form = useForm<z.infer<typeof CreateStudentFormSchema>>({
    resolver: zodResolver(CreateStudentFormSchema),
    defaultValues: student ? { name: student.name, age: student.age } : defaultValues,
  })

  const onValid = (values: z.infer<typeof CreateStudentFormSchema>) => {
    const ok = new Promise<ApiResponse<IStudent>>((resolve, reject) => {
      let res
      if (student) {
        res = api.update<IStudent>(
          `students/${student.id}`,
          { name: values.name, age: +values.age },
          'dashboard/students'
        )
      } else {
        res = api.create<IStudent>(
          'students',
          { name: values.name, age: +values.age },
          'dashboard/students'
        )
      }
      res.then((r) => {
        if (r.success) {
          resolve(r)
        } else {
          reject(r)
        }
      })
    })
    toast.promise(ok, {
      loading: 'Loding...',
      success: (data) => data.message,
      error: (data) => data.message,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onValid)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min={6}
                  max={18}
                  onChange={(e) => field.onChange(+e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="w-full flex justify-end">
          <Button type="submit" className="cursor-pointer">
            Submit
          </Button>
        </div>
      </form>
    </Form>
  )
}
