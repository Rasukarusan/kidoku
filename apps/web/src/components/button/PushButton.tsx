import { motion, AnimatePresence } from 'framer-motion'
import { EventType } from '@/types/event_queue'
import { useSession } from 'next-auth/react'
import { SearchResult } from '@/types/search'
interface Props {
  open: boolean
  book: SearchResult
  onClick: () => void
}
export const PushButton: React.FC<Props> = ({ open, book, onClick }) => {
  const { data: session } = useSession()
  const modalVariants = {
    hidden: {
      y: '10vh',
      opacity: 0,
    },
    visible: {
      y: '0',
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
      },
    },
    exit: {
      y: '-100vh',
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: 'easeInOut',
      },
    },
  }
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalVariants}
          className="absolute right-[4.25rem] top-[20rem]"
        >
          <button
            type="submit"
            className="button sm:hidden"
            style={{
              backgroundImage: 'url("/button.png")',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              width: '270px',
              height: '160px',
            }}
            onClick={async () => {
              const data = {
                userId: session.user.id,
                event: EventType.AddBook,
                book,
              }
              const res = await fetch('/api/socket', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
              })
              console.log(res)
              if (!res.ok) {
                console.error('failed to push data')
              }
              onClick()
            }}
          ></button>
        </motion.div>
      )}
      <style jsx>
        {`
          .wrapper {
            display: flex;
            height: 20vh;
            flex-direction: row;
            justify-content: center;
            align-items: center;
          }
          .button {
            border: 1px transparent;
            -webkit-border-radius: 40px;
            border-radius: 40px;
            color: #eeeeee;
            cursor: pointer;
            display: inline-block;
            font-family: Arial;
            font-size: 20px;
            padding: 8px 30px;
            text-align: center;
            text-decoration: none;
            margin-left: 20px;
            -webkit-animation: glowing 1300ms infinite;
            -moz-animation: glowing 1300ms infinite;
            -o-animation: glowing 1300ms infinite;
            animation: glowing 1300ms infinite;
          }
          @-webkit-keyframes glowing {
            0% {
              background-color: #ae2e21;
              -webkit-box-shadow: 0 0 3px #ae2e21;
            }
            50% {
              background-color: #ed1534;
              -webkit-box-shadow: 0 0 15px #ed1534;
            }
            100% {
              background-color: #ae2e21;
              -webkit-box-shadow: 0 0 3px #ae2e21;
            }
          }
          @keyframes glowing {
            0% {
              background-color: #ae2e21;
              box-shadow: 0 0 3px #ae2e21;
            }
            50% {
              background-color: #ed1534;
              box-shadow: 0 0 20px #ed1534;
            }
            100% {
              background-color: #ae2e21;
              box-shadow: 0 0 3px #ae2e21;
            }
          }
          .svg-btn {
            display: block;
            /* width: 230px; */
            /* height: 230px; */
            margin-left: 10px;
          }
          svg {
            fill: blue;
            -webkit-animation: glowing-polygon 1300ms infinite;
            -moz-animation: glowing-polygon 1300ms infinite;
            -o-animation: glowing-polygon 1300ms infinite;
            animation: glowing-polygon 1300ms infinite;
          }
          @-webkit-keyframes glowing-polygon {
            0% {
              fill: #ae2e21;
              -webkit-filter: drop-shadow(0 0 3px #ae2e21);
            }
            50% {
              fill: #ed1534;
              -webkit-filter: drop-shadow(0 0 15px #ed1534);
            }
            100% {
              fill: #ae2e21;
              -webkit-filter: drop-shadow(0 0 3px #ae2e21);
            }
          }
          @keyframes glowingPolygon {
            0% {
              fill: #ae2e21;
              filter: drop-shadow(0 0 3px #ae2e21);
            }
            50% {
              fill: #ed1534;
              filter: drop-shadow(0 0 15px #ed1534);
            }
            100% {
              fill: #ae2e21;
              filter: drop-shadow(0 0 3px #ae2e21);
            }
          }
        `}
      </style>
    </AnimatePresence>
  )
}
