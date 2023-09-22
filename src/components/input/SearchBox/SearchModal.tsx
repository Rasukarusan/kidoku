import { Loading } from '@/components/icon/Loading'
import { Item } from '@/types/search'
import { searchBooks } from '@/utils/search'
import { truncate } from '@/utils/string'
import { useEffect, useRef, useState } from 'react'
import { useReward } from 'react-rewards'

interface Props {
  open: boolean
  onClose: () => void
}
const items: Item[] = [
  {
    kind: 'books#volume',
    id: 'H-4rnwEACAAJ',
    etag: 'WPxcnWRHZ60',
    selfLink: 'https://www.googleapis.com/books/v1/volumes/H-4rnwEACAAJ',
    volumeInfo: {
      title: '完訳7つの習慣',
      subtitle: '人格主義の回復',
      authors: ['Stephen R. Covey'],
      publisher: 'Villagebooks/Tsai Fong Books',
      publishedDate: '2013-08-01',
      description:
        'A leading management consultant outlines seven organizational rules for improving effectiveness and increasing productivity at work and at home.',
      industryIdentifiers: [
        {
          type: 'ISBN_10',
          identifier: '4863940246',
        },
        {
          type: 'ISBN_13',
          identifier: '9784863940246',
        },
      ],
      readingModes: {
        text: false,
        image: false,
      },
      pageCount: 521,
      printType: 'BOOK',
      categories: ['Business & Economics'],
      maturityRating: 'NOT_MATURE',
      allowAnonLogging: false,
      contentVersion: 'preview-1.0.0',
      language: 'ja',
      previewLink:
        'http://books.google.co.jp/books?id=H-4rnwEACAAJ&dq=7%E3%81%A4n&hl=&cd=1&source=gbs_api',
      infoLink:
        'http://books.google.co.jp/books?id=H-4rnwEACAAJ&dq=7%E3%81%A4n&hl=&source=gbs_api',
      canonicalVolumeLink:
        'https://books.google.com/books/about/%E5%AE%8C%E8%A8%B37%E3%81%A4%E3%81%AE%E7%BF%92%E6%85%A3.html?hl=&id=H-4rnwEACAAJ',
    },
    saleInfo: {
      country: 'JP',
      saleability: 'NOT_FOR_SALE',
      isEbook: false,
    },
    accessInfo: {
      country: 'JP',
      viewability: 'NO_PAGES',
      embeddable: false,
      publicDomain: false,
      textToSpeechPermission: 'ALLOWED',
      epub: {
        isAvailable: false,
      },
      pdf: {
        isAvailable: false,
      },
      webReaderLink:
        'http://play.google.com/books/reader?id=H-4rnwEACAAJ&hl=&source=gbs_api',
      accessViewStatus: 'NONE',
      quoteSharingAllowed: false,
    },
    searchInfo: {
      textSnippet:
        'A leading management consultant outlines seven organizational rules for improving effectiveness and increasing productivity at work and at home.',
    },
  },
  {
    kind: 'books#volume',
    id: '9th2OwAACAAJ',
    etag: 'pzMjDKW3+eU',
    selfLink: 'https://www.googleapis.com/books/v1/volumes/9th2OwAACAAJ',
    volumeInfo: {
      title: '7つの習慣',
      subtitle: '成功には原則があった',
      authors: ['コヴィー,S.R.(スティーブン・R)'],
      publishedDate: '1996',
      industryIdentifiers: [
        {
          type: 'ISBN_10',
          identifier: '4906638015',
        },
        {
          type: 'ISBN_13',
          identifier: '9784906638017',
        },
      ],
      readingModes: {
        text: false,
        image: false,
      },
      pageCount: 525,
      printType: 'BOOK',
      categories: ['Character'],
      averageRating: 4,
      ratingsCount: 16,
      maturityRating: 'NOT_MATURE',
      allowAnonLogging: false,
      contentVersion: 'preview-1.0.0',
      language: 'ja',
      previewLink:
        'http://books.google.co.jp/books?id=9th2OwAACAAJ&dq=7%E3%81%A4n&hl=&cd=2&source=gbs_api',
      infoLink:
        'http://books.google.co.jp/books?id=9th2OwAACAAJ&dq=7%E3%81%A4n&hl=&source=gbs_api',
      canonicalVolumeLink:
        'https://books.google.com/books/about/7%E3%81%A4%E3%81%AE%E7%BF%92%E6%85%A3.html?hl=&id=9th2OwAACAAJ',
    },
    saleInfo: {
      country: 'JP',
      saleability: 'NOT_FOR_SALE',
      isEbook: false,
    },
    accessInfo: {
      country: 'JP',
      viewability: 'NO_PAGES',
      embeddable: false,
      publicDomain: false,
      textToSpeechPermission: 'ALLOWED',
      epub: {
        isAvailable: false,
      },
      pdf: {
        isAvailable: false,
      },
      webReaderLink:
        'http://play.google.com/books/reader?id=9th2OwAACAAJ&hl=&source=gbs_api',
      accessViewStatus: 'NONE',
      quoteSharingAllowed: false,
    },
  },
  {
    kind: 'books#volume',
    id: 'cysZMQAACAAJ',
    etag: 'Zk740mR6hBQ',
    selfLink: 'https://www.googleapis.com/books/v1/volumes/cysZMQAACAAJ',
    volumeInfo: {
      title: '完訳7つの習慣',
      subtitle:
        '人格主義の回復特装版「ウィークリー・チャレンジ」付属人格主義の回復',
      authors: ['スティーブン・R. コヴィー'],
      publishedDate: '2016-12-05',
      industryIdentifiers: [
        {
          type: 'ISBN_10',
          identifier: '4863940653',
        },
        {
          type: 'ISBN_13',
          identifier: '9784863940659',
        },
      ],
      readingModes: {
        text: false,
        image: false,
      },
      pageCount: 642,
      printType: 'BOOK',
      maturityRating: 'NOT_MATURE',
      allowAnonLogging: false,
      contentVersion: 'preview-1.0.0',
      panelizationSummary: {
        containsEpubBubbles: false,
        containsImageBubbles: false,
      },
      imageLinks: {
        smallThumbnail:
          'http://books.google.com/books/content?id=cysZMQAACAAJ&printsec=frontcover&img=1&zoom=5&source=gbs_api',
        thumbnail:
          'http://books.google.com/books/content?id=cysZMQAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
      },
      language: 'ja',
      previewLink:
        'http://books.google.co.jp/books?id=cysZMQAACAAJ&dq=7%E3%81%A4n&hl=&cd=3&source=gbs_api',
      infoLink:
        'http://books.google.co.jp/books?id=cysZMQAACAAJ&dq=7%E3%81%A4n&hl=&source=gbs_api',
      canonicalVolumeLink:
        'https://books.google.com/books/about/%E5%AE%8C%E8%A8%B37%E3%81%A4%E3%81%AE%E7%BF%92%E6%85%A3.html?hl=&id=cysZMQAACAAJ',
    },
    saleInfo: {
      country: 'JP',
      saleability: 'NOT_FOR_SALE',
      isEbook: false,
    },
    accessInfo: {
      country: 'JP',
      viewability: 'NO_PAGES',
      embeddable: false,
      publicDomain: false,
      textToSpeechPermission: 'ALLOWED',
      epub: {
        isAvailable: false,
      },
      pdf: {
        isAvailable: false,
      },
      webReaderLink:
        'http://play.google.com/books/reader?id=cysZMQAACAAJ&hl=&source=gbs_api',
      accessViewStatus: 'NONE',
      quoteSharingAllowed: false,
    },
  },
  {
    kind: 'books#volume',
    id: 'uacJfAEACAAJ',
    etag: 'bISHUUhsj6Q',
    selfLink: 'https://www.googleapis.com/books/v1/volumes/uacJfAEACAAJ',
    volumeInfo: {
      title: '7つの習慣',
      subtitle: '成功には原則があった!',
      authors: ['スティーブン・R. コヴィー'],
      publishedDate: '2011-06-14',
      industryIdentifiers: [
        {
          type: 'ISBN_10',
          identifier: '4863940165',
        },
        {
          type: 'ISBN_13',
          identifier: '9784863940161',
        },
      ],
      readingModes: {
        text: false,
        image: false,
      },
      pageCount: 481,
      printType: 'BOOK',
      averageRating: 4,
      ratingsCount: 16,
      maturityRating: 'NOT_MATURE',
      allowAnonLogging: false,
      contentVersion: 'preview-1.0.0',
      imageLinks: {
        smallThumbnail:
          'http://books.google.com/books/content?id=uacJfAEACAAJ&printsec=frontcover&img=1&zoom=5&source=gbs_api',
        thumbnail:
          'http://books.google.com/books/content?id=uacJfAEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
      },
      language: 'ja',
      previewLink:
        'http://books.google.co.jp/books?id=uacJfAEACAAJ&dq=7%E3%81%A4n&hl=&cd=4&source=gbs_api',
      infoLink:
        'http://books.google.co.jp/books?id=uacJfAEACAAJ&dq=7%E3%81%A4n&hl=&source=gbs_api',
      canonicalVolumeLink:
        'https://books.google.com/books/about/7%E3%81%A4%E3%81%AE%E7%BF%92%E6%85%A3.html?hl=&id=uacJfAEACAAJ',
    },
    saleInfo: {
      country: 'JP',
      saleability: 'NOT_FOR_SALE',
      isEbook: false,
    },
    accessInfo: {
      country: 'JP',
      viewability: 'NO_PAGES',
      embeddable: false,
      publicDomain: false,
      textToSpeechPermission: 'ALLOWED',
      epub: {
        isAvailable: false,
      },
      pdf: {
        isAvailable: false,
      },
      webReaderLink:
        'http://play.google.com/books/reader?id=uacJfAEACAAJ&hl=&source=gbs_api',
      accessViewStatus: 'NONE',
      quoteSharingAllowed: false,
    },
  },
  {
    kind: 'books#volume',
    id: '5MbVjgEACAAJ',
    etag: 'pWHesCkJLE4',
    selfLink: 'https://www.googleapis.com/books/v1/volumes/5MbVjgEACAAJ',
    volumeInfo: {
      title: '物語が教えてくれる7つの習慣',
      subtitle: '',
      authors: ['中山和義'],
      publishedDate: '2015-12-01',
      description:
        '1つの物語が、あなたを変える“習慣”を作り出す!世界3000万部、日本200万部のベストセラー『7つの習慣』の言葉を、わかりやすい言葉に変えて、そこからイメージできるストーリーでつづる、名著の新しいかたち。',
      industryIdentifiers: [
        {
          type: 'ISBN_10',
          identifier: '489451690X',
        },
        {
          type: 'ISBN_13',
          identifier: '9784894516908',
        },
      ],
      readingModes: {
        text: false,
        image: false,
      },
      pageCount: 133,
      printType: 'BOOK',
      maturityRating: 'NOT_MATURE',
      allowAnonLogging: false,
      contentVersion: 'preview-1.0.0',
      imageLinks: {
        smallThumbnail:
          'http://books.google.com/books/content?id=5MbVjgEACAAJ&printsec=frontcover&img=1&zoom=5&source=gbs_api',
        thumbnail:
          'http://books.google.com/books/content?id=5MbVjgEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
      },
      language: 'ja',
      previewLink:
        'http://books.google.co.jp/books?id=5MbVjgEACAAJ&dq=7%E3%81%A4n&hl=&cd=5&source=gbs_api',
      infoLink:
        'http://books.google.co.jp/books?id=5MbVjgEACAAJ&dq=7%E3%81%A4n&hl=&source=gbs_api',
      canonicalVolumeLink:
        'https://books.google.com/books/about/%E7%89%A9%E8%AA%9E%E3%81%8C%E6%95%99%E3%81%88%E3%81%A6%E3%81%8F%E3%82%8C%E3%82%8B7%E3%81%A4%E3%81%AE%E7%BF%92%E6%85%A3.html?hl=&id=5MbVjgEACAAJ',
    },
    saleInfo: {
      country: 'JP',
      saleability: 'NOT_FOR_SALE',
      isEbook: false,
    },
    accessInfo: {
      country: 'JP',
      viewability: 'NO_PAGES',
      embeddable: false,
      publicDomain: false,
      textToSpeechPermission: 'ALLOWED',
      epub: {
        isAvailable: false,
      },
      pdf: {
        isAvailable: false,
      },
      webReaderLink:
        'http://play.google.com/books/reader?id=5MbVjgEACAAJ&hl=&source=gbs_api',
      accessViewStatus: 'NONE',
      quoteSharingAllowed: false,
    },
    searchInfo: {
      textSnippet:
        '1つの物語が、あなたを変える“習慣”を作り出す!世界3000万部、日本200万部のベストセラー『7つの習慣』の言葉を、わかりやすい言葉に変えて、そこからイメージできるストー ...',
    },
  },
  {
    kind: 'books#volume',
    id: 'wQlLzQEACAAJ',
    etag: 'ZfHNYHfoId8',
    selfLink: 'https://www.googleapis.com/books/v1/volumes/wQlLzQEACAAJ',
    volumeInfo: {
      title: '完訳 7つの習慣',
      subtitle: '人格主義の回復',
      authors: ['スティーブン・R. コヴィー'],
      publishedDate: '2020-01-29',
      industryIdentifiers: [
        {
          type: 'ISBN_10',
          identifier: '4863940920',
        },
        {
          type: 'ISBN_13',
          identifier: '9784863940925',
        },
      ],
      readingModes: {
        text: false,
        image: false,
      },
      pageCount: 675,
      printType: 'BOOK',
      maturityRating: 'NOT_MATURE',
      allowAnonLogging: false,
      contentVersion: 'preview-1.0.0',
      panelizationSummary: {
        containsEpubBubbles: false,
        containsImageBubbles: false,
      },
      imageLinks: {
        smallThumbnail:
          'http://books.google.com/books/content?id=wQlLzQEACAAJ&printsec=frontcover&img=1&zoom=5&source=gbs_api',
        thumbnail:
          'http://books.google.com/books/content?id=wQlLzQEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
      },
      language: 'ja',
      previewLink:
        'http://books.google.co.jp/books?id=wQlLzQEACAAJ&dq=7%E3%81%A4n&hl=&cd=6&source=gbs_api',
      infoLink:
        'http://books.google.co.jp/books?id=wQlLzQEACAAJ&dq=7%E3%81%A4n&hl=&source=gbs_api',
      canonicalVolumeLink:
        'https://books.google.com/books/about/%E5%AE%8C%E8%A8%B3_7%E3%81%A4%E3%81%AE%E7%BF%92%E6%85%A3.html?hl=&id=wQlLzQEACAAJ',
    },
    saleInfo: {
      country: 'JP',
      saleability: 'NOT_FOR_SALE',
      isEbook: false,
    },
    accessInfo: {
      country: 'JP',
      viewability: 'NO_PAGES',
      embeddable: false,
      publicDomain: false,
      textToSpeechPermission: 'ALLOWED',
      epub: {
        isAvailable: false,
      },
      pdf: {
        isAvailable: false,
      },
      webReaderLink:
        'http://play.google.com/books/reader?id=wQlLzQEACAAJ&hl=&source=gbs_api',
      accessViewStatus: 'NONE',
      quoteSharingAllowed: false,
    },
  },
  {
    kind: 'books#volume',
    id: 'xafgsgEACAAJ',
    etag: 'WkeLYMGNLzY',
    selfLink: 'https://www.googleapis.com/books/v1/volumes/xafgsgEACAAJ',
    volumeInfo: {
      title: 'ぼくに7つの習慣を教えてよ!',
      subtitle: '再現「7つの習慣」授業',
      authors: ['フランクリン・コヴィー・ジャパン'],
      publishedDate: '2015-05-30',
      industryIdentifiers: [
        {
          type: 'ISBN_10',
          identifier: '4863940378',
        },
        {
          type: 'ISBN_13',
          identifier: '9784863940376',
        },
      ],
      readingModes: {
        text: false,
        image: false,
      },
      pageCount: 203,
      printType: 'BOOK',
      maturityRating: 'NOT_MATURE',
      allowAnonLogging: false,
      contentVersion: 'preview-1.0.0',
      imageLinks: {
        smallThumbnail:
          'http://books.google.com/books/content?id=xafgsgEACAAJ&printsec=frontcover&img=1&zoom=5&source=gbs_api',
        thumbnail:
          'http://books.google.com/books/content?id=xafgsgEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
      },
      language: 'ja',
      previewLink:
        'http://books.google.co.jp/books?id=xafgsgEACAAJ&dq=7%E3%81%A4n&hl=&cd=7&source=gbs_api',
      infoLink:
        'http://books.google.co.jp/books?id=xafgsgEACAAJ&dq=7%E3%81%A4n&hl=&source=gbs_api',
      canonicalVolumeLink:
        'https://books.google.com/books/about/%E3%81%BC%E3%81%8F%E3%81%AB7%E3%81%A4%E3%81%AE%E7%BF%92%E6%85%A3%E3%82%92%E6%95%99%E3%81%88%E3%81%A6%E3%82%88.html?hl=&id=xafgsgEACAAJ',
    },
    saleInfo: {
      country: 'JP',
      saleability: 'NOT_FOR_SALE',
      isEbook: false,
    },
    accessInfo: {
      country: 'JP',
      viewability: 'NO_PAGES',
      embeddable: false,
      publicDomain: false,
      textToSpeechPermission: 'ALLOWED',
      epub: {
        isAvailable: false,
      },
      pdf: {
        isAvailable: false,
      },
      webReaderLink:
        'http://play.google.com/books/reader?id=xafgsgEACAAJ&hl=&source=gbs_api',
      accessViewStatus: 'NONE',
      quoteSharingAllowed: false,
    },
  },
  {
    kind: 'books#volume',
    id: 'Q0zNoQEACAAJ',
    etag: 'kWpZdGqOb68',
    selfLink: 'https://www.googleapis.com/books/v1/volumes/Q0zNoQEACAAJ',
    volumeInfo: {
      title: 'まんがでわかる7つの習慣',
      publishedDate: '2014-10-23',
      description:
        'バー「セブン」で日々、バーテンダーとしての腕を磨く歩。一人の人間として成長すると同時に、人との関わりの中で“共に幸せになる”ために必要な生き方の極意を学んでいく―。大好評「まんがでわかる7つの習慣」シリーズ第3弾!',
      industryIdentifiers: [
        {
          type: 'ISBN_10',
          identifier: '480022716X',
        },
        {
          type: 'ISBN_13',
          identifier: '9784800227164',
        },
      ],
      readingModes: {
        text: false,
        image: false,
      },
      pageCount: 158,
      printType: 'BOOK',
      averageRating: 3.5,
      ratingsCount: 5,
      maturityRating: 'NOT_MATURE',
      allowAnonLogging: false,
      contentVersion: 'preview-1.0.0',
      imageLinks: {
        smallThumbnail:
          'http://books.google.com/books/content?id=Q0zNoQEACAAJ&printsec=frontcover&img=1&zoom=5&source=gbs_api',
        thumbnail:
          'http://books.google.com/books/content?id=Q0zNoQEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
      },
      language: 'ja',
      previewLink:
        'http://books.google.co.jp/books?id=Q0zNoQEACAAJ&dq=7%E3%81%A4n&hl=&cd=8&source=gbs_api',
      infoLink:
        'http://books.google.co.jp/books?id=Q0zNoQEACAAJ&dq=7%E3%81%A4n&hl=&source=gbs_api',
      canonicalVolumeLink:
        'https://books.google.com/books/about/%E3%81%BE%E3%82%93%E3%81%8C%E3%81%A7%E3%82%8F%E3%81%8B%E3%82%8B7%E3%81%A4%E3%81%AE%E7%BF%92%E6%85%A3.html?hl=&id=Q0zNoQEACAAJ',
    },
    saleInfo: {
      country: 'JP',
      saleability: 'NOT_FOR_SALE',
      isEbook: false,
    },
    accessInfo: {
      country: 'JP',
      viewability: 'NO_PAGES',
      embeddable: false,
      publicDomain: false,
      textToSpeechPermission: 'ALLOWED',
      epub: {
        isAvailable: false,
      },
      pdf: {
        isAvailable: false,
      },
      webReaderLink:
        'http://play.google.com/books/reader?id=Q0zNoQEACAAJ&hl=&source=gbs_api',
      accessViewStatus: 'NONE',
      quoteSharingAllowed: false,
    },
    searchInfo: {
      textSnippet:
        'バー「セブン」で日々、バーテンダーとしての腕を磨く歩。一人の人間として成長すると同時に、人との関わりの中で“共に幸せになる”ために必要な生き方の極意を学んでいく ...',
    },
  },
  {
    kind: 'books#volume',
    id: 'inTVsgEACAAJ',
    etag: 'hP88iL6h5xk',
    selfLink: 'https://www.googleapis.com/books/v1/volumes/inTVsgEACAAJ',
    volumeInfo: {
      title: '7つの習慣ファミリー',
      subtitle: 'かけがえのない家族文化をつくる',
      authors: ['スティーブン・R. コヴィー'],
      publishedDate: '2015-05-30',
      description:
        '人生とは、最終的に家に帰っていく旅路である。幸せな家族をつくる「7つの習慣」家族実践編。',
      industryIdentifiers: [
        {
          type: 'ISBN_10',
          identifier: '4863940351',
        },
        {
          type: 'ISBN_13',
          identifier: '9784863940352',
        },
      ],
      readingModes: {
        text: false,
        image: false,
      },
      pageCount: 631,
      printType: 'BOOK',
      maturityRating: 'NOT_MATURE',
      allowAnonLogging: false,
      contentVersion: 'preview-1.0.0',
      imageLinks: {
        smallThumbnail:
          'http://books.google.com/books/content?id=inTVsgEACAAJ&printsec=frontcover&img=1&zoom=5&source=gbs_api',
        thumbnail:
          'http://books.google.com/books/content?id=inTVsgEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
      },
      language: 'ja',
      previewLink:
        'http://books.google.co.jp/books?id=inTVsgEACAAJ&dq=7%E3%81%A4n&hl=&cd=9&source=gbs_api',
      infoLink:
        'http://books.google.co.jp/books?id=inTVsgEACAAJ&dq=7%E3%81%A4n&hl=&source=gbs_api',
      canonicalVolumeLink:
        'https://books.google.com/books/about/7%E3%81%A4%E3%81%AE%E7%BF%92%E6%85%A3%E3%83%95%E3%82%A1%E3%83%9F%E3%83%AA%E3%83%BC.html?hl=&id=inTVsgEACAAJ',
    },
    saleInfo: {
      country: 'JP',
      saleability: 'NOT_FOR_SALE',
      isEbook: false,
    },
    accessInfo: {
      country: 'JP',
      viewability: 'NO_PAGES',
      embeddable: false,
      publicDomain: false,
      textToSpeechPermission: 'ALLOWED',
      epub: {
        isAvailable: false,
      },
      pdf: {
        isAvailable: false,
      },
      webReaderLink:
        'http://play.google.com/books/reader?id=inTVsgEACAAJ&hl=&source=gbs_api',
      accessViewStatus: 'NONE',
      quoteSharingAllowed: false,
    },
    searchInfo: {
      textSnippet:
        '人生とは、最終的に家に帰っていく旅路である。幸せな家族をつくる「7つの習慣」家族実践編。',
    },
  },
]
export const SearchModal: React.FC<Props> = ({ open, onClose }) => {
  const ref = useRef<HTMLInputElement>(null)
  const [results, setResults] = useState<Item[]>(items)
  const [selectId, setSelectId] = useState('')
  const [loading, setLoading] = useState(false)
  const { reward, isAnimating } = useReward('rewardId', 'confetti')

  useEffect(() => {
    ref.current?.focus()
  }, [open])

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchWord = e.target.value
    if (searchWord) {
      const items = await searchBooks(searchWord)
      setResults(items.slice(0, 9))
    }
  }

  const onClickAdd = async () => {
    setLoading(true)
    const book = results.filter((item) => item.id === selectId).pop()
    if (!book) return
    const { title, description, authors, imageLinks, categories } =
      book.volumeInfo
    const author = authors ? authors.join(',') : '-'
    const category = categories ? categories.join(',') : '-'
    const image = imageLinks ? imageLinks.thumbnail : '/no-image.png'
    const res = await fetch(`/api/books`, {
      method: 'POST',
      body: JSON.stringify({ title, description, author, image, category }),
      headers: {
        Accept: 'application/json',
      },
    })
    reward()
    setSelectId('')
    setLoading(false)
  }

  if (!open) return null

  return (
    <div
      className="fixed w-full h-full backdrop-blur-[4px] flex justify-center items-center z-[1000] left-0 top-0 bg-[rgba(0,0,0,0.1)] overflow-y-hidden"
      onClick={onClose}
    >
      <div
        className="w-2/3 bg-white h-3/4 rounded-md overflow-y-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center border-b-[#f1f5f9] border-b pt-2 px-2">
          <div className="relative text-gray-600 w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2">
              <button
                type="submit"
                className="p-1 focus:outline-none focus:shadow-outline"
              >
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  className="w-6 h-6"
                >
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </button>
            </span>
            <input
              ref={ref}
              type="search"
              name="q"
              className="py-2 text-sm bg-white rounded-md pl-12 pr-2 h-12 focus:outline-none text-gray-900 w-full appearance-none"
              placeholder="Search..."
              autoComplete="off"
              onChange={onChange}
            />
          </div>
        </div>
        <div className="w-full text-gray-900 p-4 flex flex-wrap justify-center overflow-y-auto h-full mb-4 max-h-[60vh]">
          {results.map((item: Item, i: number) => {
            const { title, description, authors, imageLinks } = item.volumeInfo
            return (
              <div
                className="w-[200px] max-h-[300px] h-[300px] border border-gray-300 m-2 px-4 py-2 rounded-md shadow cursor-pointer"
                key={item.id}
                style={{
                  background:
                    selectId === item.id ? 'rgba(245, 88, 194, 0.2)' : 'white',
                }}
                onClick={() => setSelectId(item.id)}
              >
                <div className="font-bold mb-1">{truncate(title, 15)}</div>
                <div className="text-xs mb-1">
                  {Array.isArray(authors)
                    ? truncate(authors.join(','), 12)
                    : '-'}
                </div>
                <img
                  className="m-auto mb-1 h-[150px] object-contain"
                  src={imageLinks ? imageLinks.thumbnail : '/no-image.png'}
                  alt={title}
                />
                <div className="text-sm">{truncate(description, 30)}</div>
              </div>
            )
          })}
        </div>
        <div
          className={`w-full text-center h-[50px] flex items-center justify-center ${
            selectId ? 'bg-blue-600' : 'bg-gray-400'
          }`}
        >
          <button
            className="font-bold text-white flex items-center disabled:font-medium"
            onClick={onClickAdd}
            disabled={selectId === '' || isAnimating}
          >
            {loading && (
              <Loading className="w-[18px] h-[18px] border-[3px] mr-2 border-white" />
            )}
            <span id="rewardId">追加する</span>
          </button>
        </div>
      </div>
    </div>
  )
}
