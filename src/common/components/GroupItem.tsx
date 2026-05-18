import { type GroupItemProps } from '../types/group'
import { useState } from 'react'
import { Card } from './Card';

export const GroupItem = ({ id, title, description, children }: GroupItemProps) => {

  // const [isExpanded, setIsExpanded] = useState(true);

  // const toggleExpand = () => {
  //   setIsExpanded((prev) => !prev);
  // };

  return (
    // <div className="card">
    //   <div className="card-header">
    //     <div className="card-header-info">
    //       <h2>{title}</h2>
    //       <p>{description}</p>
    //     </div>
    //     {/* Toggle text based on state and add click handler */}
    //     <button onClick={toggleExpand}>
    //       {isExpanded ? '-' : '+'}
    //     </button>
    //   </div>

    //   {/* Conditionally render or show the body based on state */}
    //   {isExpanded && (
    //     <div className='card-body no-padding'>
    //       {children}
    //     </div>
    //   )}

    // </div>

    <Card
      header={<><h2>{title}</h2><p>{description}</p></>}
      content={<>{children}</>}
      options={{expander: true}}
    />
  )
}
