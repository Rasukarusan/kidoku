import { Logo } from '@/components/icon/Logo'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#263238]">
      <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <a href="https://app.rasukarusan.com" className="flex items-center">
              <Logo className="w-8 text-white mr-2" />
              <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">
                Kidoku
              </span>
            </a>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3 text-sm">
            <div>
              <h2 className="mb-6 text-sm font-semibold tuppercase text-white">
                Abount
              </h2>
              <ul className="text-gray-500 dark:text-gray-400 font-medium">
                <li className="mb-4">
                  <a href="#" className="hover:underline">
                    Kidokuについて
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    運営会社
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm font-semibold uppercase text-white">
                LINKS
              </h2>
              <ul className="text-gray-500 dark:text-gray-400 font-medium">
                <li className="mb-4">
                  <a
                    href="https://github.com/Rasukarusan/kidoku"
                    className="hover:underline "
                  >
                    Github
                  </a>
                </li>
                <li>
                  <a
                    href="https://twitter.com/rasukarusan2"
                    className="hover:underline"
                  >
                    Twitter
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm font-semibold uppercase text-white">
                Legal
              </h2>
              <ul className="text-gray-500 dark:text-gray-400 font-medium">
                <li className="mb-4">
                  <a href="#" className="hover:underline">
                    プライバシーポリシー
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    利用規約
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
