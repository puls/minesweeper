import React, { Component } from "react";
import Board from "./Board";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: 8,
      cols: 8,
      mines: 10
    };
  }

  setDifficulty(rows, cols, mines) {
    this.setState({ rows, cols, mines });
  }

  render() {
    return (
      <div className="container">
        <Board {...this.state} /><br /><br />
        <button onClick={this.setDifficulty.bind(this, 8, 8, 8)}>Easy</button>
        <button onClick={this.setDifficulty.bind(this, 16, 16, 40)}>
          Medium
        </button>
        <button onClick={this.setDifficulty.bind(this, 16, 30, 99)}>
          Hard
        </button>
        <button onClick={this.setDifficulty.bind(this, 32, 32, 500)}>
          Extreme
        </button>
      </div>
    );
  }
}

export default App;
