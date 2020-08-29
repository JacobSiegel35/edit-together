import { withRouter } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Navbar, Button } from "react-bulma-components";

const Navigation = props => {
  const [socketName, setSocketName] = useState("");

  useEffect(() => {
    setSocketName(props.socketName);
  }, [props]);

  return (
    <div>
      <Navbar >
        <Navbar.Burger />
        <Navbar.Menu>
          <Navbar.Container>
            <Navbar.Item>
              {
                props.isConnected ?
                  <Button 
                    color="danger"
                    onClick={props.disconnect}
                  >
                    Disconnect
                  </Button>
                :
                  <Button 
                    color="success"
                    onClick={props.create}
                  >
                    Create
                  </Button>
              }
            </Navbar.Item>
            <Navbar.Item dropdown hoverable={props.isConnected}>
              <Navbar.Link>
                {props.language}
              </Navbar.Link>
              <Navbar.Dropdown>
                <Navbar.Item onClick={()=>props.languageChange("python")}>
                  python
                </Navbar.Item>
                <Navbar.Item onClick={()=>props.languageChange("java")}>
                  java
                </Navbar.Item>
              </Navbar.Dropdown>
            </Navbar.Item>
            <Navbar.Item>
              <input 
                type="text" 
                placeholder="Name" 
                className="input" 
                value={socketName}
                disabled={!props.isConnected}
                onBlur={() => props.nameChanged(socketName)}
                onChange={(e) => setSocketName(e.target.value)}
              /> 
            </Navbar.Item>
            <Navbar.Item>
              <Button onClick={props.runCode}>Run Code</Button>
            </Navbar.Item>  
          </Navbar.Container>
          <Navbar.Container position="end">
            <Navbar.Item>
              <Button>
                View Source
              </Button>
            </Navbar.Item>
          </Navbar.Container>
        </Navbar.Menu>
      </Navbar>
    </div>
  );
}

export default withRouter(Navigation);