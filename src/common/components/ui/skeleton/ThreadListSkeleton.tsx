import { Card } from "../cards/Card";
import { Skeleton } from "./Skeleton";

export const ThreadListSkeleton = ({ count = 3 }: { count?: number }) => (
    <Card
        header={<Skeleton width="30%" height="1.5rem" />}
        content={
            <div className="threads" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <Skeleton width="40px" height="40px" borderRadius="50%" />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <Skeleton width="70%" height="1rem" />
                            <Skeleton width="40%" height="0.8rem" />
                        </div>
                    </div>
                ))}
            </div>
        }
        options={{ noPadding: true, divided: { top: true, bottom: false } }}
    />
)