export interface CardOptions {
    divided?: {
        top?: boolean;
        bottom?: boolean;
    }
    expander?: boolean,
    noPadding?: boolean,
    allowHorizontal?: boolean,
    lightBackground?: boolean
}

export interface CardProps {
    header?: React.ReactNode
    content?: React.ReactNode
    footer?: React.ReactNode
    options?: CardOptions
}

export type ImageCardItemProps = {
    main: React.ReactNode | string,
    aside?: React.ReactNode | string,
    meta?: React.ReactNode | string,
    image: string,
    options?: {
        contentDirection?: "vertical" | "horizontal",
        centered?: boolean, 
        thumbImage?: boolean,
        imageShape?: "circle" | "square",
        applyBorder?: boolean
    }
}