import React from 'react'
import type { SsoButtonType } from '../../../types/buttons'

export const SsoButton: React.FC<SsoButtonType> = ({ icon, text, brandColor }) => {
    return (
        <button className="sso-btn" style={{
            ['--brand-color' as any]: brandColor
        }}>
            <span className="sso-icon-zone">{icon}</span>
            <span className="sso-text-zone">
                {text}
            </span>
        </button>
    )
}
