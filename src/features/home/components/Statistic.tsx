type Statistic = {
    value: number | string | undefined,
    subject: string
}

export const Statistic = ({value, subject}: Statistic) => {
  return (
    <div className='statistic'>
        <p className='value'>{value}</p>
        <p className='subject'>{subject}</p>
    </div>
  )
}
