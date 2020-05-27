import { observable, action } from 'mobx'
import { assign } from 'lodash'
import { to } from 'utils'
import moment from 'moment-mini'

export default class EventSearchStore {
  resource = 'events'

  @observable
  isLoading = true

  @observable
  histogramTodayData = {}

  @observable
  histogramData = {}

  @observable
  interval = '30m'

  @observable
  data = []

  @observable
  page = 1

  @observable
  total = 0

  @observable
  limit = 10

  @observable
  namespaces = []

  get apiVersion() {
    return 'kapis/tenant.kubesphere.io/v1alpha2'
  }

  get fetchUrl() {
    return `${this.apiVersion}/${this.resource}`
  }

  @action
  changeTimeRang = time => {
    this.time_rang = time
    this.fetchQuery()
  }

  @action
  changePagination = page => {
    this.page = page
    this.fetchQuery()
  }

  @action
  async fetchTodayHistogram(params = {}) {
    this.isLoading = true

    const defaultParams = {
      operation: 'statistics',
      start_time: Math.ceil(
        moment()
          .startOf('day')
          .valueOf() / 1000
      ),
      end_time: Math.ceil(Date.now() / 1000),
      interval: this.interval,
    }

    const { statistics = {} } = await to(
      request.get(this.fetchUrl, assign(defaultParams, params))
    )

    this.isLoading = false

    this.histogramTodayData = statistics
  }

  @action
  async fetchHistogram(params = {}) {
    this.isLoading = true

    const defaultParams = {
      operation: 'histogram',
      start_time: Math.ceil(Date.now() / 1000) - 60 * 60 * 12,
      end_time: Math.ceil(Date.now() / 1000),
      interval: this.interval,
    }

    const { histogram = {} } = await to(
      request.get(this.fetchUrl, assign(defaultParams, params))
    )

    this.isLoading = false

    this.histogramData = histogram
  }

  @action
  async fetchQuery(params = {}) {
    this.isLoading = true

    const defaultParams = {
      operation: 'query',
      from: (this.page - 1) * 10,
      size: this.limit,
    }

    const { query = {} } = await to(
      request.get(this.fetchUrl, assign(defaultParams, params))
    )

    const data = query.records || []

    this.total = query.total || 0

    this.data = data

    this.isLoading = false
  }
}