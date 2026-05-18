import { useState } from 'react'

interface CardOptions {
    divided?: boolean,
    expander?: boolean,
    noPadding?: boolean,
}

interface CardProps {
    header?: React.ReactNode
    content?: React.ReactNode
    footer?: React.ReactNode
    options?: CardOptions
}

export const Card: React.FC<CardProps> = ({ header, content, footer, options = {} }) => {

    const { divided = false, noPadding = false, expander = false } = options;

    const [isExpanded, setIsExpanded] = useState<boolean>(true)

    const toggleExpand = () => {
        setIsExpanded((prev) => !prev);
    };

    const cardClasses = {
        header: ['card-header'],
        body: ['card-body', divided ? 'devided' : '', noPadding ? 'no-padding' : ''],
        footer: ['card-footer']
    }

    const headerClasses = cardClasses.header.filter(Boolean).join(' ')
    const bodyClasses = cardClasses.body.filter(Boolean).join(' ')
    const footerClasses = cardClasses.footer.filter(Boolean).join(' ')

    return (
        <div className="card">
            {header && (
                <header className={headerClasses}>
                    <div className="card-header-info">
                        {header}
                    </div>
                    {expander && (
                        <button onClick={toggleExpand}>
                            {isExpanded ? '-' : '+'}
                        </button>
                    )}
                </header>
            )}

            {isExpanded && (
                <>
                    <main className={bodyClasses}>
                        {content}
                    </main>
                    {footer && (
                        <footer className={footerClasses}>
                            {footer}
                        </footer>
                    )}
                </>
            )}
        </div>
    )
}

