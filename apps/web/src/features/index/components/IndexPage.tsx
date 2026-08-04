import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAtom } from 'jotai'
import { Container } from '@/components/layout/Container'
import { BookComment, Comment } from '@/components/layout/BookComment'
import { openSearchModalAtom } from '@/store/modal/atom'
import { MyRecentBooks } from './MyRecentBooks'
import { OnThisDay } from './OnThisDay'

interface Props {
  comments: Comment[]
}

const steps = [
  {
    number: '01',
    title: '本を見つける',
    description: 'タイトルやISBNから検索。読んだ本がすぐに見つかります。',
    icon: '/icons/koboyo/bookshelf.svg',
  },
  {
    number: '02',
    title: 'ひとこと残す',
    description: '感想は長くなくて大丈夫。心に残ったことを、あなたの言葉で。',
    icon: '/icons/koboyo/pencil.svg',
  },
  {
    number: '03',
    title: '読書を振り返る',
    description: '積み重なった記録が、あなただけの本棚になっていきます。',
    icon: '/icons/koboyo/open-book.svg',
  },
]

export const IndexPage: React.FC<Props> = ({ comments }) => {
  const router = useRouter()
  const [, setOpenSearchModal] = useAtom(openSearchModalAtom)

  useEffect(() => {
    if (router.query.start === '1') {
      setOpenSearchModal(true)
      router.replace('/', undefined, { shallow: true })
    }
  }, [router, setOpenSearchModal])

  const handleStart = () => setOpenSearchModal(true)

  return (
    <div className="overflow-hidden bg-[#fbfaf6] text-[#272a25]">
      <section className="relative min-h-[720px] border-b border-[#dcd8cc]">
        <div className="absolute -right-32 top-24 h-80 w-80 rounded-full bg-[#e5eee6] blur-3xl" />
        <div className="absolute -left-24 bottom-16 h-64 w-64 rounded-full bg-[#f1e8d7] blur-3xl" />
        <Container className="relative grid min-h-[720px] items-center gap-12 px-6 py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-12">
          <div className="max-w-2xl">
            <p className="mb-7 flex items-center gap-3 text-xs font-bold tracking-[0.24em] text-[#617064]">
              <span className="h-px w-10 bg-[#849287]" />
              YOUR READING, YOUR STORY
            </p>
            <h1 className="text-[clamp(2.8rem,7vw,5.5rem)] font-bold leading-[1.13] tracking-[-0.06em] text-[#29312b]">
              読んだ時間を、
              <br />
              <span className="relative inline-block text-[#52705d]">
                ことばに残す。
                <svg
                  className="absolute -bottom-3 left-0 w-full text-[#b9cbbd]"
                  viewBox="0 0 420 18"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 12C92 3 234 18 417 5"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="mt-10 max-w-lg text-base leading-[2] text-[#6b706a] sm:text-lg">
              kidokuは、読み終えた本と心に残ったことを、
              <br className="hidden sm:block" />
              静かに積み重ねていくための読書記録です。
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <button
                onClick={handleStart}
                className="group inline-flex items-center gap-5 rounded-full bg-[#314b3a] px-7 py-4 text-sm font-bold text-white shadow-[0_12px_30px_rgba(49,75,58,.2)] transition hover:-translate-y-0.5 hover:bg-[#263c2e]"
              >
                最初の一冊を記録する
                <span className="grid h-7 w-7 place-items-center rounded-full bg-white/15 transition group-hover:translate-x-1">
                  →
                </span>
              </button>
              <Link
                href="/discover"
                className="border-b border-[#9ca39d] pb-1 text-sm font-bold text-[#4d554f] transition hover:border-[#314b3a]"
              >
                みんなの読書を見る
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[520px] py-10">
            <div className="absolute left-3 top-4 h-24 w-24 rounded-full border border-[#afbbb1]" />
            <div className="relative ml-auto w-[88%] rotate-2 rounded-[2.5rem] border border-[#ccd2c9] bg-[#edf1e9] px-8 pb-10 pt-12 shadow-[0_30px_70px_rgba(46,57,48,.13)]">
              <div className="absolute -left-9 top-16 -rotate-6 rounded-2xl border border-[#ddd6c9] bg-[#fffdf7] p-4 shadow-lg">
                <Image
                  src="/icons/koboyo/bookmark.svg"
                  width={50}
                  height={50}
                  alt="手描きのしおり"
                />
              </div>
              <Image
                src="/icons/koboyo/bookshelf.svg"
                width={420}
                height={340}
                priority
                className="h-auto w-full -rotate-2"
                alt="Koboyoの手描きの本棚イラスト"
              />
              <div className="mt-2 flex items-end justify-between border-t border-[#cbd2ca] pt-5">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-[#7b857d]">
                    MY BOOKSHELF
                  </p>
                  <p className="mt-1 font-bold">今日の一冊を、未来の自分へ。</p>
                </div>
                <span className="font-serif text-3xl italic text-[#75847a]">
                  01
                </span>
              </div>
            </div>
            <div className="absolute -bottom-2 right-0 flex items-center gap-3 rounded-full border border-[#ded8cc] bg-[#fffdf8] px-5 py-3 text-xs font-bold shadow-md">
              <Image
                src="/icons/koboyo/coffee-cup.svg"
                width={30}
                height={30}
                alt=""
              />
              ひと息ついて、読書の記録
            </div>
          </div>
        </Container>
      </section>

      <MyRecentBooks />
      <OnThisDay />

      <section className="border-b border-[#dcd8cc] bg-[#f2efe6] py-24">
        <Container className="px-6 lg:px-12">
          <div className="mb-14 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold tracking-[0.22em] text-[#718077]">
                HOW IT WORKS
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                記録は、かんたん3ステップ。
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-[#73766f]">
              頑張らなくても続けられる。読書の余韻をそのまま残せる、シンプルな仕組みです。
            </p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-[2rem] border border-[#d5d0c5] bg-[#d5d0c5] md:grid-cols-3">
            {steps.map((step) => (
              <article
                key={step.number}
                className="group bg-[#fbfaf6] p-8 sm:p-10"
              >
                <div className="mb-10 flex items-start justify-between">
                  <span className="font-serif text-2xl italic text-[#879289]">
                    {step.number}
                  </span>
                  <div className="grid h-24 w-24 place-items-center rounded-full bg-[#edf0e8] transition group-hover:-rotate-6 group-hover:scale-105">
                    <Image src={step.icon} width={62} height={62} alt="" />
                  </div>
                </div>
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#747770]">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {comments.length > 0 && (
        <section className="bg-[#fbfaf6] py-24">
          <Container className="px-6 lg:px-12">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="text-xs font-bold tracking-[0.22em] text-[#718077]">
                  FROM READERS
                </p>
                <h2 className="mt-4 text-3xl font-bold tracking-tight">
                  みんなの読書ノート
                </h2>
              </div>
              <Link
                href="/comments"
                className="hidden text-sm font-bold text-[#53655a] hover:underline sm:block"
              >
                すべて見る →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {comments.slice(0, 4).map((comment) => (
                <BookComment key={comment.id} comment={comment} />
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="bg-[#314b3a] px-6 py-24 text-center text-white">
        <Image
          src="/icons/koboyo/open-book.svg"
          width={96}
          height={96}
          className="mx-auto invert"
          alt="手描きの開いた本"
        />
        <h2 className="mt-7 text-3xl font-bold tracking-tight sm:text-4xl">
          次の一冊を、記録しよう。
        </h2>
        <p className="mt-5 text-sm leading-7 text-white/70">
          読書の記憶は、残すことであなただけの物語になる。
        </p>
        <button
          onClick={handleStart}
          className="mt-9 rounded-full bg-[#faf7ed] px-8 py-4 text-sm font-bold text-[#314b3a] transition hover:-translate-y-0.5 hover:bg-white"
        >
          無料ではじめる
        </button>
      </section>
    </div>
  )
}
