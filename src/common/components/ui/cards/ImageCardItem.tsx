import React from 'react'

type ImageCardItem = {
    main: React.ReactNode | string,
    aside?: React.ReactNode | string,
    meta?: React.ReactNode | string,
    image: string,
    options?: {
        contentDirection: "vertical" | "horizontal",
        centerContent: boolean, 
        thumbImage: boolean,
        imageShape?: "circel" | "square"
    }
}

export const ImageCardItem = ({ aside, image, main, meta, options }: ImageCardItem) => {
    return (
        <div className="image-card-item">
            <aside>
                <div className="image-container">
                    <img src={image} alt="" />
                </div>
                {aside}
            </aside>

            <div className="content-wrapper">
                <main className="content">
                    {main}
                </main>
                <div>
                    {meta}
                </div>
            </div>
        </div>
    )
}
