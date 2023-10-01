interface Props {
  text: string
  className?: string
}
export const TitleWithLine: React.FC<Props> = ({ text, className = '' }) => {
  return (
    <div className={className}>
      <h2 className="title">{text}</h2>
      <style jsx>{`
        .title {
          position: relative;
          display: inline-block;
          padding: 0 55px;
        }
        .title::before,
        .title::after {
          content: '';
          position: absolute;
          top: 50%;
          display: inline-block;
          width: 45px;
          height: 1px;
          background-color: black;
        }
        .title::before {
          left: 0;
        }
        .title.::after {
          right: 0;
        }
      `}</style>
    </div>
  )
}
