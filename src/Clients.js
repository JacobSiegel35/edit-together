import React from "react";
import { Tile, Notification, Button } from "react-bulma-components";

export default props => {

  return (
    <Tile kind="child" notification color="warning">
      <p className="title">Connections: {Object.keys(props.clients).length}</p>
      
      {
        Object.keys(props.clients).length ?
        <ul>
          {Object.keys(props.clients).map(key => 
            <li key={key}>
              { // Make the name of the client bold
                key === props.socketID ?
                  <strong>{props.clients[key]}</strong>
                :
                  props.clients[key]
              }
            </li>
            )
          }
        </ul>
        :
          <Notification>
            <ol>
              <li className="subtitle">
                Click Create in the bottom left corner to create a new editor
              </li>
              <li className="subtitle">
                Send the url to your friends
              </li>
            </ol>
          </Notification>
      }

      <Notification>
        Output:
        {<br />}
        {props.codeOutput}
      </Notification>

      {
        props.err ? 
          <Notification color="danger">
            <Button onClick={props.removeErr} remove/>
            {props.err}
          </Notification>
        :
          null
      }
    </Tile>
  );
}