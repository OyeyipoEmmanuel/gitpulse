import { type ReactNode } from 'react'


const Card = ({className, children} : {className?:string, children:ReactNode}) => {
  return (
    <div className={`${className} bg-[#161B22] border border-[#20252C] rounded-[8px]`}>{children}</div>
  )
}

export default Card