import { useQuery, gql } from '@apollo/client'
import { SearchResult } from '@/types/search'

const GET_LATEST_SOFTWARE_DESIGN = gql`
  query GetLatestSoftwareDesign {
    latestSoftwareDesign {
      id
      title
      author
      category
      image
      memo
      isbn
    }
  }
`

const GET_SOFTWARE_DESIGN_BY_MONTH = gql`
  query GetSoftwareDesignByMonth($year: Int!, $month: Int!) {
    softwareDesignByMonth(year: $year, month: $month) {
      id
      title
      author
      category
      image
      memo
      isbn
    }
  }
`

const GET_SOFTWARE_DESIGN_BY_YEAR = gql`
  query GetSoftwareDesignByYear($input: GetSoftwareDesignInput!) {
    softwareDesignByYear(input: $input) {
      items {
        id
        title
        author
        category
        image
        memo
        isbn
      }
      total
    }
  }
`

const SEARCH_SOFTWARE_DESIGN_BY_ISBN = gql`
  query SearchSoftwareDesignByISBN($isbn: String!, $year: Int, $month: Int) {
    searchSoftwareDesignByISBN(isbn: $isbn, year: $year, month: $month) {
      id
      title
      author
      category
      image
      memo
      isbn
    }
  }
`

export const useLatestSoftwareDesign = () => {
  const { data, loading, error } = useQuery(GET_LATEST_SOFTWARE_DESIGN)

  return {
    softwareDesign: data?.latestSoftwareDesign as SearchResult | undefined,
    loading,
    error,
  }
}

export const useSoftwareDesignByMonth = (year: number, month: number) => {
  const { data, loading, error } = useQuery(GET_SOFTWARE_DESIGN_BY_MONTH, {
    variables: { year, month },
  })

  return {
    softwareDesign: data?.softwareDesignByMonth as SearchResult | undefined,
    loading,
    error,
  }
}

export const useSoftwareDesignByYear = (year: number) => {
  const { data, loading, error } = useQuery(GET_SOFTWARE_DESIGN_BY_YEAR, {
    variables: { input: { year } },
  })

  return {
    items: data?.softwareDesignByYear?.items as SearchResult[] | undefined,
    total: data?.softwareDesignByYear?.total,
    loading,
    error,
  }
}

export const useSearchSoftwareDesignByISBN = (
  isbn: string,
  year?: number,
  month?: number
) => {
  const { data, loading, error } = useQuery(SEARCH_SOFTWARE_DESIGN_BY_ISBN, {
    variables: { isbn, year, month },
    skip: !isbn,
  })

  return {
    softwareDesign: data?.searchSoftwareDesignByISBN as SearchResult | null,
    loading,
    error,
  }
}
