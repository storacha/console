import { DataSourceConfiguration, Reader, Upload } from './api'

export const id = 'psa.old.web3.storage'

export const checkToken = async (token: string) => {
  throw new Error('not implemented')
}

export const createReader = (conf: DataSourceConfiguration) => new PSAReader(conf)

class PSAReader implements Reader {
  #token
  #cursor
  #started

  constructor ({ token, cursor }: DataSourceConfiguration) {
    this.#token = token
    this.#cursor = cursor
    this.#started = false
  }

  async count (): Promise<number> {
    throw new Error('not implemented')
  }

  [Symbol.asyncIterator] () {
    return this.list()
  }

  async* list (): AsyncIterator<Upload> {
    throw new Error('not implemented')
  }
}
