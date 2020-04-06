import PropTypes from 'prop-types';
import React from 'react';

import { Button, Icon, Modal } from 'semantic-ui-react';

function FatalError(props) {
  return <Modal basic defaultOpen={true} closeOnDocumentClick={false} closeOnDimmerClick={false}
                closeIcon={false}>
    <Modal.Header>Schwerwiegender Fehler</Modal.Header>
    <Modal.Content>
      <p>
        Es ist ein schwerwiegender Fehler aufgetreten ({props.appState.mode}).
      </p>
      <p>
        {props.appState.errorMessage}
      </p>
    </Modal.Content>
    <Modal.Actions>
      <Button basic color="red" inverted onClick={() => document.location.reload(true)}>
        <Icon name="refresh" /> Seite neu laden
      </Button>
    </Modal.Actions>
  </Modal>;
}

FatalError.propTypes = {
  appState: PropTypes.object.isRequired,
};

export default FatalError;
