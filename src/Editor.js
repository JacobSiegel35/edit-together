import React from "react";
import AceEditor from 'react-ace';
import "ace-builds/src-noconflict/mode-java";
import { Tile } from "react-bulma-components";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-dracula";

export default props => {

  return (
    <Tile kind="child" notification color="primary">
      <AceEditor 
        mode={props.mode}
        theme="dracula"
        value={props.editorValue}
        onChange={text => props.handleEditorChange(text)}
      />
    </Tile>
  );
}