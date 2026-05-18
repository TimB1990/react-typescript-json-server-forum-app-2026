import { type GroupItemProps } from '../types/group'
import { useState } from 'react'
import { Card } from './Card';

export const GroupItem = ({ id, title, description, children }: GroupItemProps) => {
  return (
    <Card
      header={<><h2>{title}</h2><p>{description}</p></>}
      content={<>{children}</>}
      options={{expander: true, noPadding: true}}
    />
  )
}
