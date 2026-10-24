import { type ReactNode } from 'react'
import { Card as ShadcnCard } from '@/components/ui/card'


const Card = ({className, children} : {className?:string, children:ReactNode}) => {
  return (
    <ShadcnCard className={className}>{children}</ShadcnCard>
  )
}

export default Card
