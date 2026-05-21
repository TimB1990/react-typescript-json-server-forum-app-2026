import React from 'react'
import { type ImageCardItemProps } from '../../../types/cards'

export const ImageCardItem: React.FC<ImageCardItemProps> = ({ aside, image, main, meta, options = {} }) => {
    
    const {
        contentDirection = "vertical",
        centered = false,
        thumbImage = false,
        imageShape = "square",
        applyBorder = true

    } = options || {}

    return (
        <div className={`card-item ${centered ? 'centered': ''}`}>
                    <div className={`image-card-item ${applyBorder ? 'divided': ''} ${centered ? 'centered' : ''}`}>
            <aside>
                <div className={`image-container ${thumbImage ? 'thumb' : ''} ${imageShape}`}>
                    <img src={image} alt="" />
                </div>
                {aside}
            </aside>

            <div className={`content-wrapper ${contentDirection}`}>
                <main className="content">
                    {main}
                </main>
                <div className='meta'>
                    {meta}
                </div>
            </div>
        </div>
        </div>

    )
}
