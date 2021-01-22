import React from 'react'
import { graphql } from 'react-apollo'
import { flowRight as compose } from 'lodash'
import { INVOICES_SUM_DAILY_QUERY } from '../../GraphQL'
import Error from '../../../nav/error/Error'
import NotFound from '../../../nav/error/NotFound'
import Loading from '../../../nav/error/Loading'
import { User } from '../../../user/User.type'
import { withContext } from '../../../withContext'
import { Context } from '../../../Context.type'
import { Location } from '../../../Location.type'
import utils from '../../../utils'
import IsCumulatedFilter from '../../../nav/filter/IsCumulatedFilter'
import { withRouter } from 'react-router-dom'
import { ResponsiveLine } from '@nivo/line'
import Grid from '@material-ui/core/Grid'
import UseWindowDimensions from '../../../UseWindowDimensions'

// import IsCumulatedFilter from '../../nav/filter/IsCumulatedFilter'
// import { Link } from 'react-router-dom'
// import DateComponent from '../../nav/DateComponent'
// import Table from '@material-ui/core/Table'
// import TableBody from '@material-ui/core/TableBody'
// import TableCell from '@material-ui/core/TableCell'
// import TableHead from '@material-ui/core/TableHead'
// import TableRow from '@material-ui/core/TableRow'

type State = { isCumulated: boolean }

type Props = {
  variables: any
  showTotal: boolean
  title: string
  showIsCumulative: boolean
  location: Location
  context: Context
  invoicesSumDailyQuery: any
  me: User
}

class InvoicesGraphDaily extends React.Component<Props, State> {
  state = { isCumulated: false }
  render() {
    const isMobile = UseWindowDimensions.isMobile()
    if (this.props.invoicesSumDailyQuery.error) {
      return (
        <Error
          message={
            this.props.invoicesSumDailyQuery.error.graphQLErrors.length &&
            this.props.invoicesSumDailyQuery.error.graphQLErrors[0].message
          }
        />
      )
    }
    if (this.props.invoicesSumDailyQuery.loading) {
      return <Loading />
    }
    if (!this.props.invoicesSumDailyQuery) {
      return <NotFound />
    }
    // console.log(this.props.invoicesSumDailyQuery)
    if (this.props.invoicesSumDailyQuery.invoicesSumDaily.length === 0) {
      return <div>{`No data yet.`}</div>
    }

    let data = this.props.invoicesSumDailyQuery.invoicesSumDaily.map((invoiceSumPerMonth) => {
      const newData = {
        x: invoiceSumPerMonth.name,
        y: this.state.isCumulated
          ? -this.props.invoicesSumDailyQuery.invoicesSumDaily.reduce(
              (acc, singleInvoicesSum) =>
                Number(singleInvoicesSum.name) <= Number(invoiceSumPerMonth.name) ? singleInvoicesSum.amount + acc : acc,
              0
            )
          : -invoiceSumPerMonth.amount,
      }
      return newData
    })

    const nowHour = new Date().getHours()
    data = data.filter((singleData) => singleData.x <= nowHour)

    const dataContainer = [
      {
        id: '',
        color: 'hsl(199, 78%, 36%)',
        data: data,
      },
    ]
    const margin = isMobile ? { top: 10, right: 20, bottom: 80, left: 65 } : { top: 10, right: 25, bottom: 50, left: 65 }

    const tickRotationBottom = isMobile ? -30 : 0

    const total = -this.props.invoicesSumDailyQuery.invoicesSumDaily.reduce(
      (acc, singleInvoicesSum) => singleInvoicesSum.amount + acc,
      0
    )

    return (
      <>
        <Grid container>
          <Grid item xs={12} sm={6} className="marginAuto">
            {this.props.title && <span className="textSize11">{this.props.title}</span>}
          </Grid>
          <Grid item xs={6} sm={3} className="marginAuto">
            {this.props.showIsCumulative && (
              <div>
                <IsCumulatedFilter
                  isCumulated={this.state.isCumulated}
                  onChange={(isCumulated) => this.setState({ isCumulated })}
                />
              </div>
            )}
          </Grid>
          <Grid item xs={6} sm={3} className="marginAuto tar">
            {this.props.showTotal && <div>{utils.priceFormated(total, 'usd')}</div>}
          </Grid>
        </Grid>

        <ResponsiveLine
          margin={margin}
          animate={true}
          enableArea={true}
          enablePoints={false}
          enableSlices={'x'}
          sliceTooltip={({ slice }) => {
            return (
              <div
                style={{
                  background: 'white',
                  marginLeft: '-80px',
                  marginTop: '-60px',
                  padding: '9px 12px',
                  border: '1px solid #ccc',
                }}>
                {/* <div>{'Amount'}</div> */}
                {slice.points.map((point) => (
                  <div
                    key={point.id}
                    style={{
                      color: point.serieColor,
                      padding: '3px 0',
                    }}>
                    <strong>{point.serieId}</strong> {point.data.yFormatted}
                  </div>
                ))}
              </div>
            )
          }}
          data={dataContainer}
          curve="monotoneX"
          // pointLabelYOffset={-20}
          // margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
          xScale={{ type: 'point' }}
          // tickValues={[0, 40]}
          // yScale={{ type: 'linear', stacked: true, min: 'auto', max: 'auto' }}
          // yScale={{
          //   type: 'linear',
          //   stacked: false,
          //   min: 0,
          //   max: 'auto'
          // }}
          axisTop={null}
          yFormat={(value: number) => utils.priceFormated(value, 'usd')}
          axisRight={null}
          axisBottom={{
            orient: 'bottom',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: tickRotationBottom,
            // legend: 'transportation',
            legendOffset: 36,
            legendPosition: 'middle',
          }}
          // axisLeft={null}
          // gridYValues={5}
          axisLeft={{
            tickValues: 6,
            format: (value: number) => utils.priceFormated(value, 'usd'),
            orient: 'left',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,

            legendOffset: -40,
            legendPosition: 'middle',
          }}
          colors="hsl(199, 78%, 36%)"
          pointSize={10}
          pointColor={{ theme: 'background' }}
          pointBorderWidth={2}
          pointBorderColor={{ from: 'serieColor' }}
          // pointLabel="y"

          useMesh={true}
        />
      </>
    )
  }
}

export default compose(
  graphql(INVOICES_SUM_DAILY_QUERY, {
    name: 'invoicesSumDailyQuery',
    options: (props: Props) => ({
      variables: props.variables,
    }),
  }),
  withContext,
  withRouter
)(InvoicesGraphDaily)