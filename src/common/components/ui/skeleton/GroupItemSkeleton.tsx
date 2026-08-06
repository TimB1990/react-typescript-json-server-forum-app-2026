import { Card } from "../cards/Card";
import { Skeleton } from "./Skeleton";

export const GroupItemSkeleton = () => {
    return (
        <Card
            header={<Skeleton width="40%" height="1.5rem" />}
            content={
                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <Skeleton width="80%" height="1rem" />
                    <Skeleton width="60%" height="1rem" />
                </div>
            }
        />
    )
}