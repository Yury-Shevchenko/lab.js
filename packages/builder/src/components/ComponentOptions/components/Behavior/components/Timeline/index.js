import React, { lazy, Suspense } from 'react'
import { Field, useFormikContext } from 'formik'
import { useSelector } from 'react-redux'
import { CardBody, FormGroup, Col, Label,
  InputGroup, InputGroupAddon, FormText } from 'reactstrap'
import { isEqual } from 'lodash'

import Card from '../../../../../Card'
import Hint from '../../../../../Hint'
import Spinner from '../../../../../Spinner'
import { Input } from '../../../../../Form'

import { undefinedParameters } from '../../../../../../logic/tree/placeholders'
import { numberOrPlaceholder } from './util'

const TimelineWidget = lazy(() => import('./widget'))

// A placeholder that finds no value leaves the timeout empty: lab.js 23 then
// never ends the screen by itself (so a preview seems to hang), and lab.js 20
// ends it at once. The editor can't know every value that a study might provide
// at run time, so this only asks to check the name.
const TimeoutWarning = ({ id, value }) => {
  const missing = useSelector(
    state => undefinedParameters(value, id, state.components),
    isEqual,
  )

  return missing.length === 0 ? null :
    <FormText color="danger" className="timeout-warning">
      No parameter called <code>{ missing.join(', ') }</code> is defined on this
      component or around it. Please check the name. Without a value, this
      screen won't end by itself in the preview, and it may end at once when the
      study runs.
    </FormText>
}

export default ({ id }) => {
  const formikContext = useFormikContext()

  return (
    <Card title="Timeline" badge="Beta" wrapContent={ false }>
      <Suspense fallback={ <Spinner /> }>
        <TimelineWidget
          data={ formikContext.values.timeline || [] }
          formikContext={ formikContext }
        />
      </Suspense>
      <hr />
      <CardBody>
        <FormGroup row>
          <Label for="timeout" xs="2">
            Timeout
            <Hint
              title="Timeout"
              className="float-right"
            >
              <p className="font-weight-bold">
                End component automatically after a given number of milliseconds.
              </p>
              <p className="text-muted">
                If responses are defined alongside a timeout, whichever comes first will end the component.
              </p>
            </Hint>
          </Label>
          <Col xs="10">
            <InputGroup>
              <Field
                name="timeout" id="timeout"
                placeholder="Never"
                pattern={ numberOrPlaceholder }
                component={ Input }
                className="text-monospace"
              />
              <InputGroupAddon addonType="append">
                <span className="input-group-text text-muted">ms</span>
              </InputGroupAddon>
            </InputGroup>
            <TimeoutWarning id={ id } value={ formikContext.values.timeout } />
          </Col>
        </FormGroup>
      </CardBody>
    </Card>
  )
}
