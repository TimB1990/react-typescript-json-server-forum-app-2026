import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { formatCompactNumber } from '../../../common/utils/compactNumber'
import { faHeart, faMessage, faSeedling, faDrumSteelpan, faMedal, faTrophy, faCrown, faStar, type IconDefinition} from '@fortawesome/free-solid-svg-icons'
import { Card } from '../../../common/components/ui/cards/Card'
import { useUserRanks } from '../../../context/UserRanksContext'
import { getUserRank } from '../../../common/utils/rankHelper'

const rankIcons: Record<string, IconDefinition> = {
    faSeedling,
    faDrumSteelpan,
    faMedal,
    faTrophy,
    faCrown,
    faStar
}

export const AuthorInfo = ({ author, totalUserMessageCount }: { author: string, totalUserMessageCount: number }) => {

    const { ranks } = useUserRanks();
    const rank = getUserRank(totalUserMessageCount, ranks)

    const selectedIcon = rank ? rankIcons[rank.faIcon] || faSeedling : null;

    return (
        <div className='author-info'>
            <div>
                <p style={{ textAlign: 'center', fontSize: '1em', fontWeight: 'bold', color: 'white' }}>{author}</p>
                <p style={{ textAlign: 'center', fontSize: '0.9em', color: 'oklch(0.645 0.0216 260)' }}>member</p>
            </div>
            <div className='author-stats'>
                <ul>
                    <li>
                        <span>
                            <FontAwesomeIcon icon={faMessage} />
                            {formatCompactNumber(totalUserMessageCount)}
                        </span>
                    </li>
                    <li>
                        <span>
                            <FontAwesomeIcon icon={faHeart} />
                            {formatCompactNumber(1100)}
                        </span>
                    </li>
                </ul>
            </div>
            <Card
                header={<div className='user-rank-container'>
                    {selectedIcon && rank && (<>
                        <FontAwesomeIcon
                            icon={selectedIcon}
                            size={(rank.faIconOptions?.size as any) || 'lg'}
                            style={{ color: rank.faIconOptions?.color || 'white' }}
                        />
                        <span>{rank.name}</span></>
                    )}
                </div>}
                options={{ lightBackground: true, divided: { bottom: false } }}
            />
        </div>
    )
}
