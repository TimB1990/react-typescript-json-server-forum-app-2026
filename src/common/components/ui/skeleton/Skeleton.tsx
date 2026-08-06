import React from 'react'
import type { SkeletonProps } from '../../../types/skeleton'
import './Skeleton.css'

export const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = '1rem',
    borderRadius = '4px',
    className = ''
}) => {
    return (
        <div
            className={`skeleton-loader ${className}`}
            style={{ width, height, borderRadius }}
            aria-hidden="true"
        />
    )
}
