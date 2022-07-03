import axios from 'axios'

export class ApiClient {
  get(url: string) {
    return axios.get(url)
  }
}
