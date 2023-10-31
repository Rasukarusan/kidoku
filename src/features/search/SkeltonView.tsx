export const SkeltonView: React.FC = () => {
  return (
    <div className="mb-4 grid animate-pulse grid-cols-1 gap-4 sm:grid-cols-2">
      {[1, 2, 3, 4, 5, 6].map((v) => {
        return (
          <div className="flex items-center sm:p-4" key={v}>
            <div className="mb-1 mr-4 h-[110px] w-[82px] min-w-[82px] bg-gray-200" />
            <div className="w-full">
              <div className="mb-2 h-[30px] w-full bg-gray-200" />
              <div className="mb-2 h-[40px] w-full bg-gray-200" />
              <div className="flex items-center">
                <div className="mr-2 h-8 w-8 rounded-full bg-gray-200" />
                <div className="h-[20px] w-[150px] bg-gray-200"></div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
