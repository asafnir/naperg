import React from 'react'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import { useHistory, useLocation } from 'react-router-dom'

const ShowInviteBuyerFilter = () => {
  const queryString = require('query-string')
  const history = useHistory()
  const location = useLocation()
  const parsed = queryString.parse(location.search)
  const showInviteBuyer = parsed.showInviteBuyer ? parsed.showInviteBuyer : ''

  return (
    <div>
      <FormControl className="inputWidth">
        <InputLabel htmlFor="showInviteBuyer">showInviteBuyer</InputLabel>
        <Select
          id="showInviteBuyer"
          value={showInviteBuyer}
          onChange={e => {
            const parsed = queryString.parse(location.search)
            delete parsed.page
            parsed.showInviteBuyer = e.target.value
            history.push('?' + queryString.stringify(parsed))
          }}>
          <MenuItem value={''}>{`All`}</MenuItem>
          <MenuItem value={'TRUE'}>{`True`}</MenuItem>
          <MenuItem value={'FALSE'}>{`False`}</MenuItem>
        </Select>
      </FormControl>
    </div>
  )
}

export default ShowInviteBuyerFilter