import React from 'react'

type ImageCardItem = {
    main: React.ReactNode | string,
    aside?: React.ReactNode | string,
    meta?: React.ReactNode | string,
    image: string,
    options?: {
        contentDirection?: "vertical" | "horizontal",
        centerContent?: boolean, 
        thumbImage?: boolean,
        imageShape?: "circle" | "square",
        applyBorder?: boolean
    }
}

export const ImageCardItem = ({ aside, image, main, meta, options = {}}: ImageCardItem) => {
    
    const {
        contentDirection = "vertical",
        centerContent = false,
        thumbImage = true,
        imageShape = "circle",
        applyBorder = true

    } = options || {}

    return (
        <div className={`image-card-item ${applyBorder ? 'divided': ''}`}>
            <aside>
                <div className={`image-container ${thumbImage ? 'thumb' : ''} ${imageShape}`}>
                    <img src={image} alt="" />
                </div>
                {aside}
            </aside>

            <div className={`content-wrapper ${contentDirection} ${centerContent ? 'center' : ''}`}>
                <main className="content">
                    {main}
                </main>
                <div className='meta'>
                    {meta}
                </div>
            </div>
        </div>
    )
}
