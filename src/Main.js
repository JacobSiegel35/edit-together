import Editor from "./Editor";
import Clients from "./Clients";
import io from "socket.io-client";
import Navigation from "./Navigation";
import { withRouter } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Section, Box, Tile } from "react-bulma-components";

const socket = io.connect("/");

const Main = props => {

      ////////////////////////////////////
     //                                //
    //      Initialization           //
   //                              //
  /////////////////////////////////

  const [err, setErr] = useState("");
  const [roomID, setRoomID] = useState("");
  const [clients, setClients] = useState({});
  const [initText, setInitText] = useState("");
  const [socketName, setSocketName] = useState("");
  const [editorValue, setEditorValue] = useState("");
  const [language, setLanguage] = useState("python");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const loc = props.history.location.pathname.substring(1);
    if (loc) {
      setRoomID(loc);
      socket.emit("join-room", loc);
    }
  }, [props.history])

      ////////////////////////////////////
     //                                //
    //      VDOM Event Handlers      //
   //                              //
  /////////////////////////////////

  const create = () => {
    // create an editor and go to new tab with that name
    socket.emit("create-editor");
    socket.on("editor-created", roomID => {
      props.history.push(`/${roomID}`);

      setRoomID(roomID);
      setIsConnected(true);
      setInitText("");
      setEditorValue("");
      
      socket.emit("join-room", roomID);
    });
  }

  const nameChanged = (name) => {
    if (!name) setSocketName(socket.id);
    else setSocketName(name);

    socket.emit("socket-name-changed", name ? name : socket.id);
  }

  const languageChange = newLanguage => {
    setLanguage(newLanguage);
    socket.emit("language-change", newLanguage);
  }

  const handleEditorChange = text => {
    setEditorValue(text);
    socket.emit("change-editor-text", text);
  }

  const runCode = _ => {
    fetch('/runcode', {method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: editorValue, roomID })})
      .then(res => res.json())
      .then(data => console.log(data));
  }

  const disconnect = () => {
    // leave the socket from the room
    socket.emit("leave-room");
    setClients({});
    props.history.push("/");
    setIsConnected(false);
  }

      ////////////////////////////////////
     //                                //
    //     Socket Event Handlers     //
   //                              //
  /////////////////////////////////

  socket.on(
    "language-change", 
    newLanguage => setLanguage(newLanguage)
  );

  socket.on(
    "connected-clients", 
    clients => {
      setClients(clients)
      setSocketName(clients[socket.id]);
    }
  );

  socket.on(
    "set-editor-text", 
    text => {
      setIsConnected(true);
      setEditorValue(text);
    }
  );

  socket.on(
    "err", 
    reason => {
      setErr(reason);
      disconnect();
      props.history.push("/");
    }
  );

  return (
    <Section>
      <Box>
        <Tile kind="ancestor">
          <Tile size={5} vertical>
            <Tile>
              <Tile kind="parent" vertical>

                <Editor 
                  socket={socket}
                  roomID={roomID}
                  mode={language}
                  initText={initText}
                  isConnected={isConnected}
                  editorValue={editorValue}
                  handleEditorChange={handleEditorChange}
                />

              </Tile>
            </Tile>
          </Tile>
          <Tile size={7} vertical>
            <Tile>
              <Tile kind="parent" vertical>

                <Clients 
                  err={err}
                  removeErr={() => setErr("")}
                  clients={clients}
                  socketID={socket.id}
                  isConnected={isConnected}
                />

              </Tile>
            </Tile>
          </Tile>
        </Tile>

        <Navigation 
          create={create}
          language={language}
          socketName={socketName}
          disconnect={disconnect}
          languageChange={languageChange}
          isConnected={isConnected}
          nameChanged={nameChanged}
          runCode={runCode}
        />

      </Box>
    </Section>
  );
}

export default withRouter(Main);