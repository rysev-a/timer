import { useQueryClient } from '@tanstack/react-query'
import { CircleAlert, Loader2Icon, PanelTopOpenIcon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { httpClient } from '@/core/api'

export default function DevPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsOpen(localStorage.getItem('devPanel') === 'isOpen')
  }, [])

  const toggleDevPanel = useCallback(() => {
    setIsOpen((value) => !value)
    localStorage.setItem('devPanel', isOpen ? 'isClosed' : 'isOpen')
  }, [isOpen])

  const queryClient = useQueryClient()

  const reload = useCallback(() => {
    setIsLoading(true)
    httpClient
      .post('/api/e2e/reset')
      .then(() => {
        return Promise.all([
          queryClient.invalidateQueries({ queryKey: ['users'] }),
          queryClient.invalidateQueries({ queryKey: ['roles'] }),
          queryClient.invalidateQueries({ queryKey: ['permissions'] }),
          queryClient.invalidateQueries({ queryKey: ['projects'] }),
        ])
      })
      .then(() => {
        toast.success('reload success')
        setIsLoading(false)
      })
      .catch(() => {
        setIsLoading(false)
        toast.error('reload error')
      })
  }, [queryClient])

  if (import.meta.env.MODE !== 'development') {
    return null
  }

  if (!isOpen) {
    return (
      <div className={'fixed  z-10 top-3 right-3 '}>
        <Button size={'icon'} onClick={toggleDevPanel}>
          <PanelTopOpenIcon />
        </Button>
      </div>
    )
  }

  return import.meta.env.MODE === 'development' ? (
    <div className={'fixed  z-10 top-3 right-3 '}>
      <Card className={'w-80'}>
        <CardHeader>Dev Panel</CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={isLoading}>
                {isLoading ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <CircleAlert />
                )}
                reload all
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit profile</DialogTitle>
                <DialogDescription>Are you shure?</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" onClick={reload}>
                    Reload all
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
        <CardFooter>
          <Button
            size={'sm'}
            onClick={toggleDevPanel}
            className={'cursor-pointer'}
          >
            Close
          </Button>
        </CardFooter>
      </Card>
    </div>
  ) : null
}
